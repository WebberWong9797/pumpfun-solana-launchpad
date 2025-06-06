/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/token_factory.json`.
 */
export type TokenFactory = {
  "address": "53Cb8tAaKXe1BewvBNRR7decgph7FbVVddb1koVUPXEx",
  "metadata": {
    "name": "tokenFactory",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createToken",
      "docs": [
        "Creates a new token with 1B supply, admin ownership, and bonding curve integration"
      ],
      "discriminator": [
        84,
        52,
        204,
        228,
        24,
        140,
        234,
        75
      ],
      "accounts": [
        {
          "name": "mint",
          "writable": true,
          "signer": true
        },
        {
          "name": "adminTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "admin"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "burningTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "burningWallet"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "creatorTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenData",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "admin",
          "writable": true
        },
        {
          "name": "burningWallet"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        },
        {
          "name": "initialPurchaseAmount",
          "type": {
            "option": "u64"
          }
        }
      ]
    },
    {
      "name": "graduateToken",
      "docs": [
        "Marks a token as graduated to Raydium"
      ],
      "discriminator": [
        235,
        199,
        225,
        44,
        59,
        251,
        230,
        25
      ],
      "accounts": [
        {
          "name": "tokenData",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "token_data.mint",
                "account": "tokenData"
              }
            ]
          }
        },
        {
          "name": "admin",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "raydiumPoolId",
          "type": "pubkey"
        },
        {
          "name": "graduationFee",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateTradingData",
      "docs": [
        "Updates token trading data (called by trading program)"
      ],
      "discriminator": [
        107,
        194,
        249,
        58,
        2,
        2,
        42,
        84
      ],
      "accounts": [
        {
          "name": "tokenData",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "token_data.mint",
                "account": "tokenData"
              }
            ]
          }
        },
        {
          "name": "tradingProgram",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "currentPrice",
          "type": "u64"
        },
        {
          "name": "marketCap",
          "type": "u64"
        },
        {
          "name": "totalVolume",
          "type": "u64"
        },
        {
          "name": "holderCount",
          "type": "u32"
        },
        {
          "name": "transactionsCount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "tokenData",
      "discriminator": [
        10,
        136,
        199,
        13,
        59,
        103,
        129,
        70
      ]
    }
  ],
  "events": [
    {
      "name": "tokenCreated",
      "discriminator": [
        236,
        19,
        41,
        255,
        130,
        78,
        147,
        172
      ]
    },
    {
      "name": "tokenGraduated",
      "discriminator": [
        87,
        245,
        21,
        48,
        222,
        42,
        120,
        116
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "nameTooLong",
      "msg": "Token name is too long (max 32 characters)"
    },
    {
      "code": 6001,
      "name": "symbolTooLong",
      "msg": "Token symbol is too long (max 10 characters)"
    },
    {
      "code": 6002,
      "name": "uriTooLong",
      "msg": "Token URI is too long (max 200 characters)"
    },
    {
      "code": 6003,
      "name": "invalidPurchaseAmount",
      "msg": "Invalid purchase amount"
    },
    {
      "code": 6004,
      "name": "notEligibleForGraduation",
      "msg": "Token is not eligible for graduation"
    },
    {
      "code": 6005,
      "name": "alreadyGraduated",
      "msg": "Token has already graduated"
    }
  ],
  "types": [
    {
      "name": "tokenCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "totalSupply",
            "type": "u64"
          },
          {
            "name": "initialPurchase",
            "type": {
              "option": "u64"
            }
          }
        ]
      }
    },
    {
      "name": "tokenData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "totalSupply",
            "type": "u64"
          },
          {
            "name": "bondingCurveSupply",
            "type": "u64"
          },
          {
            "name": "burningReserve",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "type": "i64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "currentPrice",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "marketCap",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "totalVolume",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "holderCount",
            "type": {
              "option": "u32"
            }
          },
          {
            "name": "transactionsCount",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "graduationEligible",
            "type": "bool"
          },
          {
            "name": "graduated",
            "type": "bool"
          },
          {
            "name": "graduationDate",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "raydiumPoolId",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "graduationFee",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "initialPurchaseAmount",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "initialTokensPurchased",
            "type": {
              "option": "u64"
            }
          }
        ]
      }
    },
    {
      "name": "tokenGraduated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "raydiumPoolId",
            "type": "pubkey"
          },
          {
            "name": "graduationFee",
            "type": "u64"
          },
          {
            "name": "marketCap",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
