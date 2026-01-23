/**
 * Script para regenerar thumbnails de todos los documentos PDF existentes
 */
const path = require('path');
const fs = require('fs').promises;
const sqlite3 = require('sqlite3').verbose();

// Configuración de rutas
const RUTAS = {
    db: path.join(__dirname, '..', 'base_de_datos', 'escuela.sqlite'),
    docs: path.join(__dirname, '..', 'upload', 'docs'),
    thumbnails: path.join(__dirname, '..', 'upload', 'thumbnails')
};

/**
 * Genera miniatura de un PDF
 */
async function generarMiniatura(nombreArchivo) {
    const rutaPdf = path.join(RUTAS.docs, nombreArchivo);
    const rutaMiniatura = path.join(RUTAS.thumbnails, `${nombreArchivo}.png`);

    try {
        // Verificar que el PDF existe
        await fs.access(rutaPdf);

        // Importar pdf-to-img (ESM)
        const { pdf } = await import('pdf-to-img');

        // Generar miniatura
        console.log(`  Generando thumbnail para: ${nombreArchivo}`);
        const documento = await pdf(rutaPdf, { scale: 2.0 });
        const primeraPagina = await documento.getPage(1);
        await fs.writeFile(rutaMiniatura, primeraPagina);

        console.log(`  ✅ Thumbnail generado: ${nombreArchivo}.png`);
        return true;
    } catch (err) {
        console.error(`  ❌ Error con ${nombreArchivo}:`, err.message);
        return false;
    }
}

/**
 * Obtiene todos los documentos de la base de datos
 */
function obtenerDocumentos() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(RUTAS.db, (err) => {
            if (err) {
                reject(err);
                return;
            }
        });

        db.all('SELECT id, titulo, filename FROM docs', [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            db.close();
            resolve(rows);
        });
    });
}

/**
 * Función principal
 */
async function main() {
    console.log('🔄 Iniciando regeneración de thumbnails...\n');

    try {
        // Verificar que la carpeta de thumbnails existe
        await fs.mkdir(RUTAS.thumbnails, { recursive: true });

        // Obtener documentos de la base de datos
        const documentos = await obtenerDocumentos();
        console.log(`📁 Encontrados ${documentos.length} documentos en la base de datos\n`);

        if (documentos.length === 0) {
            console.log('⚠️  No hay documentos para procesar');
            return;
        }

        // Generar thumbnails
        let exitosos = 0;
        let fallidos = 0;

        for (const doc of documentos) {
            console.log(`\n[${doc.id}] ${doc.titulo}`);
            const exito = await generarMiniatura(doc.filename);
            if (exito) {
                exitosos++;
            } else {
                fallidos++;
            }
        }

        // Resumen
        console.log('\n' + '='.repeat(50));
        console.log('📊 RESUMEN');
        console.log('='.repeat(50));
        console.log(`✅ Exitosos: ${exitosos}`);
        console.log(`❌ Fallidos: ${fallidos}`);
        console.log(`📁 Total: ${documentos.length}`);
        console.log('='.repeat(50));

        if (exitosos > 0) {
            console.log(`\n✨ Los thumbnails están guardados en: ${RUTAS.thumbnails}`);
        }

    } catch (err) {
        console.error('❌ Error fatal:', err);
        process.exit(1);
    }
}

// Ejecutar
main();
