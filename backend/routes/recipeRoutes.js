import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  listPublicRecipes,
} from "../controllers/recipeController.js";

const router = express.Router();

// Todas las rutas de recetas requieren autenticación (incluidas las públicas)
router.use(requireAuth);

router.get("/", listRecipes);
router.get("/public", listPublicRecipes);
router.get("/:id", getRecipe);
router.post("/", createRecipe);
router.put("/:id", updateRecipe);
router.delete("/:id", deleteRecipe);

export default router;
