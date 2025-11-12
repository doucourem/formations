import express from "express";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import { getDailyStats, getUsersSummary, getValidatedTransactions } from "../controllers/stats.controller.js";

const router = express.Router();

// Statistiques quotidiennes
router.get("/daily", protect, requireAdmin, getDailyStats);

// Résumés utilisateurs
router.get("/users", protect, requireAdmin, getUsersSummary);

// Transactions validées
router.get("/validated", protect, requireAdmin, getValidatedTransactions);

export default router;
