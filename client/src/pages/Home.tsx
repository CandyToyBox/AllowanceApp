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

  // Update the page title when the component mounts
  useEffect(() => {
    document.title = "Smart Wallet Sub Account Demo";
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="mx-auto max-w-7xl">
        <Header />
        
        <main className="p-6">
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
