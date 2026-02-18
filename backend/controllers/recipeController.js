import Recipe from "../models/Recipe.js";
import User from "../models/User.js";

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
      publico = false,
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
      publico,
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
      "publico",
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

export async function listPublicRecipes(req, res) {
  try {
    const recipes = await Recipe.find({ publico: true })
      .sort({ createdAt: -1 })
      .populate("user", "username");
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function toggleFavorite(req, res) {
  try {
    const userId = req.session.userId;
    const { id } = req.params; // id de la receta

    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ error: "Usuario no encontrado" });

    const index = user.favorites?.findIndex(
      (favId) => favId.toString() === id
    );

    let isFavorite;
    if (index === -1 || index === undefined) {
      user.favorites = user.favorites || [];
      user.favorites.push(id);
      isFavorite = true;
    } else {
      user.favorites.splice(index, 1);
      isFavorite = false;
    }

    await user.save();
    res.json({ isFavorite });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function listFavoriteRecipes(req, res) {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId).populate({
      path: "favorites",
      populate: { path: "user", select: "username" },
    });

    if (!user) return res.status(401).json({ error: "Usuario no encontrado" });

    res.json(user.favorites || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
