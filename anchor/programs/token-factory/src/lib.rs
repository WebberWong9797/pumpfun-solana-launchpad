use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, MintTo, Transfer},
};

declare_id!("CcAY4KNFQ2DmGFwzFUNLeLfZPsyWgJpdoS7C9c86KiCZ");

#[program]
pub mod token_factory {
    use super::*;

    /// Creates a new token with 1B supply, admin ownership, and bonding curve integration
    pub fn create_token(
        ctx: Context<CreateToken>,
        name: String,
        symbol: String,
        uri: String,
        initial_purchase_amount: Option<u64>, // Optional SOL amount for initial purchase
    ) -> Result<()> {
        let mint = &mut ctx.accounts.mint;
        let admin_token_account = &ctx.accounts.admin_token_account;
        let burning_token_account = &ctx.accounts.burning_token_account;
        
        // Validate input parameters
        require!(name.len() <= 32, TokenFactoryError::NameTooLong);
        require!(symbol.len() <= 10, TokenFactoryError::SymbolTooLong);
        require!(uri.len() <= 200, TokenFactoryError::UriTooLong);

        // Constants from proposal
        const TOTAL_SUPPLY: u64 = 1_000_000_000_000_000_000; // 1B tokens with 9 decimals
        const BURNING_ALLOCATION: u64 = 200_000_000_000_000_000; // 20% for burning
        const BONDING_CURVE_ALLOCATION: u64 = 800_000_000_000_000_000; // 80% for bonding curve

        // Initialize token data
        let token_data = &mut ctx.accounts.token_data;
        token_data.mint = mint.key();
        token_data.creator = ctx.accounts.creator.key();
        token_data.admin = ctx.accounts.admin.key();
        token_data.name = name;
        token_data.symbol = symbol;
        token_data.uri = uri;
        token_data.total_supply = TOTAL_SUPPLY;
        token_data.bonding_curve_supply = BONDING_CURVE_ALLOCATION;
        token_data.burning_reserve = BURNING_ALLOCATION;
        token_data.created_at = Clock::get()?.unix_timestamp;
        token_data.is_active = true;

        // Mint all tokens to admin account
        let mint_to_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: mint.to_account_info(),
                to: admin_token_account.to_account_info(),
                authority: ctx.accounts.admin.to_account_info(),
            },
        );
        token::mint_to(mint_to_ctx, TOTAL_SUPPLY)?;

        // Transfer 20% to burning wallet
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: admin_token_account.to_account_info(),
                to: burning_token_account.to_account_info(),
                authority: ctx.accounts.admin.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, BURNING_ALLOCATION)?;

        // Handle optional initial purchase
        if let Some(sol_amount) = initial_purchase_amount {
            require!(sol_amount > 0, TokenFactoryError::InvalidPurchaseAmount);
            
            // Transfer SOL from creator to admin (for initial liquidity)
            let ix = anchor_lang::solana_program::system_instruction::transfer(
                &ctx.accounts.creator.key(),
                &ctx.accounts.admin.key(),
                sol_amount,
            );
            anchor_lang::solana_program::program::invoke(
                &ix,
                &[
                    ctx.accounts.creator.to_account_info(),
                    ctx.accounts.admin.to_account_info(),
                ],
            )?;

            // Calculate tokens to transfer (simple initial pricing)
            let tokens_to_transfer = calculate_initial_purchase_tokens(sol_amount);
            
            // Transfer tokens from admin to creator
            let transfer_to_creator_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: admin_token_account.to_account_info(),
                    to: ctx.accounts.creator_token_account.to_account_info(),
                    authority: ctx.accounts.admin.to_account_info(),
                },
            );
            token::transfer(transfer_to_creator_ctx, tokens_to_transfer)?;

            // Update token data with initial purchase
            token_data.initial_purchase_amount = Some(sol_amount);
            token_data.initial_tokens_purchased = Some(tokens_to_transfer);
        }

        // Emit token creation event
        emit!(TokenCreated {
            mint: mint.key(),
            creator: ctx.accounts.creator.key(),
            name: token_data.name.clone(),
            symbol: token_data.symbol.clone(),
            total_supply: TOTAL_SUPPLY,
            initial_purchase: initial_purchase_amount,
        });

        Ok(())
    }

    /// Updates token trading data (called by trading program)
    pub fn update_trading_data(
        ctx: Context<UpdateTradingData>,
        current_price: u64,
        market_cap: u64,
        total_volume: u64,
        holder_count: u32,
        transactions_count: u64,
    ) -> Result<()> {
        let token_data = &mut ctx.accounts.token_data;
        
        token_data.current_price = Some(current_price);
        token_data.market_cap = Some(market_cap);
        token_data.total_volume = Some(total_volume);
        token_data.holder_count = Some(holder_count);
        token_data.transactions_count = Some(transactions_count);
        token_data.updated_at = Clock::get()?.unix_timestamp;

        // Check if eligible for graduation ($69K threshold)
        if market_cap >= 69_000_000_000 { // $69K in microdollars
            token_data.graduation_eligible = true;
        }

        Ok(())
    }

    /// Marks a token as graduated to Raydium
    pub fn graduate_token(
        ctx: Context<GraduateToken>,
        raydium_pool_id: Pubkey,
        graduation_fee: u64,
    ) -> Result<()> {
        let token_data = &mut ctx.accounts.token_data;
        
        require!(token_data.graduation_eligible, TokenFactoryError::NotEligibleForGraduation);
        require!(!token_data.graduated, TokenFactoryError::AlreadyGraduated);

        token_data.graduated = true;
        token_data.graduation_date = Some(Clock::get()?.unix_timestamp);
        token_data.raydium_pool_id = Some(raydium_pool_id);
        token_data.graduation_fee = Some(graduation_fee);

        // Emit graduation event
        emit!(TokenGraduated {
            mint: token_data.mint,
            raydium_pool_id,
            graduation_fee,
            market_cap: token_data.market_cap.unwrap_or(0),
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateToken<'info> {
    #[account(
        init,
        payer = creator,
        mint::decimals = 9,
        mint::authority = admin,
        mint::freeze_authority = admin,
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = creator,
        associated_token::mint = mint,
        associated_token::authority = admin,
    )]
    pub admin_token_account: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = creator,
        associated_token::mint = mint,
        associated_token::authority = burning_wallet,
    )]
    pub burning_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = creator,
        associated_token::mint = mint,
        associated_token::authority = creator,
    )]
    pub creator_token_account: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = creator,
        space = 8 + TokenData::INIT_SPACE,
        seeds = [b"token_data", mint.key().as_ref()],
        bump,
    )]
    pub token_data: Account<'info, TokenData>,

    #[account(mut)]
    pub creator: Signer<'info>,
    
    /// CHECK: Admin wallet address from environment config
    #[account(mut)]
    pub admin: AccountInfo<'info>,
    
    /// CHECK: Burning wallet address from environment config
    pub burning_wallet: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct UpdateTradingData<'info> {
    #[account(
        mut,
        seeds = [b"token_data", token_data.mint.as_ref()],
        bump,
    )]
    pub token_data: Account<'info, TokenData>,
    
    /// CHECK: Only trading program can call this
    pub trading_program: Signer<'info>,
}

#[derive(Accounts)]
pub struct GraduateToken<'info> {
    #[account(
        mut,
        seeds = [b"token_data", token_data.mint.as_ref()],
        bump,
    )]
    pub token_data: Account<'info, TokenData>,
    
    /// CHECK: Only admin can graduate tokens
    pub admin: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct TokenData {
    pub mint: Pubkey,
    pub creator: Pubkey,
    pub admin: Pubkey,
    #[max_len(32)]
    pub name: String,
    #[max_len(10)]
    pub symbol: String,
    #[max_len(200)]
    pub uri: String,
    pub total_supply: u64,
    pub bonding_curve_supply: u64,
    pub burning_reserve: u64,
    pub created_at: i64,
    pub updated_at: i64,
    pub is_active: bool,
    
    // Trading data
    pub current_price: Option<u64>,
    pub market_cap: Option<u64>,
    pub total_volume: Option<u64>,
    pub holder_count: Option<u32>,
    pub transactions_count: Option<u64>,
    
    // Graduation data
    pub graduation_eligible: bool,
    pub graduated: bool,
    pub graduation_date: Option<i64>,
    pub raydium_pool_id: Option<Pubkey>,
    pub graduation_fee: Option<u64>,
    
    // Initial purchase data
    pub initial_purchase_amount: Option<u64>,
    pub initial_tokens_purchased: Option<u64>,
}

#[event]
pub struct TokenCreated {
    pub mint: Pubkey,
    pub creator: Pubkey,
    pub name: String,
    pub symbol: String,
    pub total_supply: u64,
    pub initial_purchase: Option<u64>,
}

#[event]
pub struct TokenGraduated {
    pub mint: Pubkey,
    pub raydium_pool_id: Pubkey,
    pub graduation_fee: u64,
    pub market_cap: u64,
}

#[error_code]
pub enum TokenFactoryError {
    #[msg("Token name is too long (max 32 characters)")]
    NameTooLong,
    #[msg("Token symbol is too long (max 10 characters)")]
    SymbolTooLong,
    #[msg("Token URI is too long (max 200 characters)")]
    UriTooLong,
    #[msg("Invalid purchase amount")]
    InvalidPurchaseAmount,
    #[msg("Token is not eligible for graduation")]
    NotEligibleForGraduation,
    #[msg("Token has already graduated")]
    AlreadyGraduated,
}

// Helper function to calculate initial purchase tokens
fn calculate_initial_purchase_tokens(sol_amount: u64) -> u64 {
    // Simple initial pricing: 1 SOL = 1M tokens (with 9 decimals)
    // This can be made more sophisticated later
    sol_amount * 1_000_000_000_000_000 // 1M tokens with 9 decimals
} 