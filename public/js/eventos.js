// eventos.js - Galería dinámica de eventos con lightbox (Shared Logic)

// ---------- VARIABLES GLOBALES ----------
let albumes = [];

// ---------- ELEMENTOS DEL DOM ----------
const contenedorAlbumes = document.getElementById('albums-container');

// ---------- CARGAR ÁLBUMES ----------
async function cargarAlbumes() {
    try {
        contenedorAlbumes.innerHTML = '<div class="loading-message">Cargando eventos...</div>';
        albumes = await api.obtener('/api/albumes');

        if (albumes.length === 0) {
            contenedorAlbumes.innerHTML = '<div class="empty-message">No hay eventos publicados aún.<br>Vuelve pronto para ver las fotos de nuestros eventos.</div>';
            return;
        }

        renderizarAlbumes();
    } catch (error) {
        console.error('Error al cargar álbumes:', error);
        contenedorAlbumes.innerHTML = '<div class="error-message">Error al cargar los eventos.<br>Por favor, intenta nuevamente más tarde.</div>';
    }
}

// ---------- RENDERIZAR ÁLBUMES ----------
function renderizarAlbumes() {
    contenedorAlbumes.innerHTML = '';

    albumes.forEach(album => {
        const tarjeta = crearTarjetaCollage(album);
        contenedorAlbumes.appendChild(tarjeta);
    });
}

// ---------- CREAR TARJETA TIPO COLLAGE (Exportable logic if needed) ----------
window.crearTarjetaCollage = function (album) {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'album-tarjeta';

    const tituloSeguro = sanearHTML(album.titulo);
    const descripcionSegura = sanearHTML(album.descripcion);
    const totalFotos = album.fotos.length;

    const fecha = new Date(album.fecha);
    const fechaFormateada = fecha.toLocaleDateString('es-SV', { year: 'numeric', month: 'long', day: 'numeric' });

    // --- Construcción del Collage Grid ---
    const contenedorCollage = document.createElement('div');
    contenedorCollage.className = 'album-collage';

    // 1. Foto Principal (Izquierda, Grande)
    if (totalFotos > 0) {
        const principal = document.createElement('div');
        principal.className = 'collage-item principal';
        principal.innerHTML = `<img src="/api/albumes/fotos/${album.id}/${album.fotos[0]}" alt="${tituloSeguro}" loading="lazy">`;
        principal.onclick = () => window.abrirGaleria(album, 0); // Usar global
        contenedorCollage.appendChild(principal);
    }

    // 2. Foto Secundaria Superior (Derecha Arriba)
    if (totalFotos > 1) {
        const sub1 = document.createElement('div');
        sub1.className = 'collage-item sub';
        sub1.innerHTML = `<img src="/api/albumes/fotos/${album.id}/${album.fotos[1]}" alt="Foto 2" loading="lazy">`;
        sub1.onclick = () => window.abrirGaleria(album, 1);
        contenedorCollage.appendChild(sub1);
    } else {
        // Filler vacío si falta layout
        contenedorCollage.appendChild(crearRelleno());
    }

    // 3. Foto Secundaria Inferior (Derecha Abajo) + Overlay
    if (totalFotos > 2) {
        const sub2 = document.createElement('div');
        sub2.className = 'collage-item sub';

        let contenido = `<img src="/api/albumes/fotos/${album.id}/${album.fotos[2]}" alt="Foto 3" loading="lazy">`;
        if (totalFotos > 3) {
            contenido += `<div class="more-photos-overlay">+${totalFotos - 3}</div>`;
        }

        sub2.innerHTML = contenido;
        sub2.onclick = () => window.abrirGaleria(album, 2); // Si hay +N, abre en la 3ra foto, usuario navega
        contenedorCollage.appendChild(sub2);
    } else {
        contenedorCollage.appendChild(crearRelleno());
    }

    // --- Info ---
    const divInfo = document.createElement('div');
    divInfo.className = 'album-info';
    divInfo.innerHTML = `
        <h3>${tituloSeguro}</h3>
        <div class="album-fecha">${fechaFormateada}</div>
        ${descripcionSegura ? `<p class="album-description">${descripcionSegura}</p>` : ''}
    `;

    tarjeta.appendChild(contenedorCollage);
    tarjeta.appendChild(divInfo);

    return tarjeta;
};

function crearRelleno() {
    const div = document.createElement('div');
    div.className = 'collage-item sub';
    div.style.background = '#f5f5f5';
    return div;
}

// ---------- INICIALIZAR ----------
cargarAlbumes();
