import { useState, useEffect } from "react";
import { useAccount, useSignTypedData, useChainId } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { Address, Hex, parseEther, toHex } from "viem";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Lock, Unlock, ArrowLeftRight, Info } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatDate, formatTransactionUrl, formatEther } from "@/lib/utils";
import { spendPermissionManagerAddress } from "@/lib/abi/SpendPermissionManager";

interface SubscriptionState {
  isSubscribed: boolean;
  signature?: Hex;
  spendPermission?: any;
  transactions: Array<{
    hash: string;
    amount: string;
    timestamp: string;
  }>;
  usedToday: string;
}

export default function SpendLimits() {
  const chainId = useChainId();
  const account = useAccount();
  const { signTypedDataAsync } = useSignTypedData();
  const [state, setState] = useState<SubscriptionState>({
    isSubscribed: false,
    transactions: [],
    usedToday: "0",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Query to check if already subscribed
  const { data: subscriptionData, refetch: refetchSubscription } = useQuery({
    queryKey: ['/api/subscription', account.address],
    enabled: !!account.address,
  });

  useEffect(() => {
    if (subscriptionData) {
      setState((prev) => ({
        ...prev,
        isSubscribed: !!subscriptionData.isSubscribed,
        transactions: subscriptionData.transactions || [],
        usedToday: subscriptionData.usedToday || "0",
        signature: subscriptionData.signature,
        spendPermission: subscriptionData.spendPermission,
      }));
    }
  }, [subscriptionData]);

  const handleSubscribe = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!account.address) {
        throw new Error("Wallet not connected");
      }

      // Define a SpendPermission to request from the user
      const spendPermission = {
        account: account.address as Address,
        spender: process.env.NEXT_PUBLIC_SPENDER_ADDRESS as Address || "0x1234567890123456789012345678901234567890",
        token: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" as Address, // ETH
        allowance: parseEther("10"),
        period: 86400, // 24 hours in seconds
        start: 0, // Start immediately
        end: 281474976710655, // Max uint48
        salt: BigInt(0),
        extraData: "0x" as Hex,
      };

      // Sign the spend permission
      const signature = await signTypedDataAsync({
        domain: {
          name: "Spend Limit Manager",
          version: "1",
          chainId: chainId,
          verifyingContract: spendPermissionManagerAddress,
        },
        types: {
          SpendPermission: [
            { name: "account", type: "address" },
            { name: "spender", type: "address" },
            { name: "token", type: "address" },
            { name: "allowance", type: "uint160" },
            { name: "period", type: "uint48" },
            { name: "start", type: "uint48" },
            { name: "end", type: "uint48" },
            { name: "salt", type: "uint256" },
            { name: "extraData", type: "bytes" },
          ],
        },
        primaryType: "SpendPermission",
        message: spendPermission,
      });

      // Register the subscription on the server
      await apiRequest('POST', '/api/subscription', {
        spendPermission: {
          ...spendPermission,
          allowance: spendPermission.allowance.toString(),
          salt: spendPermission.salt.toString(),
        },
        signature
      });

      setState((prev) => ({
        ...prev,
        isSubscribed: true,
        signature,
        spendPermission,
      }));

      await refetchSubscription();
    } catch (err: any) {
      setError(err.message || "Failed to subscribe");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCollectSubscription = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!state.signature || !state.spendPermission) {
        throw new Error("No valid subscription found");
      }

      const response = await apiRequest('POST', '/api/collect', {
        spendPermission: {
          ...state.spendPermission,
          allowance: state.spendPermission.allowance.toString(),
          salt: state.spendPermission.salt.toString(),
        },
        signature: state.signature,
      });

      const data = await response.json();

      // Add the new transaction to the list
      if (data.transactionHash) {
        setState((prev) => ({
          ...prev,
          transactions: [
            {
              hash: data.transactionHash,
              amount: "0.001",
              timestamp: new Date().toISOString(),
            },
            ...prev.transactions,
          ],
          usedToday: (parseFloat(prev.usedToday) + 0.001).toString(),
        }));
      }
    } catch (err: any) {
      setError(err.message || "Failed to collect subscription");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await apiRequest('DELETE', '/api/subscription', {
        account: account.address,
      });

      setState((prev) => ({
        ...prev,
        isSubscribed: false,
        signature: undefined,
        spendPermission: undefined,
      }));
    } catch (err: any) {
      setError(err.message || "Failed to unsubscribe");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate percentage of daily limit used
  const dailyLimitUsed = parseFloat(state.usedToday) / 0.01 * 100;

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-2">Subscription with Spend Limits</h2>
        <p className="text-textSecondary mb-6">
          Authorize our service to use your funds without requiring additional signatures.
        </p>
        
        {!state.isSubscribed ? (
          <div>
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-start">
                <Info className="h-6 w-6 text-primary mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900">About Spend Limits</h3>
                  <div className="mt-1 text-sm text-blue-800">
                    <p>By subscribing, you'll authorize our service to:</p>
                    <ul className="list-disc ml-5 mt-1">
                      <li>Spend up to 10 ETH from your wallet</li>
                      <li>Limited to 0.01 ETH per day</li>
                      <li>No additional signatures required for future transactions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                  <div>{error}</div>
                </div>
              </div>
            )}
            
            <Button 
              onClick={handleSubscribe} 
              disabled={isLoading || !account.address}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-medium"
            >
              <Lock className="h-5 w-5 mr-2" />
              Subscribe
            </Button>
          </div>
        ) : (
          <div>
            <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-start">
                <Check className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <h3 className="font-medium text-green-800">Subscription Active</h3>
                  <p className="mt-1 text-sm text-green-700">
                    You have successfully authorized our service to use your funds.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <div className="text-sm text-textSecondary">Daily spending limit</div>
                <div className="font-medium">0.01 ETH</div>
              </div>
              <Progress value={dailyLimitUsed} className="h-2" />
              <div className="flex justify-between mt-1">
                <div className="text-xs text-textSecondary">0 ETH</div>
                <div className="text-xs text-textSecondary">
                  {state.usedToday} ETH used today
                </div>
              </div>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                  <div>{error}</div>
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <Button 
                onClick={handleCollectSubscription} 
                disabled={isLoading}
                className="mb-4 sm:mb-0 bg-primary hover:bg-primary/90 text-white font-medium"
              >
                <ArrowLeftRight className="h-5 w-5 mr-2" />
                Collect Subscription
              </Button>
              
              <Button 
                onClick={handleUnsubscribe} 
                disabled={isLoading}
                variant="outline"
                className="text-textSecondary hover:text-textPrimary"
              >
                <Unlock className="h-5 w-5 mr-2" />
                Unsubscribe
              </Button>
            </div>
            
            {state.transactions.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium mb-3">Subscription Payments</h3>
                <div className="divide-y">
                  {state.transactions.map((tx, index) => (
                    <div key={index} className="py-3 first:pt-0">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{tx.amount} ETH collected</div>
                          <div className="text-sm text-textSecondary">
                            {formatDate(tx.timestamp)}
                          </div>
                        </div>
                        <a 
                          href={formatTransactionUrl(chainId, tx.hash)} 
                          className="text-primary hover:underline text-sm" 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
