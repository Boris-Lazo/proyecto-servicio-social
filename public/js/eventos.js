// eventos.js - Galería dinámica de eventos con lightbox

// ---------- VARIABLES GLOBALES ----------
let albums = [];
let currentAlbum = null;
let currentPhotoIndex = 0;

// ---------- ELEMENTOS DEL DOM ----------
const albumsContainer = document.getElementById('albums-container');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxCounter = document.getElementById('lightbox-counter');
const lightboxInfo = document.getElementById('lightbox-info');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');

// ---------- CARGAR ÁLBUMES ----------
async function loadAlbums() {
    try {
        albumsContainer.innerHTML = '<div class="loading-message">Cargando eventos...</div>';

        const response = await fetch('/api/albums');

        if (!response.ok) {
            throw new Error('Error al cargar álbumes');
        }

        albums = await response.json();

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
        const card = createAlbumCard(album);
        albumsContainer.appendChild(card);
    });
}

// ---------- CREAR TARJETA DE ÁLBUM ----------
function createAlbumCard(album) {
    const card = document.createElement('div');
    card.className = 'album-card';

    // Imagen de portada (primera foto)
    const coverUrl = `/api/uploads/${album.id}/${album.fotos[0]}`;

    // Formatear fecha
    const date = new Date(album.fecha);
    const formattedDate = date.toLocaleDateString('es-SV', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const safeTitle = sanitizeHTML(album.titulo);
    const safeDescription = sanitizeHTML(album.descripcion);

    card.innerHTML = `
        <div class="album-cover">
            <img src="${coverUrl}" alt="Portada de ${safeTitle}" loading="lazy">
            <div class="album-photo-count">📸 ${album.fotos.length}</div>
        </div>
        <div class="album-info">
            <h3>${safeTitle}</h3>
            <div class="album-date">${formattedDate}</div>
            ${safeDescription ? `<p class="album-description">${safeDescription}</p>` : ''}
        </div>
        <div class="album-thumbnails" data-album-id="${album.id}"></div>
    `;

    // Renderizar miniaturas
    const thumbnailsContainer = card.querySelector('.album-thumbnails');
    album.fotos.forEach((foto, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = 'album-thumbnail';
        thumbnail.innerHTML = `<img src="/api/uploads/${album.id}/${foto}" alt="Foto ${index + 1}" loading="lazy">`;

        // Abrir lightbox al hacer click
        thumbnail.addEventListener('click', () => {
            openLightbox(album, index);
        });

        thumbnailsContainer.appendChild(thumbnail);
    });

    return card;
}

// ---------- ABRIR LIGHTBOX ----------
function openLightbox(album, photoIndex) {
    currentAlbum = album;
    currentPhotoIndex = photoIndex;

    updateLightboxContent();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevenir scroll
}

// ---------- CERRAR LIGHTBOX ----------
function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Restaurar scroll
    currentAlbum = null;
    currentPhotoIndex = 0;
}

// ---------- ACTUALIZAR CONTENIDO DEL LIGHTBOX ----------
function updateLightboxContent() {
    if (!currentAlbum) return;

    const foto = currentAlbum.fotos[currentPhotoIndex];
    const imageUrl = `/api/uploads/${currentAlbum.id}/${foto}`;

    // Actualizar imagen
    lightboxImage.src = imageUrl;
    lightboxImage.alt = `${currentAlbum.titulo} - Foto ${currentPhotoIndex + 1}`;

    // Actualizar contador
    lightboxCounter.textContent = `${currentPhotoIndex + 1} / ${currentAlbum.fotos.length}`;

    // Actualizar información del álbum
    const date = new Date(currentAlbum.fecha);
    const formattedDate = date.toLocaleDateString('es-SV', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const safeTitle = sanitizeHTML(currentAlbum.titulo);

    lightboxInfo.innerHTML = `
        <h3>${safeTitle}</h3>
        <p>${formattedDate}</p>
    `;

    // Mostrar/ocultar botones de navegación
    lightboxPrev.style.display = currentPhotoIndex > 0 ? 'flex' : 'none';
    lightboxNext.style.display = currentPhotoIndex < currentAlbum.fotos.length - 1 ? 'flex' : 'none';
}

// ---------- NAVEGACIÓN EN LIGHTBOX ----------
function showPreviousPhoto() {
    if (currentPhotoIndex > 0) {
        currentPhotoIndex--;
        updateLightboxContent();
    }
}

function showNextPhoto() {
    if (currentPhotoIndex < currentAlbum.fotos.length - 1) {
        currentPhotoIndex++;
        updateLightboxContent();
    }
}

// ---------- EVENT LISTENERS ----------

// Botón cerrar
lightboxClose.addEventListener('click', closeLightbox);

// Botones de navegación
lightboxPrev.addEventListener('click', showPreviousPhoto);
lightboxNext.addEventListener('click', showNextPhoto);

// Click fuera de la imagen para cerrar
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        closeLightbox();
    }
});

// Teclado
document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    switch (e.key) {
        case 'Escape':
            closeLightbox();
            break;
        case 'ArrowLeft':
            showPreviousPhoto();
            break;
        case 'ArrowRight':
            showNextPhoto();
            break;
    }
});

// ---------- INICIALIZAR ----------
loadAlbums();
