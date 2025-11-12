import pool from '../models/index.js';

/**
 * 📊 Statistiques quotidiennes pour l'admin
 */
export const getDailyStats = async (req, res) => {
  try {
    // Récupération des transactions et paiements
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const todayTransactionsResult = await pool.query(
      `SELECT * FROM transactions
       WHERE created_at >= $1 AND created_at < $2`,
      [today.toISOString(), todayEnd.toISOString()]
    );

    const activeTransactions = todayTransactionsResult.rows.filter(t => !t.is_deleted);

    const totalSentToday = activeTransactions.reduce((sum, t) => sum + parseFloat(t.amount_fcfa), 0);
    const totalDebtToday = activeTransactions.reduce((sum, t) => sum + parseFloat(t.amount_to_pay), 0);
    const pendingCount = activeTransactions.filter(t => t.status === "pending").length;
    const validatedCount = activeTransactions.filter(t => t.status === "validated").length;

    // Dette globale
    const allActiveTransactionsResult = await pool.query(
      `SELECT * FROM transactions
       WHERE is_deleted IS NULL OR is_deleted = false`
    );

    const allPaymentsResult = await pool.query(`SELECT * FROM payments`);
    
    const totalDebtAllTime = allActiveTransactionsResult.rows.reduce((sum, t) => sum + parseFloat(t.amount_to_pay), 0);
    const totalPaidAllTime = allPaymentsResult.rows.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const globalDebt = Math.max(0, totalDebtAllTime - totalPaidAllTime);

    const stats = {
      totalSentToday,
      totalDebtToday,
      globalDebt,
      pendingCount,
      validatedCount,
      transactionCount: activeTransactions.length
    };

    res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
    res.json(stats);

  } catch (err) {
    console.error("[STATS DAILY] Error:", err);
    res.status(500).json({ error: "Erreur lors de la récupération des statistiques quotidiennes" });
  }
};

/**
 * 📋 Résumés des utilisateurs (admin)
 */
export const getUsersSummary = async (req, res) => {
  try {
    const allUsersResult = await pool.query(`SELECT * FROM users WHERE role != 'admin'`);
    const normalUsers = allUsersResult.rows;

    const summaries = await Promise.all(normalUsers.map(async (user) => {
      // Exemple de résumé par utilisateur
      const userTransactions = await pool.query(
        `SELECT * FROM transactions WHERE user_id = $1 AND (is_deleted IS NULL OR is_deleted = false)`,
        [user.id]
      );

      const totalSent = userTransactions.rows.reduce((sum, t) => sum + parseFloat(t.amount_fcfa), 0);
      const totalDebt = userTransactions.rows.reduce((sum, t) => sum + parseFloat(t.amount_to_pay), 0);

      return {
        userId: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        totalSent,
        totalDebt,
        transactionCount: userTransactions.rows.length
      };
    }));

    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
    res.json(summaries);
  } catch (err) {
    console.error("[STATS USERS] Error:", err);
    res.status(500).json({ error: "Erreur lors de la récupération des résumés utilisateurs" });
  }
};

/**
 * ✅ Transactions validées (admin)
 */
export const getValidatedTransactions = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, u.first_name, u.last_name, c.name AS client_name
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN clients c ON t.client_id = c.id
      WHERE t.status = 'validated'
      AND (t.is_deleted IS NULL OR t.is_deleted = false)
      ORDER BY t.created_at DESC
    `);

    const transactions = result.rows.map(row => ({
      ...row,
      userName: `${row.first_name || ""} ${row.last_name || ""}`.trim() || "Utilisateur inconnu",
      clientName: row.client_name || "Client occasionnel"
    }));

    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
    res.json(transactions);

  } catch (err) {
    console.error("[VALIDATED TRANSACTIONS] Error:", err);
    res.status(500).json({ error: "Erreur lors de la récupération des transactions validées" });
  }
};
