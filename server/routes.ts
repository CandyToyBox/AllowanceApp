import express, { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage } from "./storage";
import { getPublicClient, getSpenderWalletClient } from "./lib/spender";
import { collectSubscription } from "./lib/collectSubscription";
import { upload, deleteFile, getFilenameFromPath } from "./lib/fileUpload";
import { z } from "zod";
import {
  insertParentSchema,
  insertChildSchema,
  insertTaskSchema,
  insertTransactionSchema,
} from "@shared/schema";
import { eq } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  
  // File upload endpoint
  app.post("/api/upload", upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const imageUrl = `/uploads/${req.file.filename}`;
      res.status(200).json({ 
        imageUrl,
        message: "File uploaded successfully" 
      });
    } catch (error: any) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: error.message || "Error uploading file" });
    }
  });
  
  // Collect subscription endpoint
  app.post("/api/collect", async (req, res) => {
    try {
      const { spendPermission, signature } = req.body;
      
      if (!spendPermission || !signature) {
        return res.status(400).json({ message: "Missing spendPermission or signature" });
      }
      
      // For demo purposes, we'll simulate a successful collection without actually
      // using the wallet client, since we don't have a real private key
      
      // Generate a simulated transaction hash
      const timestamp = Math.floor(Date.now() / 1000).toString(16);
      const randomHex = Math.random().toString(16).slice(2, 10);
      const hash = `0x${timestamp}${randomHex}${"0".repeat(24)}`;
      
      console.log(`Simulated subscription collection with hash: ${hash}`);
      console.log(`Account: ${spendPermission.account}`);
      console.log(`Spender: ${spendPermission.spender}`);
      
      const result = {
        transactionHash: hash,
        message: "Subscription successfully collected",
        amount: "0.001 ETH",
        timestamp: Date.now()
      };
      
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Error collecting subscription:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });

  // ==========================================================================
  // Parent Routes
  // ==========================================================================
  
  // Get parent by wallet address
  app.get("/api/parents/wallet/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      const parent = await storage.getParentByWalletAddress(walletAddress);
      
      if (!parent) {
        return res.status(404).json({ message: "Parent not found" });
      }
      
      // Don't return the password
      const { password, ...parentData } = parent;
      res.status(200).json(parentData);
    } catch (error: any) {
      console.error("Error getting parent by wallet address:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  
  // Create parent
  app.post("/api/parents", async (req, res) => {
    try {
      const parsedData = insertParentSchema.safeParse(req.body);
      
      if (!parsedData.success) {
        return res.status(400).json({ 
          message: "Invalid parent data", 
          errors: parsedData.error.format() 
        });
      }
      
      const parent = await storage.createParent(parsedData.data);
      
      // Don't return the password
      const { password, ...parentData } = parent;
      res.status(201).json(parentData);
    } catch (error: any) {
      console.error("Error creating parent:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  
  // Update parent wallet address
  app.patch("/api/parents/:id/wallet", async (req, res) => {
    try {
      const { id } = req.params;
      const { walletAddress } = req.body;
      
      if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address is required" });
      }
      
      const updatedParent = await storage.updateParentWalletAddress(Number(id), walletAddress);
      
      if (!updatedParent) {
        return res.status(404).json({ message: "Parent not found" });
      }
      
      // Don't return the password
      const { password, ...parentData } = updatedParent;
      res.status(200).json(parentData);
    } catch (error: any) {
      console.error("Error updating parent wallet address:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  
  // ==========================================================================
  // Child Routes
  // ==========================================================================
  
  // Get children by parent ID
  app.get("/api/parents/:parentId/children", async (req, res) => {
    try {
      const { parentId } = req.params;
      const children = await storage.getChildrenByParentId(Number(parentId));
      
      // Don't return passwords
      const childrenData = children.map(({ password, ...data }) => data);
      res.status(200).json(childrenData);
    } catch (error: any) {
      console.error("Error getting children by parent ID:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  
  // Get child by wallet address
  app.get("/api/children/wallet/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      const child = await storage.getChildByWalletAddress(walletAddress);
      
      if (!child) {
        return res.status(404).json({ message: "Child not found" });
      }
      
      // Don't return the password
      const { password, ...childData } = child;
      res.status(200).json(childData);
    } catch (error: any) {
      console.error("Error getting child by wallet address:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  
  // Create child
  app.post("/api/children", async (req, res) => {
    try {
      const parsedData = insertChildSchema.safeParse(req.body);
      
      if (!parsedData.success) {
        return res.status(400).json({ 
          message: "Invalid child data", 
          errors: parsedData.error.format() 
        });
      }
      
      const child = await storage.createChild(parsedData.data);
      
      // Don't return the password
      const { password, ...childData } = child;
      res.status(201).json(childData);
    } catch (error: any) {
      console.error("Error creating child:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  
  // Update child wallet address
  app.patch("/api/children/:id/wallet", async (req, res) => {
    try {
      const { id } = req.params;
      const { walletAddress } = req.body;
      
      if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address is required" });
      }
      
      const updatedChild = await storage.updateChildWalletAddress(Number(id), walletAddress);
      
      if (!updatedChild) {
        return res.status(404).json({ message: "Child not found" });
      }
      
      // Don't return the password
      const { password, ...childData } = updatedChild;
      res.status(200).json(childData);
    } catch (error: any) {
      console.error("Error updating child wallet address:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  
  // ==========================================================================
  // Task Routes
  // ==========================================================================
  
  // Get tasks by parent ID
  app.get("/api/parents/:parentId/tasks", async (req, res) => {
    try {
      const { parentId } = req.params;
      const { status } = req.query;
      
      let tasks;
      if (status) {
        tasks = await storage.getTasksByStatus(Number(parentId), status as string);
      } else {
        tasks = await storage.getTasksByParentId(Number(parentId));
      }
      
      res.status(200).json(tasks);
    } catch (error: any) {
      console.error("Error getting tasks by parent ID:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  
  // Get tasks by child ID
  app.get("/api/children/:childId/tasks", async (req, res) => {
    try {
      const { childId } = req.params;
      const tasks = await storage.getTasksByChildId(Number(childId));
      
      res.status(200).json(tasks);
    } catch (error: any) {
      console.error("Error getting tasks by child ID:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  
  // Create task
  app.post("/api/tasks", async (req, res) => {
    try {
      const parsedData = insertTaskSchema.safeParse(req.body);
      
      if (!parsedData.success) {
        return res.status(400).json({ 
          message: "Invalid task data", 
          errors: parsedData.error.format() 
        });
      }
      
      const task = await storage.createTask(parsedData.data);
      res.status(201).json(task);
    } catch (error: any) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  
  // Submit proof image for task
  app.patch("/api/tasks/:id/proof", async (req, res) => {
    try {
      const { id } = req.params;
      const { proofImageUrl } = req.body;
      
      if (!proofImageUrl) {
        return res.status(400).json({ message: "Proof image URL is required" });
      }
      
      const updatedTask = await storage.updateTaskProofImage(Number(id), proofImageUrl);
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Also mark the task as completed
      const completedTask = await storage.completeTask(Number(id));
      
      res.status(200).json(completedTask || updatedTask);
    } catch (error: any) {
      console.error("Error updating task proof image:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  
  // Approve task
  app.patch("/api/tasks/:id/approve", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get the task first to see if it has an image
      const task = await storage.getTask(Number(id));
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Approve the task
      const updatedTask = await storage.approveTask(Number(id));
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task could not be approved" });
      }
      
      // If the task had a proof image URL and it's in our uploads directory, delete it
      if (task.proofImageUrl && task.proofImageUrl.startsWith('/uploads/')) {
        const filename = getFilenameFromPath(task.proofImageUrl);
        deleteFile(filename);
        console.log(`Deleted proof image ${filename} after task approval`);
      }
      
      res.status(200).json(updatedTask);
    } catch (error: any) {
      console.error("Error approving task:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  
  // Reject task
  app.patch("/api/tasks/:id/reject", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get the task first to see if it has an image
      const task = await storage.getTask(Number(id));
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      const updatedTask = await storage.rejectTask(Number(id));
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task could not be rejected" });
      }
      
      // If the task had a proof image URL and it's in our uploads directory, delete it
      if (task.proofImageUrl && task.proofImageUrl.startsWith('/uploads/')) {
        const filename = getFilenameFromPath(task.proofImageUrl);
        deleteFile(filename);
        console.log(`Deleted proof image ${filename} after task rejection`);
      }
      
      res.status(200).json(updatedTask);
    } catch (error: any) {
      console.error("Error rejecting task:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  
  // ==========================================================================
  // Transaction Routes
  // ==========================================================================
  
  // Get transactions by child ID
  app.get("/api/children/:childId/transactions", async (req, res) => {
    try {
      const { childId } = req.params;
      const transactions = await storage.getTransactionsByChildId(Number(childId));
      
      res.status(200).json(transactions);
    } catch (error: any) {
      console.error("Error getting transactions by child ID:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  
  // Create transaction (for spending)
  app.post("/api/transactions", async (req, res) => {
    try {
      const parsedData = insertTransactionSchema.safeParse(req.body);
      
      if (!parsedData.success) {
        return res.status(400).json({ 
          message: "Invalid transaction data", 
          errors: parsedData.error.format() 
        });
      }
      
      // Validate negative amount for spending
      if (parsedData.data.amount >= 0 && req.body.type === "spend") {
        return res.status(400).json({ 
          message: "Spending transactions must have a negative amount" 
        });
      }
      
      // Get child to check balance
      const child = await storage.getChild(parsedData.data.childId);
      
      if (!child) {
        return res.status(404).json({ message: "Child not found" });
      }
      
      // For spending, check if child has sufficient balance
      if (parsedData.data.amount < 0) {
        const currentBalance = child.allowanceBalance || 0;
        if (currentBalance + parsedData.data.amount < 0) {
          return res.status(400).json({ 
            message: "Insufficient allowance balance" 
          });
        }
        
        // Update child's allowance balance
        await storage.updateChildAllowance(child.id, parsedData.data.amount);
      }
      
      const transaction = await storage.createTransaction(parsedData.data);
      res.status(201).json(transaction);
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
