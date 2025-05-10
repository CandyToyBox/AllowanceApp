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

    // For demonstration purposes, we're just showing the approval part
    // In a real application, you would use the allowance to send tokens from the user's account
    console.log(`Subscription approved for account: ${permission.account}`);
    console.log(`Allowance: ${subscriptionAmount.toString()}`);
    
    // Note: In a production app, you would actually send tokens from the user account
    // But for this demo, we just log the approval

    return {
      transactionHash: hash,
      message: "Subscription successfully collected",
    };
  } catch (error: any) {
    console.error("Failed to collect subscription:", error);
    throw new Error(`Failed to collect subscription: ${error.message}`);
  }
}
