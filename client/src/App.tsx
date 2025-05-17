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
import logoImage from "./assets/logo.png";

function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-blue-950 to-indigo-900 text-white p-4 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <WouterLink href="/">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-purple-500"></div>
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-300 to-purple-400 text-transparent bg-clip-text cursor-pointer">
                AllowanceApp
              </span>
            </div>
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
