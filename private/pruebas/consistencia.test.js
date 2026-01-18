/**
 * Pruebas de consistencia básica para asegurar que el entorno de pruebas funciona.
 */
describe('Prueba de Consistencia Básica', () => {
    test('debería pasar una prueba de verdad básica', () => {
        expect(true).toBe(true);
    });

    test('debería ser capaz de realizar operaciones matemáticas simples', () => {
        expect(1 + 1).toBe(2);
    });
});
