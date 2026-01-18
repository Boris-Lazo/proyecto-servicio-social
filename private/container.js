// Configuración
const appConfig = require('./config/appConfig');
const dbManager = require('./config/database');
const db = dbManager.connect();

// Repositorios
const UserRepository = require('./repositories/UserRepository');
const AlbumRepository = require('./repositories/AlbumRepository');
const DocumentRepository = require('./repositories/DocumentRepository');
const PasswordResetRepository = require('./repositories/PasswordResetRepository');

const userRepository = new UserRepository(db);
const albumRepository = new AlbumRepository(db);
const documentRepository = new DocumentRepository(db);
const passwordResetRepository = new PasswordResetRepository(db);

// Servicios Externos
const MailService = require('./services/external/MailService');
const StorageService = require('./services/external/StorageService');

const mailService = new MailService(appConfig.smtp);
const storageService = new StorageService(appConfig.paths);

// Servicios de Negocio
const AuthService = require('./services/AuthService');
const AlbumService = require('./services/AlbumService');
const DocumentService = require('./services/DocumentService');

const authService = new AuthService(userRepository, passwordResetRepository, mailService);
const albumService = new AlbumService(albumRepository, storageService);
const documentService = new DocumentService(documentRepository, storageService, appConfig);

// Controladores
const AuthController = require('./controllers/AuthController');
const AlbumController = require('./controllers/AlbumController');
const DocumentController = require('./controllers/DocumentController');

const authController = new AuthController(authService);
const albumController = new AlbumController(albumService);
const documentController = new DocumentController(documentService);

// Exportar instancias listas para usar
module.exports = {
    appConfig,
    dbManager,
    authController,
    albumController,
    documentController,
};
