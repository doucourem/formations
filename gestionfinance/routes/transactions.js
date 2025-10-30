import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction
} from '../controllers/transactionController.js';

const router = express.Router();

// Lister toutes les transactions de l'utilisateur connecté
router.get('/', protect, getTransactions);

// Ajouter une transaction
router.post('/', protect, addTransaction);

// Mettre à jour une transaction
router.put('/:id', protect, updateTransaction);

// Supprimer une transaction
router.delete('/:id', protect, deleteTransaction);

export default router;
