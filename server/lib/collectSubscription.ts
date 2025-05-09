import { type PublicClient, type WalletClient, type Address, parseEther, Hex } from "viem";
import { spendPermissionManagerABI, spendPermissionManagerAddress } from "../../client/src/lib/abi/SpendPermissionManager";

export interface SpendPermission {
  account: Address;
  spender: Address;
  token: Address;
  allowance: bigint;
  period: number;
  start: number;
  end: number;
  salt: bigint;
  extraData: Hex;
}

export async function collectSubscription(
  publicClient: PublicClient,
  walletClient: WalletClient,
  permission: SpendPermission,
  signature: Hex
) {
  try {
    // Verify that we have an account to send from
    if (!walletClient.account) {
      throw new Error("No account available to send transaction");
    }

    // We'll use a small amount (0.001 ETH) for our subscription demo
    const subscriptionAmount = parseEther("0.001");

    // Use permitSpendWithAmount to authorize the spending of the tokens
    const hash = await walletClient.writeContract({
      address: spendPermissionManagerAddress,
      abi: spendPermissionManagerABI,
      functionName: "permitSpendWithAmount",
      args: [permission, subscriptionAmount, signature],
    });

    console.log(`Subscription collected: ${hash}`);

    // Send ETH to the spender from the user account
    const transferHash = await walletClient.sendTransaction({
      to: walletClient.account.address,
      value: 0n, // We don't need to send value here, just to use the authorization
    });

    console.log(`Transfer executed: ${transferHash}`);

    return {
      transactionHash: hash,
      message: "Subscription successfully collected",
    };
  } catch (error: any) {
    console.error("Failed to collect subscription:", error);
    throw new Error(`Failed to collect subscription: ${error.message}`);
  }
}
