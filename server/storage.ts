import { 
  users, 
  type User, 
  type InsertUser,
  type Transaction,
  type InsertTransaction,
  type SpendPermission,
  type InsertSpendPermission
} from "@shared/schema";

// Storage interface
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Transaction methods
  saveTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionById(id: number): Promise<Transaction | undefined>;
  getTransactionsByAccount(account: string): Promise<Transaction[]>;
  
  // Spend Permission methods
  saveSpendPermission(permission: InsertSpendPermission): Promise<SpendPermission>;
  getSpendPermissionById(id: number): Promise<SpendPermission | undefined>;
  getSpendPermissionByAccount(account: string): Promise<SpendPermission | undefined>;
  deleteSpendPermissionByAccount(account: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private spendPermissions: Map<number, SpendPermission>;
  private userIdCounter: number;
  private transactionIdCounter: number;
  private spendPermissionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.spendPermissions = new Map();
    this.userIdCounter = 1;
    this.transactionIdCounter = 1;
    this.spendPermissionIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Transaction methods
  async saveTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const transaction: Transaction = { 
      ...insertTransaction, 
      id,
      timestamp: new Date() 
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getTransactionById(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionsByAccount(account: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(tx => tx.from.toLowerCase() === account.toLowerCase())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Spend Permission methods
  async saveSpendPermission(insertPermission: InsertSpendPermission): Promise<SpendPermission> {
    const id = this.spendPermissionIdCounter++;
    const permission: SpendPermission = { 
      ...insertPermission, 
      id,
      createdAt: new Date() 
    };
    this.spendPermissions.set(id, permission);
    return permission;
  }

  async getSpendPermissionById(id: number): Promise<SpendPermission | undefined> {
    return this.spendPermissions.get(id);
  }

  async getSpendPermissionByAccount(account: string): Promise<SpendPermission | undefined> {
    return Array.from(this.spendPermissions.values())
      .find(permission => permission.account.toLowerCase() === account.toLowerCase());
  }

  async deleteSpendPermissionByAccount(account: string): Promise<void> {
    const permission = await this.getSpendPermissionByAccount(account);
    if (permission) {
      this.spendPermissions.delete(permission.id);
    }
  }
}

export const storage = new MemStorage();
