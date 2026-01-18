// documentos.js - Página dinámica de documentos

// ---------- VARIABLES GLOBALES ----------
let documents = [];

// ---------- ELEMENTOS DEL DOM ----------
const docsContainer = document.getElementById('documentos-container');

// ---------- CARGAR DOCUMENTOS ----------
async function loadDocuments() {
    try {
        docsContainer.innerHTML = '<div class="loading-message">Cargando documentos...</div>';
        documents = await api.get('/api/docs');

        if (documents.length === 0) {
            docsContainer.innerHTML = '<div class="empty-message">No hay documentos publicados aún.<br>Vuelve pronto para consultar los documentos de rendición de cuentas.</div>';
            return;
        }

        renderDocuments();
    } catch (error) {
        console.error('Error al cargar documentos:', error);
        docsContainer.innerHTML = '<div class="error-message">Error al cargar los documentos.<br>Por favor, intenta nuevamente más tarde.</div>';
    }
}

// ---------- ORGANIZAR DOCUMENTOS POR AÑO Y MES ----------
function organizeDocumentsByDate() {
    const organized = {};

    documents.forEach(doc => {
        const [year, month] = doc.mes.split('-');

        if (!organized[year]) {
            organized[year] = {};
        }

        if (!organized[year][month]) {
            organized[year][month] = [];
        }

        organized[year][month].push(doc);
    });

    return organized;
}

// ---------- RENDERIZAR DOCUMENTOS ----------
function renderDocuments() {
    docsContainer.innerHTML = '';

    const organized = organizeDocumentsByDate();

    // Ordenar años de más reciente a más antiguo
    const years = Object.keys(organized).sort((a, b) => b - a);

    years.forEach(year => {
        const yearSection = document.createElement('div');
        yearSection.className = 'year-section';

        const yearHeader = document.createElement('h2');
        yearHeader.className = 'year-header';
        yearHeader.textContent = `📅 ${year}`;
        yearSection.appendChild(yearHeader);

        // Ordenar meses de más reciente a más antiguo
        const months = Object.keys(organized[year]).sort((a, b) => b - a);

        months.forEach(month => {
            const monthDocs = organized[year][month];
            const monthName = getMonthName(parseInt(month));

            const monthSection = document.createElement('div');
            monthSection.className = 'month-section';

            const monthHeader = document.createElement('h3');
            monthHeader.className = 'month-header';
            monthHeader.textContent = `${monthName} ${year}`;
            monthSection.appendChild(monthHeader);

            const docsGrid = document.createElement('div');
            docsGrid.className = 'documentos-grid';

            monthDocs.forEach(doc => {
                const card = createDocumentCard(doc);
                docsGrid.appendChild(card);
            });

            monthSection.appendChild(docsGrid);
            yearSection.appendChild(monthSection);
        });

        docsContainer.appendChild(yearSection);
    });
}

// ---------- CREAR TARJETA DE DOCUMENTO ----------
function createDocumentCard(doc) {
    const cardLink = document.createElement('a');
    cardLink.href = `/api/docs/file/${doc.filename}`;
    cardLink.target = '_blank';
    cardLink.className = 'documento-card-link';

    const safeTitle = sanitizeHTML(doc.titulo);
    cardLink.setAttribute('aria-label', `Ver documento ${safeTitle}`);

    const downloadUrl = `/api/docs/file/${doc.filename}`;
    // URL del thumbnail
    const thumbnailUrl = `/api/docs/thumbnail/${doc.filename}`;

    cardLink.innerHTML = `
        <article class="documento-card">
            <div class="documento-preview">
                <img src="${thumbnailUrl}" alt="Vista previa de ${safeTitle}" loading="lazy">
            </div>
            <h4>${safeTitle}</h4>
        </article>
    `;

    return cardLink;
}

// ---------- OBTENER NOMBRE DEL MES ----------
function getMonthName(monthNumber) {
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[monthNumber - 1];
}

// ---------- INICIALIZAR ----------
loadDocuments();
