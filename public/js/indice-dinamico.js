// index-dynamic.js - Contenido dinámico para la página de inicio

// ---------- CARGAR ÚLTIMO ÁLBUM ----------
async function cargarUltimoAlbum() {
    const container = document.getElementById('latest-album-container');

    try {
        const albumes = await api.obtener('/api/albumes');

        if (albumes.length === 0) {
            container.innerHTML = '<p class="no-contenido">No hay eventos publicados aún.</p>';
            return;
        }

        // Tomar el primer álbum (más reciente)
        const ultimoAlbum = albumes[0];
        renderizarVistaPreviaAlbum(ultimoAlbum, container);

    } catch (error) {
        console.error('Error al cargar último álbum:', error);
        container.innerHTML = '<p class="error-contenido">Error al cargar eventos.</p>';
    }
}

// ---------- RENDERIZAR PREVIEW DE ÁLBUM ----------
function renderizarVistaPreviaAlbum(album, container) {
    container.innerHTML = ''; // Limpiar loader

    const tarjeta = document.createElement('div');
    tarjeta.className = 'album-tarjeta'; // Reusar clase album-tarjeta para estilo consistente

    const tituloSeguro = sanearHTML(album.titulo);
    const descripcionSegura = sanearHTML(album.descripcion);
    const totalFotos = album.fotos.length;
    const fecha = new Date(album.fecha);
    const fechaFormateada = fecha.toLocaleDateString('es-SV', { year: 'numeric', month: 'long', day: 'numeric' });

    // Collage Container
    const contenedorCollage = document.createElement('div');
    contenedorCollage.className = 'album-collage';

    // 1. Main
    if (totalFotos > 0) {
        const principal = document.createElement('div');
        principal.className = 'collage-item principal';
        principal.innerHTML = `<img src="/api/albumes/fotos/${album.id}/${album.fotos[0]}" alt="${tituloSeguro}" loading="lazy">`;
        principal.onclick = () => window.abrirGaleria(album, 0);
        contenedorCollage.appendChild(principal);
    }

    // 2. Sub 1
    if (totalFotos > 1) {
        const sub1 = document.createElement('div');
        sub1.className = 'collage-item sub';
        sub1.innerHTML = `<img src="/api/albumes/fotos/${album.id}/${album.fotos[1]}" alt="Foto 2" loading="lazy">`;
        sub1.onclick = () => window.abrirGaleria(album, 1);
        contenedorCollage.appendChild(sub1);
    } else {
        contenedorCollage.appendChild(crearRelleno());
    }

    // 3. Sub 2 + Overlay
    if (totalFotos > 2) {
        const sub2 = document.createElement('div');
        sub2.className = 'collage-item sub';
        let contenido = `<img src="/api/albumes/fotos/${album.id}/${album.fotos[2]}" alt="Foto 3" loading="lazy">`;
        if (totalFotos > 3) {
            contenido += `<div class="more-photos-overlay">+${totalFotos - 3}</div>`;
        }
        sub2.innerHTML = contenido;
        sub2.onclick = () => window.abrirGaleria(album, 2);
        contenedorCollage.appendChild(sub2);
    } else {
        contenedorCollage.appendChild(crearRelleno());
    }

    // Info
    const divInfo = document.createElement('div');
    divInfo.className = 'album-info';
    divInfo.innerHTML = `
        <h3>${tituloSeguro}</h3>
        <div class="album-fecha">${fechaFormateada}</div>
        ${descripcionSegura ? `<p class="album-description">${descripcionSegura}</p>` : ''}
    `;

    tarjeta.appendChild(contenedorCollage);
    tarjeta.appendChild(divInfo);

    container.appendChild(tarjeta);

    // Boton ver todos - alineado a la izquierda
    const contenedorBoton = document.createElement('div');
    contenedorBoton.style.marginTop = '1rem';
    contenedorBoton.style.textAlign = 'left';
    contenedorBoton.innerHTML = '<a href="eventos.html" class="btn-cta">Ver todos los eventos →</a>';
    container.appendChild(contenedorBoton);
}

function crearRelleno() {
    const div = document.createElement('div');
    div.className = 'collage-item sub';
    div.style.background = '#f5f5f5';
    return div;
}

// ---------- CARGAR ÚLTIMO DOCUMENTO ----------
async function cargarUltimoDocumento() {
    const container = document.getElementById('latest-doc-container');

    try {
        const documentos = await api.obtener('/api/documentos');

        if (documentos.length === 0) {
            container.innerHTML = '<p class="no-contenido">No hay documentos publicados aún.</p>';
            return;
        }

        // Tomar el primer documento (más reciente)
        const ultimoDoc = documentos[0];
        renderizarVistaPreviaDocumento(ultimoDoc, container);

    } catch (error) {
        console.error('Error al cargar último documento:', error);
        container.innerHTML = '<p class="error-contenido">Error al cargar documentos.</p>';
    }
}

// ---------- RENDERIZAR PREVIEW DE DOCUMENTO ----------
function renderizarVistaPreviaDocumento(doc, container) {
    const [anio, mes] = doc.mes.split('-');
    const nombreMes = obtenerNombreMes(parseInt(mes));
    const tituloSeguro = sanearHTML(doc.titulo);
    const urlDescarga = `/api/documentos/archivo/${doc.nombre_archivo}`;
    const urlMiniatura = `/api/documentos/miniatura/${doc.nombre_archivo}`;

    container.innerHTML = `
        <a href="${urlDescarga}" target="_blank" class="documento-tarjeta-link-index" aria-label="Ver documento ${tituloSeguro}">
            <div class="documento-tarjeta-index">
                <div class="documento-preview-index">
                    <img src="${urlMiniatura}" alt="Vista previa de ${tituloSeguro}" loading="lazy">
                </div>
                <h4>${tituloSeguro}</h4>
                <p class="preview-fecha">${nombreMes} ${anio}</p>
            </div>
        </a>
        <div style="margin-top: 1rem; text-align: left;">
            <a href="documentos.html" class="btn-cta">Ver todos los documentos →</a>
        </div>
    `;
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
cargarUltimoAlbum();
cargarUltimoDocumento();
