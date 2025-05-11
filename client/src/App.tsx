import { Switch, Route, Link as WouterLink } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ParentDashboard from "@/pages/ParentDashboard";
import ChildDashboard from "@/pages/ChildDashboard";
import { WagmiProvider } from "wagmi";
import { getConfig } from "./lib/wagmi";
import { Button } from "@/components/ui/button";

function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-blue-950 to-indigo-900 text-white p-4 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <WouterLink href="/">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-200 to-purple-200 text-transparent bg-clip-text cursor-pointer">
              AllowanceApp
            </span>
          </WouterLink>
        </div>
        
        <div className="flex space-x-2">
          <WouterLink href="/parent">
            <Button variant="ghost" className="text-white hover:bg-blue-800">
              Parent Dashboard
            </Button>
          </WouterLink>
          <WouterLink href="/child">
            <Button variant="ghost" className="text-white hover:bg-blue-800">
              Child Dashboard
            </Button>
          </WouterLink>
        </div>
      </div>
    </nav>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 dark:bg-gray-950">
        {children}
      </main>
      <footer className="bg-slate-900 text-white py-4 text-center text-sm">
        <div className="container mx-auto">
          <p>
            © {new Date().getFullYear()} AllowanceApp | Built with Sub Accounts & Spend Limits on Base
          </p>
        </div>
      </footer>
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/parent" component={ParentDashboard} />
        <Route path="/child" component={ChildDashboard} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <WagmiProvider config={getConfig()}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
