// Configuración
const configuracionApp = require('./configuracion/configuracionApp');
const gestorBaseDatos = require('./configuracion/baseDeDatos');
const db = gestorBaseDatos.conectar();

// Repositorios
const RepositorioUsuario = require('./repositorios/RepositorioUsuario');
const RepositorioAlbum = require('./repositorios/RepositorioAlbum');
const RepositorioDocumento = require('./repositorios/RepositorioDocumento');
const RepositorioRestablecimientoClave = require('./repositorios/RepositorioRestablecimientoClave');

const repositorioUsuario = new RepositorioUsuario(db);
const repositorioAlbum = new RepositorioAlbum(db);
const repositorioDocumento = new RepositorioDocumento(db);
const repositorioRestablecimientoClave = new RepositorioRestablecimientoClave(db);

// Servicios Externos
const ServicioCorreo = require('./servicios/externo/ServicioCorreo');
const ServicioAlmacenamiento = require('./servicios/externo/ServicioAlmacenamiento');

const servicioCorreo = new ServicioCorreo(configuracionApp.smtp);
const servicioAlmacenamiento = new ServicioAlmacenamiento(configuracionApp.rutas);

// Servicios de Negocio
const ServicioAutenticacion = require('./servicios/ServicioAutenticacion');
const ServicioAlbum = require('./servicios/ServicioAlbum');
const ServicioDocumento = require('./servicios/ServicioDocumento');

const servicioAutenticacion = new ServicioAutenticacion(repositorioUsuario, repositorioRestablecimientoClave, servicioCorreo);
const servicioAlbum = new ServicioAlbum(repositorioAlbum, servicioAlmacenamiento);
const servicioDocumento = new ServicioDocumento(repositorioDocumento, servicioAlmacenamiento, configuracionApp);

// Controladores
const ControladorAutenticacion = require('./controladores/ControladorAutenticacion');
const ControladorAlbum = require('./controladores/ControladorAlbum');
const ControladorDocumento = require('./controladores/ControladorDocumento');

const controladorAutenticacion = new ControladorAutenticacion(servicioAutenticacion);
const controladorAlbum = new ControladorAlbum(servicioAlbum);
const controladorDocumento = new ControladorDocumento(servicioDocumento);

// Exportar instancias listas para usar
module.exports = {
    configuracionApp,
    gestorBaseDatos,
    controladorAutenticacion,
    controladorAlbum,
    controladorDocumento,
};
