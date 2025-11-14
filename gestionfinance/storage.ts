import { 
  users, 
  clients, 
  transactions, 
  payments, 
  systemSettings,
  balanceHistory,
  type User, 
  type InsertUser, 
  type Client, 
  type InsertClient,
  type Transaction,
  type InsertTransaction,
  type Payment,
  type InsertPayment,
  type SystemSettings,
  type InsertSystemSettings,
  notifications,
  type Notification,
  type InsertNotification,
  type BalanceHistory,
  type InsertBalanceHistory
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, or, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Clients
  getClient(id: number): Promise<Client | undefined>;
  getClientsByUserId(userId: number): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, updates: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<Client | undefined>;
  
  // Transactions
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  getAllTransactions(): Promise<Transaction[]>;
  getPendingTransactions(): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, updates: Partial<Transaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<Transaction | undefined>;
  deleteTransactionPermanently(id: number): Promise<Transaction | undefined>;
  
  // Payments
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByUserId(userId: number): Promise<Payment[]>;
  getAllPayments(): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  deletePayment(id: number): Promise<Payment | undefined>;
  
  // System Settings
  getSystemSettings(): Promise<SystemSettings>;
  updateSystemSettings(settings: Partial<InsertSystemSettings>): Promise<SystemSettings>;
  
  // Statistics
  getDailyStats(date?: Date): Promise<{
    totalSent: number;
    totalPaid: number;
    globalDebt: number;
  }>;
  
  getUserSummary(userId: number): Promise<{
    totalSent: number;
    totalPaid: number;
    previousDebt: number;
    currentDebt: number;
    todayPaidAmount: number;
  }>;
  
  getUserDebt(userId: number): Promise<number>;
  
  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(targetRole?: string, targetUserId?: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  getUnreadNotifications(targetRole?: string, targetUserId?: number): Promise<Notification[]>;
  
  // Balance History
  createOrUpdateBalanceHistory(data: InsertBalanceHistory): Promise<BalanceHistory>;
  getBalanceHistory(): Promise<BalanceHistory[]>;
  getBalanceHistoryByDate(date: string): Promise<BalanceHistory | undefined>;
  updateBalanceMovement(date: string, type: 'addition_fcfa' | 'usage_gnf', amount: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Map<number, Client>;
  private transactions: Map<number, Transaction>;
  private payments: Map<number, Payment>;
  private notifications: Map<number, Notification>;
  private systemSettings: SystemSettings = {
    id: 1,
    exchangeRate: "15.2000",
    mainBalanceGNF: "0",
    feePercentage: "0.00",
    debtThresholdFCFA: "100000.00",
    updatedAt: new Date()
  };
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.transactions = new Map();
    this.payments = new Map();
    this.notifications = new Map();
    this.currentId = 1;
    
    // Initialize with default admin user and system settings
    this.initializeDefaults();
  }

  private initializeDefaults() {
    // Create default admin user
    const adminUser: User = {
      id: this.currentId++,
      firstName: "Admin",
      lastName: "System",
      username: "admin",
      password: "admin123", // In production, this should be hashed
      role: "admin",
      isActive: true,
      personalDebtThresholdFCFA: "1000000.00", // Seuil élevé pour admin
      personalFeePercentage: "10",
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // Create default regular user
    const regularUser: User = {
      id: this.currentId++,
      firstName: "Jean",
      lastName: "Dupont",
      username: "jean.dupont",
      password: "user123", // In production, this should be hashed
      role: "user",
      isActive: true,
      personalDebtThresholdFCFA: "100000.00", // Seuil par défaut pour utilisateurs
      personalFeePercentage: "10",
      createdAt: new Date(),
    };
    this.users.set(regularUser.id, regularUser);

    // Initialize system settings
    this.systemSettings = {
      id: 1,
      exchangeRate: "20.0000",
      mainBalanceGNF: "45250000.00",
      feePercentage: "0.00",
      debtThresholdFCFA: "100000.00",
      updatedAt: new Date(),
    };
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "user",
      isActive: insertUser.isActive ?? true,
      personalDebtThresholdFCFA: insertUser.personalDebtThresholdFCFA || (insertUser.role === "admin" ? "1000000.00" : "100000.00"),
      personalFeePercentage: insertUser.personalFeePercentage || "10",
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getClientsByUserId(userId: number): Promise<Client[]> {
    return Array.from(this.clients.values()).filter(
      (client) => client.userId === userId,
    );
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = this.currentId++;
    const client: Client = { 
      ...insertClient, 
      id,
      createdAt: new Date(),
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: number, updates: Partial<InsertClient>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;
    
    const updatedClient = { ...client, ...updates };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: number): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;
    
    this.clients.delete(id);
    return client;
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    // Utiliser directement PostgreSQL pour garantir l'affichage complet
    try {
      const result = await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
      return result;
    } catch (error) {
      console.error('Error fetching transactions from database:', error);
      // Fallback vers le stockage mémoire en cas d'erreur
      return Array.from(this.transactions.values()).filter(
        (transaction) => transaction.userId === userId,
      );
    }
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async getPendingTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => ["pending", "seen", "proof_submitted"].includes(transaction.status)
    );
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentId++;
    const settings = await this.getSystemSettings();
    const exchangeRate = parseFloat(settings.exchangeRate);
    const amountFCFA = parseFloat(insertTransaction.amountFCFA);
    const amountGNF = amountFCFA * exchangeRate;
    
    // UTILISER LES VALEURS CALCULÉES PAR ROUTES.TS (si fournies) OU CALCULER
    let feeAmount, feePercentage, totalToPay;
    
    if (insertTransaction.feeAmount && insertTransaction.feePercentage && insertTransaction.amountToPay && 
        insertTransaction.feeAmount !== "0" && insertTransaction.feeAmount !== "0.00") {
      // Utiliser les valeurs pré-calculées par routes.ts
      feeAmount = parseFloat(insertTransaction.feeAmount);
      feePercentage = parseFloat(insertTransaction.feePercentage);
      totalToPay = parseFloat(insertTransaction.amountToPay);
      console.log(`💰 [STORAGE] Utilisation frais pré-calculés: ${feeAmount} FCFA (${feePercentage}%) → Total: ${totalToPay} FCFA`);
    } else {
      // Calcul OBLIGATOIRE des frais 10% si pas fourni par routes.ts
      const settings_current = await this.getSystemSettings();
      feePercentage = parseFloat(settings_current.feePercentage || "10");
      feeAmount = amountFCFA * (feePercentage / 100);
      totalToPay = amountFCFA + feeAmount;
      console.log(`💰 [STORAGE] Calcul frais OBLIGATOIRE: ${feeAmount} FCFA (${feePercentage}%) → Total: ${totalToPay} FCFA`);
    }
    
    const transaction: Transaction = { 
      ...insertTransaction,
      id,
      status: insertTransaction.status || "pending",
      clientId: insertTransaction.clientId || null,
      proof: insertTransaction.proof || null,
      proofType: insertTransaction.proofType || null,
      externalProofUrl: insertTransaction.externalProofUrl || null,
      isArchived: insertTransaction.isArchived || false,
      isProofShared: insertTransaction.isProofShared || false,
      amountGNF: amountGNF.toFixed(2),
      exchangeRate: settings.exchangeRate,
      createdAt: new Date(),
      feeAmount: feeAmount.toString(),
      feePercentage: feePercentage.toString(),
      amountToPay: totalToPay.toString(),
      cancellationRequested: insertTransaction.cancellationRequested || null,
      cancellationRequestedAt: insertTransaction.cancellationRequestedAt || null,
      cancellationReason: insertTransaction.cancellationReason || null,
      isDeleted: insertTransaction.isDeleted || false,
      deletedAt: insertTransaction.deletedAt || null,
      deletedBy: insertTransaction.deletedBy || null,
    };
    
    this.transactions.set(id, transaction);
    
    // Check if this is a DEPOT BAMAKO transaction (special handling)
    let isDepotBamako = false;
    if (insertTransaction.clientId) {
      const client = await this.getClient(insertTransaction.clientId);
      isDepotBamako = client?.name === "DEPOT BAMAKO";
    }
    
    // Deduct from main balance ONLY if NOT a DEPOT BAMAKO transaction
    if (!isDepotBamako) {
      const newBalance = parseFloat(settings.mainBalanceGNF) - amountGNF;
      await this.updateSystemSettings({ mainBalanceGNF: newBalance.toFixed(2) });
      console.log(`💰 [STORAGE] Balance déduité: ${amountGNF} GNF (client: ${isDepotBamako ? 'DEPOT BAMAKO' : 'autre'})`);
    } else {
      console.log(`🏦 [STORAGE] DEPOT BAMAKO - Solde admin NON déduité: ${amountGNF} GNF`);
    }
    
    return transaction;
  }

  async updateTransaction(id: number, updates: Partial<Transaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    const updatedTransaction = { ...transaction, ...updates };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async deleteTransaction(id: number): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    this.transactions.delete(id);
    return transaction;
  }

  async deleteTransactionPermanently(id: number): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    this.transactions.delete(id);
    return transaction;
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPaymentsByUserId(userId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      (payment) => payment.userId === userId,
    );
  }

  async getAllPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values());
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.currentId++;
    const payment: Payment = { 
      ...insertPayment, 
      id,
      createdAt: new Date(),
    };
    this.payments.set(id, payment);
    return payment;
  }

  async deletePayment(id: number): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (payment) {
      this.payments.delete(id);
    }
    return payment;
  }

  async getSystemSettings(): Promise<SystemSettings> {
    return this.systemSettings;
  }

  async updateSystemSettings(settings: Partial<InsertSystemSettings>): Promise<SystemSettings> {
    this.systemSettings = { 
      ...this.systemSettings, 
      ...settings,
      updatedAt: new Date(),
    };
    return this.systemSettings;
  }

  async getDailyStats(date?: Date): Promise<{
    totalSent: number;
    totalPaid: number;
    globalDebt: number;
  }> {
    const targetDate = date || new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    console.log(`💰 [DAILY STATS] Calculating for date: ${targetDate.toISOString().split('T')[0]}`);

    // CORRECTION CRITIQUE : Utiliser la base de données PostgreSQL directement pour garantir la cohérence
    // Filtrer les transactions du jour et exclure les transactions supprimées
    const todayTransactionsResult = await db.execute(sql`
      SELECT amount_fcfa, amount_to_pay, is_deleted
      FROM transactions 
      WHERE DATE(created_at) = ${targetDate.toISOString().split('T')[0]}
      AND (is_deleted IS NULL OR is_deleted = false)
    `);

    const todayPaymentsResult = await db.execute(sql`
      SELECT amount
      FROM payments 
      WHERE DATE(created_at) = ${targetDate.toISOString().split('T')[0]}
    `);

    const totalSent = todayTransactionsResult.rows.reduce(
      (sum: number, row: any) => sum + parseFloat(row.amount_fcfa || '0'), 0
    );
    
    const totalPaid = todayPaymentsResult.rows.reduce(
      (sum: number, row: any) => sum + parseFloat(row.amount || '0'), 0
    );

    console.log(`💰 [DAILY STATS] Today transactions count: ${todayTransactionsResult.rows.length}`);
    console.log(`💰 [DAILY STATS] Total sent today: ${totalSent} FCFA`);
    console.log(`💰 [DAILY STATS] Total paid today: ${totalPaid} FCFA`);

    // Calculate global debt using database directly (all time)
    const allTransactionsResult = await db.execute(sql`
      SELECT amount_to_pay 
      FROM transactions 
      WHERE (is_deleted IS NULL OR is_deleted = false)
    `);
    
    const allPaymentsResult = await db.execute(sql`
      SELECT amount 
      FROM payments
    `);
    
    const totalSentEver = allTransactionsResult.rows.reduce(
      (sum: number, row: any) => sum + parseFloat(row.amount_to_pay || '0'), 0
    );
    
    const totalPaidEver = allPaymentsResult.rows.reduce(
      (sum: number, row: any) => sum + parseFloat(row.amount || '0'), 0
    );

    const globalDebt = Math.max(0, totalSentEver - totalPaidEver);

    console.log(`💰 [DAILY STATS] Global debt calculated: ${globalDebt} FCFA`);

    return {
      totalSent,
      totalPaid,
      globalDebt,
    };
  }

  async getUserSummary(userId: number): Promise<{
    totalSent: number;
    totalPaid: number;
    previousDebt: number;
    currentDebt: number;
    todayPaidAmount: number;
  }> {
    const userTransactions = await this.getTransactionsByUserId(userId);
    const userPayments = await this.getPaymentsByUserId(userId);

    // CORRECTION DETTE : Exclure seulement les transactions supprimées (is_deleted = true)
    // La propriété cancellationRequested n'existe plus dans le schéma de base de données
    const activeTransactions = userTransactions.filter(t => !t.isDeleted);

    const totalSent = activeTransactions.reduce(
      (sum, t) => sum + parseFloat(t.amountFCFA), 0
    );
    
    const totalToPay = activeTransactions.reduce(
      (sum, t) => sum + parseFloat(t.amountToPay), 0
    );
    
    const totalPaid = userPayments.reduce(
      (sum, p) => sum + parseFloat(p.amount), 0
    );

    const currentDebt = Math.max(0, totalToPay - totalPaid);

    // Calculate today's paid amount
    const today = new Date().toISOString().split('T')[0];
    const todayPaidAmount = userPayments
      .filter(p => p.createdAt.toISOString().split('T')[0] === today)
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    console.log(`💰 [USER SUMMARY] User ${userId}: ${userTransactions.length} total, ${activeTransactions.length} active, debt: ${currentDebt}`);

    return {
      totalSent,
      totalPaid,
      previousDebt: 0, // Simplified for now
      currentDebt,
      todayPaidAmount,
    };
  }

  async getUserDebt(userId: number): Promise<number> {
    const userTransactions = await this.getTransactionsByUserId(userId);
    const userPayments = await this.getPaymentsByUserId(userId);

    // CORRECTION DETTE : Exclure seulement les transactions supprimées (is_deleted = true)
    // La propriété cancellationRequested n'existe plus dans le schéma de base de données
    const activeTransactions = userTransactions.filter(t => !t.isDeleted);

    const totalToPay = activeTransactions.reduce(
      (sum, t) => sum + parseFloat(t.amountToPay), 0
    );
    
    const totalPaid = userPayments.reduce(
      (sum, p) => sum + parseFloat(p.amount), 0
    );

    console.log(`💰 [USER DEBT 1] User ${userId}: ${userTransactions.length} total transactions, ${activeTransactions.length} active, debt: ${Math.max(0, totalToPay - totalPaid)}`);

    return Math.max(0, totalToPay - totalPaid);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const notification: Notification = { 
      id: this.currentId++, 
      ...insertNotification,
      targetRole: insertNotification.targetRole || "user",
      targetUserId: insertNotification.targetUserId || null,
      relatedId: insertNotification.relatedId || null,
      isRead: insertNotification.isRead || false,
      isPersistent: insertNotification.isPersistent || false,
      createdAt: new Date(),
      readAt: null,
    };
    this.notifications.set(notification.id, notification);
    return notification;
  }

  async getNotifications(targetRole?: string, targetUserId?: number): Promise<Notification[]> {
    const allNotifications = Array.from(this.notifications.values());
    return allNotifications.filter(n => {
      if (targetRole && n.targetRole !== targetRole) return false;
      if (targetUserId && n.targetUserId && n.targetUserId !== targetUserId) return false;
      return true;
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (notification) {
      const updated = { ...notification, isRead: true, readAt: new Date() };
      this.notifications.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async getUnreadNotifications(targetRole?: string, targetUserId?: number): Promise<Notification[]> {
    const notifications = await this.getNotifications(targetRole, targetUserId);
    return notifications.filter(n => !n.isRead);
  }

  // Balance History methods (stub implementations for MemStorage)
  async createOrUpdateBalanceHistory(data: InsertBalanceHistory): Promise<BalanceHistory> {
    // Simple stub implementation for memory storage
    const balanceHistory: BalanceHistory = {
      id: this.currentId++,
      date: data.date,
      openingBalance: data.openingBalance || "0",
      dailyAdditionsFCFA: data.dailyAdditionsFCFA || "0",
      dailyUsageGNF: data.dailyUsageGNF || "0",
      closingBalance: data.closingBalance || "0",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return balanceHistory;
  }

  async getBalanceHistory(): Promise<BalanceHistory[]> {
    // Return empty array for memory storage
    return [];
  }

  async getBalanceHistoryByDate(date: string): Promise<BalanceHistory | undefined> {
    // Return undefined for memory storage
    return undefined;
  }

  async updateBalanceMovement(date: string, type: 'addition_fcfa' | 'usage_gnf', amount: number): Promise<void> {
    // No-op for memory storage
    return;
  }
}

// DatabaseStorage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async getClientsByUserId(userId: number): Promise<Client[]> {
    return await db.select().from(clients).where(eq(clients.userId, userId));
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db
      .insert(clients)
      .values(insertClient)
      .returning();
    return client;
  }

  async updateClient(id: number, updates: Partial<InsertClient>): Promise<Client | undefined> {
    const [client] = await db
      .update(clients)
      .set(updates)
      .where(eq(clients.id, id))
      .returning();
    return client || undefined;
  }

  async deleteClient(id: number): Promise<Client | undefined> {
    const [client] = await db
      .delete(clients)
      .where(eq(clients.id, id))
      .returning();
    return client || undefined;
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    // Inclure toutes les transactions y compris celles supprimées pour garder la trace
    return await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
  }

  async getAllTransactions(): Promise<Transaction[]> {
    // Inclure toutes les transactions y compris celles supprimées pour garder la trace
    return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
  }

  async getPendingTransactions(): Promise<Transaction[]> {
    // Exclure les transactions supprimées des pending
    return await db.select().from(transactions).where(
      and(
        eq(transactions.isDeleted, false),
        or(
          eq(transactions.status, "pending"),
          eq(transactions.status, "seen"),
          eq(transactions.status, "proof_submitted")
        )
      )
    );
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    console.log(`💰 [FRAIS AUTO] Création transaction avec données:`, insertTransaction);
    
    // SYSTÈME DE FRAIS AUTOMATIQUE OBLIGATOIRE - routes.ts calcule TOUJOURS les frais
    if (insertTransaction.feeAmount && insertTransaction.feePercentage && insertTransaction.amountToPay) {
      console.log(`💰 [FRAIS AUTO] Frais pré-calculés par routes.ts - UTILISATION DIRECTE`);
      
      const [transaction] = await db
        .insert(transactions)
        .values(insertTransaction)
        .returning();
        
      console.log(`💰 [FRAIS AUTO] Transaction insérée avec frais ${insertTransaction.feePercentage}%:`, {
        id: transaction.id,
        montant: transaction.amountFCFA,
        frais: transaction.feeAmount,
        pourcentage: transaction.feePercentage,
        total: transaction.amountToPay
      });
      return transaction;
    }
    
    // ERREUR - les frais DOIVENT être calculés par routes.ts
    console.error(`🚨 [FRAIS AUTO] ERREUR: Frais non calculés par routes.ts!`);
    throw new Error("Les frais doivent être calculés par routes.ts avant l'insertion");
  }

  async updateTransaction(id: number, updates: Partial<Transaction>): Promise<Transaction | undefined> {
    const [transaction] = await db
      .update(transactions)
      .set(updates)
      .where(eq(transactions.id, id))
      .returning();
    return transaction || undefined;
  }

  async deleteTransaction(id: number, deletedBy?: number): Promise<Transaction | undefined> {
    // Soft delete: marquer comme supprimée au lieu de supprimer réellement
    const [transaction] = await db
      .update(transactions)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: deletedBy || null
      })
      .where(eq(transactions.id, id))
      .returning();
    return transaction || undefined;
  }

  async deleteTransactionPermanently(id: number): Promise<Transaction | undefined> {
    // SUPPRESSION DÉFINITIVE: supprimer complètement de la base de données
    const [transaction] = await db
      .delete(transactions)
      .where(eq(transactions.id, id))
      .returning();
    return transaction || undefined;
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }

  async getPaymentsByUserId(userId: number): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.userId, userId));
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();
    return payment;
  }

  async deletePayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db
      .delete(payments)
      .where(eq(payments.id, id))
      .returning();
    return payment || undefined;
  }

  async getAllPayments(): Promise<Payment[]> {
    return await db.select().from(payments).orderBy(desc(payments.createdAt));
  }

  async getSystemSettings(): Promise<SystemSettings> {
    const [settings] = await db.select().from(systemSettings).limit(1);
    if (!settings) {
      // Create minimal settings if none exist
      const [newSettings] = await db
        .insert(systemSettings)
        .values({
          exchangeRate: "1.0000",
          mainBalanceGNF: "0.00"
        })
        .returning();
      return newSettings;
    }
    return settings;
  }

  async updateSystemSettings(updates: Partial<InsertSystemSettings>): Promise<SystemSettings> {
    const currentSettings = await this.getSystemSettings();
    const [settings] = await db
      .update(systemSettings)
      .set(updates)
      .where(eq(systemSettings.id, currentSettings.id))
      .returning();
    return settings;
  }

  async getDailyStats(date?: Date): Promise<{
    totalSent: number;
    totalPaid: number;
    globalDebt: number;
  }> {
    // 🚨 CORRECTION : Récupérer toutes les transactions en excluant celles supprimées ET celles avec demande d'annulation
    const allTransactionsRaw = await db.select().from(transactions).where(
      eq(transactions.isDeleted, false)
    );
    
    // Filtrer aussi les transactions avec demande d'annulation
    const allTransactions = allTransactionsRaw.filter(t => 
      !t.cancellationRequested
    );
    
    const allPayments = await db.select().from(payments);
    
    // Calculate total sent (all time - displayed as "Total Envoyé")
    const totalSent = allTransactions.reduce(
      (sum, t) => sum + parseFloat(t.amountFCFA), 0
    );
    
    // Calculate total paid (all time)
    const totalPaid = allPayments.reduce(
      (sum, p) => sum + parseFloat(p.amount), 0
    );

    // Calculate global debt: total to pay (with fees) minus total paid
    // CORRECTION: utiliser amountToPay pour la dette globale (avec frais) - cohérent avec calculs individuels
    const totalToPayWithFees = allTransactions.reduce(
      (sum, t) => sum + parseFloat(t.amountToPay), 0
    );

    const globalDebt = Math.max(0, totalToPayWithFees - totalPaid);

    console.log('[DAILY STATS] Calculations:', {
      totalTransactionsRaw: allTransactionsRaw.length,
      totalTransactionsActive: allTransactions.length,
      totalPayments: allPayments.length,
      totalSent,
      totalToPayWithFees,
      totalPaid,
      globalDebt
    });

    return {
      totalSent,
      totalPaid,
      globalDebt,
    };
  }

  async getUserSummary(userId: number): Promise<{
    totalSent: number;
    totalPaid: number;
    previousDebt: number;
    currentDebt: number;
    transactionCount: number;
    todayPaidAmount: number;
  }> {
    const userTransactions = await this.getTransactionsByUserId(userId);
    const userPayments = await this.getPaymentsByUserId(userId);

    // CORRECTION DETTE : Exclure seulement les transactions supprimées (is_deleted = true)
    // La propriété cancellationRequested n'existe plus dans le schéma de base de données
    const activeTransactions = userTransactions.filter(t => 
      !t.isDeleted
    );

    // CORRECTION : totalSent doit être le montant FCFA original (sans frais)
    const totalSent = activeTransactions.reduce(
      (sum, t) => sum + parseFloat(t.amountFCFA), 0
    );
    
    // Utiliser amountToPay pour la dette (montant réel à payer avec frais)
    const totalToPay = activeTransactions.reduce(
      (sum, t) => sum + parseFloat(t.amountToPay), 0
    );
    
    const totalPaid = userPayments.reduce(
      (sum, p) => sum + parseFloat(p.amount), 0
    );

    // Allow negative debt (which represents credit)
    const currentDebt = totalToPay - totalPaid;

    // Compter le nombre total de transactions (actives seulement)
    const transactionCount = activeTransactions.length;

    // Calculer le montant payé aujourd'hui (paiements validés par admin)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setDate(todayEnd.getDate() + 1);
    
    const todayPaidAmount = userPayments
      .filter(p => {
        const paymentDate = new Date(p.createdAt);
        return paymentDate >= today && paymentDate < todayEnd;
      })
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    return {
      totalSent,
      totalPaid,
      previousDebt: 0, // Simplified for now
      currentDebt,
      transactionCount,
      todayPaidAmount,
    };
  }

  async getUserDebt(userId: number): Promise<number> {
    const userTransactions = await this.getTransactionsByUserId(userId);
    const userPayments = await this.getPaymentsByUserId(userId);

    // CORRECTION DETTE : Exclure seulement les transactions supprimées (is_deleted = true)
    // La propriété cancellationRequested n'existe plus dans le schéma de base de données
    const activeTransactions = userTransactions.filter(t => !t.isDeleted);

    const totalToPay = activeTransactions.reduce(
      (sum, t) => sum + parseFloat(t.amountToPay), 0
    );
    
    const totalPaid = userPayments.reduce(
      (sum, p) => sum + parseFloat(p.amount), 0
    );

    const finalDebt = Math.max(0, totalToPay - totalPaid);
    console.log(`💰 [USER DEBT CORRECTED] User ${userId}: ${userTransactions.length} total transactions, ${activeTransactions.length} active, totalToPay: ${totalToPay}, totalPaid: ${totalPaid}, debt: ${finalDebt}`);

    return finalDebt;
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async getNotifications(targetRole?: string, targetUserId?: number): Promise<Notification[]> {
    if (targetRole && targetUserId) {
      const result = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.targetRole, targetRole),
            eq(notifications.targetUserId, targetUserId)
          )
        )
        .orderBy(desc(notifications.createdAt));
      return result;
    } else if (targetRole) {
      const result = await db
        .select()
        .from(notifications)
        .where(eq(notifications.targetRole, targetRole))
        .orderBy(desc(notifications.createdAt));
      return result;
    } else if (targetUserId) {
      const result = await db
        .select()
        .from(notifications)
        .where(eq(notifications.targetUserId, targetUserId))
        .orderBy(desc(notifications.createdAt));
      return result;
    }
    
    const result = await db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt));
    return result;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const [notification] = await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(notifications.id, id))
      .returning();
    return notification || undefined;
  }

  async getUnreadNotifications(targetRole?: string, targetUserId?: number): Promise<Notification[]> {
    const allNotifications = await this.getNotifications(targetRole, targetUserId);
    return allNotifications.filter(n => !n.isRead);
  }

  async createOrUpdateBalanceHistory(data: InsertBalanceHistory): Promise<BalanceHistory> {
    const existingRecord = await this.getBalanceHistoryByDate(data.date);
    
    if (existingRecord) {
      const [updated] = await db
        .update(balanceHistory)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(balanceHistory.date, data.date))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(balanceHistory)
        .values(data)
        .returning();
      return created;
    }
  }

  async getBalanceHistory(): Promise<BalanceHistory[]> {
    return await db
      .select()
      .from(balanceHistory)
      .orderBy(balanceHistory.date);
  }

  async getBalanceHistoryByDate(date: string): Promise<BalanceHistory | undefined> {
    const result = await db
      .select()
      .from(balanceHistory)
      .where(eq(balanceHistory.date, date));
    return result[0];
  }

  async updateBalanceMovement(date: string, type: 'addition_fcfa' | 'usage_gnf', amount: number): Promise<void> {
    const existingRecord = await this.getBalanceHistoryByDate(date);
    
    if (!existingRecord) {
      // Créer un nouvel enregistrement pour ce jour
      const previousDay = new Date(date);
      previousDay.setDate(previousDay.getDate() - 1);
      const previousRecord = await this.getBalanceHistoryByDate(previousDay.toISOString().split('T')[0]);
      
      // 1. Solde d'ouverture = calculé à partir du solde actuel + usage du jour
      const settings = await this.getSystemSettings();
      const currentBalance = parseFloat(settings.mainBalanceGNF);
      const dailyUsage = await this.calculateActualDailyUsage(date);
      
      // Solde d'ouverture = Solde actuel + Usage du jour (car le solde actuel a déjà été diminué)
      const openingBalance = (currentBalance + dailyUsage).toFixed(2);
      
      // 2. Solde de clôture = solde actuel du système
      const closingBalance = settings.mainBalanceGNF;
      
      const newRecord: InsertBalanceHistory = {
        date,
        openingBalance,
        dailyAdditionsFCFA: type === 'addition_fcfa' ? amount.toFixed(2) : "0.00",
        dailyUsageGNF: dailyUsage.toFixed(2),
        closingBalance
      };
      
      await this.createOrUpdateBalanceHistory(newRecord);
    } else {
      // Mettre à jour l'enregistrement existant
      const updates: Partial<InsertBalanceHistory> = {};
      
      if (type === 'addition_fcfa') {
        const currentAdditions = parseFloat(existingRecord.dailyAdditionsFCFA);
        updates.dailyAdditionsFCFA = (currentAdditions + amount).toFixed(2);
      }
      
      // Recalculer le solde utilisé basé sur toutes les transactions du jour
      const dailyUsage = await this.calculateActualDailyUsage(date);
      updates.dailyUsageGNF = dailyUsage.toFixed(2);
      
      // Recalculer le solde de clôture : ouverture - utilisation
      const opening = parseFloat(existingRecord.openingBalance);
      updates.closingBalance = (opening - dailyUsage).toFixed(2);
      
      await db
        .update(balanceHistory)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(balanceHistory.date, date));
    }
  }

  // Calcule le solde utilisé du jour = somme des montants FCFA originaux convertis en GNF (sans frais)
  private async calculateActualDailyUsage(date: string): Promise<number> {
    try {
      // Récupérer toutes les transactions du jour (peu importe le statut)
      const allTransactions = await db
        .select()
        .from(transactions)
        .where(sql`DATE(${transactions.createdAt}) = ${date}`);
      
      // Récupérer le taux de change actuel
      const settings = await this.getSystemSettings();
      const exchangeRate = parseFloat(settings.exchangeRate);
      
      // Calculer la somme des montants FCFA originaux convertis en GNF (sans frais)
      const totalUsage = allTransactions.reduce((sum, transaction) => {
        const amountFCFA = parseFloat(transaction.amountFCFA);
        const amountGNFWithoutFees = amountFCFA * exchangeRate;
        return sum + amountGNFWithoutFees;
      }, 0);
      
      return totalUsage;
    } catch (error) {
      console.error('Error calculating daily usage:', error);
      return 0;
    }
  }
}

export const storage = new DatabaseStorage();
