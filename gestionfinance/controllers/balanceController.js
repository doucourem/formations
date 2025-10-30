import pool from '../models/index.js';

export const getBalanceHistory = async (req, res) => {
  const result = await pool.query('SELECT * FROM balance_history WHERE user_id=$1', [req.user.id]);
  res.json(result.rows);
};
