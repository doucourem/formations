const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ error: 'Token manquant' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Token manquant" });
  try {
  const payload = jwt.verify(token, JWT_SECRET);
  req.user = payload;
  console.log("✅ Utilisateur authentifié :", payload);
  next();
} catch (err) {
  console.error("❌ Erreur de token :", err.message);
  return res.status(401).json({ error: 'Token invalide' });
}
}

module.exports = authenticate;
