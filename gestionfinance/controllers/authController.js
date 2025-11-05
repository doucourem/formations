import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../models/index.js';

// === Enregistrement ===
export const register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existing = await pool.query('SELECT * FROM users WHERE username=$1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ msg: 'Cet utilisateur existe déjà' });
    }

    // Hasher le mot de passe
    const hashed = await bcrypt.hash(password, 10);

    // Insérer l'utilisateur
    const result = await pool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
      [email, hashed, role || 'user']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Erreur serveur', error: err.message });
  }
};

// === Connexion ===
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = (await pool.query('SELECT * FROM users WHERE username=$1', [email])).rows[0];

    if (!user) return res.status(400).json({ msg: 'Utilisateur non trouvé' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Mot de passe incorrect' });

    // Génération du token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Erreur serveur', error: err.message });
  }
};

// === Changement de mot de passe ===
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = (await pool.query('SELECT * FROM users WHERE id=$1', [userId])).rows[0];
    if (!user) return res.status(404).json({ msg: 'Utilisateur non trouvé' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Ancien mot de passe incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password=$1 WHERE id=$2', [hashed, userId]);

    res.json({ msg: 'Mot de passe mis à jour avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Erreur serveur', error: err.message });
  }
};
