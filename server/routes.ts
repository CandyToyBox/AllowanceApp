import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createPublicClient, createWalletClient, Hex, http } from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { spendPermissionManagerAbi, spendPermissionManagerAddress } from "../client/src/lib/abi/SpendPermissionManager";
import { collectSubscriptionSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Spender wallet setup
const SPENDER_PRIVATE_KEY = process.env.SPENDER_PRIVATE_KEY as Hex;
const SPENDER_ADDRESS = process.env.NEXT_PUBLIC_SPENDER_ADDRESS;

// Create public client
async function getPublicClient() {
  return createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });
}

// Create wallet client for the spender
async function getSpenderWalletClient() {
  if (!SPENDER_PRIVATE_KEY) {
    throw new Error("SPENDER_PRIVATE_KEY environment variable is not set");
  }
  
  const spenderAccount = privateKeyToAccount(SPENDER_PRIVATE_KEY);
  
  return createWalletClient({
    account: spenderAccount,
    chain: baseSepolia,
    transport: http(),
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up routes
  app.get("/api/subscription", async (req: Request, res: Response) => {
    try {
      const address = req.query.address as string;
      
      if (!address) {
        return res.status(400).json({ message: "Address parameter is required" });
      }

      const subscription = await storage.getSpendPermissionByAccount(address);
      const transactions = await storage.getTransactionsByAccount(address);
      
      // Calculate used today
      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      const recentTransactions = transactions.filter(tx => 
        new Date(tx.timestamp).getTime() > oneDayAgo
      );
      
      const usedToday = recentTransactions.reduce((sum, tx) => 
        sum + parseFloat(tx.value), 0
      ).toFixed(4);

      return res.json({ 
        isSubscribed: !!subscription,
        subscription,
        transactions,
        usedToday
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch subscription data" });
    }
  });

  app.post("/api/subscription", async (req: Request, res: Response) => {
    try {
      const { spendPermission, signature } = req.body;
      
      if (!spendPermission || !signature) {
        return res.status(400).json({ message: "spendPermission and signature are required" });
      }

      // Store the spend permission in the database
      const savedPermission = await storage.saveSpendPermission({
        account: spendPermission.account,
        spender: spendPermission.spender,
        token: spendPermission.token,
        allowance: spendPermission.allowance.toString(),
        period: parseInt(spendPermission.period),
        start: parseInt(spendPermission.start),
        end: parseInt(spendPermission.end),
        salt: spendPermission.salt.toString(),
        extraData: spendPermission.extraData,
        signature: signature,
        walletId: 1, // Default wallet ID for now
      });

      return res.status(201).json({ savedPermission });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to save subscription" });
    }
  });

  app.delete("/api/subscription", async (req: Request, res: Response) => {
    try {
      const { account } = req.body;
      
      if (!account) {
        return res.status(400).json({ message: "account is required" });
      }

      await storage.deleteSpendPermissionByAccount(account);
      return res.status(200).json({ message: "Subscription deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to delete subscription" });
    }
  });

  app.post("/api/collect", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = collectSubscriptionSchema.parse(req.body);
      const { spendPermission, signature } = validatedData;

      if (!SPENDER_ADDRESS) {
        throw new Error("SPENDER_ADDRESS environment variable is not set");
      }

      // Create clients
      const publicClient = await getPublicClient();
      const walletClient = await getSpenderWalletClient();

      // Create the spend transaction
      const ethAmount = "0.001"; // Fixed amount to collect
      const ethInWei = BigInt(1000000000000000); // 0.001 ETH in wei

      // Call the spend function on the contract using the spender wallet
      const hash = await walletClient.writeContract({
        address: spendPermissionManagerAddress as `0x${string}`,
        abi: spendPermissionManagerAbi,
        functionName: "spend",
        args: [
          spendPermission.account as `0x${string}`,
          spendPermission.token as `0x${string}`,
          ethInWei,
          SPENDER_ADDRESS as `0x${string}`,
          "0x" as Hex,
        ],
      });

      // Wait for the transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // Save the transaction to the database
      await storage.saveTransaction({
        walletId: 1, // Default wallet ID
        hash: hash,
        from: spendPermission.account,
        to: SPENDER_ADDRESS,
        value: ethAmount,
        status: receipt.status === "success" ? "success" : "failed",
      });

      return res.json({ 
        transactionHash: hash,
        receipt
      });
    } catch (error) {
      console.error("Error processing collect request:", error);

      // Handle validation errors
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          message: "Validation error",
          errors: validationError.message
        });
      }

      return res.status(500).json({ 
        message: "Failed to collect subscription",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
