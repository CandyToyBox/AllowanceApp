import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function WalletConnection() {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [copied, setCopied] = useState(false);

  const isConnected = account.status === "connected";
  
  // Extract display address from the account
  let displayAddress = "";
  let walletAddress = "";
  
  if (account.addresses) {
    const addresses = account.addresses as any;
    if (Array.isArray(addresses) && addresses.length > 0) {
      walletAddress = addresses[0];
    } else if (addresses?.primaryAddress) {
      walletAddress = addresses.primaryAddress;
    }
    
    if (walletAddress) {
      displayAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
    }
  }

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="bg-white shadow-sm border border-[#E5E5E5]">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Wallet Connection</h2>
        
        {!isConnected ? (
          <div className="space-y-4">
            <p className="text-[#676767] text-sm">Connect your Smart Wallet to interact with this application.</p>
            {connectors
              .filter((connector) => connector.name === "Coinbase Wallet")
              .map((connector) => (
                <Button
                  key={connector.uid}
                  className="w-full py-3 px-4 bg-primary text-white font-medium rounded-lg hover:bg-[#0039B3] transition-colors"
                  onClick={() => connect({ connector })}
                >
                  Sign in with Smart Wallet
                </Button>
              ))}
            {error && <p className="text-sm text-[#FF5C5C]">{error.message}</p>}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#05B169]"></div>
                  <p className="text-sm font-medium text-[#05B169]">Connected</p>
                </div>
                <div className="mt-3 space-y-1">
                  <p className="text-sm text-[#676767]">Sub Account Address:</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono bg-[#F6F6F6] py-1 px-2 rounded truncate">
                      {displayAddress}
                    </p>
                    <button 
                      className="text-primary hover:text-[#0039B3]"
                      onClick={copyAddress}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    </button>
                    {copied && (
                      <span className="text-xs text-[#05B169]">Copied!</span>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-[#676767]">Chain ID:</p>
                  <p className="text-sm font-medium">{account.chainId}</p>
                </div>
              </div>
            </div>
            <Button
              className="w-full py-2 px-4 border border-[#AAAAAA] text-[#444444] font-medium rounded-lg hover:bg-[#F6F6F6] transition-colors"
              variant="outline"
              onClick={() => disconnect()}
            >
              Disconnect
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
