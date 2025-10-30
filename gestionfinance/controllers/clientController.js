import pool from '../models/index.js';

/**
 * Récupérer les clients
 * - Les utilisateurs normaux voient seulement leurs clients
 * - Les admins voient tous les clients
 */
export const getClients = async (req, res) => {
  try {
    let result;

    if (req.user.role === 'admin') {
      result = await pool.query('SELECT * FROM clients ORDER BY created_at DESC');
    } else {
      result = await pool.query(
        'SELECT * FROM clients WHERE user_id=$1 ORDER BY created_at DESC',
        [req.user.id]
      );
    }

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Ajouter un client
 */
export const addClient = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const result = await pool.query(
      'INSERT INTO clients (user_id, name, email, phone) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, name, email, phone]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Mettre à jour un client
 * - L’utilisateur ne peut modifier que ses propres clients
 * - L’admin peut modifier tous les clients
 */
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    let result;

    if (req.user.role === 'admin') {
      result = await pool.query(
        'UPDATE clients SET name=$1, email=$2, phone=$3 WHERE id=$4 RETURNING *',
        [name, email, phone, id]
      );
    } else {
      result = await pool.query(
        'UPDATE clients SET name=$1, email=$2, phone=$3 WHERE id=$4 AND user_id=$5 RETURNING *',
        [name, email, phone, id, req.user.id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found or unauthorized' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Supprimer un client
 * - L’utilisateur ne peut supprimer que ses propres clients
 * - L’admin peut supprimer tous les clients
 */
export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    let result;

    if (req.user.role === 'admin') {
      result = await pool.query('DELETE FROM clients WHERE id=$1 RETURNING *', [id]);
    } else {
      result = await pool.query(
        'DELETE FROM clients WHERE id=$1 AND user_id=$2 RETURNING *',
        [id, req.user.id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found or unauthorized' });
    }

    res.json({ message: 'Client deleted successfully', client: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
