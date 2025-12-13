// index-dynamic.js - Contenido dinámico para la página de inicio

// ---------- CARGAR ÚLTIMO ÁLBUM ----------
async function loadLatestAlbum() {
    const container = document.getElementById('latest-album-container');

    try {
        const response = await fetch('/api/albums');

        if (!response.ok) {
            throw new Error('Error al cargar álbumes');
        }

        const albums = await response.json();

        if (albums.length === 0) {
            container.innerHTML = '<p class="no-content">No hay eventos publicados aún.</p>';
            return;
        }

        // Tomar el primer álbum (más reciente)
        const latestAlbum = albums[0];
        renderAlbumPreview(latestAlbum, container);

    } catch (error) {
        console.error('Error al cargar último álbum:', error);
        container.innerHTML = '<p class="error-content">Error al cargar eventos.</p>';
    }
}

// ---------- RENDERIZAR PREVIEW DE ÁLBUM ----------
function renderAlbumPreview(album, container) {
    const coverUrl = `/api/uploads/${album.id}/${album.fotos[0]}`;

    const date = new Date(album.fecha);
    const formattedDate = date.toLocaleDateString('es-SV', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const safeTitle = sanitizeHTML(album.titulo);
    const safeDescription = sanitizeHTML(album.descripcion);

    container.innerHTML = `
        <div class="preview-card">
            <div class="preview-image">
                <img src="${coverUrl}" alt="${safeTitle}" loading="lazy">
                <div class="preview-badge">📸 ${album.fotos.length} fotos</div>
            </div>
            <div class="preview-content">
                <h3>${safeTitle}</h3>
                <p class="preview-date">📅 ${formattedDate}</p>
                ${safeDescription ? `<p class="preview-desc">${safeDescription}</p>` : ''}
            </div>
        </div>
        <a href="eventos.html" class="btn-cta">Ver todos los eventos →</a>
    `;
}

// ---------- CARGAR ÚLTIMO DOCUMENTO ----------
async function loadLatestDocument() {
    const container = document.getElementById('latest-doc-container');

    try {
        const response = await fetch('/api/docs');

        if (!response.ok) {
            throw new Error('Error al cargar documentos');
        }

        const docs = await response.json();

        if (docs.length === 0) {
            container.innerHTML = '<p class="no-content">No hay documentos publicados aún.</p>';
            return;
        }

        // Tomar el primer documento (más reciente)
        const latestDoc = docs[0];
        renderDocumentPreview(latestDoc, container);

    } catch (error) {
        console.error('Error al cargar último documento:', error);
        container.innerHTML = '<p class="error-content">Error al cargar documentos.</p>';
    }
}

// ---------- RENDERIZAR PREVIEW DE DOCUMENTO ----------
function renderDocumentPreview(doc, container) {
    const [year, month] = doc.mes.split('-');
    const monthName = getMonthName(parseInt(month));
    const safeTitle = sanitizeHTML(doc.titulo);

    container.innerHTML = `
        <div class="preview-card doc-preview">
            <div class="doc-icon">📄</div>
            <div class="preview-content">
                <h3>${safeTitle}</h3>
                <p class="preview-date">📅 ${monthName} ${year}</p>
                <span class="doc-badge">PDF</span>
            </div>
        </div>
        <a href="documentos.html" class="btn-cta">Ver todos los documentos →</a>
    `;
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
loadLatestAlbum();
loadLatestDocument();
