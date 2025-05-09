import { useAccount } from "wagmi";

export default function Header() {
  const { chainId } = useAccount();
  
  return (
    <header className="py-4 px-6 border-b border-[#E5E5E5] bg-white">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* Logo representation */}
          <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </div>
          <h1 className="font-bold text-xl text-[#111111]">Smart Wallet Demo</h1>
        </div>

        <div className="hidden md:flex gap-4 items-center">
          <div className="text-sm font-medium text-[#676767]">
            {chainId === 84532 ? 'Base Sepolia Testnet' : chainId === 8453 ? 'Base Mainnet' : 'Unknown Network'}
          </div>
          <div className="h-5 w-5 rounded-full bg-[#05B169] animate-pulse"></div>
        </div>
      </div>
    </header>
  );
}
