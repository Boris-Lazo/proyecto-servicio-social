const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
  const encabezado = req.headers.authorization;
  if (!encabezado) return res.status(401).json({ error: 'Se requiere token' });
  try {
    const token = encabezado.split(' ')[1];
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decodificado.user;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};
