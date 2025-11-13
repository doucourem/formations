// controllers/api.js
import express from "express";
import { z } from "zod";
import pool from "../models/index.js"; // PostgreSQL pool
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
// Router principal
/**
 * 🧾 Récupérer tous les utilisateurs
 * - Admin → tous les utilisateurs
 * - User → seulement lui-même
 */
export const getUsers = async (req, res) => {
  try {
    let result;

    if (req.user.role === "admin") {
      result = await pool.query("SELECT * FROM users ORDER BY created_at DESC");
    } else {
      result = await pool.query("SELECT * FROM users WHERE id = $1", [req.user.id]);
    }

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ➕ Créer un utilisateur
 */
export const createUser = async (req, res) => {
  const {
    first_name,
    last_name,
    username,
    password,
    role = "user",
    personal_debt_threshold_fcfa = 100000,
    personal_fee_percentage = 10,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO users 
        (first_name, last_name, username, password, role, personal_debt_threshold_fcfa, personal_fee_percentage)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [first_name, last_name, username, password, role, personal_debt_threshold_fcfa, personal_fee_percentage]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ✏️ Mettre à jour un utilisateur
 */
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const {
    first_name,
    last_name,
    role,
    personal_debt_threshold_fcfa,
    personal_fee_percentage,
    is_active,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, role = $3, 
           personal_debt_threshold_fcfa = $4, personal_fee_percentage = $5, is_active = $6
       WHERE id = $7
       RETURNING *`,
      [first_name, last_name, role, personal_debt_threshold_fcfa, personal_fee_percentage, is_active, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ❌ Supprimer un utilisateur
 */
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const router = express.Router();

/** ==================== USERS ==================== **/

// Récupérer tous les utilisateurs
router.get("/users", protect, async (req, res) => {
  try {
    const result = req.user.role === "admin"
      ? await pool.query("SELECT * FROM users ORDER BY created_at DESC")
      : await pool.query("SELECT * FROM users WHERE id = $1", [req.user.id]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Créer un utilisateur
router.post("/users", protect, requireAdmin, async (req, res) => {
  const { first_name, last_name, username, password, role = "user", personal_debt_threshold_fcfa = 100000, personal_fee_percentage = 10 } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO users 
       (first_name, last_name, username, password, role, personal_debt_threshold_fcfa, personal_fee_percentage)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [first_name, last_name, username, password, role, personal_debt_threshold_fcfa, personal_fee_percentage]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mettre à jour un utilisateur
router.put("/users/:id", protect, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, role, personal_debt_threshold_fcfa, personal_fee_percentage, is_active } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users
       SET first_name=$1,last_name=$2,role=$3,personal_debt_threshold_fcfa=$4,personal_fee_percentage=$5,is_active=$6
       WHERE id=$7 RETURNING *`,
      [first_name, last_name, role, personal_debt_threshold_fcfa, personal_fee_percentage, is_active, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Supprimer un utilisateur
router.delete("/users/:id", protect, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** ==================== PAYMENTS ==================== **/

// Créer un paiement
router.post("/payments", protect, requireAdmin, async (req, res) => {
  try {
    const paymentSchema = z.object({
      userId: z.number(),
      amount: z.string().min(1).refine(val => !isNaN(Number(val)) && Number(val) > 0),
      validatedBy: z.number()
    });

    const validatedData = paymentSchema.parse(req.body);

    // Vérifier que l'utilisateur existe
    const userResult = await pool.query("SELECT * FROM users WHERE id=$1", [validatedData.userId]);
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    // Créer le paiement
    const result = await pool.query(
      `INSERT INTO payments (user_id, amount, validated_by) VALUES ($1,$2,$3) RETURNING *`,
      [validatedData.userId, validatedData.amount, validatedData.validatedBy]
    );

    res.json({ message: "Paiement validé avec succès", payment: result.rows[0] });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ message: "Données invalides", errors: error.errors });
    res.status(500).json({ message: "Impossible de valider le paiement", error: error.message || "Erreur inconnue" });
  }
});

// Récupérer tous les paiements
router.get("/payments", protect, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM payments ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des paiements", error: err.message });
  }
});

// Supprimer un paiement
router.delete("/payments/:id", protect, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM payments WHERE id=$1 RETURNING *", [id]);
    if (!result.rows.length) return res.status(404).json({ message: "Paiement introuvable" });
    res.json({ message: "Paiement annulé avec succès", payment: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Impossible d'annuler le paiement", error: err.message });
  }
});

/** ==================== BALANCE ==================== **/

// Ajouter au solde
router.post("/balance/add", protect, requireAdmin, async (req, res) => {
  try {
    const schema = z.object({ amountFCFA: z.number().min(1) });
    const { amountFCFA } = schema.parse(req.body);

    const settingsRes = await pool.query("SELECT * FROM system_settings LIMIT 1");
    const settings = settingsRes.rows[0];
    const newBalance = parseFloat(settings.main_balance_gnf) + amountFCFA * parseFloat(settings.exchange_rate);

    await pool.query("UPDATE system_settings SET main_balance_gnf=$1", [newBalance]);

    res.json({ message: "Solde augmenté avec succès", newBalance });
  } catch (err) {
    res.status(500).json({ message: "Impossible de modifier le solde", error: err.message });
  }
});

// Soustraire du solde
router.post("/balance/subtract", protect, requireAdmin, async (req, res) => {
  try {
    const schema = z.object({ amountFCFA: z.number().min(1) });
    const { amountFCFA } = schema.parse(req.body);

    const settingsRes = await pool.query("SELECT * FROM system_settings LIMIT 1");
    const settings = settingsRes.rows[0];
    const newBalance = parseFloat(settings.main_balance_gnf) - amountFCFA * parseFloat(settings.exchange_rate);

    if (newBalance < 0) return res.status(400).json({ message: "Solde insuffisant" });

    await pool.query("UPDATE system_settings SET main_balance_gnf=$1", [newBalance]);

    res.json({ message: "Solde diminué avec succès", newBalance });
  } catch (err) {
    res.status(500).json({ message: "Impossible de modifier le solde", error: err.message });
  }
});

// Historique du solde
router.get("/balance/history", protect, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM balance_history ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Impossible de récupérer l'historique", error: err.message });
  }
});

/** ==================== REPORTS ==================== **/

// Rapport par utilisateur
router.get("/reports/user/:userId", protect, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) return res.status(400).json({ message: "Invalid user ID" });

    if (req.user.role !== "admin" && req.user.id !== userId) return res.status(403).json({ message: "Access denied" });

    const transactionsRes = await pool.query("SELECT * FROM transactions WHERE user_id=$1", [userId]);
    const transactions = transactionsRes.rows;

    // Exemple simple : total envoyé, total payé, dette actuelle
    const totalSent = transactions.reduce((sum, t) => sum + parseFloat(t.amount_fcfa), 0);
    const totalPaid = transactions.reduce((sum, t) => sum + parseFloat(t.paid_amount || 0), 0);
    const currentDebt = totalSent - totalPaid;

    res.json({ userId, totalSent, totalPaid, currentDebt, transactions });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération du rapport", error: err.message });
  }
});


  router.get("/api/system/settings", async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching system settings:", error);
      res.status(500).json({ message: "Failed to fetch system settings" });
    }
  });

  // API route for updating system settings
  router.patch("/api/system/settings", protect, requireAdmin, async (req, res) => {
    try {
      const updatedSettings = await storage.updateSystemSettings(req.body);
      
      // Invalidate cache after update
     // invalidateCache('/api/system/settings');
      
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating system settings:", error);
      res.status(500).json({ message: "Failed to update system settings" });
    }
  });


export default router;
