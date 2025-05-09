export const spendPermissionManagerAddress = "0x00000000Fc1237824fb747aBDE0FF18990E59b2e";

export const spendPermissionManagerAbi = [
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "authorized",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      },
      {
        name: "",
        type: "address",
        internalType: "address"
      },
      {
        name: "",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "allowance",
        type: "uint160",
        internalType: "uint160"
      },
      {
        name: "validAfter",
        type: "uint48",
        internalType: "uint48"
      },
      {
        name: "validUntil",
        type: "uint48",
        internalType: "uint48"
      },
      {
        name: "consumedInPeriod",
        type: "uint160",
        internalType: "uint160"
      },
      {
        name: "periodStart",
        type: "uint48",
        internalType: "uint48"
      },
      {
        name: "period",
        type: "uint48",
        internalType: "uint48"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "authorize",
    inputs: [
      {
        name: "permission",
        type: "tuple",
        internalType: "struct SpendPermission",
        components: [
          {
            name: "account",
            type: "address",
            internalType: "address"
          },
          {
            name: "spender",
            type: "address",
            internalType: "address"
          },
          {
            name: "token",
            type: "address",
            internalType: "address"
          },
          {
            name: "allowance",
            type: "uint160",
            internalType: "uint160"
          },
          {
            name: "period",
            type: "uint48",
            internalType: "uint48"
          },
          {
            name: "start",
            type: "uint48",
            internalType: "uint48"
          },
          {
            name: "end",
            type: "uint48",
            internalType: "uint48"
          },
          {
            name: "salt",
            type: "uint256",
            internalType: "uint256"
          },
          {
            name: "extraData",
            type: "bytes",
            internalType: "bytes"
          }
        ]
      },
      {
        name: "signature",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "chainId",
    inputs: [],
    outputs: [
      {
        name: "id",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "deauthorize",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address"
      },
      {
        name: "spender",
        type: "address",
        internalType: "address"
      },
      {
        name: "token",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "domainSeparator",
    inputs: [],
    outputs: [
      {
        name: "separator",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "hasAuthorization",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address"
      },
      {
        name: "spender",
        type: "address",
        internalType: "address"
      },
      {
        name: "token",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "authorized",
        type: "bool",
        internalType: "bool"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "hashPermission",
    inputs: [
      {
        name: "permission",
        type: "tuple",
        internalType: "struct SpendPermission",
        components: [
          {
            name: "account",
            type: "address",
            internalType: "address"
          },
          {
            name: "spender",
            type: "address",
            internalType: "address"
          },
          {
            name: "token",
            type: "address",
            internalType: "address"
          },
          {
            name: "allowance",
            type: "uint160",
            internalType: "uint160"
          },
          {
            name: "period",
            type: "uint48",
            internalType: "uint48"
          },
          {
            name: "start",
            type: "uint48",
            internalType: "uint48"
          },
          {
            name: "end",
            type: "uint48",
            internalType: "uint48"
          },
          {
            name: "salt",
            type: "uint256",
            internalType: "uint256"
          },
          {
            name: "extraData",
            type: "bytes",
            internalType: "bytes"
          }
        ]
      }
    ],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "nonces",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      },
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "spend",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address"
      },
      {
        name: "token",
        type: "address",
        internalType: "address"
      },
      {
        name: "amount",
        type: "uint160",
        internalType: "uint160"
      },
      {
        name: "to",
        type: "address",
        internalType: "address"
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    outputs: [
      {
        name: "",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    stateMutability: "nonpayable"
  },
  {
    type: "event",
    name: "Authorized",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "spender",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "allowance",
        type: "uint160",
        indexed: false,
        internalType: "uint160"
      },
      {
        name: "validAfter",
        type: "uint48",
        indexed: false,
        internalType: "uint48"
      },
      {
        name: "validUntil",
        type: "uint48",
        indexed: false,
        internalType: "uint48"
      },
      {
        name: "periodSeconds",
        type: "uint48",
        indexed: false,
        internalType: "uint48"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "Deauthorized",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "spender",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "Spent",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "spender",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "amount",
        type: "uint160",
        indexed: false,
        internalType: "uint160"
      }
    ],
    anonymous: false
  }
] as const;
