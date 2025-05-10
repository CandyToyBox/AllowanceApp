import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAccount, useSignTypedData } from "wagmi";
import { Address, Hex, parseUnits } from "viem";
import { useQuery } from "@tanstack/react-query";
import { spendPermissionManagerAddress } from "@/lib/abi/SpendPermissionManager";

export default function SpendLimits() {
  const [isDisabled, setIsDisabled] = useState(false);
  const [signature, setSignature] = useState<Hex>();
  const [transactions, setTransactions] = useState<Array<{hash: string, timestamp: number}>>([]);
  const [spendPermission, setSpendPermission] = useState<object>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { signTypedDataAsync } = useSignTypedData();
  const account = useAccount();
  
  // For demo purposes, use Base Sepolia by default
  const chainId = account.chainId || 84532; 

  // Helper function to collect subscription payments
  const collectSubscription = async () => {
    setIsDisabled(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    interface CollectResponseData {
      transactionHash: string;
      message: string;
      amount: string;
      timestamp: number;
    }
    
    let data: CollectResponseData | undefined;
    try {
      const replacer = (key: string, value: any) => {
        if (typeof value === "bigint") {
          return value.toString();
        }
        return value;
      };
      
      const response = await fetch("/api/collect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          {
            spendPermission,
            signature,
            dummyData: Math.ceil(Math.random() * 100),
          },
          replacer
        ),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Network response was not ok");
      }
      
      data = await response.json() as CollectResponseData;
      
      if (data && data.transactionHash) {
        setTransactions(prev => [
          { 
            hash: data.transactionHash, 
            timestamp: data.timestamp || Date.now()
          },
          ...prev,
        ]);
        
        setSuccessMessage(`Successfully collected subscription payment of 0.001 ETH`);
      }
    } catch (e: any) {
      console.error("Error collecting subscription:", e);
      setErrorMessage(e.message || "Failed to collect subscription. Please try again.");
    }
    
    setIsDisabled(false);
    return data;
  };
  
  // Setup react-query for the collection function
  const { isLoading, refetch } = useQuery({
    queryKey: ["collectSubscription"],
    queryFn: collectSubscription,
    refetchOnWindowFocus: false,
    enabled: false, // Don't fetch automatically, only when button is clicked
  });

  // Demo wallet address function - use properly formatted address
  const getDemoWalletAddress = (): Address => {
    // For demo purposes, use a valid lowercase Ethereum address
    return "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266" as Address;
  };

  // Function to submit a subscription
  const handleSubscribe = async () => {
    setIsDisabled(true);
    setErrorMessage(null);
    
    try {
      // Check if wallet is connected
      if (account.status !== "connected") {
        setErrorMessage("Please connect your wallet first");
        return;
      }
      
      // Get wallet address - for demo purposes
      const walletAddress = getDemoWalletAddress();
      
      // Use the spender address from environment variables as recommended in docs
      const spenderAddress = (process.env.NEXT_PUBLIC_SPENDER_ADDRESS || "0x422289a2a34f11f8be5d74bdba748a484390dbde").toLowerCase() as Address;
      
      // Create the spend permission data - following the documentation
      const permissionData = {
        account: walletAddress, // User wallet address
        spender: spenderAddress, // Spender address
        token: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" as Address, // ETH (EIP-7528 standard)
        allowance: parseUnits("0.01", 18), // 0.01 ETH per period
        period: 86400, // seconds in a day
        start: 0, // unix timestamp (0 for immediate start)
        end: 281474976710655, // max uint48 (far future expiration)
        salt: BigInt(0), // Used for uniqueness - zero for demo
        extraData: "0x" as Hex, // No extra data needed
      };

      // Sign the permission
      const typedSignature = await signTypedDataAsync({
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
        message: permissionData,
      });
      
      setSpendPermission(permissionData);
      setSignature(typedSignature);
    } catch (e: any) {
      console.error("Error signing message:", e);
      setErrorMessage(e.message || "Failed to sign message");
    } finally {
      setIsDisabled(false);
    }
  };

  // Format time for display
  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  return (
    <Card className="bg-white shadow-sm border border-[#E5E5E5]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Spend Limits</h2>
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#EBF0FF] text-primary text-xs font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v-1l1-1 1-1 .257-.257A6 6 0 1118 8zm-6-4a1 1 0 100 2h4a1 1 0 100-2h-4z" clipRule="evenodd" />
            </svg>
            Active
          </span>
        </div>
        
        <div className="space-y-4">
          <div className="p-3 bg-[#F6F6F6] rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium">ETH</p>
              <div className="text-xs px-2 py-0.5 bg-[#E5E5E5] rounded-full">Native</div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold">0.01 ETH</p>
              <p className="text-sm text-[#676767]">per 24h</p>
            </div>
          </div>
          
          {!signature ? (
            <>
              <Button
                className="w-full py-3 px-4 bg-primary text-white font-medium rounded-lg hover:bg-[#0039B3] transition-colors"
                onClick={handleSubscribe}
                disabled={isDisabled || account.status !== "connected"}
              >
                {isDisabled ? "Processing..." : "Subscribe"}
              </Button>
              {errorMessage && (
                <div className="mt-2 p-2 bg-red-50 text-red-600 text-sm rounded-md">
                  {errorMessage}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <Button
                className="w-full py-3 px-4 bg-[#05B169] text-white font-medium rounded-lg hover:bg-[#04a05e] transition-colors"
                onClick={() => refetch()}
                disabled={isDisabled || isLoading}
              >
                {isDisabled || isLoading ? "Processing..." : "Collect Subscription"}
              </Button>
              
              {/* Success message */}
              {successMessage && (
                <div className="mt-2 p-2 bg-green-50 text-green-600 text-sm rounded-md">
                  {successMessage}
                </div>
              )}
              
              {/* Error message */}
              {errorMessage && (
                <div className="mt-2 p-2 bg-red-50 text-red-600 text-sm rounded-md">
                  {errorMessage}
                </div>
              )}
              
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Subscription Payments</h3>
                {transactions.length === 0 ? (
                  <p className="text-sm text-[#676767]">No transactions yet</p>
                ) : (
                  transactions.map((tx, i) => (
                    <a 
                      key={i} 
                      href={`https://sepolia.basescan.org/tx/${tx.hash}`}
                      className="block p-3 bg-[#F6F6F6] rounded-lg hover:bg-[#E5E5E5] transition-all duration-200"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#05B169]" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium truncate">
                          {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                        </span>
                      </div>
                      <div className="mt-1 flex justify-between items-center">
                        <span className="text-xs text-[#676767]">{formatTimeAgo(tx.timestamp)}</span>
                        <span className="text-xs font-medium">0.001 ETH</span>
                      </div>
                    </a>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
