const {
    controladorAlbum,
    controladorAutenticacion,
    controladorDocumento
} = require('../contenedor');

describe('Verificación de Arquitectura y Traducción', () => {
    test('Controlador de Álbum debería estar instanciado correctamente', () => {
        expect(controladorAlbum).toBeDefined();
        expect(typeof controladorAlbum.crearAlbum).toBe('function');
        expect(typeof controladorAlbum.listarAlbumes).toBe('function');
        expect(typeof controladorAlbum.eliminarAlbum).toBe('function');
    });

    test('Controlador de Autenticación debería estar instanciado correctamente', () => {
        expect(controladorAutenticacion).toBeDefined();
        expect(typeof controladorAutenticacion.iniciarSesion).toBe('function');
        expect(typeof controladorAutenticacion.recuperar).toBe('function');
    });

    test('Controlador de Documento debería estar instanciado correctamente', () => {
        expect(controladorDocumento).toBeDefined();
        expect(typeof controladorDocumento.crearDocumento).toBe('function');
        expect(typeof controladorDocumento.listarDocumentos).toBe('function');
    });
});
