import RecipeGroup from "../models/RecipeGroups.js";
import Recipe from "../models/Recipe.js";

export const createRecipeGroup = async (req, res) => {
  try {
    const { name, description, publico } = req.body;
    const newRecipeGroup = new RecipeGroup({
      user: req.user.id,
      name,
      description,
      publico,
    });
    const recipeGroup = await newRecipeGroup.save();
    res.status(201).json(recipeGroup);
  } catch (error) {
    console.error("Error creando recipe group:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getRecipeGroups = async (req, res) => {
  try {
    console.log("getRecipeGroups para usuario:", req.user?.id);
    const recipeGroups = await RecipeGroup.find({ user: req.user.id })
      .populate("recipes", "title");
    res.json(recipeGroups);
  } catch (error) {
    console.error("Error obteniendo recipe groups:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getRecipeGroupById = async (req, res) => {
    try {
      const recipeGroup = await RecipeGroup.findById(req.params.id).populate('recipes');
      if (recipeGroup && recipeGroup.user.toString() === req.user.id) {
        res.json(recipeGroup);
      } else {
        res.status(404).json({ message: "Recipe group not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  };

export const updateRecipeGroup = async (req, res) => {
  try {
    const { name, description, publico } = req.body;
    const recipeGroup = await RecipeGroup.findById(req.params.id);

    if (recipeGroup && recipeGroup.user.toString() === req.user.id) {
      recipeGroup.name = name || recipeGroup.name;
      recipeGroup.description = description || recipeGroup.description;
      recipeGroup.publico = publico !== undefined ? publico : recipeGroup.publico;

      const updatedRecipeGroup = await recipeGroup.save();
      res.json(updatedRecipeGroup);
    } else {
      res.status(404).json({ message: "Recipe group not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteRecipeGroup = async (req, res) => {
  try {
    const recipeGroup = await RecipeGroup.findById(req.params.id);

    if (recipeGroup && recipeGroup.user.toString() === req.user.id) {
      await recipeGroup.deleteOne();
      await Recipe.updateMany(
        { groups: recipeGroup._id },
        { $pull: { groups: recipeGroup._id } }
      );
      res.json({ message: "Recipe group borrado" });
    } else {
      res.status(404).json({ message: "Recipe group no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const addRecipeToGroup = async (req, res) => {
    try {
        const { recipeId } = req.body;
        const recipeGroup = await RecipeGroup.findById(req.params.id);
        const recipe = await Recipe.findById(recipeId);

        if (recipeGroup && recipeGroup.user.toString() === req.user.id && recipe && recipe.user.toString() === req.user.id) {
            if (!recipeGroup.recipes.includes(recipeId)) {
                recipeGroup.recipes.push(recipeId);
                await recipeGroup.save();
            }
            if (!recipe.groups.includes(recipeGroup._id)) {
                recipe.groups.push(recipeGroup._id);
                await recipe.save();
            }
            res.json(recipeGroup);
        } else {
            res.status(404).json({ message: "Recipe group o recipe no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

export const removeRecipeFromGroup = async (req, res) => {
    try {
        const recipeGroup = await RecipeGroup.findById(req.params.id);
        const recipe = await Recipe.findById(req.params.recipeId);

        if (recipeGroup && recipeGroup.user.toString() === req.user.id && recipe) {
            recipeGroup.recipes = recipeGroup.recipes.filter(
                (id) => id.toString() !== req.params.recipeId
            );
            await recipeGroup.save();
            recipe.groups = recipe.groups.filter(
                (id) => id.toString() !== req.params.id
            );
            await recipe.save();

            res.json(recipeGroup);
        } else {
            res.status(404).json({ message: "Recipe group o recipe no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
