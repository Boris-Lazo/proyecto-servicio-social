// visor-imagenes.js - Lógica del Visor de Imágenes (Lightbox) en español

(function () {
    // ---------- ELEMENTOS DEL DOM ----------
    const visor = document.getElementById('lightbox');
    const imagenVisor = document.getElementById('lightbox-image');
    const infoVisor = document.getElementById('lightbox-info');
    const contadorVisor = document.getElementById('lightbox-counter');
    const btnCerrar = document.getElementById('lightbox-close');
    const btnPrev = document.getElementById('lightbox-prev');
    const btnSiguiente = document.getElementById('lightbox-next');
    const contenedorMiniaturas = document.querySelector('.lightbox-sidebar');
    const contenedorScrollMovil = document.getElementById('lightbox-mobile-scroll');

    // ---------- ESTADO ----------
    let albumActual = null;
    let indiceActual = 0;

    // ---------- FUNCIONES ----------

    /**
     * Abre el visor con un álbum y una imagen específica
     */
    window.abrirGaleria = function (album, indice = 0) {
        albumActual = album;
        indiceActual = indice;

        visor.classList.add('active');
        document.body.style.overflow = 'hidden'; // Bloquear scroll

        actualizarVisor();
        renderizarMiniaturas();
    };

    function cerrarVisor() {
        visor.classList.remove('active');
        document.body.style.overflow = '';
        albumActual = null;
    }

    function actualizarVisor() {
        if (!albumActual) return;

        const foto = albumActual.fotos[indiceActual];
        const urlFoto = `/api/albumes/fotos/${albumActual.id}/${foto}`;

        imagenVisor.src = urlFoto;
        imagenVisor.alt = `Foto ${indiceActual + 1} de ${albumActual.titulo}`;

        infoVisor.textContent = albumActual.titulo;
        contadorVisor.textContent = `${indiceActual + 1} / ${albumActual.fotos.length}`;

        // Actualizar miniaturas activas
        document.querySelectorAll('.thumb-item').forEach((item, i) => {
            item.classList.toggle('active', i === indiceActual);
        });

        // Auto-scroll en móvil
        const miniaturaMovil = contenedorScrollMovil.children[indiceActual];
        if (miniaturaMovil) {
            miniaturaMovil.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }

    function renderizarMiniaturas() {
        contenedorMiniaturas.innerHTML = '';
        contenedorScrollMovil.innerHTML = '';

        albumActual.fotos.forEach((foto, indice) => {
            const urlFoto = `/api/albumes/fotos/${albumActual.id}/${foto}`;

            // Miniatura lateral (escritorio)
            const item = document.createElement('div');
            item.className = `thumb-item ${indice === indiceActual ? 'active' : ''}`;
            item.innerHTML = `<img src="${urlFoto}" alt="Miniatura ${indice + 1}" loading="lazy">`;
            item.onclick = () => {
                indiceActual = indice;
                actualizarVisor();
            };
            contenedorMiniaturas.appendChild(item);

            // Miniatura scroll (móvil)
            const itemMovil = item.cloneNode(true);
            itemMovil.onclick = item.onclick;
            contenedorScrollMovil.appendChild(itemMovil);
        });
    }

    function imagenSiguiente() {
        if (!albumActual) return;
        indiceActual = (indiceActual + 1) % albumActual.fotos.length;
        actualizarVisor();
    }

    function imagenAnterior() {
        if (!albumActual) return;
        indiceActual = (indiceActual - 1 + albumActual.fotos.length) % albumActual.fotos.length;
        actualizarVisor();
    }

    // ---------- EVENTOS ----------

    btnCerrar.onclick = cerrarVisor;
    btnSiguiente.onclick = imagenSiguiente;
    btnPrev.onclick = imagenAnterior;

    // Cerrar al hacer clic fuera de la imagen
    visor.onclick = (e) => {
        if (e.target === visor || e.target.classList.contains('lightbox-principal-area')) {
            cerrarVisor();
        }
    };

    // Control por teclado
    document.addEventListener('keydown', (e) => {
        if (!visor.classList.contains('active')) return;

        if (e.key === 'Escape') cerrarVisor();
        if (e.key === 'ArrowRight') imagenSiguiente();
        if (e.key === 'ArrowLeft') imagenAnterior();
    });
})();
