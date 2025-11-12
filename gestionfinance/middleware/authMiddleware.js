import jwt from 'jsonwebtoken';

/** Vérifie que l'utilisateur est connecté */
export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'Pas de token' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token invalide' });
  }
};

/** Vérifie que l'utilisateur est admin */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Accès refusé, admin seulement' });
  }
  next();
};
