import { 
  users, parents, children, tasks, transactions,
  type User, type InsertUser,
  type Parent, type InsertParent,
  type Child, type InsertChild,
  type Task, type InsertTask,
  type Transaction, type InsertTransaction
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

// Interface for user operations (legacy support)
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Parent operations
  getParent(id: number): Promise<Parent | undefined>;
  getParentByUsername(username: string): Promise<Parent | undefined>;
  getParentByWalletAddress(walletAddress: string): Promise<Parent | undefined>;
  createParent(parent: InsertParent): Promise<Parent>;
  updateParentWalletAddress(id: number, walletAddress: string): Promise<Parent | undefined>;
  
  // Child operations
  getChild(id: number): Promise<Child | undefined>;
  getChildByUsername(username: string): Promise<Child | undefined>;
  getChildByWalletAddress(walletAddress: string): Promise<Child | undefined>;
  getChildrenByParentId(parentId: number): Promise<Child[]>;
  createChild(child: InsertChild): Promise<Child>;
  updateChildWalletAddress(id: number, walletAddress: string): Promise<Child | undefined>;
  updateChildAllowance(id: number, amount: number): Promise<Child | undefined>;
  
  // Task operations
  getTask(id: number): Promise<Task | undefined>;
  getTasksByParentId(parentId: number): Promise<Task[]>;
  getTasksByChildId(childId: number): Promise<Task[]>;
  getTasksByStatus(parentId: number, status: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTaskStatus(id: number, status: string): Promise<Task | undefined>;
  updateTaskProofImage(id: number, proofImageUrl: string): Promise<Task | undefined>;
  completeTask(id: number): Promise<Task | undefined>;
  approveTask(id: number): Promise<Task | undefined>;
  rejectTask(id: number): Promise<Task | undefined>;
  
  // Transaction operations
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByChildId(childId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
}

export class DatabaseStorage implements IStorage {
  // Legacy User Methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Parent Methods
  async getParent(id: number): Promise<Parent | undefined> {
    const [parent] = await db.select().from(parents).where(eq(parents.id, id));
    return parent;
  }
  
  async getParentByUsername(username: string): Promise<Parent | undefined> {
    const [parent] = await db.select().from(parents).where(eq(parents.username, username));
    return parent;
  }
  
  async getParentByWalletAddress(walletAddress: string): Promise<Parent | undefined> {
    const [parent] = await db.select().from(parents).where(eq(parents.walletAddress, walletAddress));
    return parent;
  }
  
  async createParent(insertParent: InsertParent): Promise<Parent> {
    const [parent] = await db
      .insert(parents)
      .values(insertParent)
      .returning();
    return parent;
  }
  
  async updateParentWalletAddress(id: number, walletAddress: string): Promise<Parent | undefined> {
    const [updatedParent] = await db
      .update(parents)
      .set({ walletAddress })
      .where(eq(parents.id, id))
      .returning();
    return updatedParent;
  }
  
  // Child Methods
  async getChild(id: number): Promise<Child | undefined> {
    const [child] = await db.select().from(children).where(eq(children.id, id));
    return child;
  }
  
  async getChildByUsername(username: string): Promise<Child | undefined> {
    const [child] = await db.select().from(children).where(eq(children.username, username));
    return child;
  }
  
  async getChildByWalletAddress(walletAddress: string): Promise<Child | undefined> {
    const [child] = await db.select().from(children).where(eq(children.walletAddress, walletAddress));
    return child;
  }
  
  async getChildrenByParentId(parentId: number): Promise<Child[]> {
    return await db.select().from(children).where(eq(children.parentId, parentId));
  }
  
  async createChild(insertChild: InsertChild): Promise<Child> {
    const [child] = await db
      .insert(children)
      .values(insertChild)
      .returning();
    return child;
  }
  
  async updateChildWalletAddress(id: number, walletAddress: string): Promise<Child | undefined> {
    const [updatedChild] = await db
      .update(children)
      .set({ walletAddress })
      .where(eq(children.id, id))
      .returning();
    return updatedChild;
  }
  
  async updateChildAllowance(id: number, amount: number): Promise<Child | undefined> {
    // Get current balance
    const [child] = await db.select().from(children).where(eq(children.id, id));
    if (!child) return undefined;
    
    const currentBalance = child.allowanceBalance || 0;
    const newBalance = currentBalance + amount;
    
    const [updatedChild] = await db
      .update(children)
      .set({ allowanceBalance: newBalance })
      .where(eq(children.id, id))
      .returning();
    return updatedChild;
  }
  
  // Task Methods
  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }
  
  async getTasksByParentId(parentId: number): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.parentId, parentId))
      .orderBy(desc(tasks.createdAt));
  }
  
  async getTasksByChildId(childId: number): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.childId, childId))
      .orderBy(desc(tasks.createdAt));
  }
  
  async getTasksByStatus(parentId: number, status: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.parentId, parentId),
          eq(tasks.status, status)
        )
      )
      .orderBy(desc(tasks.createdAt));
  }
  
  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(insertTask)
      .returning();
    return task;
  }
  
  async updateTaskStatus(id: number, status: string): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set({ status })
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }
  
  async updateTaskProofImage(id: number, proofImageUrl: string): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set({ 
        proofImageUrl,
        status: "completed",
        completedAt: new Date()
      })
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }
  
  async completeTask(id: number): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set({ 
        status: "completed",
        completedAt: new Date()
      })
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }
  
  async approveTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    if (!task) return undefined;
    
    // Update task status
    const [updatedTask] = await db
      .update(tasks)
      .set({ 
        status: "approved",
        approvedAt: new Date()
      })
      .where(eq(tasks.id, id))
      .returning();
    
    if (updatedTask) {
      // Update child's allowance balance
      await this.updateChildAllowance(task.childId, task.rewardAmount);
      
      // Create a transaction record
      await this.createTransaction({
        childId: task.childId,
        amount: task.rewardAmount,
        description: `Reward for completing task: ${task.title}`,
        transactionHash: null,
      });
    }
    
    return updatedTask;
  }
  
  async rejectTask(id: number): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set({ status: "rejected" })
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }
  
  // Transaction Methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }
  
  async getTransactionsByChildId(childId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.childId, childId))
      .orderBy(desc(transactions.createdAt));
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }
}

export const storage = new DatabaseStorage();
