// eventos.js - Galería dinámica de eventos con lightbox (Shared Logic)

// ---------- VARIABLES GLOBALES ----------
let albums = [];

// ---------- ELEMENTOS DEL DOM ----------
const albumsContainer = document.getElementById('albums-container');

// ---------- CARGAR ÁLBUMES ----------
async function loadAlbums() {
    try {
        albumsContainer.innerHTML = '<div class="loading-message">Cargando eventos...</div>';
        albums = await api.get('/api/albums');

        if (albums.length === 0) {
            albumsContainer.innerHTML = '<div class="empty-message">No hay eventos publicados aún.<br>Vuelve pronto para ver las fotos de nuestros eventos.</div>';
            return;
        }

        renderAlbums();
    } catch (error) {
        console.error('Error al cargar álbumes:', error);
        albumsContainer.innerHTML = '<div class="error-message">Error al cargar los eventos.<br>Por favor, intenta nuevamente más tarde.</div>';
    }
}

// ---------- RENDERIZAR ÁLBUMES ----------
function renderAlbums() {
    albumsContainer.innerHTML = '';

    albums.forEach(album => {
        const card = createCollageCard(album);
        albumsContainer.appendChild(card);
    });
}

// ---------- CREAR TARJETA TIPO COLLAGE (Exportable logic if needed) ----------
window.createCollageCard = function (album) {
    const card = document.createElement('div');
    card.className = 'album-card';

    const safeTitle = sanitizeHTML(album.titulo);
    const safeDescription = sanitizeHTML(album.descripcion);
    const totalPhotos = album.fotos.length;

    const date = new Date(album.fecha);
    const formattedDate = date.toLocaleDateString('es-SV', { year: 'numeric', month: 'long', day: 'numeric' });

    // --- Construcción del Collage Grid ---
    const collageContainer = document.createElement('div');
    collageContainer.className = 'album-collage';

    // 1. Foto Principal (Izquierda, Grande)
    if (totalPhotos > 0) {
        const main = document.createElement('div');
        main.className = 'collage-item main';
        main.innerHTML = `<img src="/api/uploads/${album.id}/${album.fotos[0]}" alt="${safeTitle}" loading="lazy">`;
        main.onclick = () => window.openLightbox(album, 0); // Usar global
        collageContainer.appendChild(main);
    }

    // 2. Foto Secundaria Superior (Derecha Arriba)
    if (totalPhotos > 1) {
        const sub1 = document.createElement('div');
        sub1.className = 'collage-item sub';
        sub1.innerHTML = `<img src="/api/uploads/${album.id}/${album.fotos[1]}" alt="Foto 2" loading="lazy">`;
        sub1.onclick = () => window.openLightbox(album, 1);
        collageContainer.appendChild(sub1);
    } else {
        // Filler vacío si falta layout
        collageContainer.appendChild(createFiller());
    }

    // 3. Foto Secundaria Inferior (Derecha Abajo) + Overlay
    if (totalPhotos > 2) {
        const sub2 = document.createElement('div');
        sub2.className = 'collage-item sub';

        let content = `<img src="/api/uploads/${album.id}/${album.fotos[2]}" alt="Foto 3" loading="lazy">`;
        if (totalPhotos > 3) {
            content += `<div class="more-photos-overlay">+${totalPhotos - 3}</div>`;
        }

        sub2.innerHTML = content;
        sub2.onclick = () => window.openLightbox(album, 2); // Si hay +N, abre en la 3ra foto, usuario navega
        collageContainer.appendChild(sub2);
    } else {
        collageContainer.appendChild(createFiller());
    }

    // --- Info ---
    const infoDiv = document.createElement('div');
    infoDiv.className = 'album-info';
    infoDiv.innerHTML = `
        <h3>${safeTitle}</h3>
        <div class="album-date">${formattedDate}</div>
        ${safeDescription ? `<p class="album-description">${safeDescription}</p>` : ''}
    `;

    card.appendChild(collageContainer);
    card.appendChild(infoDiv);

    return card;
};

function createFiller() {
    const div = document.createElement('div');
    div.className = 'collage-item sub';
    div.style.background = '#f5f5f5';
    return div;
}

// ---------- INICIALIZAR ----------
loadAlbums();
