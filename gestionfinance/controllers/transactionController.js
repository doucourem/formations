import pool from '../models/index.js';
/**
 * 🔄 Récupérer toutes les transactions
 * - Admin → toutes
 * - User → seulement ses transactions
 */
export const getTransactions = async (req, res) => {
  try {
    let result;

    if (req.user.role === "admin") {
      result = await pool.query("SELECT * FROM transactions ORDER BY created_at DESC");
    } else {
      result = await pool.query(
        "SELECT * FROM transactions WHERE user_id=$1 ORDER BY created_at DESC",
        [req.user.id]
      );
    }

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ➕ Ajouter une transaction
 */
export const addTransaction = async (req, res) => {
  try {
    const { amount, client_id, amount_gnf, amount_to_pay, fee_amount } = req.body;

    const result = await pool.query(
      `INSERT INTO transactions 
        (user_id, amount_fcfa, client_id, amount_gnf, amount_to_pay, fee_amount)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, amount, client_id, amount_gnf, amount_to_pay, fee_amount]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ✏️ Mettre à jour une transaction
 */
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type } = req.body;
    let result;

    if (req.user.role === "admin") {
      result = await pool.query(
        "UPDATE transactions SET amount_fcfa=$1, type=$2 WHERE id=$3 RETURNING *",
        [amount, type, id]
      );
    } else {
      result = await pool.query(
        "UPDATE transactions SET amount_fcfa=$1, type=$2 WHERE id=$3 AND user_id=$4 RETURNING *",
        [amount, type, id, req.user.id]
      );
    }

    if (!result.rows.length) {
      return res.status(404).json({ error: "Transaction not found or unauthorized" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ❌ Supprimer une transaction
 */
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    let result;

    if (req.user.role === "admin") {
      result = await pool.query(
        "DELETE FROM transactions WHERE id=$1 RETURNING *",
        [id]
      );
    } else {
      result = await pool.query(
        "DELETE FROM transactions WHERE id=$1 AND user_id=$2 RETURNING *",
        [id, req.user.id]
      );
    }

    if (!result.rows.length) {
      return res.status(404).json({ error: "Transaction not found or unauthorized" });
    }

    res.json({ message: "Transaction deleted successfully", transaction: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ⏳ Transactions en attente optimisées pour connexions lentes
 */
export const getPendingTransactions = async (req, res) => {
  try {
    const userAgent = req.get("User-Agent") || "";
    const isSlowConnection =
      userAgent.includes("Mobile") ||
      userAgent.includes("Guinea") ||
      req.get("X-Connection-Type") === "3g";

    if (isSlowConnection) {
      res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
      res.setHeader("Connection", "keep-alive");
    }

    const pendingResult = await pool.query(`
      SELECT t.*, u.first_name, u.last_name, c.name AS client_name
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN clients c ON t.client_id = c.id
      WHERE t.status IN ('pending', 'seen', 'proof_submitted')
        AND (t.is_deleted IS NULL OR t.is_deleted = false)
        AND (t.cancellation_requested IS NULL OR t.cancellation_requested = false)
      ORDER BY t.created_at DESC
    `);

    const pendingTransactions = pendingResult.rows.map(row => ({
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
      userName: `${row.first_name || ""} ${row.last_name || ""}`.trim() || "Utilisateur inconnu",
      clientName: row.client_name || "Client occasionnel",
    }));

    res.json(pendingTransactions);
  } catch (error) {
    console.error("Error in /api/transactions/pending:", error);
    res.status(500).json({ error: "Failed to fetch pending transactions" });
  }
};
