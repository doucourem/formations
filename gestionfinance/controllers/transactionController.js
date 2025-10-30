import pool from '../models/index.js';

/**
 * Récupérer les transactions
 * - Les utilisateurs normaux voient seulement leurs transactions
 * - Les admins voient toutes les transactions
 */
export const getTransactions = async (req, res) => {
  try {
    let result;

    if (req.user.role === 'admin') {
      result = await pool.query('SELECT * FROM transactions ORDER BY created_at DESC');
    } else {
      result = await pool.query(
        'SELECT * FROM transactions WHERE user_id=$1 ORDER BY created_at DESC',
        [req.user.id]
      );
    }

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Ajouter une transaction (pour l’utilisateur connecté)
 */
export const addTransaction = async (req, res) => {
  try {
    const { amount, type } = req.body;
    const result = await pool.query(
      'INSERT INTO transactions (user_id, amount, type) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, amount, type]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Mettre à jour une transaction
 * - L’utilisateur ne peut modifier que ses propres transactions
 * - L’admin peut modifier toutes les transactions
 */
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type } = req.body;

    let result;

    if (req.user.role === 'admin') {
      result = await pool.query(
        'UPDATE transactions SET amount=$1, type=$2 WHERE id=$3 RETURNING *',
        [amount, type, id]
      );
    } else {
      result = await pool.query(
        'UPDATE transactions SET amount=$1, type=$2 WHERE id=$3 AND user_id=$4 RETURNING *',
        [amount, type, id, req.user.id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found or unauthorized' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Supprimer une transaction
 * - L’utilisateur ne peut supprimer que ses propres transactions
 * - L’admin peut supprimer toutes les transactions
 */
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    let result;

    if (req.user.role === 'admin') {
      result = await pool.query(
        'DELETE FROM transactions WHERE id=$1 RETURNING *',
        [id]
      );
    } else {
      result = await pool.query(
        'DELETE FROM transactions WHERE id=$1 AND user_id=$2 RETURNING *',
        [id, req.user.id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found or unauthorized' });
    }

    res.json({ message: 'Transaction deleted successfully', transaction: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
