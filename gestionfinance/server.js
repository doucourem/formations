import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Import des routes
import authRoutes from './routes/auth.js';
import clientRoutes from './routes/clients.js';
import transactionRoutes from './routes/transactions.js';
import notificationRoutes from './routes/notifications.js';
import balanceRoutes from './routes/balance.js';
import usersRoutes from './routes/users.js';
import statsroutesRoutes from './routes/stats.routes.js';
import apiRouter from "./controllers/usersController.js";



dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/balance', balanceRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/stats', statsroutesRoutes);
app.use("/api", apiRouter);

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'API backend running!' });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
