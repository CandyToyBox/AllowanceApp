import { Link } from "wouter";
import { Github } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h5v-2H8v2h3z"/>
          </svg>
          <span className="text-xl font-semibold">Smart Wallet Demo</span>
        </div>
        <div>
          <a 
            href="https://github.com/base/demos/tree/master/smart-wallet" 
            className="text-sm text-primary hover:underline flex items-center" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <span>View on GitHub</span>
            <Github className="h-4 w-4 ml-1" />
          </a>
        </div>
      </div>
    </header>
  );
}
