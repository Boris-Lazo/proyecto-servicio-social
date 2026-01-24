// documentos.js – Lógica para la página de documentos de rendición de cuentas

// ---------- UTILIDADES ----------
function $(id) { return document.getElementById(id); }

// ---------- ESTADO GLOBAL ----------
let documentos = [];

// ---------- CARGAR DOCUMENTOS ----------
async function cargarDocumentos() {
    const contenedor = $('documentos-grid');

    try {
        documentos = await api.obtener('/api/documentos');

        if (documentos.length === 0) {
            contenedor.innerHTML = `
                <div class="no-documentos">
                    <img src="img/docs-empty.svg" alt="No hay documentos" class="empty-icon">
                    <p>No hay documentos publicados aún.</p>
                    <p class="subtext">Vuelve pronto para consultar los documentos de rendición de cuentas.</p>
                </div>
            `;
            return;
        }

        renderizarDocumentos(documentos);

    } catch (error) {
        console.error('Error al cargar documentos:', error);
        contenedor.innerHTML = '<p class="error-msg">Error al cargar los documentos. Por favor, intenta más tarde.</p>';
    }
}

// ---------- RENDERIZAR DOCUMENTOS ----------
function renderizarDocumentos(lista) {
    const contenedor = $('documentos-grid');
    contenedor.innerHTML = '';

    lista.forEach(doc => {
        const tarjeta = crearTarjetaDocumento(doc);
        contenedor.appendChild(tarjeta);
    });
}

// ---------- CREAR TARJETA DE DOCUMENTO ----------
function crearTarjetaDocumento(doc) {
    const [anio, mes] = doc.mes.split('-');
    const nombresMeses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const nombreMes = nombresMeses[parseInt(mes) - 1];

    const tarjeta = document.createElement('div');
    tarjeta.className = 'documento-tarjeta';

    const tituloSeguro = sanearHTML(doc.titulo);

    // Enlace que envuelve toda la tarjeta
    const enlaceTarjeta = document.createElement('a');
    enlaceTarjeta.href = `/api/documentos/archivo/${doc.nombre_archivo}`;
    enlaceTarjeta.target = '_blank';
    enlaceTarjeta.className = 'documento-link';
    enlaceTarjeta.setAttribute('aria-label', `Ver documento: ${tituloSeguro}`);

    // Cuerpo de la tarjeta
    const contenido = `
        <div class="documento-header">
            <span class="badge-pdf">PDF</span>
            <span class="doc-anio">${anio}</span>
        </div>
        <div class="documento-cuerpo">
            <div class="documento-icono">
                <img src="/api/documentos/miniatura/${doc.nombre_archivo}" alt="Icono PDF"
                     onerror="this.src='img/pdf-fallback.png'">
            </div>
            <h3>${tituloSeguro}</h3>
            <p class="documento-mes">${nombreMes}</p>
        </div>
        <div class="documento-footer">
            <span class="btn-ver">Ver Documento</span>
        </div>
    `;

    enlaceTarjeta.innerHTML = contenido;
    tarjeta.appendChild(enlaceTarjeta);

    return tarjeta;
}

// ---------- INICIALIZAR ----------
document.addEventListener('DOMContentLoaded', () => {
    cargarDocumentos();
});
