import { http, cookieStorage, createConfig, createStorage } from "wagmi";
import { baseSepolia, base } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";
import { parseEther, toHex } from "viem";
 
export function getConfig() {
  return createConfig({
    chains: [base],
    connectors: [
      coinbaseWallet({
        appName: "Smart Wallet Sub Account Demo",
        preference: {
          keysUrl: "https://keys.coinbase.com/connect",
          options: "smartWalletOnly",
        },
        subAccounts: {
          enableAutoSubAccounts: true,
          defaultSpendLimits: {
            8453: [ // Base Mainnet Chain ID
              {
                token: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
                allowance: toHex(parseEther('0.01')), // 0.01 ETH
                period: 86400, // 24h
              },
            ],
          },
        },
      }),
    ],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      [baseSepolia.id]: http(),
      [base.id]: http(),
    },
  });
}
