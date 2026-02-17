import Recipe from "../models/Recipe.js";

export async function listRecipes(req, res) {
  try {
    const userId = req.session.userId;
    const recipes = await Recipe.find({ user: userId }).sort({ createdAt: -1 });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getRecipe(req, res) {
  try {
    const userId = req.session.userId;
    const { id } = req.params;
    const recipe = await Recipe.findOne({ _id: id, user: userId });
    if (!recipe) return res.status(404).json({ error: "Receta no encontrada" });
    res.json(recipe);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function createRecipe(req, res) {
  try {
    const userId = req.session.userId;
    const {
      title,
      description = "",
      ingredientes = [],
      cantidades = [],
      pasos = [],
      comentarios = "",
    } = req.body;
    if (!title)
      return res.status(400).json({ error: "El título es requerido" });

    const recipe = new Recipe({
      user: userId,
      title,
      description,
      ingredientes,
      cantidades,
      pasos,
      comentarios,
    });
    await recipe.save();
    res.status(201).json(recipe);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateRecipe(req, res) {
  try {
    const userId = req.session.userId;
    const { id } = req.params;
    const update = req.body;
    // Solo permitir campos válidos
    const allowedFields = [
      "title",
      "description",
      "ingredientes",
      "cantidades",
      "pasos",
      "comentarios",
    ];
    const filteredUpdate = {};
    for (const key of allowedFields) {
      if (update.hasOwnProperty(key)) filteredUpdate[key] = update[key];
    }
    const recipe = await Recipe.findOneAndUpdate(
      { _id: id, user: userId },
      filteredUpdate,
      { new: true }
    );
    if (!recipe) return res.status(404).json({ error: "Receta no encontrada" });
    res.json(recipe);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteRecipe(req, res) {
  try {
    const userId = req.session.userId;
    const { id } = req.params;
    const recipe = await Recipe.findOneAndDelete({ _id: id, user: userId });
    if (!recipe) return res.status(404).json({ error: "Receta no encontrada" });
    res.json({ message: "Receta eliminada" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
