import { useEffect } from "react";
import { useAccount } from "wagmi";
import Header from "@/components/Header";
import WalletConnect from "@/components/WalletConnect";
import MessageSigning from "@/components/MessageSigning";
import SendTransaction from "@/components/SendTransaction";
import SpendLimits from "@/components/SpendLimits";
import Footer from "@/components/Footer";

export default function Home() {
  const account = useAccount();
  const isConnected = account.status === "connected";

  // Set page title
  useEffect(() => {
    document.title = "Smart Wallet Demo | Base";
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow">
        <div className="mb-6">
          <WalletConnect />
        </div>
        
        {isConnected && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MessageSigning />
            <SendTransaction />
            <div className="lg:col-span-2">
              <SpendLimits />
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
