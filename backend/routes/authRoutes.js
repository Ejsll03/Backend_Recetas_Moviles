import express from "express";
import { 
  register, 
  login, 
  logout, 
  checkAuth, 
  resetPassword,
  sessionInfo,
  debugSessions,
  sessionStats,
  getProfile,
  updateProfile,
  deleteAccount
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Rutas de autenticación principales
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/check", checkAuth);
router.post("/reset-password", resetPassword);

// Rutas de información y debug de sesiones
router.get("/session-info", sessionInfo);
router.get("/session-stats", sessionStats);
router.get("/debug-sessions", debugSessions);

// Rutas de perfil de usuario (requieren autenticación)
router.get("/profile", requireAuth, getProfile);
router.put("/profile", requireAuth, updateProfile);
router.delete("/profile", requireAuth, deleteAccount);

export default router;