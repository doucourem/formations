import pool from '../models/index.js';

export const getBalanceHistory = async (req, res) => {
  const result = await pool.query('SELECT * FROM balance_history');
  res.json(result.rows);
};
