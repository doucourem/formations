import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertNotificationSchema } from "@shared/schema";
import { insertUserSchema, insertClientSchema, insertTransactionSchema, insertPaymentSchema, insertSystemSettingsSchema, type InsertTransaction } from "@shared/schema";
import { z } from "zod";
import path from "path";
import express from "express";

// Extend Express types
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        firstName: string;
        lastName: string;
        username: string;
        role: string;
      };
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: number;
      firstName: string;
      lastName: string;
      username: string;
      role: string;
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Store push notification subscriptions for admin users
  const adminPushSubscriptions = new Map<number, any>();

  // Function to send push notifications to admin users
  const sendPushNotification = async (data: any) => {
    // Send to all registered admin push subscriptions
    const userIds = Array.from(adminPushSubscriptions.keys());
    for (const userId of userIds) {
      try {
        const subscription = adminPushSubscriptions.get(userId);
        // In a real implementation, you would use web-push library here
        // For now, we simulate by sending via browser notification API
        console.log(`📱 Sending push notification to admin ${userId}:`, data);
      } catch (error) {
        console.error(`Failed to send push notification to admin ${userId}:`, error);
        // Remove invalid subscriptions
        adminPushSubscriptions.delete(userId);
      }
    }
  };

  // Serve PWA files
  app.get('/manifest.json', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public/manifest.json'));
  });
  
  app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(process.cwd(), 'public/sw.js'));
  });
  
  app.use('/icons', express.static(path.join(process.cwd(), 'public/icons')));

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    req.user = req.session.user;
    next();
  };

  // Push notification subscription endpoint
  app.post('/api/push/subscribe', requireAuth, async (req, res) => {
    try {
      const { subscription } = req.body;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      // Only allow admin users to subscribe to push notifications
      if (userRole === 'admin') {
        adminPushSubscriptions.set(userId, subscription);
        console.log(`📱 Admin ${userId} subscribed to push notifications`);
        res.json({ success: true, message: 'Subscribed to push notifications' });
      } else {
        res.status(403).json({ message: 'Only admin users can subscribe to push notifications' });
      }
    } catch (error) {
      console.error('Push subscription error:', error);
      res.status(500).json({ message: 'Failed to subscribe to push notifications' });
    }
  });

  app.post('/api/push/unsubscribe', requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      adminPushSubscriptions.delete(userId);
      console.log(`📱 Admin ${userId} unsubscribed from push notifications`);
      res.json({ success: true, message: 'Unsubscribed from push notifications' });
    } catch (error) {
      console.error('Push unsubscription error:', error);
      res.status(500).json({ message: 'Failed to unsubscribe from push notifications' });
    }
  });

  // Authentication
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password || !user.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Store user in session
      const sessionUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role
      };
      
      (req.session as any).user = sessionUser;

      res.json({ 
        user: sessionUser
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json({ user: req.session.user });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(u => ({ 
        id: u.id, 
        firstName: u.firstName, 
        lastName: u.lastName, 
        username: u.username, 
        role: u.role, 
        isActive: u.isActive,
        createdAt: u.createdAt 
      })));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json({ 
        id: user.id, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        username: user.username, 
        role: user.role 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const user = await storage.updateUser(id, updates);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ 
        id: user.id, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        username: user.username, 
        role: user.role,
        isActive: user.isActive 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Clients
  app.get("/api/clients", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (!userId) {
        return res.status(400).json({ message: "userId required" });
      }
      
      const clients = await storage.getClientsByUserId(userId);
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(clientData);
      res.json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.patch("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      const updates = req.body;
      if (!updates.name || typeof updates.name !== 'string' || updates.name.trim().length === 0) {
        return res.status(400).json({ message: "Name is required and must be a non-empty string" });
      }
      
      const client = await storage.updateClient(id, { name: updates.name.trim() });
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(500).json({ message: "Failed to update client", error: String(error) });
    }
  });

  // Transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : null;
      const pending = req.query.pending === "true";
      
      let transactions;
      if (pending) {
        transactions = await storage.getPendingTransactions();
      } else if (userId) {
        transactions = await storage.getTransactionsByUserId(userId);
      } else {
        transactions = await storage.getAllTransactions();
      }
      
      // Populate with user and client data
      const populatedTransactions = await Promise.all(
        transactions.map(async (t) => {
          try {
            const user = await storage.getUser(t.userId);
            const client = t.clientId ? await storage.getClient(t.clientId) : null;
            return {
              ...t,
              userName: user ? `${user.firstName} ${user.lastName}` : "Unknown",
              clientName: client?.name || "Client Occasionnel"
            };
          } catch (enrichError) {
            console.error(`Error enriching transaction ${t.id}:`, enrichError);
            return {
              ...t,
              userName: "Unknown",
              clientName: "Client Occasionnel"
            };
          }
        })
      );
      
      res.json(populatedTransactions);
    } catch (error) {
      console.error("Error in /api/transactions:", error);
      res.json([]);
    }
  });

  app.post("/api/transactions", requireAuth, async (req, res) => {
    try {
      // Validate only the fields sent from client
      const clientSchema = z.object({
        clientId: z.union([z.string(), z.number(), z.null()]).optional().transform(val => {
          if (val === null || val === undefined || val === "") return null;
          return typeof val === 'string' ? parseInt(val) : val;
        }),
        phoneNumber: z.string(),
        amountFCFA: z.string()
      });

      const body = clientSchema.parse(req.body);
      
      // Vérifier si le solde admin est suffisant
      const settings = await storage.getSystemSettings();
      const exchangeRate = parseFloat(settings.exchangeRate);
      const amountFCFA = parseFloat(body.amountFCFA);
      const amountGNF = amountFCFA * exchangeRate;
      const adminBalance = parseFloat(settings.mainBalanceGNF);

      if (amountGNF > adminBalance) {
        return res.status(400).json({ 
          message: "Solde insuffisant", 
          details: `Le montant converti (${amountGNF.toFixed(0)} GNF) dépasse le solde admin disponible (${adminBalance.toFixed(0)} GNF)`
        });
      }

      // Créer l'objet transaction complet avec tous les champs requis
      const transactionData = {
        userId: req.user!.id,
        clientId: body.clientId,
        phoneNumber: body.phoneNumber,
        amountFCFA: body.amountFCFA,
        amountGNF: amountGNF.toFixed(2),
        amountToPay: body.amountFCFA,
        status: "pending",
        exchangeRate: settings.exchangeRate
      };

      const transaction = await storage.createTransaction(transactionData);
      
      // Déduire le montant du solde admin
      const newBalance = adminBalance - amountGNF;
      await storage.updateSystemSettings({
        mainBalanceGNF: newBalance.toString()
      });
      
      // Créer une notification persistante pour l'admin
      const userName = `${req.user!.firstName} ${req.user!.lastName}`;
      await storage.createNotification({
        type: 'transaction',
        title: '🔔 Nouvelle Transaction',
        message: `${userName} a soumis une transaction de ${body.amountFCFA} FCFA`,
        targetRole: 'admin',
        targetUserId: null,
        relatedId: transaction.id,
        isRead: false,
        isPersistent: true
      });
      
      // Notify admin via WebSocket and Push with transaction details
      const notificationData = {
        type: 'NEW_TRANSACTION',
        title: '🔔 Nouvelle Transaction',
        body: `${userName} a soumis une transaction de ${body.amountFCFA} FCFA`,
        phoneNumber: body.phoneNumber,
        amountGNF: amountGNF.toFixed(0),
        amountFCFA: body.amountFCFA,
        id: transaction.id,
        userId: req.user!.id,
        persistent: true
      };

      // Send via WebSocket for connected users
      (app as any).sendNotification('admin', null, notificationData);
      
      // Send push notification for offline users
      await sendPushNotification(notificationData);
      
      res.json(transaction);
    } catch (error) {
      console.error("Transaction creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create transaction", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.patch("/api/transactions/:id", async (req, res) => {
    try {
      console.log("📸 [SERVER DEBUG] PATCH /api/transactions/:id appelé");
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      console.log("📸 [SERVER DEBUG] ID transaction:", id);
      console.log("📸 [SERVER DEBUG] Updates reçues:", {
        hasProof: !!updates.proof,
        proofType: updates.proofType,
        proofLength: updates.proof?.length || 0,
        status: updates.status,
        keysReceived: Object.keys(updates)
      });
      
      // Détecter si c'est une suppression de preuve
      if (updates.proof === null && updates.proofType === null && updates.status === "pending") {
        console.log("🗑️ [SERVER DEBUG] SUPPRESSION DE PREUVE DÉTECTÉE pour transaction ID:", id);
      }

      // Vérification de la taille de l'image
      if (updates.proof && updates.proofType === "image") {
        const proofSizeKB = Math.round(updates.proof.length / 1024);
        console.log("📸 [SERVER DEBUG] Taille de l'image:", proofSizeKB, "KB");
        
        if (updates.proof.length > 2000000) { // 2MB max
          console.log("📸 [SERVER ERROR] Image trop volumineuse:", proofSizeKB, "KB");
          return res.status(400).json({ 
            message: `Image trop volumineuse: ${proofSizeKB}KB (max 2MB)` 
          });
        }
      }
      
      const transaction = await storage.updateTransaction(id, updates);
      
      if (!transaction) {
        console.log("📸 [SERVER ERROR] Transaction non trouvée pour ID:", id);
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      console.log("📸 [SERVER SUCCESS] Transaction mise à jour avec succès:", {
        id: transaction.id,
        hasProof: !!transaction.proof,
        status: transaction.status
      });
      
      // If proof was added/updated, notify the user
      if (updates.proof && transaction.userId) {
        console.log("📸 [SERVER DEBUG] Envoi de notification à l'utilisateur:", transaction.userId);
        (app as any).sendNotification('user', transaction.userId, {
          type: 'PROOF_SUBMITTED',
          message: 'Une preuve a été soumise pour votre transaction',
          data: {
            transactionId: transaction.id,
            proofType: updates.proofType,
            status: updates.status
          }
        });
      }
      
      res.json(transaction);
    } catch (error) {
      console.error("📸 [SERVER ERROR] Erreur lors de la mise à jour:", error);
      res.status(500).json({ message: "Failed to update transaction" });
    }
  });

  // Route pour supprimer une transaction (utilisateur - seulement si pending)
  app.delete("/api/transactions/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.getTransaction(id);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      // Vérifier que l'utilisateur est propriétaire de la transaction
      if (req.user!.role === 'user' && transaction.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      // L'utilisateur ne peut supprimer que si status = pending
      if (req.user!.role === 'user' && transaction.status !== 'pending') {
        return res.status(400).json({ message: "Cannot delete transaction that has been seen by admin" });
      }

      // Supprimer la transaction
      const deletedTransaction = await storage.deleteTransaction(id);
      
      if (!deletedTransaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      // Remettre le montant dans le solde admin
      const settings = await storage.getSystemSettings();
      const amountGNF = parseFloat(deletedTransaction.amountGNF);
      const currentBalance = parseFloat(settings.mainBalanceGNF);
      const newBalance = currentBalance + amountGNF;

      await storage.updateSystemSettings({
        mainBalanceGNF: newBalance.toFixed(2)
      });

      // Notifier l'admin si c'est un utilisateur qui supprime
      if (req.user!.role === 'user') {
        sendNotification('admin', null, {
          type: 'TRANSACTION_DELETED',
          message: `Transaction #${id} supprimée par ${req.user!.firstName} ${req.user!.lastName}`,
          data: {
            transactionId: id,
            amount: deletedTransaction.amountFCFA,
            userId: req.user!.id
          }
        });
      }

      res.json({ message: "Transaction deleted successfully" });
    } catch (error) {
      console.error("Transaction deletion error:", error);
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Route pour annuler une transaction (utilisateur - si seen par admin)
  app.patch("/api/transactions/:id/cancel", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.getTransaction(id);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      // Vérifier que l'utilisateur est propriétaire
      if (req.user!.role === 'user' && transaction.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      // L'utilisateur ne peut annuler que si status = seen
      if (req.user!.role === 'user' && transaction.status !== 'seen') {
        return res.status(400).json({ message: "Can only cancel transactions that have been seen by admin" });
      }

      // Mettre à jour le statut en cancelled
      const updatedTransaction = await storage.updateTransaction(id, {
        status: 'cancelled'
      });

      // Notifier l'admin de l'annulation
      sendNotification('admin', null, {
        type: 'TRANSACTION_CANCELLED',
        message: `Transaction #${id} annulée par ${req.user!.firstName} ${req.user!.lastName}`,
        data: {
          transactionId: id,
          amount: transaction.amountFCFA,
          userId: req.user!.id
        }
      });

      res.json(updatedTransaction);
    } catch (error) {
      console.error("Transaction cancellation error:", error);
      res.status(500).json({ message: "Failed to cancel transaction" });
    }
  });

  // Payments
  app.get("/api/payments", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : null;
      
      let payments;
      if (userId) {
        payments = await storage.getPaymentsByUserId(userId);
      } else {
        return res.status(400).json({ message: "userId required" });
      }
      
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      
      // Send WebSocket notification for payment made
      sendNotification("admin", null, {
        type: "PAYMENT_MADE",
        message: `Nouveau paiement de ${payment.amount} GNF validé`,
        data: { paymentId: payment.id, userId: payment.userId }
      });

      res.json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid payment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  // System Settings
  app.get("/api/system/settings", async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system settings" });
    }
  });

  app.patch("/api/system/settings", async (req, res) => {
    try {
      const updates = req.body;
      const settings = await storage.updateSystemSettings(updates);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to update system settings" });
    }
  });

  // Statistics
  app.get("/api/stats/daily", async (req, res) => {
    try {
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
      const stats = await storage.getDailyStats(date);
      res.json(stats);
    } catch (error) {
      console.error("Error in /api/stats/daily:", error);
      res.json({ totalSent: 0, totalPaid: 0, globalDebt: 0 });
    }
  });

  app.get("/api/stats/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const summary = await storage.getUserSummary(userId);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user summary" });
    }
  });

  // Get daily stats for a specific user
  app.get("/api/stats/daily-user", async (req, res) => {
    try {
      console.log("Daily stats request:", req.query);
      const userId = req.query.userId ? parseInt(req.query.userId as string) : null;
      const dateParam = req.query.date as string;
      
      if (!userId) {
        console.log("No userId provided");
        return res.status(400).json({ message: "User ID is required" });
      }

      console.log("Getting transactions for user:", userId);
      
      // Use provided date or default to today
      const targetDate = dateParam ? new Date(dateParam) : new Date();
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      console.log("Target date range:", targetDate, "to", nextDay);

      // Get user's transactions for the target date
      const userTransactions = await storage.getTransactionsByUserId(userId);
      console.log("Found", userTransactions.length, "total transactions for user");

      const dayTransactions = userTransactions.filter(t => {
        const transactionDate = new Date(t.createdAt);
        return transactionDate >= targetDate && transactionDate < nextDay;
      });

      console.log("Found", dayTransactions.length, "transactions for target date");

      const totalSentDay = dayTransactions.reduce(
        (sum, t) => sum + parseFloat(t.amountFCFA), 0
      );

      const transactionCount = dayTransactions.length;

      console.log("Total sent:", totalSentDay, "Transaction count:", transactionCount);

      res.json({
        totalSentDay,
        transactionCount,
        date: targetDate.toISOString(),
        isToday: targetDate.toDateString() === new Date().toDateString()
      });
    } catch (error) {
      console.error("Error in /api/stats/user/daily:", error);
      res.status(500).json({ message: "Failed to fetch daily user stats", error: (error as Error).message });
    }
  });

  // Alternative route for user stats with query parameter
  app.get("/api/stats/user", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : null;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      const summary = await storage.getUserSummary(userId);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user summary" });
    }
  });

  // Get all user summaries for admin dashboard
  app.get("/api/stats/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const userSummaries = await Promise.all(
        users.filter(u => u.role === "user").map(async (user) => {
          try {
            const summary = await storage.getUserSummary(user.id);
            return {
              id: user.id,
              name: `${user.firstName} ${user.lastName}`,
              email: user.username,
              ...summary
            };
          } catch (userError) {
            console.error(`Error fetching summary for user ${user.id}:`, userError);
            return {
              id: user.id,
              name: `${user.firstName} ${user.lastName}`,
              email: user.username,
              totalSent: 0,
              totalPaid: 0,
              previousDebt: 0,
              currentDebt: 0
            };
          }
        })
      );
      res.json(userSummaries);
    } catch (error) {
      console.error("Error in /api/stats/users:", error);
      res.status(500).json({ message: "Failed to fetch user summaries" });
    }
  });

  // Get pending transactions count for notifications
  app.get("/api/stats/pending-count", async (req, res) => {
    try {
      const pendingTransactions = await storage.getPendingTransactions();
      res.json({ count: pendingTransactions.length });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending transactions count" });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket Server for notifications
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store connected clients by user role and ID
  const connectedClients = new Map<string, WebSocket>();
  
  wss.on('connection', (ws, request) => {
    console.log('WebSocket connection established');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'register' && data.userId && data.role) {
          // Register client with user ID and role
          const clientKey = `${data.role}_${data.userId}`;
          connectedClients.set(clientKey, ws);
          console.log(`Client registered: ${clientKey}`);
        }
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    });
    
    ws.on('close', () => {
      // Remove client from connected clients
      connectedClients.forEach((client, key) => {
        if (client === ws) {
          connectedClients.delete(key);
          console.log(`Client disconnected: ${key}`);
        }
      });
    });
  });
  
  // Function to send notification to specific user role
  function sendNotification(role: string, userId: number | null, notification: any) {
    if (role === 'admin') {
      // Send to all admin users
      connectedClients.forEach((client, key) => {
        if (key.startsWith('admin_') && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(notification));
        }
      });
    } else if (userId) {
      // Send to specific user
      const clientKey = `user_${userId}`;
      const client = connectedClients.get(clientKey);
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(notification));
      }
    }
  }
  
  // Routes pour les notifications
  app.post("/api/notifications", async (req: Request, res) => {
    try {
      const validatedData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(validatedData);
      
      // Envoyer la notification en temps réel
      sendNotification(notification.targetRole, notification.targetUserId, {
        type: 'notification',
        title: notification.title,
        body: notification.message,
        id: notification.id,
        userId: notification.targetUserId,
        persistent: notification.isPersistent
      });
      
      res.json(notification);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/notifications", async (req: Request, res) => {
    try {
      const { targetRole, targetUserId } = req.query;
      const notifications = await storage.getNotifications(
        targetRole as string,
        targetUserId ? parseInt(targetUserId as string) : undefined
      );
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/notifications/unread", async (req: Request, res) => {
    try {
      const { targetRole, targetUserId } = req.query;
      const notifications = await storage.getUnreadNotifications(
        targetRole as string,
        targetUserId ? parseInt(targetUserId as string) : undefined
      );
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/notifications/mark-seen", async (req: Request, res) => {
    try {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ message: "ID de notification requis" });
      }
      
      const notification = await storage.markNotificationAsRead(parseInt(id));
      if (!notification) {
        return res.status(404).json({ message: "Notification introuvable" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/notifications/:id/read", async (req: Request, res) => {
    try {
      const { id } = req.params;
      const notification = await storage.markNotificationAsRead(parseInt(id));
      
      if (!notification) {
        return res.status(404).json({ message: "Notification introuvable" });
      }
      
      res.json(notification);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Routes pour les rapports quotidiens
  app.get("/api/reports/user/:userId", requireAuth, async (req: Request, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Vérifier les permissions : admin peut voir tous les rapports, utilisateur ne peut voir que le sien
      if (req.user!.role !== "admin" && req.user!.id !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Obtenir toutes les transactions et paiements de l'utilisateur
      const userTransactions = await storage.getTransactionsByUserId(userId);
      const userPayments = await storage.getPaymentsByUserId(userId);

      // Créer un map des dates avec les données
      const dateMap = new Map<string, {
        date: string;
        transactions: typeof userTransactions;
        payments: typeof userPayments;
      }>();

      // Ajouter les transactions
      userTransactions.forEach(transaction => {
        const date = new Date(transaction.createdAt).toISOString().split('T')[0];
        if (!dateMap.has(date)) {
          dateMap.set(date, { date, transactions: [], payments: [] });
        }
        dateMap.get(date)!.transactions.push(transaction);
      });

      // Ajouter les paiements
      userPayments.forEach(payment => {
        const date = new Date(payment.createdAt).toISOString().split('T')[0];
        if (!dateMap.has(date)) {
          dateMap.set(date, { date, transactions: [], payments: [] });
        }
        dateMap.get(date)!.payments.push(payment);
      });

      // Calculer les rapports quotidiens
      const dailyReports = [];
      let cumulativeDebt = 0;

      // Trier les dates
      const sortedDates = Array.from(dateMap.keys()).sort();

      for (const date of sortedDates) {
        const dayData = dateMap.get(date)!;
        
        const previousDebt = cumulativeDebt;
        const totalSent = dayData.transactions.reduce((sum, t) => sum + parseFloat(t.amountFCFA), 0);
        const totalToPay = dayData.transactions.reduce((sum, t) => sum + parseFloat(t.amountToPay), 0);
        const totalPaid = dayData.payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        
        cumulativeDebt = previousDebt + totalToPay - totalPaid;
        const remainingDebt = Math.max(0, cumulativeDebt);

        dailyReports.push({
          date,
          previousDebt,
          totalSent,
          totalPaid,
          remainingDebt
        });
      }

      res.json(dailyReports.reverse()); // Plus récent en premier
    } catch (error) {
      console.error("Error fetching user reports:", error);
      res.status(500).json({ message: "Failed to fetch user reports", error: (error as Error).message });
    }
  });

  // Store notification function on the app for use in routes
  (app as any).sendNotification = sendNotification;
  
  return httpServer;
}
