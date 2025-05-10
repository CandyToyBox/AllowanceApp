import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type Address } from "viem"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Shortens an Ethereum address for display purposes
 * e.g., 0x1234...5678
 */
export function shortenAddress(address?: Address | string, chars = 4): string {
  if (!address) return "";
  const prefixLength = 2; // "0x"
  return `${address.substring(0, chars + prefixLength)}...${address.substring(address.length - chars)}`;
}

/**
 * Formats a number as a currency string
 * e.g., 1000 -> $10.00
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

/**
 * Formats a date for display
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
