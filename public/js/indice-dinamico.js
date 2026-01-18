// index-dynamic.js - Contenido dinámico para la página de inicio

// ---------- CARGAR ÚLTIMO ÁLBUM ----------
async function loadLatestAlbum() {
    const container = document.getElementById('latest-album-container');

    try {
        const albums = await api.obtener('/api/albums');

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
    container.innerHTML = ''; // Limpiar loader

    const card = document.createElement('div');
    card.className = 'album-card'; // Reusar clase album-card para estilo consistente

    const safeTitle = sanitizeHTML(album.titulo);
    const safeDescription = sanitizeHTML(album.descripcion);
    const totalPhotos = album.fotos.length;
    const date = new Date(album.fecha);
    const formattedDate = date.toLocaleDateString('es-SV', { year: 'numeric', month: 'long', day: 'numeric' });

    // Collage Container
    const collageContainer = document.createElement('div');
    collageContainer.className = 'album-collage';

    // 1. Main
    if (totalPhotos > 0) {
        const main = document.createElement('div');
        main.className = 'collage-item main';
        main.innerHTML = `<img src="/api/uploads/${album.id}/${album.fotos[0]}" alt="${safeTitle}" loading="lazy">`;
        main.onclick = () => window.openLightbox(album, 0);
        collageContainer.appendChild(main);
    }

    // 2. Sub 1
    if (totalPhotos > 1) {
        const sub1 = document.createElement('div');
        sub1.className = 'collage-item sub';
        sub1.innerHTML = `<img src="/api/uploads/${album.id}/${album.fotos[1]}" alt="Foto 2" loading="lazy">`;
        sub1.onclick = () => window.openLightbox(album, 1);
        collageContainer.appendChild(sub1);
    } else {
        collageContainer.appendChild(createFiller());
    }

    // 3. Sub 2 + Overlay
    if (totalPhotos > 2) {
        const sub2 = document.createElement('div');
        sub2.className = 'collage-item sub';
        let content = `<img src="/api/uploads/${album.id}/${album.fotos[2]}" alt="Foto 3" loading="lazy">`;
        if (totalPhotos > 3) {
            content += `<div class="more-photos-overlay">+${totalPhotos - 3}</div>`;
        }
        sub2.innerHTML = content;
        sub2.onclick = () => window.openLightbox(album, 2);
        collageContainer.appendChild(sub2);
    } else {
        collageContainer.appendChild(createFiller());
    }

    // Info
    const infoDiv = document.createElement('div');
    infoDiv.className = 'album-info';
    infoDiv.innerHTML = `
        <h3>${safeTitle}</h3>
        <div class="album-date">${formattedDate}</div>
        ${safeDescription ? `<p class="album-description">${safeDescription}</p>` : ''}
    `;

    card.appendChild(collageContainer);
    card.appendChild(infoDiv);

    container.appendChild(card);

    // Boton ver todos - alineado a la izquierda
    const btnContainer = document.createElement('div');
    btnContainer.style.marginTop = '1rem';
    btnContainer.style.textAlign = 'left';
    btnContainer.innerHTML = '<a href="eventos.html" class="btn-cta">Ver todos los eventos →</a>';
    container.appendChild(btnContainer);
}

function createFiller() {
    const div = document.createElement('div');
    div.className = 'collage-item sub';
    div.style.background = '#f5f5f5';
    return div;
}

// ---------- CARGAR ÚLTIMO DOCUMENTO ----------
async function loadLatestDocument() {
    const container = document.getElementById('latest-doc-container');

    try {
        const docs = await api.obtener('/api/docs');

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
    const downloadUrl = `/api/docs/file/${doc.filename}`;
    const thumbnailUrl = `/api/docs/thumbnail/${doc.filename}`;

    container.innerHTML = `
        <a href="${downloadUrl}" target="_blank" class="documento-card-link-index" aria-label="Ver documento ${safeTitle}">
            <div class="documento-card-index">
                <div class="documento-preview-index">
                    <img src="${thumbnailUrl}" alt="Vista previa de ${safeTitle}" loading="lazy">
                </div>
                <h4>${safeTitle}</h4>
                <p class="preview-date">${monthName} ${year}</p>
            </div>
        </a>
        <div style="margin-top: 1rem; text-align: left;">
            <a href="documentos.html" class="btn-cta">Ver todos los documentos →</a>
        </div>
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
