import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    ingredientes: { type: [String], default: [] },
    cantidades: { type: [String], default: [] },
    pasos: { type: [String], default: [] },
    comentarios: { type: String, default: "" },
    publico: { type: Boolean, default: false },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "RecipeGroup" }],
  },
  { timestamps: true }
);

export default mongoose.model("Recipe", recipeSchema);
