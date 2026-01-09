import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // admin | manager | user
  
  isActive: boolean("is_active").notNull().default(true),
  personalDebtThresholdFCFA: decimal("personal_debt_threshold_fcfa", { precision: 15, scale: 2 }).default("100000.00"),
  personalFeePercentage: decimal("personal_fee_percentage", { precision: 5, scale: 2 }).default("10.00"),
  walletGNF: decimal("wallet_gnf", { precision: 20, scale: 2 }).default("0.00"), // ✅ solde individuel
  createdAt: timestamp("created_at").notNull().defaultNow(),
});


export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  clientId: integer("client_id").references(() => clients.id),
  phoneNumber: text("phone_number").notNull(),
  amountFCFA: decimal("amount_fcfa", { precision: 15, scale: 2 }).notNull(),
  amountGNF: decimal("amount_gnf", { precision: 15, scale: 2 }).notNull(),
  amountToPay: decimal("amount_to_pay", { precision: 15, scale: 2 }).notNull(),
  feeAmount: decimal("fee_amount", { precision: 15, scale: 2 }).notNull().default("0.00"),
  feePercentage: decimal("fee_percentage", { precision: 5, scale: 2 }).notNull().default("0.00"),
  status: text("status").notNull().default("pending"), // 'pending', 'seen', 'validated', 'cancelled'
  cancellationRequested: boolean("cancellation_requested").default(false), // Demande d'annulation par l'utilisateur
  cancellationRequestedAt: timestamp("cancellation_requested_at"), // Date de la demande d'annulation
  cancellationReason: text("cancellation_reason"), // Raison de la demande d'annulation
  proof: text("proof"), // JSON string for proof data (legacy - single proof)
  proofType: text("proof_type"), // 'image', 'text' (legacy)
  proofImages: text("proof_images"), // JSON array pour plusieurs images (nouveau)
  proofCount: integer("proof_count").default(0), // Nombre de preuves (0 = legacy, 1-3 = nouveau)
  externalProofUrl: text("external_proof_url"), // Google Drive URL for archived proofs
  isArchived: boolean("is_archived").default(false).notNull(),
  isProofShared: boolean("is_proof_shared").default(false).notNull(), // Marque si la preuve a été partagée
  isDeleted: boolean("is_deleted").default(false).notNull(), // Marque si la transaction a été supprimée
  deletedAt: timestamp("deleted_at"), // Date de suppression
  deletedBy: integer("deleted_by").references(() => users.id), // Qui a supprimé la transaction
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 4 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  validatedBy: integer("validated_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 4 }).notNull().default("20.0000"),
  mainBalanceGNF: decimal("main_balance_gnf", { precision: 15, scale: 2 }).notNull().default("0.00"),
  feePercentage: decimal("fee_percentage", { precision: 5, scale: 2 }).notNull().default("0.00"),
  debtThresholdFCFA: decimal("debt_threshold_fcfa", { precision: 15, scale: 2 }).notNull().default("100000.00"), // Seuil de dette en FCFA
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'transaction', 'payment', etc.
  title: text("title").notNull(),
  message: text("message").notNull(),
  targetRole: text("target_role").notNull().default("admin"), // 'admin', 'user'
  targetUserId: integer("target_user_id"), // null pour tous les admins
  relatedId: integer("related_id"), // ID de la transaction/payment concernée
  isRead: boolean("is_read").notNull().default(false),
  isPersistent: boolean("is_persistent").notNull().default(true), // Si la notification doit persister
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});

export const balanceHistory = pgTable("balance_history", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // Format YYYY-MM-DD
  openingBalance: decimal("opening_balance", { precision: 15, scale: 2 }).notNull().default("0.00"), // Solde d'ouverture - solde restant de la veille en GNF
  dailyAdditionsFCFA: decimal("daily_additions_fcfa", { precision: 15, scale: 2 }).notNull().default("0.00"), // Montant ajouté du jour en FCFA
  dailyUsageGNF: decimal("daily_usage_gnf", { precision: 15, scale: 2 }).notNull().default("0.00"), // Solde utilisé pour dépôts du jour en GNF
  closingBalance: decimal("closing_balance", { precision: 15, scale: 2 }).notNull().default("0.00"), // Solde de clôture en GNF
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});


const roleEnum = z.enum(["admin", "manager", "user"]);

export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true })
  .extend({
    role: roleEnum.default("user"),
  });



export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertSystemSettingsSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertBalanceHistorySchema = createInsertSchema(balanceHistory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  clients: many(clients),
  transactions: many(transactions),
  payments: many(payments),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, {
    fields: [clients.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [transactions.clientId],
    references: [clients.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type SystemSettings = typeof systemSettings.$inferSelect;
export type InsertSystemSettings = z.infer<typeof insertSystemSettingsSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type BalanceHistory = typeof balanceHistory.$inferSelect;
export type InsertBalanceHistory = z.infer<typeof insertBalanceHistorySchema>;
