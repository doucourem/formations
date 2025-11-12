import pool from '../models/index.js';
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
