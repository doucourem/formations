import express from "express";
import { getUsers, createUser, updateUser, deleteUser } from "../controllers/usersController.js";
import { protect } from "../middleware/authMiddleware.js"; // si tu utilises JWT

const router = express.Router();

router.get("/", protect, getUsers);
router.post("/", protect, createUser);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);

export default router;
