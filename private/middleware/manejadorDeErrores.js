const fs = require('fs');
const path = require('path');

const flujoLog = fs.createWriteStream(path.join(__dirname, '..', 'error.log'), { flags: 'a' });

function manejadorDeErrores(err, req, res, next) {
  const { estado = 500, mensaje = 'Internal Server Error' } = err;
  const mensajeLog = `[${new Date().toISOString()}] ${req.method} ${req.url} - ${estado} - ${mensaje}\n`;

  flujoLog.write(mensajeLog);
  console.error(mensajeLog);

  res.status(estado).json({ error: mensaje });
}

module.exports = manejadorDeErrores;
