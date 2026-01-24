// documentos.js - Página dinámica de documentos

// ---------- VARIABLES GLOBALES ----------
let documentos = [];

// ---------- ELEMENTOS DEL DOM ----------
const contenedorDocs = document.getElementById('documentos-container');

// ---------- CARGAR DOCUMENTOS ----------
async function cargarDocumentos() {
    try {
        contenedorDocs.innerHTML = '<div class="loading-message">Cargando documentos...</div>';
        documentos = await api.obtener('/api/documentos');

        if (documentos.length === 0) {
            contenedorDocs.innerHTML = '<div class="empty-message">No hay documentos publicados aún.<br>Vuelve pronto para consultar los documentos de rendición de cuentas.</div>';
            return;
        }

        renderizarDocumentos();
    } catch (error) {
        console.error('Error al cargar documentos:', error);
        contenedorDocs.innerHTML = '<div class="error-message">Error al cargar los documentos.<br>Por favor, intenta nuevamente más tarde.</div>';
    }
}

// ---------- ORGANIZAR DOCUMENTOS POR AÑO Y MES ----------
function organizarDocumentosPorFecha() {
    const organizados = {};

    documentos.forEach(doc => {
        const [anio, mes] = doc.mes.split('-');

        if (!organizados[anio]) {
            organizados[anio] = {};
        }

        if (!organizados[anio][mes]) {
            organizados[anio][mes] = [];
        }

        organizados[anio][mes].push(doc);
    });

    return organizados;
}

// ---------- RENDERIZAR DOCUMENTOS ----------
function renderizarDocumentos() {
    contenedorDocs.innerHTML = '';

    const organizados = organizarDocumentosPorFecha();

    // Ordenar años de más reciente a más antiguo
    const anios = Object.keys(organizados).sort((a, b) => b - a);

    anios.forEach(anio => {
        const seccionAnio = document.createElement('div');
        seccionAnio.className = 'year-section';

        const encabezadoAnio = document.createElement('h2');
        encabezadoAnio.className = 'year-header';
        encabezadoAnio.textContent = `📅 ${anio}`;
        seccionAnio.appendChild(encabezadoAnio);

        // Ordenar meses de más reciente a más antiguo
        const meses = Object.keys(organizados[anio]).sort((a, b) => b - a);

        meses.forEach(mes => {
            const documentosMes = organizados[anio][mes];
            const nombreMes = obtenerNombreMes(parseInt(mes));

            const seccionMes = document.createElement('div');
            seccionMes.className = 'month-section';

            const encabezadoMes = document.createElement('h3');
            encabezadoMes.className = 'month-header';
            encabezadoMes.textContent = `${nombreMes} ${anio}`;
            seccionMes.appendChild(encabezadoMes);

            const cuadriculaDocs = document.createElement('div');
            cuadriculaDocs.className = 'documentos-grid';

            documentosMes.forEach(doc => {
                const tarjeta = crearTarjetaDocumento(doc);
                cuadriculaDocs.appendChild(tarjeta);
            });

            seccionMes.appendChild(cuadriculaDocs);
            seccionAnio.appendChild(seccionMes);
        });

        contenedorDocs.appendChild(seccionAnio);
    });
}

// ---------- CREAR TARJETA DE DOCUMENTO ----------
function crearTarjetaDocumento(doc) {
    const enlaceTarjeta = document.createElement('a');
    enlaceTarjeta.href = `/api/docs/file/${doc.nombre_archivo}`;
    enlaceTarjeta.target = '_blank';
    enlaceTarjeta.className = 'documento-tarjeta-link';

    const tituloSeguro = sanearHTML(doc.titulo);
    enlaceTarjeta.setAttribute('aria-label', `Ver documento ${tituloSeguro}`);

    // URL de la miniatura
    const urlMiniatura = `/api/documentos/miniatura/${doc.nombre_archivo}`;

    enlaceTarjeta.innerHTML = `
        <article class="documento-tarjeta">
            <div class="documento-preview">
                <img src="${urlMiniatura}" alt="Vista previa de ${tituloSeguro}" loading="lazy">
            </div>
            <h4>${tituloSeguro}</h4>
        </article>
    `;

    return enlaceTarjeta;
}

// ---------- OBTENER NOMBRE DEL MES ----------
function obtenerNombreMes(numeroMes) {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[numeroMes - 1];
}

// ---------- INICIALIZAR ----------
cargarDocumentos();
