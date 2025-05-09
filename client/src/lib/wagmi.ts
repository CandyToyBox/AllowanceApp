import { http, cookieStorage, createConfig, createStorage } from "wagmi";
import { baseSepolia, base } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";
import { parseEther, toHex } from "viem";

// Determine whether we're in a development environment
const isDev = process.env.NODE_ENV === "development";

export function getConfig() {
  return createConfig({
    chains: [baseSepolia, base],
    connectors: [
      coinbaseWallet({
        appName: "Smart Wallet Demo",
        preference: {
          // Use development environment for Smart Wallet testing in dev mode
          keysUrl: isDev ? "https://keys-dev.coinbase.com/connect" : undefined,
          options: "smartWalletOnly",
        },
        subAccounts: {
          enableAutoSubAccounts: true,
          defaultSpendLimits: {
            84532: [ // Base Sepolia Chain ID
              {
                token: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // Native ETH
                allowance: toHex(parseEther('0.01')), // 0.01 ETH
                period: 86400, // 24h
              },
            ],
            8453: [ // Base Mainnet Chain ID
              {
                token: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // Native ETH
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

declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}
