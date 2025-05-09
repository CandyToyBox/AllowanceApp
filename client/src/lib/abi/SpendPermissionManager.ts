// Address of the SpendPermissionManager contract on Base Sepolia
export const spendPermissionManagerAddress = "0xB1d702a952d3B3c5892A39C0A375C10627E67446";

// SpendPermissionManager ABI
export const spendPermissionManagerABI = [
  {
    "inputs": [],
    "name": "InvalidPermission",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidSignature",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "PermissionExceeded",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "PermissionExpired",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "PermissionUsed",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint160",
        "name": "amount",
        "type": "uint160"
      }
    ],
    "name": "SpendPermit",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "DOMAIN_SEPARATOR",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "getRemainingAllowance",
    "outputs": [
      {
        "internalType": "uint160",
        "name": "amount",
        "type": "uint160"
      },
      {
        "internalType": "uint48",
        "name": "valid",
        "type": "uint48"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "uint160",
            "name": "allowance",
            "type": "uint160"
          },
          {
            "internalType": "uint48",
            "name": "period",
            "type": "uint48"
          },
          {
            "internalType": "uint48",
            "name": "start",
            "type": "uint48"
          },
          {
            "internalType": "uint48",
            "name": "end",
            "type": "uint48"
          },
          {
            "internalType": "uint256",
            "name": "salt",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "extraData",
            "type": "bytes"
          }
        ],
        "internalType": "struct SpendPermissionManager.SpendPermission",
        "name": "permission",
        "type": "tuple"
      },
      {
        "internalType": "uint160",
        "name": "amount",
        "type": "uint160"
      },
      {
        "internalType": "bytes",
        "name": "signature",
        "type": "bytes"
      }
    ],
    "name": "getRequiredAllowancePermitCalldata",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "calldata_",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "uint160",
            "name": "allowance",
            "type": "uint160"
          },
          {
            "internalType": "uint48",
            "name": "period",
            "type": "uint48"
          },
          {
            "internalType": "uint48",
            "name": "start",
            "type": "uint48"
          },
          {
            "internalType": "uint48",
            "name": "end",
            "type": "uint48"
          },
          {
            "internalType": "uint256",
            "name": "salt",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "extraData",
            "type": "bytes"
          }
        ],
        "internalType": "struct SpendPermissionManager.SpendPermission",
        "name": "permission",
        "type": "tuple"
      },
      {
        "internalType": "bytes",
        "name": "signature",
        "type": "bytes"
      }
    ],
    "name": "permitSpend",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "uint160",
            "name": "allowance",
            "type": "uint160"
          },
          {
            "internalType": "uint48",
            "name": "period",
            "type": "uint48"
          },
          {
            "internalType": "uint48",
            "name": "start",
            "type": "uint48"
          },
          {
            "internalType": "uint48",
            "name": "end",
            "type": "uint48"
          },
          {
            "internalType": "uint256",
            "name": "salt",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "extraData",
            "type": "bytes"
          }
        ],
        "internalType": "struct SpendPermissionManager.SpendPermission",
        "name": "permission",
        "type": "tuple"
      },
      {
        "internalType": "uint160",
        "name": "amount",
        "type": "uint160"
      },
      {
        "internalType": "bytes",
        "name": "signature",
        "type": "bytes"
      }
    ],
    "name": "permitSpendWithAmount",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "spent",
    "outputs": [
      {
        "internalType": "uint160",
        "name": "amount",
        "type": "uint160"
      },
      {
        "internalType": "uint48",
        "name": "lastUpdated",
        "type": "uint48"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "uint160",
            "name": "allowance",
            "type": "uint160"
          },
          {
            "internalType": "uint48",
            "name": "period",
            "type": "uint48"
          },
          {
            "internalType": "uint48",
            "name": "start",
            "type": "uint48"
          },
          {
            "internalType": "uint48",
            "name": "end",
            "type": "uint48"
          },
          {
            "internalType": "uint256",
            "name": "salt",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "extraData",
            "type": "bytes"
          }
        ],
        "internalType": "struct SpendPermissionManager.SpendPermission",
        "name": "permission",
        "type": "tuple"
      },
      {
        "internalType": "bytes",
        "name": "signature",
        "type": "bytes"
      }
    ],
    "name": "validatePermitSpend",
    "outputs": [],
    "stateMutability": "view",
    "type": "function"
  }
];
