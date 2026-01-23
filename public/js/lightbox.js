// lightbox.js - Lógica compartida para el visor de imágenes (Lightbox)

// Variables Globales para el estado del visor
let _visor_albumActual = null;
let _visor_indiceActual = 0;

// Elementos del DOM
let _el_visor = null;
let _el_imagen = null;
let _el_contador = null;
let _el_info = null;
let _el_barraLateral = null; // Contenedor de miniaturas

/**
 * Inicializa los elementos del DOM y los eventos del visor
 */
function inicializarElementosVisor() {
    _el_visor = document.getElementById('lightbox');
    _el_imagen = document.getElementById('lightbox-image');
    _el_contador = document.getElementById('lightbox-counter');
    _el_info = document.getElementById('lightbox-info');
    _el_barraLateral = document.querySelector('.lightbox-sidebar');

    // Configurar eventos globales (solo una vez)
    if (_el_visor && !_el_visor.dataset.inicializado) {
        document.getElementById('lightbox-close').addEventListener('click', cerrarVisor);
        document.getElementById('lightbox-prev').addEventListener('click', mostrarFotoAnterior);
        document.getElementById('lightbox-next').addEventListener('click', mostrarSiguienteFoto);

        // Soporte para navegación con teclado
        document.addEventListener('keydown', (evento) => {
            if (!_el_visor.classList.contains('active')) return;
            if (evento.key === 'Escape') cerrarVisor();
            if (evento.key === 'ArrowLeft') mostrarFotoAnterior();
            if (evento.key === 'ArrowRight') mostrarSiguienteFoto();
        });

        _el_visor.dataset.inicializado = 'true';
    }
}

/**
 * Abre el visor de imágenes con un álbum y una imagen específica
 * @param {Object} album - Datos del álbum
 * @param {number} indice - Índice de la imagen a mostrar
 */
window.openLightbox = function (album, indice) {
    _visor_albumActual = album;
    _visor_indiceActual = indice;

    inicializarElementosVisor();

    if (!_el_visor) {
        console.error('La estructura HTML del visor (lightbox) no fue encontrada en el DOM.');
        return;
    }

    actualizarContenidoVisor();
    _el_visor.classList.add('active');
    document.body.style.overflow = 'hidden'; // Bloquear desplazamiento de la página
};

/**
 * Cierra el visor de imágenes
 */
window.cerrarVisor = function () {
    if (_el_visor) _el_visor.classList.remove('active');
    document.body.style.overflow = '';
    _visor_albumActual = null;
};

/**
 * Actualiza la imagen y la información mostrada en el visor
 */
function actualizarContenidoVisor() {
    if (!_visor_albumActual) return;

    const foto = _visor_albumActual.fotos[_visor_indiceActual];
    const urlImagen = `/api/uploads/${_visor_albumActual.id}/${foto}`;

    // 1. Cargar la imagen principal con un efecto suave
    _el_imagen.style.opacity = '0.5';
    setTimeout(() => {
        _el_imagen.src = urlImagen;
        _el_imagen.style.opacity = '1';
    }, 150);

    // 2. Actualizar contador e información del álbum
    const total = _visor_albumActual.fotos.length;
    if (_el_contador) _el_contador.textContent = `${_visor_indiceActual + 1} / ${total}`;

    if (_el_info) {
        const fecha = new Date(_visor_albumActual.fecha).toLocaleDateString();
        _el_info.innerHTML = `
            <h3>${sanitizeHTML(_visor_albumActual.titulo)}</h3>
            <p>📅 ${fecha} • 📸 Foto ${_visor_indiceActual + 1} de ${total}</p>
        `;
    }

    // 3. Renderizar la barra lateral de miniaturas
    renderizarMiniaturas();

    // 4. Renderizar vista móvil (Scroll vertical)
    renderizarVistaMovil();
}

/**
 * Renderiza la vista de scroll vertical para móviles
 */
function renderizarVistaMovil() {
    const elMovil = document.getElementById('lightbox-mobile-scroll');
    if (!elMovil) return;

    // Si ya tiene contenido del álbum actual, no rehacerlo
    if (elMovil.dataset.albumId === _visor_albumActual.id) return;

    elMovil.dataset.albumId = _visor_albumActual.id;
    elMovil.innerHTML = '';

    // Header del álbum
    const fecha = new Date(_visor_albumActual.fecha).toLocaleDateString();
    const header = document.createElement('div');
    header.className = 'lightbox-mobile-header';
    header.innerHTML = `
        <h3>${sanitizeHTML(_visor_albumActual.titulo)}</h3>
        <p class="meta">📅 ${fecha}</p>
        ${_visor_albumActual.descripcion ? `<p class="desc">${sanitizeHTML(_visor_albumActual.descripcion)}</p>` : ''}
    `;
    elMovil.appendChild(header);

    // Lista de fotos
    _visor_albumActual.fotos.forEach(foto => {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'lightbox-mobile-item';

        const img = document.createElement('img');
        img.src = `/api/uploads/${_visor_albumActual.id}/${foto}`;
        img.loading = 'lazy';
        img.alt = 'Foto del evento';

        imgContainer.appendChild(img);
        elMovil.appendChild(imgContainer);
    });
}

/**
 * Dibuja las miniaturas de todas las fotos del álbum en la barra lateral
 */
function renderizarMiniaturas() {
    if (!_el_barraLateral) return;

    // Verificar si necesitamos regenerar las miniaturas (si cambió el álbum)
    const idAlbumActual = _el_barraLateral.dataset.albumId;

    if (idAlbumActual !== _visor_albumActual.id) {
        _el_barraLateral.innerHTML = '';
        _el_barraLateral.dataset.albumId = _visor_albumActual.id;

        _visor_albumActual.fotos.forEach((foto, indice) => {
            const img = document.createElement('img');
            img.src = `/api/uploads/${_visor_albumActual.id}/${foto}`;
            img.loading = 'lazy';

            const div = document.createElement('div');
            div.className = 'lightbox-thumb';
            div.appendChild(img);

            div.onclick = (evento) => {
                evento.stopPropagation();
                _visor_indiceActual = indice;
                actualizarContenidoVisor();
            };

            _el_barraLateral.appendChild(div);
        });
    }

    // Resaltar la miniatura de la foto actual
    const miniaturas = Array.from(_el_barraLateral.children);
    miniaturas.forEach((t, i) => {
        if (i === _visor_indiceActual) {
            t.classList.add('active');
            t.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            t.classList.remove('active');
        }
    });
}

/**
 * Navega a la siguiente fotografía
 */
function mostrarSiguienteFoto() {
    if (!_visor_albumActual) return;
    if (_visor_indiceActual < _visor_albumActual.fotos.length - 1) {
        _visor_indiceActual++;
        actualizarContenidoVisor();
    }
}

/**
 * Navega a la fotografía anterior
 */
function mostrarFotoAnterior() {
    if (_visor_indiceActual > 0) {
        _visor_indiceActual--;
        actualizarContenidoVisor();
    }
}

/**
 * Utilidad básica para sanitizar cadenas de texto (si no está disponible globalmente)
 */
function sanitizeHTML(cadena) {
    if (!cadena) return '';
    const temp = document.createElement('div');
    temp.textContent = cadena;
    return temp.innerHTML;
}
