import express from "express";
import {
  createRecipeGroup,
  getRecipeGroups,
  getRecipeGroupById,
  updateRecipeGroup,
  deleteRecipeGroup,
  addRecipeToGroup,
  removeRecipeFromGroup,
} from "../controllers/recipeGroupController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.route("/").post(requireAuth, createRecipeGroup).get(requireAuth, getRecipeGroups);
router
  .route("/:id")
  .get(requireAuth, getRecipeGroupById)
  .put(requireAuth, updateRecipeGroup)
  .delete(requireAuth, deleteRecipeGroup);
router.route("/:id/recipes").post(requireAuth, addRecipeToGroup);
router.route("/:id/recipes/:recipeId").delete(requireAuth, removeRecipeFromGroup);

export default router;
