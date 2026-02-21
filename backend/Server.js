import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import session from "express-session";
import MongoStore from "connect-mongo";
import authRoutes from "./routes/authRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import recipeGroupRoutes from "./routes/recipeGroupRoutes.js";
import User from "./models/User.js";
import bcrypt from "bcrypt";

dotenv.config({ path: path.resolve("./.env") });
const app = express();

// Middlewares
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());

app.use(
  session({
    secret:
      process.env.SESSION_SECRET ,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
      ttl: 60 * 60, // 1 hora
      autoRemove: "native",
    }),
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
    },
  })
);

// Middleware de logging
app.use((req, res, next) => {
  console.log(
    `📡 ${req.method} ${req.url} - Session: ${
      req.sessionID
    } - ${new Date().toISOString()}`
  );
  next();
});

// Rutas
app.use("/auth", authRoutes);
app.use("/recipes", recipeRoutes);
app.use("/api/recipe-groups", recipeGroupRoutes);
// Servir archivos estáticos de uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Conectar a MongoDB
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI no está definido");
  process.exit(1);
}

// Función para configurar la base de datos
async function setupDatabase() {
  try {
    // Aquí podrías crear datos de prueba si lo necesitas.
    // De momento no se crea ningún usuario por defecto para evitar errores.
    console.log("Base de datos lista");
  } catch (error) {
    console.error("Error configurando la base de datos:", error.message);
  }
}

// Conectar a MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("Conectado a MongoDB Atlas");

    await setupDatabase();

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log("Sesiones almacenadas en MongoDB");
    });
  })
  .catch((err) => {
    console.error("Error de conexión a MongoDB:", err.message);
    process.exit(1);
  });
