import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccount, useSendTransaction, useSignMessage } from "wagmi";
import { parseEther } from "viem";

export default function WalletActions() {
  const account = useAccount();
  const isConnected = account.status === "connected";
  
  // Sign Message
  const [message, setMessage] = useState("Hello World");
  const { signMessage, data: signData, isLoading: isSignLoading, reset: resetSign } = useSignMessage();
  
  // Send Transaction
  const [recipient, setRecipient] = useState("0xd8da6bf26964af9d7eed9e03e53415d37aa96045");
  const [amount, setAmount] = useState("0.001");
  const { 
    sendTransactionAsync, 
    data: txData, 
    isLoading: isTxLoading,
    reset: resetTx
  } = useSendTransaction();
  
  const handleSignMessage = () => {
    if (!message.trim()) return;
    resetSign();
    signMessage({ message });
  };
  
  const handleSendTransaction = async () => {
    if (!recipient || !amount) return;
    resetTx();
    
    try {
      await sendTransactionAsync({
        to: recipient,
        value: parseEther(amount),
      });
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };
  
  return (
    <Card className="bg-white shadow-sm border border-[#E5E5E5]">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Wallet Actions</h2>
        
        <div className="space-y-4">
          {/* Sign Message Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Sign Message</h3>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Enter a message to sign"
                className="flex-1 py-2 px-3 border border-[#AAAAAA] rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={!isConnected || isSignLoading}
              />
              <Button
                className="whitespace-nowrap py-2 px-4 border border-primary text-primary font-medium rounded-lg hover:bg-[#EBF0FF] transition-colors"
                variant="outline"
                onClick={handleSignMessage}
                disabled={!isConnected || isSignLoading}
              >
                {isSignLoading ? "Signing..." : "Sign"}
              </Button>
            </div>
            {signData && (
              <div className="p-3 border border-[#E5E5E5] rounded-lg bg-[#F6F6F6] text-sm font-mono">
                <p className="text-xs text-[#676767] mb-1">Signed Message:</p>
                <p className="text-xs break-all">{signData}</p>
              </div>
            )}
          </div>
          
          {/* Send Transaction Section */}
          <div className="pt-4 border-t border-[#E5E5E5] space-y-3">
            <h3 className="text-sm font-semibold">Send Transaction</h3>
            <div className="space-y-3">
              <div>
                <Label className="block text-xs text-[#676767] mb-1">Recipient Address</Label>
                <Input
                  placeholder="0x..."
                  className="w-full py-2 px-3 border border-[#AAAAAA] rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  disabled={!isConnected || isTxLoading}
                />
              </div>
              <div>
                <Label className="block text-xs text-[#676767] mb-1">Amount (ETH)</Label>
                <Input
                  type="number"
                  placeholder="0.001"
                  className="w-full py-2 px-3 border border-[#AAAAAA] rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.001"
                  min="0"
                  disabled={!isConnected || isTxLoading}
                />
              </div>
              <Button
                className="w-full py-3 px-4 bg-primary text-white font-medium rounded-lg hover:bg-[#0039B3] transition-colors"
                onClick={handleSendTransaction}
                disabled={!isConnected || isTxLoading}
              >
                {isTxLoading ? "Sending..." : "Send Transaction"}
              </Button>
              
              {/* Transaction Success Message */}
              {txData && (
                <div className="p-3 bg-[#E6F7EF] rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#05B169]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium text-[#05B169]">Transaction sent successfully! 🎉</p>
                  </div>
                  <p className="text-xs text-[#444444] mt-1 break-all">
                    <a 
                      href={`https://sepolia.basescan.org/tx/${txData}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {txData}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
