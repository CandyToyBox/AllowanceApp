import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getPublicClient, getSpenderWalletClient } from "./lib/spender";
import { collectSubscription } from "./lib/collectSubscription";

export async function registerRoutes(app: Express): Promise<Server> {
  // Collect subscription endpoint
  app.post("/api/collect", async (req, res) => {
    try {
      const { spendPermission, signature } = req.body;
      
      if (!spendPermission || !signature) {
        return res.status(400).json({ message: "Missing spendPermission or signature" });
      }
      
      const publicClient = await getPublicClient();
      const spenderWallet = await getSpenderWalletClient();
      
      // Convert BigInt strings back to BigInt
      const formattedPermission = {
        ...spendPermission,
        allowance: BigInt(spendPermission.allowance),
        salt: BigInt(spendPermission.salt),
      };
      
      const result = await collectSubscription(
        publicClient,
        spenderWallet,
        formattedPermission,
        signature
      );
      
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Error collecting subscription:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
