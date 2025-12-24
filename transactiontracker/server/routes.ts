import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { db } from "./db";
import { insertNotificationSchema } from "@shared/schema";
import { insertUserSchema, insertClientSchema, insertTransactionSchema, insertPaymentSchema, insertSystemSettingsSchema, type InsertTransaction, users, payments, clients, transactions as transactionsTable } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { z } from "zod";
import path from "path";
import express from "express";

import { networkOptimizationMiddleware, optimizedResponseMiddleware } from "./middleware/network-optimization";
import { performanceCacheMiddleware, invalidateCache } from "./middleware/performance-cache";
import webpush from "web-push";

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

  // Configure web-push with VAPID keys
  webpush.setVapidDetails(
    'mailto:admin@gesfinance.com',
    'BEl62iUYgUivxIkv69yViEuiBIa40HI8MeJgUm30e1oSQi4VKVS3t3-JQxePaFNPe3UgKkgdOq8i3nM2Yw5-KKE',
    'p1F_QNiCNhYN-8KMIRl9-Tc7FNWJJy6FsZxD-Cr8VVU'
  );

  // Function to send real push notifications to all admin subscribers
  async function sendPushNotificationToAdmins(message: string, data?: any) {
    console.log('📱 [PUSH] Sending notification to', adminPushSubscriptions.size, 'admin subscribers');
    
    const subscriptions = Array.from(adminPushSubscriptions.entries());
    for (const [userId, subscription] of subscriptions) {
      try {
        const payload = JSON.stringify({
          title: 'GesFinance - Admin',
          body: message,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png',
          tag: 'admin-notification',
          requireInteraction: true,
          data: {
            ...data,
            userId,
            timestamp: Date.now()
          }
        });

        await webpush.sendNotification(subscription, payload);
        console.log('📱 [PUSH] Successfully sent to admin', userId);
      } catch (error) {
        console.error('📱 [PUSH] Failed to send notification to admin', userId, ':', error);
        // Remove invalid subscriptions
        adminPushSubscriptions.delete(userId);
      }
    }
  }

  // Apply network optimization middleware globally
  app.use(networkOptimizationMiddleware);
  app.use(optimizedResponseMiddleware);

  // Health check endpoints for deployment monitoring
  app.get("/health", (req, res) => {
    res.status(200).json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(), 
      service: "GesFinance",
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  });

  // Immediate health check for fast deployment verification
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "healthy", timestamp: new Date().toISOString(), service: "GesFinance" });
  });

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    req.user = req.session.user;
    next();
  };

  // Admin middleware
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // Force cache invalidation endpoint
  app.post("/api/cache/invalidate", requireAuth, (req, res) => {
    try {
      // Clear all server-side cache
      invalidateCache('/api/transactions');
      invalidateCache('/api/stats/user');
      invalidateCache('/api/stats/daily');
      invalidateCache('/api/reports/user');
      invalidateCache('/api/clients');
      invalidateCache('/api/system/settings');
      
      // Send WebSocket message to force frontend refresh
      const userKey = `${req.user!.role}_${req.user!.id}`;
      const client = connectedClients.get(userKey);
      if (client) {
        client.send(JSON.stringify({
          type: 'FORCE_REFRESH_ALL',
          message: 'Cache invalidated - refreshing all data'
        }));
      }
      
      res.json({ 
        message: "Cache invalidated successfully", 
        timestamp: new Date().toISOString() 
      });
    } catch (error) {
      console.error("Error invalidating cache:", error);
      res.status(500).json({ message: "Failed to invalidate cache" });
    }
  });

  // Performance-optimized static file serving
  app.get('/manifest.json', (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(path.join(process.cwd(), 'public/manifest.json'));
  });
  
  app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes (SW updates frequently)
    res.sendFile(path.join(process.cwd(), 'public/sw.js'));
  });
  
  // Icons with long cache (immutable)
  app.use('/icons', express.static(path.join(process.cwd(), 'public/icons'), {
    maxAge: '1y',
    etag: true,
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }));

  // Create HTTP server and WebSocket server
  const httpServer = createServer(app);
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
      const keysToDelete: string[] = [];
      connectedClients.forEach((client, key) => {
        if (client === ws) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => {
        connectedClients.delete(key);
        console.log(`Client disconnected: ${key}`);
      });
    });
  });
  
  // Function to send notification to specific user role
  function sendNotification(role: string, userId: number | null, notification: any) {
    console.log(`🔔 [SERVER] Envoi notification ${notification.type} vers ${role}`, { connectedClients: connectedClients.size });
    
    if (role === 'admin') {
      // Send to all admin users
      let sentCount = 0;
      connectedClients.forEach((client, key) => {
        if (key.startsWith('admin_') && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(notification));
          sentCount++;
          console.log(`🔔 [SERVER] Notification envoyée à ${key}`);
        }
      });
      console.log(`🔔 [SERVER] Total notifications envoyées: ${sentCount}`);
    } else if (role === 'user' && userId) {
      // Send to specific user
      const userKey = `user_${userId}`;
      const client = connectedClients.get(userKey);
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(notification));
        console.log(`🔔 [SERVER] Notification envoyée à ${userKey}`);
      } else {
        console.log(`🔔 [SERVER] Client ${userKey} non connecté ou fermé`);
      }
    }
  }

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

  app.post('/api/push/test', requireAuth, requireAdmin, async (req, res) => {
    try {
      const userId = req.user!.id;
      const userName = `${req.user!.firstName} ${req.user!.lastName}`;
      
      // Send test notification to the admin who requested it
      await sendPushNotificationToAdmins(
        `Test de notification pour ${userName}`,
        {
          type: 'TEST_NOTIFICATION',
          userId,
          userName,
          message: 'Si vous recevez cette notification, le système fonctionne parfaitement!'
        }
      );
      
      console.log(`📱 Test notification sent to admin ${userId}`);
      res.json({ success: true, message: 'Test notification sent' });
    } catch (error) {
      console.error('Test notification error:', error);
      res.status(500).json({ message: 'Failed to send test notification' });
    }
  });

  // Authentication
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const userAgent = req.headers['user-agent'] || 'Unknown';
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      
      console.log(`[AUTH] Login attempt - Username: "${username}", Mobile: ${isMobile}`);
      console.log(`[AUTH] User-Agent: ${userAgent}`);
      console.log(`[AUTH] Request headers:`, JSON.stringify({
        'content-type': req.headers['content-type'],
        'origin': req.headers.origin,
        'referer': req.headers.referer,
        'cookie': req.headers.cookie ? 'Present' : 'Missing'
      }));
      
      if (!username || !password) {
        console.log(`[AUTH] Missing credentials - Username: "${username}", Password: ${password ? '[PROVIDED]' : '[EMPTY]'}`);
        return res.status(400).json({ message: "Username and password required" });
      }

      // Trim whitespace that might come from mobile keyboards
      const cleanUsername = username.trim();
      const cleanPassword = password.trim();
      
      console.log(`[AUTH] Cleaned credentials - Username: "${cleanUsername}", Password length: ${cleanPassword.length}`);

      const user = await storage.getUserByUsername(cleanUsername);
      console.log(`[AUTH] User lookup result:`, user ? `Found user: ${user.username}, Active: ${user.isActive}` : 'User not found');
      
      if (!user || user.password !== cleanPassword || !user.isActive) {
        if (user) {
          console.log(`[AUTH] Password comparison details:`);
          console.log(`[AUTH] Stored password: "${user.password}" (length: ${user.password.length})`);
          console.log(`[AUTH] Provided password: "${cleanPassword}" (length: ${cleanPassword.length})`);
          console.log(`[AUTH] Character codes stored: [${user.password.split('').map((c: string) => c.charCodeAt(0)).join(', ')}]`);
          console.log(`[AUTH] Character codes provided: [${cleanPassword.split('').map((c: string) => c.charCodeAt(0)).join(', ')}]`);
          console.log(`[AUTH] Password match: ${user.password === cleanPassword}`);
          console.log(`[AUTH] User active: ${user.isActive}`);
        }
        console.log(`[AUTH] Authentication failed - User exists: ${!!user}, Password match: ${user ? user.password === cleanPassword : false}, Active: ${user ? user.isActive : false}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Store user in session
      const sessionUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role,
        walletGNF : user.walletGNF
      };
      
      req.session.user = sessionUser;
      
      console.log(`[AUTH] Session created for user ${user.username}, Session ID: ${req.sessionID}`);
      console.log(`[AUTH] Session data:`, JSON.stringify(req.session.user));
      
      res.json({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role,
        walletGNF : user.walletGNF
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('sessionId'); // Use the custom session name
      res.clearCookie('connect.sid'); // Clear default name too for safety
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    console.log(`[AUTH] /me request - Mobile: ${isMobile}, SessionID: ${req.sessionID}`);
    console.log(`[AUTH] Session exists: ${!!req.session}, User in session: ${!!req.session?.user}`);
    
    if (req.session?.user) {
      console.log(`[AUTH] Returning user data for: ${req.session.user.username}`);
      res.json(req.session.user);
    } else {
      console.log(`[AUTH] No valid session found`);
      res.status(401).json({ message: "Not authenticated" });
    }
  });



  // Route pour récupérer tous les utilisateurs (admin seulement)
  app.get("/api/users", requireAuth, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      console.log(`[USERS API] Retrieved ${users.length} users`);
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
      res.json(users);
    } catch (error) {
      console.error("[USERS API] Error:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs" });
    }
  });

  app.post("/api/users", requireAuth, async (req, res) => {
    try {
      // Only admin can create users
      if (req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      console.error("User creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.patch("/api/users/:id", requireAuth, async (req, res) => {
    try {
      // Only admin can update users
      if (req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const user = await storage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("User update error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.patch("/api/users/:id/password", requireAuth, async (req, res) => {
    try {
      // Only admin can change user passwords
      if (req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const id = parseInt(req.params.id);
      const { password } = req.body;
      
      if (!password || typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }

      const user = await storage.updateUser(id, { password });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Route pour mettre à jour le pourcentage de frais personnel d'un utilisateur
  app.patch("/api/users/:userId/fee-percentage", requireAuth, requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { feePercentage } = req.body;
      
      if (!feePercentage || isNaN(parseFloat(feePercentage))) {
        return res.status(400).json({ message: "Pourcentage de frais invalide" });
      }
      
      const percentage = parseFloat(feePercentage);
      if (percentage < 0 || percentage > 100) {
        return res.status(400).json({ message: "Le pourcentage doit être entre 0 et 100" });
      }

      // Mettre à jour le pourcentage de frais personnel de l'utilisateur
      const [updatedUser] = await db
        .update(users)
        .set({ personalFeePercentage: percentage.toFixed(2) })
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUser) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      console.log(`💰 [FEE UPDATE] Admin ${req.user!.firstName} a mis à jour le pourcentage de frais de ${updatedUser.firstName} ${updatedUser.lastName} à ${percentage}%`);

      // Invalider le cache des utilisateurs côté serveur
      if (adminCache.userMap) {
        console.log('🔄 [FEE UPDATE API] Clearing admin cache...');
        adminCache.lastUpdate = 0; // Force cache refresh
      }
      
      // Invalider le cache performance pour /api/users
      const { invalidateCache } = await import('./middleware/performance-cache.js');
      invalidateCache('/api/users');
      console.log('🔄 [FEE UPDATE API] Performance cache invalidated for /api/users');

      // Notifier tous les clients connectés via WebSocket de la mise à jour
      sendNotification('both', null, {
        type: 'FEE_PERCENTAGE_UPDATED',
        userId: updatedUser.id,
        userName: `${updatedUser.firstName} ${updatedUser.lastName}`,
        newPercentage: percentage,
        message: `Frais mis à jour : ${updatedUser.firstName} ${updatedUser.lastName} → ${percentage}%`
      });
      console.log(`🔔 [FEE UPDATE] WebSocket notification sent for user ${updatedUser.id} (${percentage}%)`);

      // Notifier spécifiquement l'utilisateur concerné pour qu'il actualise ses données
      if (connectedClients.has(`user_${updatedUser.id}`)) {
        const userClient = connectedClients.get(`user_${updatedUser.id}`);
        if (userClient) {
          userClient.send(JSON.stringify({
            type: 'PERSONAL_FEE_UPDATED',
            userId: updatedUser.id,
            newPercentage: percentage,
            message: `Vos frais ont été mis à jour à ${percentage}%`
          }));
          console.log(`🎯 [FEE UPDATE] Direct notification sent to user ${updatedUser.id}`);
        }
      }

      res.json({ 
        message: "Pourcentage de frais mis à jour avec succès",
        user: {
          id: updatedUser.id,
          name: `${updatedUser.firstName} ${updatedUser.lastName}`,
          feePercentage: updatedUser.personalFeePercentage
        }
      });
    } catch (error) {
      console.error("Error updating user fee percentage:", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour du pourcentage de frais" });
    }
  });

  // Clients routes
  app.get("/api/clients", performanceCacheMiddleware, requireAuth, async (req, res) => {
    try {
      // Force no-cache to ensure fresh data after mutations
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      const clients = await storage.getClientsByUserId(req.user!.id);
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.json([]);
    }
  });

  app.post("/api/clients", requireAuth, async (req, res) => {
    try {
      const clientData = insertClientSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      // Vérifier si un client avec le même nom existe déjà pour cet utilisateur
      const existingClients = await storage.getClientsByUserId(req.user!.id);
      const duplicateName = existingClients.find(
        client => client.name.toLowerCase().trim() === clientData.name.toLowerCase().trim()
      );
      
      if (duplicateName) {
        return res.status(400).json({ 
          message: "Un client avec ce nom existe déjà. Veuillez choisir un autre nom." 
        });
      }
      
      const client = await storage.createClient(clientData);
      
      // Invalider le cache après création
      invalidateCache('/api/clients');
      
      res.json(client);
    } catch (error) {
      console.error("Client creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create client", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.patch("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      const updates = req.body;
      if (!updates.name || typeof updates.name !== 'string' || updates.name.trim().length === 0) {
        return res.status(400).json({ message: "Name is required and must be a non-empty string" });
      }
      
      // Verify the client belongs to the current user
      const existingClient = await storage.getClient(id);
      if (!existingClient) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      if (existingClient.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Vérifier si un autre client avec le même nom existe déjà pour cet utilisateur
      const existingClients = await storage.getClientsByUserId(req.user!.id);
      const duplicateName = existingClients.find(
        client => client.id !== id && client.name.toLowerCase().trim() === updates.name.toLowerCase().trim()
      );
      
      if (duplicateName) {
        return res.status(400).json({ 
          message: "Un client avec ce nom existe déjà. Veuillez choisir un autre nom." 
        });
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

  // Delete client
  app.delete("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      console.log(`🗑️ [DELETE CLIENT] Request from user ${req.user!.id} for client ${req.params.id}`);
      
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        console.log('🗑️ [DELETE CLIENT] Invalid ID:', req.params.id);
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      // Verify the client belongs to the current user
      const existingClient = await storage.getClient(id);
      if (!existingClient) {
        console.log('🗑️ [DELETE CLIENT] Client not found:', id);
        return res.status(404).json({ message: "Client not found" });
      }
      
      if (existingClient.userId !== req.user!.id) {
        console.log('🗑️ [DELETE CLIENT] Access denied - client belongs to user', existingClient.userId, 'but request from user', req.user!.id);
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Check if client has transactions
      const userTransactions = await storage.getTransactionsByUserId(req.user!.id);
      const hasTransactions = userTransactions.some(t => t.clientId === id);
      
      if (hasTransactions) {
        console.log('🗑️ [DELETE CLIENT] Cannot delete - client has transactions:', id);
        return res.status(400).json({ 
          message: "Impossible de supprimer ce client car il a des transactions associées" 
        });
      }
      
      const deletedClient = await storage.deleteClient(id);
      
      if (!deletedClient) {
        console.log('🗑️ [DELETE CLIENT] Failed to delete client:', id);
        return res.status(404).json({ message: "Client not found" });
      }
      
      console.log('🗑️ [DELETE CLIENT] Successfully deleted:', deletedClient.name);
      res.json({ message: "Client supprimé avec succès", client: deletedClient });
    } catch (error) {
      console.error("🗑️ [DELETE CLIENT] Error:", error);
      res.status(500).json({ message: "Failed to delete client", error: String(error) });
    }
  });

  // API pour compter les transactions nécessitant une annulation
  app.get("/api/stats/cancellation-count", requireAuth, requireAdmin, async (req, res) => {
    try {
      console.log('🚨 [CANCELLATION COUNT] Checking for transactions to cancel...');
      
      // Critères pour transactions à annuler:
      // 1. Status 'pending' depuis plus de 24h
      // 2. Status 'seen' depuis plus de 48h 
      // 3. Status 'proof_submitted' depuis plus de 72h sans validation
      
      // D'abord, vérifier toutes les transactions pending
      const pendingResult = await db.execute(`
        SELECT id, status, created_at, 
               EXTRACT(EPOCH FROM (NOW() - created_at))/3600 as hours_old
        FROM transactions 
        WHERE status = 'pending'
        ORDER BY created_at DESC
      `);
      
      console.log('🚨 [CANCELLATION COUNT] All pending transactions:', 
        pendingResult.rows.map(row => ({
          id: row.id,
          status: row.status,
          created_at: row.created_at,
          hours_old: row.hours_old
        }))
      );
      
      // Compter les transactions qui nécessitent vraiment une annulation
      // CRITÈRES RÉALISTES : 
      // 1. Status 'pending' depuis plus de 7 jours
      // 2. Status 'seen' depuis plus de 3 jours 
      // 3. Status 'proof_submitted' depuis plus de 2 jours sans validation
      const countResult = await db.execute(`
        SELECT COUNT(*) as count FROM transactions 
        WHERE (
          cancellation_requested = true OR
          (status = 'pending' AND created_at < NOW() - INTERVAL '7 days') OR
          (status = 'seen' AND created_at < NOW() - INTERVAL '3 days') OR
          (status = 'proof_submitted' AND created_at < NOW() - INTERVAL '2 days')
        )
        AND (is_deleted IS NULL OR is_deleted = false)
        AND status != 'cancelled'
      `);
      
      const count = countResult.rows[0]?.count || 0;
      console.log('🚨 [CANCELLATION COUNT] Transactions needing cancellation (with realistic criteria):', count);
      console.log('🚨 [CANCELLATION COUNT] Applied criteria: 7 days for pending, 3 days for seen, 2 days for proof_submitted');
      
      res.json({ count: parseInt(count as string) });
    } catch (error) {
      console.error("Error counting cancellation candidates:", error);
      res.status(500).json({ count: 0 });
    }
  });

  // API pour récupérer les transactions nécessitant une annulation
  app.get("/api/transactions/cancellation-candidates", requireAuth, requireAdmin, async (req, res) => {
    try {
      console.log('🚨 [CANCELLATION CANDIDATES] Fetching transactions to cancel...');
      
      // Récupérer les transactions qui nécessitent annulation avec leurs détails complets
      const candidatesResult = await db.execute(`
        SELECT t.*, u.first_name, u.last_name, c.name as client_name,
               EXTRACT(EPOCH FROM (NOW() - t.created_at))/3600 as hours_old
        FROM transactions t
        LEFT JOIN users u ON t.user_id = u.id
        LEFT JOIN clients c ON t.client_id = c.id
        WHERE (
          t.cancellation_requested = true OR
          (t.status = 'pending' AND t.created_at < NOW() - INTERVAL '7 days') OR
          (t.status = 'seen' AND t.created_at < NOW() - INTERVAL '3 days') OR
          (t.status = 'proof_submitted' AND t.created_at < NOW() - INTERVAL '2 days')
        )
        AND (t.is_deleted IS NULL OR t.is_deleted = false)
        AND t.status != 'cancelled'
        ORDER BY t.created_at DESC
      `);

      const candidates = candidatesResult.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        clientId: row.client_id,
        phoneNumber: row.phone_number,
        amountFCFA: row.amount_fcfa,
        amountGNF: row.amount_gnf,
        amountToPay: row.amount_to_pay,
        feeAmount: row.fee_amount,
        feePercentage: row.fee_percentage,
        status: row.status,
        proof: row.proof,
        proofType: row.proof_type,
        proofImages: row.proof_images,
        proofCount: row.proof_count,
        externalProofUrl: row.external_proof_url,
        isArchived: row.is_archived,
        isProofShared: row.is_proof_shared,
        isDeleted: row.is_deleted,
        deletedAt: row.deleted_at,
        deletedBy: row.deleted_by,
        exchangeRate: row.exchange_rate,
        createdAt: row.created_at,
        userName: `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Utilisateur inconnu',
        clientName: row.client_name || 'Client occasionnel',
        hoursOld: parseFloat(row.hours_old || '0'),
        cancellationRequested: row.cancellation_requested || false,
        cancellationRequestedAt: row.cancellation_requested_at,
        cancellationReason: row.cancellation_reason
      }));

      console.log(`🚨 [CANCELLATION CANDIDATES] Found ${candidates.length} transactions needing cancellation:`);
      candidates.forEach(t => {
        console.log(`  - ID ${t.id}: ${t.userName} -> ${t.clientName} (${t.amountFCFA} FCFA) - Status: ${t.status}, Age: ${t.hoursOld.toFixed(1)}h`);
      });
      
      res.json(candidates);
    } catch (error) {
      console.error("Error fetching cancellation candidates:", error);
      res.status(500).json({ error: "Failed to fetch cancellation candidates" });
    }
  });

  // ROUTE SUPPRIMÉE : Plus de demandes d'annulation côté utilisateur

  // Cache en mémoire ultra-rapide pour admin
  let adminCache = {
    pendingTransactions: null as any,
    allTransactions: null as any,
    userMap: null as Map<number, string> | null,
    clientMap: null as Map<number, string> | null,
    lastUpdate: 0,
    cacheTimeout: 5000 // 5 secondes cache ultra-court
  };

  // Fonction pour invalider le cache admin
  function invalidateAdminCache() {
    adminCache.pendingTransactions = null;
    adminCache.allTransactions = null;
    adminCache.userMap = null;
    adminCache.clientMap = null;
    adminCache.lastUpdate = 0;
  }

  // Fonction pour pré-charger le cache admin
  async function preloadAdminCache() {
    const now = Date.now();
    if (adminCache.lastUpdate && (now - adminCache.lastUpdate) < adminCache.cacheTimeout) {
      console.log('[ADMIN CACHE] Using existing cache, age:', now - adminCache.lastUpdate, 'ms');
      return; // Cache encore valide
    }

    try {
      console.log('[ADMIN CACHE] Refreshing cache...');
      
      // 🚨 CORRECTION : Requête directe pour exclure les transactions avec demande d'annulation
      const pendingTransactionsResult = await db.execute(`
        SELECT * FROM transactions 
        WHERE status IN ('pending', 'seen', 'proof_submitted')
        AND (is_deleted IS NULL OR is_deleted = false)
        AND (cancellation_requested IS NULL OR cancellation_requested = false)
        ORDER BY created_at DESC
      `);
      
      const pendingTransactions = pendingTransactionsResult.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        clientId: row.client_id,
        phoneNumber: row.phone_number,
        amountFCFA: row.amount_fcfa,
        amountGNF: row.amount_gnf,
        amountToPay: row.amount_to_pay,
        feeAmount: row.fee_amount,
        feePercentage: row.fee_percentage,
        status: row.status,
        cancellationRequested: row.cancellation_requested || false,
        cancellationRequestedAt: row.cancellation_requested_at,
        cancellationReason: row.cancellation_reason,
        proof: row.proof,
        proofType: row.proof_type,
        proofImages: row.proof_images,
        proofCount: row.proof_count,
        externalProofUrl: row.external_proof_url,
        isArchived: row.is_archived,
        isProofShared: row.is_proof_shared,
        isDeleted: row.is_deleted,
        deletedAt: row.deleted_at,
        deletedBy: row.deleted_by,
        exchangeRate: row.exchange_rate,
        createdAt: row.created_at
      }));
      
      // 🚨 CORRECTION : Requête directe pour toutes les transactions en excluant les supprimées
      const allTransactionsResult = await db.execute(`
        SELECT t.*, u.first_name, u.last_name, c.name as client_name
        FROM transactions t
        LEFT JOIN users u ON t.user_id = u.id
        LEFT JOIN clients c ON t.client_id = c.id
        WHERE (t.is_deleted IS NULL OR t.is_deleted = false)
        ORDER BY t.created_at DESC
      `);
      
      const allTransactions = allTransactionsResult.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        clientId: row.client_id,
        phoneNumber: row.phone_number,
        amountFCFA: row.amount_fcfa,
        amountGNF: row.amount_gnf,
        amountToPay: row.amount_to_pay,
        feeAmount: row.fee_amount,
        feePercentage: row.fee_percentage,
        status: row.status,
        cancellationRequested: row.cancellation_requested || false,
        cancellationRequestedAt: row.cancellation_requested_at,
        cancellationReason: row.cancellation_reason,
        proof: row.proof,
        proofType: row.proof_type,
        proofImages: row.proof_images,
        proofCount: row.proof_count,
        externalProofUrl: row.external_proof_url,
        isArchived: row.is_archived,
        isProofShared: row.is_proof_shared,
        isDeleted: row.is_deleted,
        deletedAt: row.deleted_at,
        deletedBy: row.deleted_by,
        exchangeRate: row.exchange_rate,
        createdAt: row.created_at,
        userName: `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Utilisateur inconnu',
        clientName: row.client_name || 'Client occasionnel'
      }));
      
      const [allUsers, allClients] = await Promise.all([
        storage.getAllUsers(),
        db.select().from(clients)
      ]);

      console.log('[ADMIN CACHE] Raw data loaded:', {
        pendingCount: pendingTransactions.length,
        allCount: allTransactions.length,
        usersCount: allUsers.length,
        clientsCount: allClients.length
      });

      console.log('[ADMIN CACHE] Pending transactions details:', 
        pendingTransactions.map(t => ({ id: t.id, userId: t.userId, status: t.status }))
      );

      adminCache.userMap = new Map(allUsers.map(u => [u.id, `${u.firstName} ${u.lastName}`]));
      adminCache.clientMap = new Map(allClients.map(c => [c.id, c.name]));
      
      console.log('[ADMIN CACHE] User mapping:', Array.from(adminCache.userMap.entries()));
      
      // Enrichir les transactions immédiatement
      adminCache.pendingTransactions = pendingTransactions.map(t => ({
        ...t,
        userName: adminCache.userMap!.get(t.userId) || "Unknown",
        clientName: t.clientId ? (adminCache.clientMap!.get(t.clientId) || "Client Occasionnel") : "Client Occasionnel"
      }));

      console.log('[ADMIN CACHE] Enriched pending transactions:', 
        adminCache.pendingTransactions.map((t: any) => ({ id: t.id, userName: t.userName, status: t.status }))
      );

      // Les transactions sont déjà enrichies depuis la requête SQL directe
      adminCache.allTransactions = allTransactions;

      adminCache.lastUpdate = now;
      console.log('[ADMIN CACHE] Cache refreshed successfully');
    } catch (error) {
      console.error('[ADMIN CACHE] Failed to preload cache:', error);
    }
  }

  // Route ultra-optimisée pour admin - transactions en attente INSTANTANÉES
  app.get("/api/transactions/pending", async (req, res) => {
    try {
      // Optimisation pour connexions 3G lentes en Guinée
      const userAgent = req.get('User-Agent') || '';
      const isSlowConnection = userAgent.includes('Mobile') || 
                              userAgent.includes('Guinea') || 
                              req.get('X-Connection-Type') === '3g';
      
      if (isSlowConnection) {
        // Cache plus agressif pour connexions lentes
        res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
        res.setHeader('Connection', 'keep-alive');
      }
      
      console.log('[PENDING] Direct database query...');
      // 🚨 CORRECTION : Exclure les transactions avec demande d'annulation de l'onglet "En Attente"
      const pendingTransactionsResult = await db.execute(`
        SELECT t.*, u.first_name, u.last_name, c.name as client_name
        FROM transactions t
        LEFT JOIN users u ON t.user_id = u.id
        LEFT JOIN clients c ON t.client_id = c.id
        WHERE t.status IN ('pending', 'seen', 'proof_submitted')
        AND (t.is_deleted IS NULL OR t.is_deleted = false)
        AND (t.cancellation_requested IS NULL OR t.cancellation_requested = false)
        ORDER BY t.created_at DESC
      `);
      
      const pendingTransactions = pendingTransactionsResult.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        clientId: row.client_id,
        phoneNumber: row.phone_number,
        amountFCFA: row.amount_fcfa,
        amountGNF: row.amount_gnf,
        amountToPay: row.amount_to_pay,
        feeAmount: row.fee_amount,
        feePercentage: row.fee_percentage,
        status: row.status,
        cancellationRequested: row.cancellation_requested || false,
        cancellationRequestedAt: row.cancellation_requested_at,
        cancellationReason: row.cancellation_reason,
        proof: row.proof,
        proofType: row.proof_type,
        proofImages: row.proof_images,
        proofCount: row.proof_count,
        externalProofUrl: row.external_proof_url,
        isArchived: row.is_archived,
        isProofShared: row.is_proof_shared,
        isDeleted: row.is_deleted,
        deletedAt: row.deleted_at,
        deletedBy: row.deleted_by,
        exchangeRate: row.exchange_rate,
        createdAt: row.created_at,
        userName: `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Utilisateur inconnu',
        clientName: row.client_name || 'Client occasionnel'
      }));
      
      console.log('[PENDING FIXED] Found', pendingTransactions.length, 'total transactions (pending+seen+proof_submitted)');
      
      // ADMIN VOIT TOUT : Pas de limitation pour l'admin - il doit voir toutes les transactions en attente
      const limitedTransactions = pendingTransactions;
      
      // Les transactions sont déjà enrichies avec userName et clientName depuis la requête SQL
      const enrichedTransactions = limitedTransactions;
      
      console.log('[PENDING] Enriched first transaction:', enrichedTransactions[0]);
      res.json(enrichedTransactions);
    } catch (error) {
      console.error("Error in /api/transactions/pending:", error);
      res.status(500).json({ error: "Failed to fetch pending transactions" });
    }
  });

  // Route pour récupérer les statistiques utilisateur
  app.get("/api/stats/user", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const summary = await storage.getUserSummary(userId);
      
      console.log(`[STATS USER] Summary for user ${userId}:`, summary);
      
      res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
      res.json(summary);
    } catch (error) {
      console.error("[STATS USER] Error:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des statistiques utilisateur" });
    }
  });

  // Route pour récupérer le profil utilisateur avec frais personnalisés
  app.get("/api/user/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      console.log(`[USER PROFILE] Profile for user ${userId}:`, {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        personalFeePercentage: user.personalFeePercentage
      });
      
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.json({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role,
        personalFeePercentage: user.personalFeePercentage,
        personalDebtThresholdFCFA: user.personalDebtThresholdFCFA,
        isActive: user.isActive
      });
    } catch (error) {
      console.error("[USER PROFILE] Error:", error);
      res.status(500).json({ error: "Erreur lors de la récupération du profil utilisateur" });
    }
  });

  // Route pour vérifier le statut de crédit/dette de l'utilisateur
  app.get("/api/user/can-send", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        console.error(`❌ [CAN SEND] User ${userId} not found`);
        return res.status(404).json({ 
          canSend: false,
          message: "Utilisateur non trouvé" 
        });
      }
          const settings = await storage.getSystemSettings();
       const exchangeRate = parseFloat(settings.exchangeRate);
     // user.walletGNF peut être string ou null/undefined
const debtThreshold = parseFloat(user.walletGNF !== null && user.walletGNF !== undefined 
  ? user.walletGNF.toString() 
  : "100000.00"
)/exchangeRate;




      const userDebt = await storage.getUserDebt(userId);
      const currentDebt = parseFloat(userDebt.toString());
      const remainingCredit = Math.max(0, debtThreshold - currentDebt);
      
      const canSend = currentDebt < debtThreshold;
      
      const result = {
        canSend,
        currentDebt: currentDebt.toFixed(2),
        debtThreshold: debtThreshold.toFixed(2),
        remainingCredit: remainingCredit.toFixed(2),
        message: canSend 
          ? `Vous pouvez envoyer jusqu'à ${remainingCredit.toFixed(0)} FCFA`
          : `Crédit dépassé. Dette: ${currentDebt.toFixed(0)} FCFA / Limite: ${debtThreshold.toFixed(0)} FCFA`
      };
      
      console.log(`✅ [CAN SEND] User ${user.walletGNF} (${user.firstName}):`, result);
      
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.json(result);
    } catch (error) {
      console.error("❌ [CAN SEND] Error:", error);
      res.status(500).json({ 
        canSend: false,
        message: "Erreur lors de la vérification du crédit",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Route pour récupérer les statistiques quotidiennes admin
  app.get("/api/stats/daily", requireAuth, requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      const mainBalance = parseFloat(settings.mainBalanceGNF || "0");
      
      // Calculer les statistiques du jour
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEnd = new Date(today);
      todayEnd.setDate(todayEnd.getDate() + 1);
      
      // Récupérer toutes les transactions du jour
      const todayTransactions = await db.select().from(transactionsTable)
        .where(sql`${transactionsTable.createdAt} >= ${today.toISOString()} AND ${transactionsTable.createdAt} < ${todayEnd.toISOString()}`)
        .orderBy(transactionsTable.createdAt);
      
      const activeTransactions = todayTransactions.filter(t => !t.isDeleted);
      
      const totalSentToday = activeTransactions.reduce((sum, t) => sum + parseFloat(t.amountFCFA), 0);
      const totalDebtToday = activeTransactions.reduce((sum, t) => sum + parseFloat(t.amountToPay), 0);
      const pendingCount = activeTransactions.filter(t => t.status === 'pending').length;
      const validatedCount = activeTransactions.filter(t => t.status === 'validated').length;
      
      // CORRECTION MAJEURE : Calculer la dette globale de tous les temps
      // Récupérer toutes les transactions actives (pas seulement d'aujourd'hui)
      const allActiveTransactions = await db.select().from(transactionsTable)
        .where(sql`${transactionsTable.isDeleted} IS NULL OR ${transactionsTable.isDeleted} = false`);
      
      // Récupérer tous les paiements
      const allPayments = await db.select().from(payments);
      
      // Calculer la dette totale (amount_to_pay) et les paiements totaux
      const totalDebtAllTime = allActiveTransactions.reduce((sum, t) => sum + parseFloat(t.amountToPay), 0);
      const totalPaidAllTime = allPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      // Dette globale = Dette totale - Paiements totaux
      const globalDebt = Math.max(0, totalDebtAllTime - totalPaidAllTime);
      
      console.log(`[STATS DAILY] Total debt all time: ${totalDebtAllTime} FCFA`);
      console.log(`[STATS DAILY] Total paid all time: ${totalPaidAllTime} FCFA`);
      console.log(`[STATS DAILY] Global debt calculated: ${globalDebt} FCFA`);
      
      const stats = {
        mainBalance,
        totalSentToday,
        totalDebtToday,
        globalDebt, // NOUVEAU : Ajouter la dette globale
        pendingCount,
        validatedCount,
        transactionCount: activeTransactions.length
      };
      
      console.log(`[STATS DAILY] Daily stats:`, stats);
      
      res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
      res.json(stats);
    } catch (error) {
      console.error("[STATS DAILY] Error:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des statistiques quotidiennes" });
    }
  });

  // Route pour récupérer les résumés de tous les utilisateurs (admin seulement)
  app.get("/api/stats/users", requireAuth, requireAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const normalUsers = allUsers.filter(user => user.role !== 'admin');
      
      const userSummaries = await Promise.all(
        normalUsers.map(async (user) => {
          const summary = await storage.getUserSummary(user.id);
          return {
            userId: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            ...summary
          };
        })
      );
      
      console.log(`[STATS USERS] Summaries for ${userSummaries.length} users generated`);
      
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
      res.json(userSummaries);
    } catch (error) {
      console.error("[STATS USERS] Error:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des résumés utilisateurs" });
    }
  });

  // Route pour récupérer les transactions validées
  app.get("/api/transactions/validated", requireAuth, requireAdmin, async (req, res) => {
    try {
      console.log('[VALIDATED] Direct database query...');
      
      const validatedTransactionsResult = await db.execute(`
        SELECT t.*, u.first_name, u.last_name, c.name as client_name
        FROM transactions t
        LEFT JOIN users u ON t.user_id = u.id
        LEFT JOIN clients c ON t.client_id = c.id
        WHERE t.status = 'validated'
        AND (t.is_deleted IS NULL OR t.is_deleted = false)
        ORDER BY t.created_at DESC
      `);
      
      const validatedTransactions = validatedTransactionsResult.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        clientId: row.client_id,
        phoneNumber: row.phone_number,
        amountFCFA: row.amount_fcfa,
        amountGNF: row.amount_gnf,
        amountToPay: row.amount_to_pay,
        feeAmount: row.fee_amount,
        feePercentage: row.fee_percentage,
        status: row.status,
        cancellationRequested: row.cancellation_requested || false,
        cancellationRequestedAt: row.cancellation_requested_at,
        cancellationReason: row.cancellation_reason,
        proof: row.proof,
        proofType: row.proof_type,
        proofImages: row.proof_images,
        proofCount: row.proof_count,
        externalProofUrl: row.external_proof_url,
        isArchived: row.is_archived,
        isProofShared: row.is_proof_shared,
        isDeleted: row.is_deleted,
        deletedAt: row.deleted_at,
        deletedBy: row.deleted_by,
        exchangeRate: row.exchange_rate,
        createdAt: row.created_at,
        userName: `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Utilisateur inconnu',
        clientName: row.client_name || 'Client occasionnel'
      }));
      
      console.log('[VALIDATED] Found', validatedTransactions.length, 'validated transactions');
      
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
      res.json(validatedTransactions);
    } catch (error) {
      console.error("[VALIDATED TRANSACTIONS] Error:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des transactions validées" });
    }
  });

  // Route pour récupérer le numéro de transaction d'un utilisateur pour un jour donné
  app.get("/api/transactions/user-number/:userId/:date", requireAuth, async (req: Request, res) => {
    try {
      const { userId, date } = req.params;
      
      // Convertir la date en début et fin de journée
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);
      
      // Récupérer toutes les transactions de l'utilisateur pour ce jour depuis la base de données
      const userTransactions = await db.select().from(transactionsTable)
        .where(
          sql`${transactionsTable.userId} = ${userId} AND ${transactionsTable.createdAt} >= ${startOfDay.toISOString()} AND ${transactionsTable.createdAt} < ${endOfDay.toISOString()}`
        )
        .orderBy(transactionsTable.createdAt);
      
      // Créer un mapping transaction -> numéro
      const numberMap: { [key: string]: number } = {};
      userTransactions.forEach((transaction, index) => {
        numberMap[transaction.createdAt.toISOString()] = index + 1;
      });
      
      console.log(`[USER NUMBER] Found ${userTransactions.length} transactions for user ${userId} on ${date}`);
      res.json({ numberMap, totalCount: userTransactions.length });
    } catch (error) {
      console.error("[USER NUMBER] Error:", error);
      res.status(500).json({ error: "Erreur lors de la récupération du numéro de transaction" });
    }
  });

  // Route ultra-optimisée pour toutes les transactions - INSTANTANÉ pour admin
  app.get("/api/transactions", requireAuth, async (req, res) => {
    try {
      const start = Date.now();
      
      // Pagination parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50; // Default 50 per page
      const offset = (page - 1) * limit;
      
      if (req.user!.role === 'admin') {
        // Admin: forcer refresh du cache pour récupérer les dernières transactions
        invalidateAdminCache();
        await preloadAdminCache();
        const allResult = adminCache.allTransactions || [];
        
        // Apply pagination to cached results
        const total = allResult.length;
        const result = allResult.slice(offset, offset + limit);
        
        const responseTime = Date.now() - start;
        console.log(`[ADMIN ALL] Page ${page}/${Math.ceil(total/limit)} - ${result.length}/${total} transactions loaded in ${responseTime}ms`);
        
        res.set({
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Admin-Cache': 'preloaded',
          'X-Response-Time': `${responseTime}ms`,
          'X-Total-Count': total.toString(),
          'X-Page': page.toString(),
          'X-Per-Page': limit.toString()
        });
        
        return res.json({
          transactions: result,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: offset + limit < total,
            hasPrev: page > 1
          }
        });
      } else {
        // Utilisateur normal: requête standard avec pagination côté client - CORRECTION BUG CLIENTNAME
        console.log(`🔧 [CLIENT NAME DEBUG] Fixing client name display for user ${req.user!.id}`);
        
        // Récupération directe depuis PostgreSQL pour garantir les données à jour
        // NOUVEAU : Exclure les transactions avec demande d'annulation pour qu'elles n'apparaissent plus côté utilisateur
        const allTransactions = await db.select().from(transactionsTable)
          .where(
            sql`${transactionsTable.userId} = ${req.user!.id} AND (${transactionsTable.cancellationRequested} IS NULL OR ${transactionsTable.cancellationRequested} = false)`
          )
          .orderBy(desc(transactionsTable.createdAt));
        console.log(`🔧 [CLIENT NAME DEBUG] Found ${allTransactions.length} transactions from database`);
        
        const [allUsers, allClients] = await Promise.all([
          db.select().from(users),
          db.select().from(clients).where(eq(clients.userId, req.user!.id))
        ]);
        console.log(`🔧 [CLIENT NAME DEBUG] Found ${allClients.length} clients for user ${req.user!.id}:`, allClients.map(c => ({ id: c.id, name: c.name })));
        
        const userMap = new Map(allUsers.map(u => [u.id, `${u.firstName} ${u.lastName}`]));
        const clientMap = new Map(allClients.map(c => [c.id, c.name]));
        
        const populatedTransactions = allTransactions.map((t: any) => {
          const clientName = t.clientId ? (clientMap.get(t.clientId) || "Client Occasionnel") : "Client Occasionnel";
          console.log(`🔧 [CLIENT NAME DEBUG] Transaction ${t.id}: clientId=${t.clientId}, resolved clientName="${clientName}"`);
          
          return {
            ...t,
            userName: userMap.get(t.userId) || "Unknown",
            clientName: clientName
          };
        });
        
        // Apply pagination to results
        const total = populatedTransactions.length;
        const paginatedTransactions = populatedTransactions.slice(offset, offset + limit);
        
        const responseTime = Date.now() - start;
        console.log(`[USER] Page ${page}/${Math.ceil(total/limit)} - ${paginatedTransactions.length}/${total} transactions loaded in ${responseTime}ms`);
        
        res.json({
          transactions: paginatedTransactions,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: offset + limit < total,
            hasPrev: page > 1
          }
        });
      }
    } catch (error) {
      console.error("Error in /api/transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", requireAuth, async (req, res) => {
  try {
    // 1️⃣ Validation des champs
    const clientSchema = z.object({
      clientId: z.union([z.string(), z.number(), z.null()]).optional().transform(val => {
        if (val === null || val === undefined || val === "") return null;
        return typeof val === 'string' ? parseInt(val) : val;
      }),
      phoneNumber: z.string(),
      amountFCFA: z.string()
    });

    const body = clientSchema.parse(req.body);

    // 2️⃣ Récupérer l'utilisateur
    const user = await storage.getUser(req.user!.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const userWallet = parseFloat(user.walletGNF || "0");

    // 3️⃣ Vérifier dette personnelle
    const debtThreshold = parseFloat(user.walletGNF || "100000.00");
    const currentDebt = parseFloat((await storage.getUserDebt(req.user!.id)).toString());

    if (currentDebt >= debtThreshold) {

      return res.status(403).json({
        message: `Envoi refusé. Votre dette (${currentDebt.toFixed(2)} FCFA) dépasse votre seuil autorisé (${debtThreshold.toFixed(2)} FCFA).`,
        debtInfo: { currentDebt: currentDebt.toFixed(2), debtThreshold: debtThreshold.toFixed(2), blocked: true }
      });
    }

    // 4️⃣ Paramètres système et conversion
    const settings = await storage.getSystemSettings();
    const exchangeRate = parseFloat(settings.exchangeRate);
    const amountFCFA = parseFloat(body.amountFCFA);
    const amountGNF = amountFCFA * exchangeRate;

    // 5️⃣ Vérifier solde utilisateur
    if (amountGNF > userWallet) {
      return res.status(400).json({ 
        message: "Solde utilisateur insuffisant",
        currentBalance: userWallet,
        attemptedDebit: amountGNF
      });
    }

    // 6️⃣ Frais personnalisés
    const userFeePercentage = parseFloat(user.personalFeePercentage || "10.00");
    const feeAmount = amountFCFA * (userFeePercentage / 100);
    const totalToPay = amountFCFA + feeAmount;

    // 7️⃣ Créer la transaction
    const [transaction] = await db.insert(transactionsTable).values({
      userId: req.user!.id,
      clientId: body.clientId,
      phoneNumber: body.phoneNumber,
      amountFCFA: amountFCFA.toString(),
      amountGNF: amountGNF.toFixed(2),
      amountToPay: totalToPay.toFixed(2),
      feeAmount: feeAmount.toString(),
      feePercentage: userFeePercentage.toString(),
      status: "pending",
      exchangeRate: settings.exchangeRate
    }).returning();

    // 8️⃣ Déduire le solde utilisateur
    const newUserWallet = userWallet - amountGNF;
    await storage.updateUser(req.user!.id, { walletGNF: newUserWallet.toString() });

    // 9️⃣ Déduire le solde admin si ce n'est pas DEPOT BAMAKO
    let isDepotBamako = false;
    if (body.clientId) {
      const client = await storage.getClient(body.clientId);
      isDepotBamako = client?.name === "DEPOT BAMAKO";
    }

    if (!isDepotBamako) {
      const newAdminBalance = parseFloat(settings.mainBalanceGNF) - amountGNF;
      await storage.updateSystemSettings({ mainBalanceGNF: newAdminBalance.toString(), idUser: req.user!.id });
    }

    //  🔟 Enregistrer la transaction dans l’historique wallet
   /* await storage.createWalletTransaction({
      userId: req.user!.id,
      adminId: null,
      type: "DEBIT",
      amountFCFA,
      amountGNF,
      exchangeRate,
      previousBalance: userWallet,
      newBalance: newUserWallet,
      reason: 'Transaction envoyée',
      createdAt: new Date()
    });
*/
    // 1️⃣1️⃣ Notifications admins
    const userName = `${user.firstName} ${user.lastName}`;
    sendNotification('admin', null, {
      type: 'TRANSACTION_CREATED',
      message: `${userName} a soumis une transaction de ${amountFCFA} FCFA`,
      transaction,
      userId: req.user!.id
    });

    invalidateCache('/api/transactions');
    invalidateAdminCache();

    res.json({ 
      transaction,
      userWalletBefore: userWallet,
      userWalletAfter: newUserWallet,
      amountGNF,
      totalToPay,
      feeAmount
    });

  } catch (error) {
    console.error("🚨 [TRANSACTION ERROR]", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Données invalides", errors: error.errors });
    }
    res.status(500).json({ message: "Erreur lors de la transaction", error: error instanceof Error ? error.message : "Inconnue" });
  }
});


  app.patch("/api/transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      console.log(`📸 [PROOF SUBMISSION] Transaction ${id} - Request body keys:`, Object.keys(updateData));
      console.log(`📸 [PROOF SUBMISSION] Transaction ${id} - Update data:`, {
        hasLegacyProof: !!updateData.proof,
        hasMultipleProofs: !!updateData.proofImages,
        proofCount: updateData.proofCount,
        proofType: updateData.proofType,
        status: updateData.status,
        bodySize: JSON.stringify(updateData).length
      });
      
      // Improved validation for multiple proofs system
      if (updateData.proofImages && updateData.proofCount) {
        console.log(`📸 [PROOF SUBMISSION] Processing ${updateData.proofCount} multiple images`);
        
        try {
          const proofImagesArray = JSON.parse(updateData.proofImages);
          
          if (!Array.isArray(proofImagesArray)) {
            console.error(`📸 [PROOF ERROR] proofImages is not an array:`, typeof proofImagesArray);
            return res.status(400).json({ 
              message: "Format des preuves invalide - tableau attendu",
              details: `Type reçu: ${typeof proofImagesArray}` 
            });
          }
          
          if (proofImagesArray.length !== updateData.proofCount) {
            console.error(`📸 [PROOF ERROR] Array length mismatch:`, {
              arrayLength: proofImagesArray.length,
              expectedCount: updateData.proofCount
            });
            return res.status(400).json({ 
              message: "Nombre d'images incohérent",
              details: `Reçu: ${proofImagesArray.length}, attendu: ${updateData.proofCount}` 
            });
          }
          
          // Enhanced image validation
          for (let i = 0; i < proofImagesArray.length; i++) {
            const imageData = proofImagesArray[i];
            
            if (typeof imageData !== 'string') {
              console.error(`📸 [PROOF ERROR] Image ${i + 1} is not a string:`, typeof imageData);
              return res.status(400).json({ 
                message: `Image ${i + 1} format invalide - chaîne base64 attendue`,
                details: `Type reçu: ${typeof imageData}`
              });
            }
            
            if (!imageData.startsWith('data:image/')) {
              console.error(`📸 [PROOF ERROR] Image ${i + 1} invalid base64 format:`, imageData.substring(0, 50));
              return res.status(400).json({ 
                message: `Image ${i + 1} format invalide - doit commencer par 'data:image/'`
              });
            }
            
            const imageSize = Math.round(imageData.length / 1024);
            console.log(`📸 [PROOF SUBMISSION] Image ${i + 1} size: ${imageSize}KB`);
            
            if (imageData.length > 5000000) { // Increased limit to 5MB
              console.error(`📸 [PROOF ERROR] Image ${i + 1} too large: ${imageSize}KB`);
              return res.status(400).json({ 
                message: `Image ${i + 1} trop volumineuse: ${imageSize}KB (max 5MB)`
              });
            }
          }
          
          console.log(`📸 [PROOF SUBMISSION] ✅ ${proofImagesArray.length} images validated successfully`);
        } catch (jsonError) {
          console.error(`📸 [PROOF ERROR] JSON parsing failed:`, jsonError);
          return res.status(400).json({ 
            message: "Format JSON des preuves invalide",
            details: jsonError instanceof Error ? jsonError.message : "Erreur de parsing JSON"
          });
        }
      }
      
      // Enhanced legacy proof validation
      if (updateData.proof && updateData.proofType === "image") {
        const proofSizeKB = Math.round(updateData.proof.length / 1024);
        console.log(`📸 [PROOF SUBMISSION] Legacy image size: ${proofSizeKB}KB`);
        
        if (!updateData.proof.startsWith('data:image/')) {
          console.error(`📸 [PROOF ERROR] Legacy image invalid format:`, updateData.proof.substring(0, 50));
          return res.status(400).json({ 
            message: "Format d'image invalide - doit commencer par 'data:image/'"
          });
        }
        
        if (updateData.proof.length > 5000000) { // Increased limit to 5MB
          console.error(`📸 [PROOF ERROR] Legacy image too large: ${proofSizeKB}KB`);
          return res.status(400).json({ 
            message: `Image trop volumineuse: ${proofSizeKB}KB (max 5MB)`
          });
        }
      }
      
      console.log(`📸 [PROOF SUBMISSION] ✅ All validations passed, updating transaction ${id}`);
      
      const transaction = await storage.updateTransaction(id, updateData);
      if (!transaction) {
        console.error(`📸 [PROOF ERROR] Transaction ${id} not found in storage`);
        return res.status(404).json({ message: "Transaction non trouvée" });
      }
      
      console.log(`👁️ [UPDATE] Transaction ${id} updated successfully - New status:`, transaction.status);
      
      // Désactiver le cache pour les mises à jour
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');

      // Invalider le cache admin pour mise à jour instantanée
      invalidateAdminCache();
      
      // Notifications WebSocket temps réel selon le type de changement
      console.log(`🔔 [NOTIFICATION CHECK] updateData.status = "${updateData.status}" - Checking notification routing...`);
      
      if (updateData.status === 'seen') {
        // CORRECTION CRITIQUE : Notifier l'utilisateur que sa transaction a été vue par l'admin
        console.log(`👁️ [MARK SEEN] Transaction ${id} marked as seen by admin - NOTIFYING USER FOR REAL-TIME UPDATE`);
        
        sendNotification('user', transaction.userId, {
          type: 'TRANSACTION_STATUS_CHANGE',
          message: `Votre transaction a été vue par l'admin`,
          transaction: transaction,
          newStatus: 'seen'
        });
        
        // Également invalider le cache utilisateur pour forcer la mise à jour
        sendNotification('user', transaction.userId, {
          type: 'REFRESH_USER_DATA',
          event: 'transaction-status-updated',
          transactionId: id,
          action: 'status-changed-to-seen'
        });
        
      } else if (updateData.status !== 'seen') {
        console.log(`🔔 [NOTIFICATION SENT] Sending WebSocket notification for status "${updateData.status}"`);
        sendNotification('admin', null, {
          type: 'TRANSACTION_UPDATED',
          message: `Transaction ${id} mise à jour`,
          transaction: transaction
        });
      }

      // Rafraîchir les statistiques admin si la transaction affecte la dette
      if (updateData.status === 'validated' || updateData.status === 'cancelled') {
        sendNotification('admin', null, {
          type: 'REFRESH_STATS',
          event: 'stats-update',
          action: 'transaction-updated'
        });
      }

      // Si transaction validée, notifier utilisateur ET admin instantanément
      if (updateData.status === 'validated') {
        sendNotification('user', transaction.userId, {
          type: 'TRANSACTION_VALIDATED',
          message: 'Votre transaction a été validée',
          transaction: transaction
        });
        
        sendNotification('admin', null, {
          type: 'TRANSACTION_VALIDATED',
          message: `Transaction ${id} validée`,
          transaction: transaction
        });

        // Déclencher événement côté client pour refresh immédiat onglet VALIDÉES
        sendNotification('admin', null, {
          type: 'REFRESH_VALIDATED',
          event: 'transaction-validated',
          transaction: transaction
        });

        // NOUVEAU: Force mise à jour immédiate du badge compteur
        sendNotification('admin', null, {
          type: 'BADGE_COUNT_UPDATE',
          event: 'badge-count-force-update',
          action: 'transaction-validated'
        });
      }

      // Si preuve ajoutée (legacy ou multiples), notifier admin instantanément
      if (updateData.proof || updateData.proofImages) {
        const proofMessage = updateData.proofImages 
          ? `${updateData.proofCount} nouvelles preuves soumises pour transaction ${id}`
          : `Nouvelle preuve soumise pour transaction ${id}`;
          
        sendNotification('admin', null, {
          type: 'PROOF_SUBMITTED',
          message: proofMessage,
          transaction: transaction
        });

        // Send push notification for proof submission
        const user = await storage.getUser(transaction.userId);
        if (user) {
          await sendPushNotificationToAdmins(
            `${user.firstName} ${user.lastName} a soumis une preuve`,
            {
              type: 'PROOF_SUBMITTED',
              transactionId: id,
              userId: transaction.userId,
              userName: `${user.firstName} ${user.lastName}`,
              phoneNumber: transaction.phoneNumber,
              amountFCFA: transaction.amountFCFA
            }
          );
        }
      }
      
      console.log(`📸 [PROOF SUBMISSION] ✅ Transaction ${id} updated successfully`);
      res.json(transaction);
    } catch (error) {
      const transactionId = parseInt(req.params.id);
      console.error(`📸 [PROOF ERROR] Failed to update transaction ${transactionId}:`, error);
      console.error(`📸 [PROOF ERROR] Error stack:`, error instanceof Error ? error.stack : 'No stack');
      
      // Detailed error response for debugging
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      const errorDetails = error instanceof Error ? error.stack : JSON.stringify(error);
      
      res.status(500).json({ 
        message: "Échec de soumission des preuves",
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString()
      });
    }
  });

  // NOUVELLE API : Système de suppression à 3 niveaux selon les spécifications utilisateur
  app.delete("/api/transactions/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = req.user!;
      
      // Récupérer la transaction avant suppression
      const transactionToDelete = await storage.getTransaction(id);
      if (!transactionToDelete) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      // Vérifier si la transaction est déjà supprimée (soft delete)
      if (transactionToDelete.isDeleted) {
        // Transaction déjà supprimée - admin peut faire une suppression définitive
        if (user.role !== 'admin') {
          return res.status(403).json({ message: "Only admin can permanently delete transactions" });
        }
        
        // SUPPRESSION DÉFINITIVE par l'admin
        const transaction = await storage.deleteTransactionPermanently(id);
        if (!transaction) {
          return res.status(404).json({ message: "Transaction not found" });
        }
        
        console.log(`[PERMANENT DELETE] Admin permanently deleted transaction ${id}`);
        
        // Notifier via WebSocket
        sendNotification('admin', null, {
          type: 'TRANSACTION_DELETED',
          message: `Transaction ${id} supprimée définitivement`,
          transactionId: id
        });
        
        // Invalider le cache admin
        invalidateAdminCache();
        
        return res.json({ message: "Transaction permanently deleted", transaction });
      }

      // LOGIQUE À 3 NIVEAUX SELON SPÉCIFICATIONS UTILISATEUR
      
      if (user.role === 'admin') {
        // CAS 3: Admin peut supprimer n'importe quelle transaction directement
        return await handleAdminDirectDeletion(id, transactionToDelete, user, res);
      }
      
      if (user.role === 'user') {
        // Vérifier si l'utilisateur est propriétaire de la transaction
        if (transactionToDelete.userId !== user.id) {
          return res.status(403).json({ message: "You can only delete your own transactions" });
        }
        
        if (transactionToDelete.status === 'pending') {
          // CAS 1: Transaction non-vue par admin → Suppression directe par utilisateur
          console.log(`[USER DELETE] User ${user.id} deleting pending transaction ${id} - not seen by admin yet`);
          return await handleUserDirectDeletion(id, transactionToDelete, user, res);
        } else {
          // CAS 2: Transaction vue par admin → Demande d'annulation (va dans onglet "Annulées")
          console.log(`[USER REQUEST] User ${user.id} requesting cancellation for transaction ${id} - already seen by admin`);
          return await handleUserCancellationRequest(id, transactionToDelete, user, res);
        }
      }
      
      return res.status(403).json({ message: "Unauthorized" });
      
    } catch (error) {
      console.error("Delete transaction error:", error);
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // FONCTION AUXILIAIRE: CAS 1 - Suppression directe par utilisateur (transaction non-vue)
  async function handleUserDirectDeletion(id: number, transactionToDelete: any, user: any, res: Response) {
    // Marquer la transaction comme supprimée (soft delete)
    const transaction = await storage.deleteTransaction(id, user.id);
    
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Check if this is a DEPOT BAMAKO transaction (special handling)
    let isDepotBamako = false;
    if (transactionToDelete.clientId) {
      const client = await storage.getClient(transactionToDelete.clientId);
      isDepotBamako = client?.name === "DEPOT BAMAKO";
    }
    
    // Restaurer le solde admin (seulement si pas DEPOT BAMAKO et transaction pending)
    const settings = await storage.getSystemSettings();
    let newBalance = parseFloat(settings.mainBalanceGNF);
    
    if (!isDepotBamako) {
      const amountToRestoreFCFA = parseFloat(transactionToDelete.amountFCFA);
      const exchangeRate = parseFloat(settings.exchangeRate);
      const amountToRestore = amountToRestoreFCFA * exchangeRate;
      newBalance = newBalance + amountToRestore;
      
      await storage.updateSystemSettings({
        mainBalanceGNF: newBalance.toString()
      });
      
      console.log(`[USER DELETE] Transaction ${id} supprimée par utilisateur, restauré ${amountToRestoreFCFA} FCFA (${amountToRestore} GNF). Nouveau solde: ${newBalance}`);
    } else {
      console.log(`🏦 [USER DELETE] DEPOT BAMAKO - Transaction ${id} supprimée, solde admin NON restauré`);
    }

    // Notifier via WebSocket
    sendNotification('admin', null, {
      type: 'TRANSACTION_DELETED',
      message: `Transaction ${id} supprimée par utilisateur`,
      transactionId: id,
      action: 'user-direct-delete'
    });

    // Invalider les caches
    invalidateAdminCache();
    invalidateUserCache(user.id);

    return res.json({ 
      message: "Transaction deleted successfully", 
      transaction,
      balanceRestored: !isDepotBamako,
      newBalance: newBalance 
    });
  }

  // FONCTION AUXILIAIRE: CAS 2 - Demande d'annulation par utilisateur (transaction vue)
  async function handleUserCancellationRequest(id: number, transactionToDelete: any, user: any, res: Response) {
    // Marquer la transaction avec demande d'annulation (va dans onglet "Annulées" admin)
    const transaction = await db.update(transactionsTable)
      .set({
        cancellationRequested: true,
        cancellationRequestedAt: new Date(),
        cancellationReason: `Demande d'annulation par utilisateur ${user.firstName} ${user.lastName}`
      })
      .where(eq(transactionsTable.id, id))
      .returning()
      .then(rows => rows[0]);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    console.log(`[CANCELLATION REQUEST] User ${user.id} requested cancellation for transaction ${id}`);

    // Notifier l'admin via WebSocket
    sendNotification('admin', null, {
      type: 'CANCELLATION_REQUESTED',
      message: `${user.firstName} ${user.lastName} demande l'annulation de la transaction ${id}`,
      transactionId: id,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      amountFCFA: transactionToDelete.amountFCFA,
      action: 'user-cancellation-request'
    });

    // Invalider les caches
    invalidateAdminCache();
    invalidateUserCache(user.id);

    return res.json({ 
      message: "Cancellation request sent to admin", 
      transaction,
      note: "La transaction apparaîtra dans l'onglet 'Annulées' de l'admin pour traitement"
    });
  }

  // FONCTION AUXILIAIRE: CAS 3 - Suppression directe par admin (toutes transactions)
  async function handleAdminDirectDeletion(id: number, transactionToDelete: any, user: any, res: Response) {
    // Admin peut supprimer n'importe quelle transaction directement
    const transaction = await storage.deleteTransaction(id, user.id);
    
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Check if this is a DEPOT BAMAKO transaction (special handling)
    let isDepotBamako = false;
    if (transactionToDelete.clientId) {
      const client = await storage.getClient(transactionToDelete.clientId);
      isDepotBamako = client?.name === "DEPOT BAMAKO";
    }
    
    // Restaurer le solde admin selon les règles métier
    const settings = await storage.getSystemSettings();
    let newBalance = parseFloat(settings.mainBalanceGNF);
    let balanceRestored = false;
    
    if (!isDepotBamako && ['pending', 'seen'].includes(transactionToDelete.status)) {
      const amountToRestoreFCFA = parseFloat(transactionToDelete.amountFCFA);
      const exchangeRate = parseFloat(settings.exchangeRate);
      const amountToRestore = amountToRestoreFCFA * exchangeRate;
      newBalance = newBalance + amountToRestore;
      balanceRestored = true;
      
      await storage.updateSystemSettings({
        mainBalanceGNF: newBalance.toString()
      });
      
      console.log(`[ADMIN DELETE] Transaction ${id} supprimée par admin, restauré ${amountToRestoreFCFA} FCFA (${amountToRestore} GNF). Nouveau solde: ${newBalance}`);
    } else if (isDepotBamako) {
      console.log(`🏦 [ADMIN DELETE] DEPOT BAMAKO - Transaction ${id} supprimée, solde admin NON restauré`);
    } else {
      console.log(`[ADMIN DELETE] Transaction ${id} (${transactionToDelete.status}) supprimée par admin, aucune restauration de solde`);
    }

    // Notifier via WebSocket
    sendNotification('admin', null, {
      type: 'TRANSACTION_DELETED',
      message: `Transaction ${id} supprimée par admin`,
      transactionId: id,
      action: 'admin-direct-delete'
    });

    // Invalider les caches
    invalidateAdminCache();
    if (transactionToDelete.userId) {
      invalidateUserCache(transactionToDelete.userId);
    }

    return res.json({ 
      message: "Transaction deleted successfully by admin", 
      transaction,
      balanceRestored,
      newBalance: newBalance 
    });
  }

  // ROUTE SUPPRIMÉE : Plus de demandes d'annulation dans le nouveau système

  // Fonction auxiliaire pour invalider le cache utilisateur spécifique
  function invalidateUserCache(userId: number) {
    // Invalider tous les caches liés aux données utilisateur
    invalidateCache(`/api/user/transactions/${userId}`);
    invalidateCache(`/api/user/stats/${userId}`);
    invalidateCache(`/api/stats/daily-user/${userId}`);
    invalidateCache('/api/user/can-send');
    console.log(`🗑️ [CACHE] User cache invalidated for user ${userId}`);
  }

  // ROUTE SUPPRIMÉE : Plus d'onglet "Annulées" dans le nouveau système

  // API route for system settings (was missing!)
  app.get("/api/system/settings", async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching system settings:", error);
      res.status(500).json({ message: "Failed to fetch system settings" });
    }
  });

  // API route for updating system settings
  app.patch("/api/system/settings", requireAuth, requireAdmin, async (req, res) => {
    try {
      const updatedSettings = await storage.updateSystemSettings(req.body);
      
      // Invalidate cache after update
      invalidateCache('/api/system/settings');
      
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating system settings:", error);
      res.status(500).json({ message: "Failed to update system settings" });
    }
  });

  // API route for user reports (was missing!)
  app.get("/api/reports/user/:userId", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Verify user can access this data (admin or own data)
      if (req.user!.role !== 'admin' && req.user!.id !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get user transactions grouped by date - use storage method instead
      const userTransactions = await storage.getTransactionsByUserId(userId);
      
      // Filter out deleted and cancelled transactions
      const filteredTransactions = userTransactions.filter(t => 
        !t.isDeleted && !t.cancellationRequested
      );

      // Group transactions by date and calculate daily reports
      const dailyGroups: Record<string, any[]> = {};
      
      filteredTransactions.forEach(transaction => {
        const date = transaction.createdAt.toISOString().split('T')[0];
        if (!dailyGroups[date]) {
          dailyGroups[date] = [];
        }
        dailyGroups[date].push(transaction);
      });

      // Get all payments for this user to calculate proper daily payment amounts
      const userPayments = await storage.getPaymentsByUserId(userId);
      const paymentsByDate: Record<string, number> = {};
      
      // Group payments by date
      userPayments.forEach(payment => {
        const date = payment.createdAt.toISOString().split('T')[0];
        if (!paymentsByDate[date]) {
          paymentsByDate[date] = 0;
        }
        paymentsByDate[date] += parseFloat(payment.amount);
      });

      // Calculate real current debt (matching global stats using ONLY non-deleted transactions)
      const activeTransactions = userTransactions.filter(t => !t.isDeleted);
      const totalTransactionDebt = activeTransactions.reduce((sum, t) => sum + parseFloat(t.amountToPay), 0);
      const totalPayments = userPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const realCurrentDebt = totalTransactionDebt - totalPayments;
      
      console.log(`[DEBT DEBUG] User ${userId} - Active transactions: ${activeTransactions.length}/${userTransactions.length}, Total debt: ${totalTransactionDebt}, Payments: ${totalPayments}, Real debt: ${realCurrentDebt}`);

      // Calculate daily reports with fixed debt calculation 
      const sortedDates = Object.keys(dailyGroups).sort((a, b) => a.localeCompare(b)); // Oldest first
      
      const dailyReports = sortedDates.map((date) => {
        const dayTransactions = dailyGroups[date];
        
        // Calculate totals for the day
        const totalSent = dayTransactions.reduce((sum, t) => sum + parseFloat(t.amountFCFA), 0);
        const totalFees = dayTransactions.reduce((sum, t) => sum + (parseFloat(t.feeAmount) || 0), 0);
        const totalPaid = paymentsByDate[date] || 0;
        
        // Calculate cumulative debt and payments up to this date (CORRECT METHOD)
        const transactionsUpToDate = userTransactions.filter(t => {
          const transactionDate = new Date(t.createdAt).toISOString().split('T')[0];
          return transactionDate <= date;
        });
        const paymentsUpToDate = userPayments.filter(p => {
          const paymentDate = new Date(p.createdAt).toISOString().split('T')[0];
          return paymentDate <= date;
        });
        
        const cumulativeTransactionDebt = transactionsUpToDate.reduce((sum, t) => sum + parseFloat(t.amountToPay), 0);
        const cumulativePayments = paymentsUpToDate.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        let remainingDebt = cumulativeTransactionDebt - cumulativePayments;
        
        // CRITICAL FIX: For the most recent date, ensure consistency with global debt calculations
        if (date === sortedDates[sortedDates.length - 1]) {
          remainingDebt = realCurrentDebt; // Force consistency between daily reports and global statistics
        }
        
        // Previous debt = remaining debt minus today's new debt plus today's payments
        const dayDebt = totalSent + totalFees;
        const previousDebt = remainingDebt - dayDebt + totalPaid;
        
        return {
          date,
          previousDebt: Math.round(previousDebt),
          totalSent: Math.round(totalSent),
          totalFees: Math.round(totalFees),
          totalPaid: Math.round(totalPaid),
          remainingDebt: Math.round(remainingDebt)
        };
      });
      
      // Sort by date descending (most recent first) for response
      dailyReports.sort((a, b) => b.date.localeCompare(a.date));
      
      res.json(dailyReports.slice(0, 30)); // Last 30 days
    } catch (error) {
      console.error("Error fetching user reports:", error);
      res.status(500).json({ message: "Failed to fetch user reports" });
    }
  });

  // API route for payment validation (NOUVEAU - CORRECTION CRITIQUE)
  app.post("/api/payments", requireAuth, requireAdmin, async (req, res) => {
    try {
      console.log('[PAYMENT VALIDATION] Request received:', req.body);
      
      // Validation des données reçues
      const paymentSchema = z.object({
        userId: z.number(),
        amount: z.string().min(1, "Montant requis").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Montant invalide"),
        validatedBy: z.number()
      });

      const validatedData = paymentSchema.parse(req.body);
      
      // Vérifier que l'utilisateur existe
      const user = await storage.getUser(validatedData.userId);
      if (!user) {
        console.log('[PAYMENT VALIDATION] User not found:', validatedData.userId);
        return res.status(404).json({ message: "Utilisateur introuvable" });
      }

      // Créer le paiement
      const payment = await storage.createPayment({
        userId: validatedData.userId,
        amount: validatedData.amount,
        validatedBy: validatedData.validatedBy
      });

      console.log('[PAYMENT VALIDATION] Payment created successfully:', payment.id);

      // Invalider les caches pour actualisation immédiate
      invalidateCache('/api/stats/users');
      invalidateCache('/api/stats/daily');
      invalidateCache('/api/transactions');
      
      // Notifier via WebSocket pour mise à jour temps réel
      sendNotification('admin', null, {
        type: 'PAYMENT_VALIDATED',
        message: `Paiement de ${validatedData.amount} FCFA validé pour ${user.firstName} ${user.lastName}`,
        payment: payment,
        userId: validatedData.userId
      });

      sendNotification('user', validatedData.userId, {
        type: 'PAYMENT_RECEIVED',
        message: `Votre paiement de ${validatedData.amount} FCFA a été validé`,
        payment: payment
      });

      res.json({ 
        message: "Paiement validé avec succès", 
        payment: payment 
      });

    } catch (error) {
      console.error('[PAYMENT VALIDATION] Error:', error);
      
      if (error instanceof z.ZodError) {
        console.error('[PAYMENT VALIDATION] Validation errors:', error.errors);
        return res.status(400).json({ 
          message: "Données de paiement invalides", 
          errors: error.errors 
        });
      }
      
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      console.error('[PAYMENT VALIDATION] Final error message:', errorMessage);
      
      res.status(500).json({ 
        message: "Impossible de valider le paiement", 
        error: errorMessage 
      });
    }
  });

  // API route for getting payments (GET) - NOUVEAU - ROUTE MANQUANTE CRITIQUE
  app.get("/api/payments", requireAuth, requireAdmin, async (req, res) => {
    try {
      console.log('[PAYMENTS GET] Fetching all payments for admin');
      
      // Récupérer tous les paiements depuis la base de données
      const allPayments = await storage.getAllPayments();
      
      console.log('[PAYMENTS GET] Found', allPayments.length, 'payments');
      
      // Ajouter les informations utilisateur pour chaque paiement
      const paymentsWithUserInfo = await Promise.all(
        allPayments.map(async (payment) => {
          const user = await storage.getUser(payment.userId);
          return {
            ...payment,
            userName: user ? `${user.firstName} ${user.lastName}` : 'Utilisateur inconnu',
            userUsername: user?.username || 'N/A'
          };
        })
      );
      
      // Trier par date décroissante (plus récents d'abord)
      paymentsWithUserInfo.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      res.json(paymentsWithUserInfo);
      
    } catch (error) {
      console.error('[PAYMENTS GET] Error fetching payments:', error);
      res.status(500).json({ 
        message: "Erreur lors de la récupération des paiements" 
      });
    }
  });

  // API routes for balance management - NOUVEAU - ROUTES MANQUANTES CRITIQUES
app.post("/api/balance/add", requireAuth, requireAdmin, async (req, res) => {
  try {
    console.log('💰 [BALANCE ADD] Request received:', req.body);

    // Validation des données reçues
    const balanceSchema = z.object({
      userId: z.number().min(1, "Utilisateur requis"),
      amountFCFA: z.number().min(1, "Montant doit être supérieur à 0")
    });

    const { userId, amountFCFA } = balanceSchema.parse(req.body);

    // Vérifier que l'utilisateur existe
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    // Récupérer les paramètres système actuels
    const currentSettings = await storage.getSystemSettings();
    const currentBalanceGNF = parseFloat(currentSettings.mainBalanceGNF);
    const exchangeRate = parseFloat(currentSettings.exchangeRate);

    // Convertir FCFA en GNF
    const amountGNF = amountFCFA * exchangeRate;
    const newBalanceGNF = currentBalanceGNF + amountGNF;

    console.log('💰 [BALANCE ADD] Adding:', amountFCFA, 'FCFA =', amountGNF, 'GNF');

    // Transaction atomique
    await db.transaction(async (tx) => {
      // 1️⃣ Mettre à jour le solde principal
      await storage.updateSystemSettings({ mainBalanceGNF: newBalanceGNF.toString() });

      // 2️⃣ Mettre à jour le wallet de l'utilisateur
      const previousWallet = parseFloat(user.walletGNF || "0");
      const newWallet = previousWallet + amountGNF;

      await storage.updateUser(userId, { walletGNF: newWallet.toString() });
    });

    // Invalider le cache pour forcer le rafraîchissement
    invalidateCache('/api/system/settings');

    // Notifier via WebSocket pour mise à jour temps réel
    sendNotification('admin', null, {
      type: 'BALANCE_UPDATED',
      message: `Solde augmenté de ${amountFCFA.toLocaleString('fr-FR')} FCFA pour ${user.firstName} ${user.lastName}`,
      newBalance: newBalanceGNF,
      balanceChange: amountGNF
    });

    res.json({
      message: "Solde utilisateur mis à jour avec succès",
      userId,
      amountFCFA,
      amountGNF,
      newBalanceGNF
    });

  } catch (error) {
    console.error('💰 [BALANCE ADD] Error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Données invalides", errors: error.errors });
    }

    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    res.status(500).json({ message: "Impossible d'ajouter le solde", error: errorMessage });
  }
});





  app.post("/api/balance/subtract", requireAuth, requireAdmin, async (req, res) => {
    try {
      console.log('💰 [BALANCE SUBTRACT] Request received:', req.body);
      
      // Validation des données reçues
      const balanceSchema = z.object({
        amountFCFA: z.number().min(1, "Montant doit être supérieur à 0")
      });

      const validatedData = balanceSchema.parse(req.body);
      
      // Récupérer les paramètres système actuels
      const currentSettings = await storage.getSystemSettings();
      const currentBalanceGNF = parseFloat(currentSettings.mainBalanceGNF);
      const exchangeRate = parseFloat(currentSettings.exchangeRate);
      
      // Convertir FCFA en GNF et soustraire du solde
      const amountToSubtractGNF = validatedData.amountFCFA * exchangeRate;
      const newBalanceGNF = currentBalanceGNF - amountToSubtractGNF;
      
      console.log('💰 [BALANCE SUBTRACT] Current balance:', currentBalanceGNF, 'GNF');
      console.log('💰 [BALANCE SUBTRACT] Subtracting:', validatedData.amountFCFA, 'FCFA =', amountToSubtractGNF, 'GNF');
      console.log('💰 [BALANCE SUBTRACT] New balance:', newBalanceGNF, 'GNF');
      
      // Vérifier que le solde ne devient pas négatif
      if (newBalanceGNF < 0) {
        return res.status(400).json({ 
          message: "Opération refusée : le solde deviendrait négatif",
          currentBalance: currentBalanceGNF,
          requestedSubtraction: amountToSubtractGNF,
          resultingBalance: newBalanceGNF
        });
      }
      
      // Mettre à jour le solde principal
      const updatedSettings = await storage.updateSystemSettings({
        mainBalanceGNF: newBalanceGNF.toString()
      });
      
      // Invalider le cache pour forcer le rafraîchissement
      invalidateCache('/api/system/settings');
      
      // Notifier via WebSocket pour mise à jour temps réel
      sendNotification('admin', null, {
        type: 'BALANCE_UPDATED',
        message: `Solde diminué de ${validatedData.amountFCFA.toLocaleString('fr-FR')} FCFA`,
        newBalance: newBalanceGNF,
        balanceChange: -amountToSubtractGNF
      });

      res.json({ 
        message: "Solde diminué avec succès",
        previousBalance: currentBalanceGNF,
        amountSubtracted: amountToSubtractGNF,
        newBalance: newBalanceGNF,
        settings: updatedSettings
      });

    } catch (error) {
      console.error('💰 [BALANCE SUBTRACT] Error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Données invalides", 
          errors: error.errors 
        });
      }
      
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      res.status(500).json({ 
        message: "Impossible de diminuer le solde", 
        error: errorMessage 
      });
    }
  });

  // DELETE payment route - Route manquante pour annulation paiements
  app.delete("/api/payments/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const paymentId = parseInt(req.params.id);
      console.log('[PAYMENT DELETE] Attempting to delete payment:', paymentId);
      
      if (isNaN(paymentId)) {
        return res.status(400).json({ message: "ID de paiement invalide" });
      }

      // Récupérer le paiement avant de le supprimer pour la notification
      const paymentToDelete = await storage.getPayment?.(paymentId);
      if (!paymentToDelete) {
        return res.status(404).json({ message: "Paiement introuvable" });
      }

      // Supprimer le paiement
      const deletedPayment = await storage.deletePayment(paymentId);
      if (!deletedPayment) {
        return res.status(404).json({ message: "Paiement introuvable" });
      }

      console.log('[PAYMENT DELETE] Payment deleted successfully:', paymentId);

      // Invalider les caches pour actualisation immédiate
      invalidateCache('/api/stats/users');
      invalidateCache('/api/stats/daily');
      invalidateCache('/api/payments');
      
      // Notifier via WebSocket pour mise à jour temps réel
      sendNotification('admin', null, {
        type: 'PAYMENT_DELETED',
        message: `Paiement de ${deletedPayment.amount} FCFA annulé`,
        paymentId: paymentId,
        userId: deletedPayment.userId
      });

      res.json({ 
        message: "Paiement annulé avec succès", 
        payment: deletedPayment 
      });

    } catch (error) {
      console.error('[PAYMENT DELETE] Error:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      res.status(500).json({ 
        message: "Impossible d'annuler le paiement", 
        error: errorMessage 
      });
    }
  });

  // Route pour récupérer l'historique du solde
  app.get("/api/balance/history", requireAuth, requireAdmin, async (req, res) => {
    try {
      console.log('📊 [BALANCE HISTORY] Request received');
      
      const balanceHistory = await storage.getBalanceHistory();
      console.log('📊 [BALANCE HISTORY] Retrieved', balanceHistory.length, 'entries');
      
      res.json(balanceHistory);
    } catch (error) {
      console.error('📊 [BALANCE HISTORY] Error:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      res.status(500).json({ 
        message: "Impossible de récupérer l'historique du solde", 
        error: errorMessage 
      });
    }
  });

  return httpServer;
}
