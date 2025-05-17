# AllowanceApp - Web3 Allowance Management for Families

![AllowanceApp Logo](public/logo.png)

> **Empowering Families to Automate, Track, and Reward—Onchain.**

AllowanceApp is a family-focused financial management platform that leverages Coinbase Smart Wallet technology to provide secure, controlled cryptocurrency transactions for parents and children on the Base blockchain. It combines traditional allowance management with blockchain technology to create an educational and secure financial experience.

## Features

### 1. Parent Dashboard
- Create and manage child accounts with customizable allowances
- Create task-based incentives with monetary rewards
- Set spending limits for children using Sub Account technology
- Review and approve/reject task completion proofs
- Monitor transaction history for all children's accounts
- Connect parent wallet to manage the entire family's finances

### 2. Child Dashboard
- View assigned tasks and upload proof of completion with images
- Track personal allowance balance and transaction history
- Spend allowance within parent-defined limits
- View task status (pending, completed, approved, rejected)
- Connect to child Sub Account wallet

### 3. Web3 Wallet Integration
- Secure connection to Coinbase Smart Wallet
- Sub Account setup for children with Parent Account as the owner
- Spend Limits for controlled transactions
- Blockchain-based transaction history
- Direct transfers to child accounts upon task completion

### 4. Task Management System
- Create tasks with titles, descriptions, and reward amounts
- Set task due dates
- Submit visual proof of task completion via image uploads
- Automatic notification of task status changes
- Reward disbursement upon task approval

## Technology Stack

- **Frontend**: React with TypeScript
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Blockchain**: Base Network with Viem/Wagmi
- **File Storage**: Local file system with automatic cleanup
- **UI Components**: Tailwind CSS with Shadcn UI components
- **Authentication**: Wallet-based authentication
- **State Management**: TanStack React Query

## Database Schema

The application uses a PostgreSQL database with the following schema:

- **Users**: Basic authentication information
- **Parents**: Parent account profiles linked to wallet addresses
- **Children**: Child accounts with allowance balances and spend limits
- **Tasks**: Assignments with rewards, due dates, and completion status
- **Transactions**: Record of allowance expenditures

## Workflow

### Parent Workflow
1. Parent connects wallet and creates child accounts
2. Parent assigns tasks with reward amounts and due dates
3. Parent reviews submitted proofs and approves/rejects task completion
4. Parent can monitor all transactions and adjust allowances

### Child Workflow
1. Child connects wallet to view assigned tasks
2. Child completes tasks and submits photo proof
3. Upon parent approval, reward is automatically added to allowance
4. Child can spend allowance within preset limits

## Image Upload Functionality

- Secure image upload for task proof submission
- File type validation (images only)
- Automatic image deletion after task approval/rejection
- Size limits to prevent abuse

## Installation and Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up PostgreSQL database
4. Run migrations: `npm run db:push`
5. Start the development server: `npm run dev`

## Environment Variables

The application requires the following environment variables:

```
DATABASE_URL=postgresql://user:password@localhost:5432/allowanceapp
```

## Security Features

- Wallet-based authentication for secure access
- Parent-controlled spend limits for child accounts
- Server-side validation of all transactions
- Secure image upload with file type verification
- Automatic cleanup of uploaded files

## Deployment

The application is designed to be deployed on Replit, with automatic configuration handling.

## Future Enhancements

- Mobile app with push notifications
- Multi-currency support
- Goal-setting and savings features
- Educational content about financial literacy
- Additional parental controls and monitoring

## License

This project is available under the MIT License.