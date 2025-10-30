import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';
import {
  getClients,
  addClient,
  updateClient,
  deleteClient
} from '../controllers/clientController.js';

const router = express.Router();

// Tous les utilisateurs connectés peuvent voir leurs clients
router.get('/', protect, getClients);

// Ajouter un client (tous utilisateurs connectés)
router.post('/', protect, addClient);

// Mettre à jour un client (propriétaire ou admin)
router.put('/:id', protect, updateClient);

// Supprimer un client (propriétaire ou admin)
router.delete('/:id', protect, deleteClient);

export default router;
