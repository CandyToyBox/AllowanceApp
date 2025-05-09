import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Key, LogOut } from "lucide-react";
import { shortenAddress } from "@/lib/utils";

export default function WalletConnect() {
  const account = useAccount();
  const { connect, connectors, isLoading, error } = useConnect();
  const { disconnect } = useDisconnect();
  const isConnected = account.status === "connected";
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      setErrorMessage(error.message);
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleConnect = () => {
    const coinbaseConnector = connectors.find(c => c.name === "Coinbase Wallet");
    if (coinbaseConnector) {
      connect({ connector: coinbaseConnector });
    } else {
      setErrorMessage("Coinbase Wallet connector not found");
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Connect Wallet</h2>
        
        {!isConnected ? (
          <div>
            <p className="text-textSecondary mb-4">
              Connect your wallet to get started with Smart Wallet and Sub Accounts.
            </p>
            <Button 
              onClick={handleConnect}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-white font-medium"
            >
              <Key className="h-5 w-5 mr-2" />
              Sign in with Smart Wallet
            </Button>
            {errorMessage && (
              <p className="mt-2 text-sm text-destructive">{errorMessage}</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-textSecondary">Sub Account</div>
                  <div className="font-medium flex items-center">
                    <span className="text-sm truncate">
                      {shortenAddress(account.addresses?.subAccount)}
                    </span>
                    <button 
                      className="ml-2 text-primary hover:text-primary/80"
                      onClick={() => {
                        if (account.addresses?.subAccount) {
                          navigator.clipboard.writeText(account.addresses.subAccount);
                        }
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm bg-green-100 text-green-800 py-1 px-3 rounded-full">
                {account.chain?.name || "Base Sepolia"}
              </div>
              <Button 
                onClick={() => disconnect()}
                variant="outline"
                className="text-textSecondary hover:text-textPrimary"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
