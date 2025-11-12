import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getPendingTransactions,
} from "../controllers/transactionController.js";

const router = express.Router();

// CRUD classique
router.get("/", protect, getTransactions);
router.post("/", protect, addTransaction);
router.put("/:id", protect, updateTransaction);
router.delete("/:id", protect, deleteTransaction);

// ✅ Transactions en attente (optimisé)
router.get("/pending", protect, getPendingTransactions);

export default router;
