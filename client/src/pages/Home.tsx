import { useEffect } from "react";
import { Link as WouterLink } from "wouter";
import WalletConnect from "@/components/WalletConnect";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import logoImage from "../assets/logo.png";

export default function Home() {
  // Check the connection status when the component mounts
  const { address, status } = useAccount();
  const isConnected = status === "connected";

  // Update the page title when the component mounts
  useEffect(() => {
    document.title = "AllowanceApp - Sub Accounts & Spend Limits";
  }, []);

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden bg-gradient-to-b from-blue-950 to-indigo-900 pb-16 pt-10 md:pb-24 md:pt-20">
        <div className="absolute top-0 left-0 right-0 z-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="opacity-20">
            <path fill="#4F46E5" fillOpacity="1" d="M0,256L48,229.3C96,203,192,149,288,154.7C384,160,480,224,576,234.7C672,245,768,203,864,186.7C960,171,1056,181,1152,186.7C1248,192,1344,192,1392,192L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
          </svg>
        </div>
        
        <div className="absolute inset-0 z-0">
          <div className="absolute left-[10%] top-[20%] h-48 w-48 rounded-full bg-purple-500 opacity-20 blur-3xl"></div>
          <div className="absolute right-[15%] bottom-[20%] h-64 w-64 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12">
            <div className="text-center lg:text-left lg:max-w-xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Allowance Made <span className="bg-gradient-to-r from-blue-300 to-purple-300 text-transparent bg-clip-text">Smarter</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-lg mx-auto lg:mx-0">
                Manage children's allowances with blockchain-powered Sub Accounts and Spend Limits. Assign tasks, reward completion, and teach financial responsibility.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <WouterLink href="/parent">
                  <Button size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8">
                    Parent Dashboard
                  </Button>
                </WouterLink>
                <WouterLink href="/child">
                  <Button size="lg" variant="outline" className="bg-purple-600 text-white border-purple-400 hover:bg-purple-700 hover:border-purple-300 px-8">
                    Child Dashboard
                  </Button>
                </WouterLink>
              </div>
            </div>
            
            <div className="relative bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-xl lg:w-[450px]">
              <div className="absolute -top-4 -right-4 h-24 w-24 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full opacity-30 blur-2xl"></div>
              <div className="mb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-36 h-36 rounded-full bg-gradient-to-r from-yellow-500 to-purple-500 flex items-center justify-center p-4">
                    <span className="text-3xl font-bold text-white">AllowanceApp</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-center text-white">Connect Your Wallet</h3>
                <p className="text-blue-200 text-center mt-2">
                  Sign in with your wallet to access the full features of AllowanceApp
                </p>
              </div>
              
              <WalletConnect />
              
              <div className="mt-6 pt-6 border-t border-white/10 text-center">
                <p className="text-blue-200 text-sm">
                  Built on Base with Coinbase Smart Wallet's Sub Accounts and Spend Limits
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-50 dark:bg-slate-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
              How AllowanceApp Works
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Combining traditional allowance management with blockchain technology for a secure, educational experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Parent Controls</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Create and manage Sub Accounts for your children, set Spend Limits, assign tasks, and review proof of completion.
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600 dark:text-purple-400">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Smart Wallets</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Each child gets their own blockchain Sub Account with customizable Spend Limits for safe, controlled transactions.
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="M12 16v.01"></path>
                  <path d="M6 12v.01"></path>
                  <path d="M12 12v.01"></path>
                  <path d="M18 12v.01"></path>
                  <path d="M6 8v.01"></path>
                  <path d="M12 8v.01"></path>
                  <path d="M18 8v.01"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Task & Reward System</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Children complete tasks, submit proof images, and earn allowance directly in their wallet when approved by parents.
              </p>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-6">
              Ready to transform how you manage allowances?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isConnected ? (
                <>
                  <WouterLink href="/parent">
                    <Button size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8">
                      Get Started
                    </Button>
                  </WouterLink>
                </>
              ) : (
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8" onClick={() => document.getElementById('connect-section')?.scrollIntoView({ behavior: 'smooth' })}>
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-100 dark:bg-slate-800 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
              Powered by Blockchain Technology
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
              Built on Base with Coinbase Smart Wallet technology, featuring Sub Accounts and Spend Limits
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center space-x-2 bg-white dark:bg-slate-700 py-2 px-4 rounded-full shadow-sm">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                <span className="text-slate-700 dark:text-slate-200">Base Testnet</span>
              </div>
              <div className="flex items-center space-x-2 bg-white dark:bg-slate-700 py-2 px-4 rounded-full shadow-sm">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-slate-700 dark:text-slate-200">Smart Wallets</span>
              </div>
              <div className="flex items-center space-x-2 bg-white dark:bg-slate-700 py-2 px-4 rounded-full shadow-sm">
                <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                <span className="text-slate-700 dark:text-slate-200">Sub Accounts</span>
              </div>
              <div className="flex items-center space-x-2 bg-white dark:bg-slate-700 py-2 px-4 rounded-full shadow-sm">
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                <span className="text-slate-700 dark:text-slate-200">Spend Limits</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
