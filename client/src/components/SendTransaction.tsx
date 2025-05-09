import { useState } from "react";
import { useAccount, useSendTransaction } from "wagmi";
import { parseEther } from "viem";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowLeftRight, Check } from "lucide-react";
import { formatTransactionUrl } from "@/lib/utils";

export default function SendTransaction() {
  const { chain } = useAccount();
  const [recipient, setRecipient] = useState("0xd8da6bf26964af9d7eed9e03e53415d37aa96045");
  const [amount, setAmount] = useState("0.001");
  const [error, setError] = useState("");

  const { 
    sendTransactionAsync, 
    data: txHash,
    isPending
  } = useSendTransaction();

  const handleSendTransaction = async () => {
    try {
      setError("");
      if (!recipient.startsWith("0x") || recipient.length !== 42) {
        throw new Error("Invalid recipient address");
      }
      
      const etherValue = parseFloat(amount);
      if (isNaN(etherValue) || etherValue <= 0) {
        throw new Error("Invalid amount");
      }

      await sendTransactionAsync({
        to: recipient as `0x${string}`,
        value: parseEther(amount),
      });
    } catch (err: any) {
      setError(err.message || "Failed to send transaction");
    }
  };

  const txUrl = txHash ? formatTransactionUrl(chain?.id || 84532, txHash) : "";

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Send Transaction</h2>
        <p className="text-textSecondary mb-4">
          Send ETH from your Sub Account. Transactions are limited by your configured Spend Limits.
        </p>
        
        <div className="mb-4">
          <Label htmlFor="recipient" className="block text-sm font-medium text-textSecondary mb-1">
            Recipient Address
          </Label>
          <Input 
            id="recipient" 
            value={recipient} 
            onChange={(e) => setRecipient(e.target.value)} 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        
        <div className="mb-4">
          <Label htmlFor="amount" className="block text-sm font-medium text-textSecondary mb-1">
            Amount (ETH)
          </Label>
          <div className="relative">
            <Input 
              id="amount" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary pr-12"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-textSecondary">
              ETH
            </div>
          </div>
          <div className="text-xs text-textSecondary mt-1">Spend limit: 0.01 ETH per 24 hours</div>
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
          onClick={handleSendTransaction} 
          disabled={isPending}
          className="mb-4 bg-primary hover:bg-primary/90 text-white font-medium"
        >
          <ArrowLeftRight className="h-5 w-5 mr-2" />
          Send Transaction
        </Button>
        
        {txHash && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg">
            <div className="flex items-start">
              <Check className="h-5 w-5 mr-2 mt-0.5" />
              <div>
                <div className="font-medium">Transaction sent successfully! 🎉</div>
                <a 
                  href={txUrl} 
                  className="text-sm hover:underline text-primary block mt-1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  View on Basescan
                </a>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
