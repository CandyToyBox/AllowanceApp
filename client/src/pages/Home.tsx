import { useEffect } from "react";
import Header from "@/components/Header";
import WalletConnection from "@/components/WalletConnection";
import SpendLimits from "@/components/SpendLimits";
import WalletActions from "@/components/WalletActions";
import InfoSection from "@/components/InfoSection";
import { useAccount } from "wagmi";

export default function Home() {
  // Check the connection status when the component mounts
  const account = useAccount();
  const isConnected = account.status === "connected";

  // Update the page title when the component mounts
  useEffect(() => {
    document.title = "Smart Wallet Sub Account Demo";
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="mx-auto max-w-7xl">
        <Header />
        
        <main className="p-6">
          {/* Intro banner when not connected */}
          {!isConnected && (
            <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <h2 className="text-xl font-semibold text-primary mb-2">
                Smart Wallet Demo with Sub Accounts and Spend Limits
              </h2>
              <p className="text-gray-700">
                This demo showcases Coinbase Smart Wallet's capabilities with Sub Accounts and Spend Limits.
                First, connect your wallet using the "Sign in with Smart Wallet" button to get started.
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Wallet Connection Section */}
            <div className="lg:col-span-1">
              <WalletConnection />
            </div>
            
            {/* Sub Account Section */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SpendLimits />
                <WalletActions />
              </div>
            </div>
          </div>
          
          <InfoSection />
        </main>
      </div>
    </div>
  );
}
