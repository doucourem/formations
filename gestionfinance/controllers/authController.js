import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../models/index.js';

// Enregistrement
export const register = async (req, res) => {
  const { email, password, role } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
    [email, hashed, role || 'user']
  );
  res.json(result.rows[0]);
};

// Connexion
export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = (await pool.query('SELECT * FROM users WHERE email=$1', [email])).rows[0];
  if (!user) return res.status(400).json({ msg: 'Utilisateur non trouvé' });

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) return res.status(400).json({ msg: 'Mot de passe incorrect' });

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
};

// Changer le mot de passe
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  // Récupérer l'utilisateur
  const user = (await pool.query('SELECT * FROM users WHERE id=$1', [userId])).rows[0];
  if (!user) return res.status(404).json({ msg: 'Utilisateur non trouvé' });

  // Vérifier l'ancien mot de passe
  const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
  if (!isMatch) return res.status(400).json({ msg: 'Ancien mot de passe incorrect' });

  // Hash du nouveau mot de passe
  const hashed = await bcrypt.hash(newPassword, 10);

  // Mettre à jour dans la DB
  await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hashed, userId]);

  res.json({ msg: 'Mot de passe mis à jour avec succès' });
};
