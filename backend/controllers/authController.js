import User from "../models/User.js";
import bcrypt from "bcrypt";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // ¿Ya existe el usuario?
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ error: "El usuario ya existe" });

    // Hashear contraseña
    const hashed = await bcrypt.hash(password, 10);

    const user = new User({ username, email, password: hashed });
    await user.save();

    res.json({ message: "Usuario registrado con éxito" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    console.log("🔍 Petición de login recibida:", {
      method: req.method,
      url: req.url,
      body: req.body,
      sessionID: req.sessionID
    });

    const { username, password } = req.body;

    // Validar que se envíen username y contraseña
    if (!username || !password) {
      console.log("Error: Username o contraseña faltantes");
      return res.status(400).json({ error: "Username y contraseña son requeridos" });
    }

    // Buscar usuario en la base de datos por username
    const user = await User.findOne({ username });
    if (!user) {
      console.log("Error: Usuario no encontrado:", username);
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log("Error: Contraseña incorrecta para usuario:", username);
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    // Crear sesión 
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.email = user.email;
    req.session.isAuthenticated = true;
    req.session.loginTime = new Date().toISOString();

    console.log("Login exitoso para usuario:", username);
    console.log("Sesión creada:", req.sessionID);
    console.log("Sesión guardada en MongoDB");
    
    res.json({ 
      message: "Login exitoso",
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
      sessionID: req.sessionID
    });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Endpoint para logout
export const logout = (req, res) => {
  const username = req.session.username;
  
  req.session.destroy((err) => {
    if (err) {
      console.error("Error al cerrar sesión:", err);
      return res.status(500).json({ error: "Error al cerrar sesión" });
    }
    
    res.clearCookie('connect.sid');
    console.log("Logout exitoso para usuario:", username);
    res.json({ message: "Logout exitoso" });
  });
};

// Endpoint para verificar sesión activa
export const checkAuth = (req, res) => {
  if (req.session.isAuthenticated) {
    res.json({
      isAuthenticated: true,
      user: {
        id: req.session.userId,
        username: req.session.username,
        email: req.session.email
      }
    });
  } else {
    res.json({
      isAuthenticated: false
    });
  }
};

// Endpoint para reset password (placeholder)
export const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email es requerido" });
    }

    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      console.log("Email no encontrado:", email);
      // Por seguridad, no revelamos si el email existe o no
      return res.json({ 
        message: "Si el email existe, se han enviado las instrucciones" 
      });
    }

    console.log("Instrucciones de reset enviadas a:", email);
    
    res.json({ 
      message: "Si el email existe, se han enviado las instrucciones",
      email: email // Solo para desarrollo, en producción quitar
    });
  } catch (err) {
    console.error("Error en reset password:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Endpoint para ver información detallada de la sesión
export const sessionInfo = (req, res) => {
  if (!req.session.isAuthenticated) {
    return res.status(401).json({ 
      error: "No autenticado",
      message: "Debes iniciar sesión para ver la información de sesión"
    });
  }
  
  // Calcular tiempo restante de sesión
  const expires = new Date(req.session.cookie.expires);
  const now = new Date();
  const timeRemaining = Math.floor((expires - now) / 1000);
  
  res.json({
    sessionID: req.sessionID,
    user: {
      id: req.session.userId,
      username: req.session.username,
      email: req.session.email
    },
    sessionData: {
      isAuthenticated: req.session.isAuthenticated,
      loginTime: req.session.loginTime,
      cookie: {
        originalMaxAge: req.session.cookie.originalMaxAge,
        expires: req.session.cookie.expires,
        httpOnly: req.session.cookie.httpOnly,
        path: req.session.cookie.path
      }
    },
    mongoStoreInfo: {
      sessionCollection: "sessions",
      sessionExpires: req.session.cookie.expires,
      timeRemaining: timeRemaining > 0 ? `${timeRemaining} segundos` : "Expirada",
      timeRemainingSeconds: timeRemaining,
      status: timeRemaining > 0 ? "Activa" : "Expirada"
    },
    storage: {
      type: "MongoDB",
      collection: "sessions",
      persistence: "Sobrevive reinicios del servidor"
    }
  });
};

// Endpoint para debug de sesiones (solo desarrollo)
export const debugSessions = async (req, res) => {
  try {
    // Verificar si es desarrollo
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: "Endpoint no disponible en producción" });
    }

    const sessionStore = req.sessionStore;
    
    // Obtener todas las sesiones
    sessionStore.all((error, sessions) => {
      if (error) {
        console.error("Error obteniendo sesiones:", error);
        return res.status(500).json({ error: "Error obteniendo sesiones" });
      }
      
      const sessionCount = Object.keys(sessions || {}).length;
      const activeSessions = sessions ? Object.entries(sessions).map(([id, session]) => ({
        sessionID: id,
        user: session.userId ? {
          id: session.userId,
          username: session.username
        } : null,
        isAuthenticated: session.isAuthenticated || false,
        loginTime: session.loginTime || 'No disponible',
        expires: session.cookie?.expires
      })) : [];

      res.json({
        totalSessions: sessionCount,
        activeSessions: activeSessions,
        storage: {
          type: "MongoDB",
          collection: "sessions",
          status: sessionStore ? "Conectado" : "Error"
        }
      });
    });
  } catch (error) {
    console.error("Error en debugSessions:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Endpoint para ver estadísticas de sesiones
export const sessionStats = (req, res) => {
  if (!req.session.isAuthenticated) {
    return res.status(401).json({ error: "No autenticado" });
  }

  const sessionAge = Math.floor((new Date() - new Date(req.session.loginTime)) / 1000);
  const expires = new Date(req.session.cookie.expires);
  const timeRemaining = Math.floor((expires - new Date()) / 1000);

  res.json({
    currentSession: {
      user: req.session.username,
      sessionID: req.sessionID,
      sessionAge: `${sessionAge} segundos`,
      timeRemaining: `${timeRemaining} segundos`,
      loginTime: req.session.loginTime
    },
    system: {
      sessionStorage: "MongoDB",
      cookieSettings: {
        httpOnly: req.session.cookie.httpOnly,
        secure: req.session.cookie.secure,
        maxAge: req.session.cookie.originalMaxAge
      }
    }
  });
};

// Obtener perfil del usuario autenticado
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Actualizar perfil del usuario autenticado
export const updateProfile = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email;

    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No hay datos para actualizar" });
    }

    const user = await User.findByIdAndUpdate(req.session.userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Actualizar datos en la sesión
    req.session.username = user.username;
    req.session.email = user.email;

    res.json({
      message: "Perfil actualizado con éxito",
      user,
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);

    // Manejar errores de unicidad (username/email duplicados)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "campo";
      return res
        .status(400)
        .json({ error: `Ya existe un usuario con ese ${field}` });
    }

    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Eliminar cuenta del usuario autenticado
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const deleted = await User.findByIdAndDelete(userId);

    if (!deleted) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const username = req.session.username;

    req.session.destroy((err) => {
      if (err) {
        console.error("Error al eliminar sesión tras borrar cuenta:", err);
        return res
          .status(500)
          .json({ error: "Cuenta eliminada, pero error al cerrar sesión" });
      }

      res.clearCookie("connect.sid");
      console.log("🗑️ Cuenta eliminada para usuario:", username);
      res.json({ message: "Cuenta eliminada correctamente" });
    });
  } catch (error) {
    console.error("Error al eliminar cuenta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};