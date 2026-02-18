import mongoose from "mongoose";

const recipeGroupSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
    publico: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("RecipeGroup", recipeGroupSchema);