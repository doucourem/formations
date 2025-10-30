import pool from '../models/index.js';

export const getNotifications = async (req, res) => {
  const result = await pool.query('SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id]);
  res.json(result.rows);
};

export const addNotification = async (req, res) => {
  const { title, message } = req.body;
  const result = await pool.query(
    'INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3) RETURNING *',
    [req.user.id, title, message]
  );
  res.json(result.rows[0]);
};
