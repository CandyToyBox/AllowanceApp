import { type ClassValue, clsx } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address: string | undefined, length = 4): string {
  if (!address) return '';
  return `${address.substring(0, length + 2)}...${address.substring(address.length - length)}`;
}

export function formatDate(date: Date | string | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  return format(dateObj, 'MMM dd, yyyy \'at\' HH:mm');
}

export function getBaseExplorerUrl(chainId: number): string {
  if (chainId === 84532) { // Base Sepolia
    return 'https://sepolia.basescan.org';
  } else if (chainId === 8453) { // Base Mainnet
    return 'https://basescan.org';
  }
  return 'https://sepolia.basescan.org'; // Default to Base Sepolia
}

export function formatTransactionUrl(chainId: number, hash: string): string {
  return `${getBaseExplorerUrl(chainId)}/tx/${hash}`;
}

export function formatEther(value: bigint | string): string {
  const val = typeof value === 'string' ? BigInt(value) : value;
  const divided = Number(val) / 1e18;
  return divided.toFixed(divided < 0.0001 ? 6 : 4);
}
