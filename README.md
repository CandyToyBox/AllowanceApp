# Coinbase Smart Wallet with Sub Accounts and Spend Limits Demo

This application demonstrates the integration of Coinbase Smart Wallet with Sub Accounts and Spend Limits on the Base blockchain. It allows users to connect their Smart Wallet, create and manage spend limits, sign messages, and send transactions.

## Features

### 1. Wallet Connection
- Connect to Coinbase Smart Wallet with Sub Accounts
- View wallet details (address, chain ID)
- Disconnect functionality
- Proper error handling for wallet connections

### 2. Spend Limits
- Create spend limits for third-party spenders
- Authorize a recurring spending allowance (0.01 ETH per day)
- Sign spend limit permissions using EIP-712 typed data signatures
- Collect subscription payments without requiring additional signatures

### 3. Wallet Actions
- Sign messages to verify wallet ownership
- Send transactions to other addresses
- View transaction history and status

## Technology Stack

- **Frontend**: React.js with Vite
- **Backend**: Express.js
- **Blockchain Interaction**: Wagmi hooks and Viem
- **UI Components**: Shadcn UI components
- **State Management**: React Query
- **Network**: Base Sepolia testnet

## How It Works

### Smart Wallet Integration
The application uses Wagmi hooks to connect to Coinbase Smart Wallet with Sub Accounts. The wallet connection is managed through the WalletConnection component, which handles the connection state and displays the user's wallet address.

### Spend Limits
1. Users connect their Smart Wallet
2. They authorize a spend limit (0.01 ETH per day) by signing a permission with their wallet
3. This creates a recurring allowance that the spender can collect from without requiring additional signatures
4. The SpendLimits component manages this flow and displays transaction history

### Backend Integration
The server-side code handles the collection of subscriptions by:
1. Receiving the signed permission and signature
2. For demo purposes, it simulates a transaction instead of actually calling the blockchain
3. Returns a transaction hash and metadata for display in the UI

## Project Structure

```
├── client
│   ├── src
│   │   ├── components       # UI components
│   │   ├── hooks            # Custom React hooks
│   │   ├── lib              # Utility functions and configuration
│   │   │   ├── abi          # Smart contract ABIs
│   │   ├── pages            # Page components
├── server
│   ├── lib                  # Server utilities
│   ├── routes.ts            # API endpoints
```

## Smart Contract Information

The application interacts with the SpendPermissionManager contract on Base Sepolia:
- Contract Address: `0x000000000022D473030F116dDEE9F6B43aC78BA3`
- This contract manages the spend permissions and allows for subscription-like payments

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Connect your Coinbase Smart Wallet
5. Authorize a spend limit
6. Collect subscription payments without additional signatures

## Development Notes

- The application uses lowercase addresses to ensure compatibility with Viem's strict address validation
- For demo purposes, a hardcoded spender address is used in client-side code
- In a production environment, environment variables would be properly configured
- The server simulates subscription collection without actually calling the blockchain