const fs = require('fs');
const path = require('path');

const logStream = fs.createWriteStream(path.join(__dirname, '..', 'error.log'), { flags: 'a' });

function errorHandler(err, req, res, next) {
  const { status = 500, message = 'Internal Server Error' } = err;
  const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.url} - ${status} - ${message}\n`;

  logStream.write(logMessage);
  console.error(logMessage);

  res.status(status).json({ error: message });
}

module.exports = errorHandler;
