export function requireAuth(req, res, next) {
  if (req.session && req.session.isAuthenticated && req.session.userId) {
    return next();
  }
  return res.status(401).json({ error: "No autenticado" });
}
