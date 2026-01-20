<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '../servicios/cliente-api';

// Importar estilos específicos de la vista-fondo
import '../activos/css/admin.css';

const enrutador = useRouter();

// --- ESTADO ---
const usuarioActual = ref('');
const nombreRol = ref('');
const menuExpandido = ref(false);
const pestañaActiva = ref('albums');

const estadisticas = ref({
  albums: 0,
  docs: 0,
  fotos: 0,
  ultimaFecha: '--'
});

// --- ÁLBUMES ---
const formularioAlbum = ref({
  titulo: '',
  fecha: '',
  descripcion: '',
  fotos: []
});
const previewFotos = ref([]);
const progresoAlbum = ref(0);
const errorAlbum = ref('');
const exitoAlbum = ref('');
const subiendoAlbum = ref(false);

// --- DOCUMENTOS ---
const formularioDoc = ref({
  titulo: '',
  mes: '',
  archivo: null
});
const nombreArchivoDoc = ref('Haz clic para seleccionar archivo PDF');
const progresoDoc = ref(0);
const errorDoc = ref('');
const exitoDoc = ref('');
const subiendoDoc = ref(false);

// --- GESTIÓN ---
const listaAlbums = ref([]);
const listaDocs = ref([]);
const cargandoGestion = ref(false);

// --- MODAL ---
const modalVisible = ref(false);
const modalDatos = ref({
  titulo: '',
  mensaje: '',
  pista: '',
  textoConfirmar: '',
  accion: null
});

// --- CONSTANTES ---
const MAX_FOTOS = 30;
const MAX_PDF_MB = 10;

// --- MÉTODOS ---

const verificarAutenticacion = () => {
  const token = localStorage.getItem('token');
  const usuario = localStorage.getItem('usuario');

  if (!token || !usuario) {
    enrutador.push('/login');
    return false;
  }

  usuarioActual.value = usuario;
  // Extraer nombre del correo (antes del @) y formatear
  const nombreLimpio = usuario.split('@')[0].replace(/[\._]/g, ' ');
  nombreRol.value = nombreLimpio.charAt(0).toUpperCase() + nombreLimpio.slice(1);
  return true;
};

const cargarEstadisticas = async () => {
  try {
    const albums = await api.obtener('/api/albums');
    const docs = await api.obtener('/api/docs');

    estadisticas.value.albums = albums.length;
    estadisticas.value.docs = docs.length;
    estadisticas.value.fotos = albums.reduce((suma, album) => suma + (album.fotos?.length || 0), 0);

    if (albums.length > 0) {
      estadisticas.value.ultimaFecha = new Date(albums[0].fecha).toLocaleDateString('es-SV');
    }
  } catch (error) {
    console.error('Error al cargar estadísticas:', error);
  }
};

const manejarCambioFotos = (evento) => {
  const archivos = Array.from(evento.target.files);
  errorAlbum.value = '';
  exitoAlbum.value = '';

  if (archivos.length > MAX_FOTOS) {
    errorAlbum.value = `Máximo ${MAX_FOTOS} fotos`;
    evento.target.value = '';
    formularioAlbum.value.fotos = [];
    previewFotos.value = [];
    return;
  }

  formularioAlbum.value.fotos = archivos;
  previewFotos.value = [];

  archivos.forEach(archivo => {
    if (archivo.type !== 'image/jpeg') return;
    const lector = new FileReader();
    lector.onload = ev => {
      previewFotos.value.push(ev.target.result);
    };
    lector.readAsDataURL(archivo);
  });
};

const subirAlbum = async () => {
  errorAlbum.value = '';
  exitoAlbum.value = '';

  const { titulo, fecha, descripcion, fotos } = formularioAlbum.value;

  if (!titulo || !fecha || fotos.length === 0) {
    errorAlbum.value = 'Completa título, fecha y al menos una foto';
    return;
  }

  const datosForm = new FormData();
  datosForm.append('titulo', titulo);
  datosForm.append('fecha', fecha);
  datosForm.append('descripcion', descripcion);
  fotos.forEach(f => datosForm.append('fotos', f));

  subiendoAlbum.value = true;

  try {
    const respuesta = await api.subir('/api/albums', datosForm, (porc) => {
      progresoAlbum.value = porc;
    });

    exitoAlbum.value = `✅ Álbum "${respuesta.album.titulo}" publicado con ${respuesta.album.fotos.length} fotos.`;

    // Resetear formulario
    formularioAlbum.value = { titulo: '', fecha: '', descripcion: '', fotos: [] };
    previewFotos.value = [];
    progresoAlbum.value = 0;
    cargarEstadisticas();
  } catch (err) {
    errorAlbum.value = '❌ ' + err.message;
  } finally {
    subiendoAlbum.value = false;
  }
};

const manejarCambioDoc = (evento) => {
  const archivo = evento.target.files[0];
  if (archivo) {
    formularioDoc.value.archivo = archivo;
    nombreArchivoDoc.value = archivo.name;
  } else {
    nombreArchivoDoc.value = 'Haz clic para seleccionar archivo PDF';
  }
};

const subirDocumento = async () => {
  errorDoc.value = '';
  exitoDoc.value = '';

  const { titulo, mes, archivo } = formularioDoc.value;

  if (!titulo || !mes || !archivo) {
    errorDoc.value = 'Completa título, mes y selecciona un PDF';
    return;
  }

  if (archivo.size > MAX_PDF_MB * 1024 * 1024) {
    errorDoc.value = `Máximo ${MAX_PDF_MB} MB por PDF`;
    return;
  }

  const datosForm = new FormData();
  datosForm.append('titulo', titulo);
  datosForm.append('mes', mes);
  datosForm.append('doc', archivo);

  subiendoDoc.value = true;

  try {
    await api.subir('/api/docs', datosForm, (porc) => {
      progresoDoc.value = porc;
    });

    exitoDoc.value = `✅ PDF "${titulo}" subido correctamente.`;

    // Resetear formulario
    formularioDoc.value = { titulo: '', mes: '', archivo: null };
    nombreArchivoDoc.value = 'Haz clic para seleccionar archivo PDF';
    progresoDoc.value = 0;
    cargarEstadisticas();
  } catch (err) {
    errorDoc.value = '❌ ' + err.message;
  } finally {
    subiendoDoc.value = false;
  }
};

const cargarListasGestion = async () => {
  try {
    cargandoGestion.value = true;
    listaAlbums.value = await api.obtener('/api/albums');
    listaDocs.value = await api.obtener('/api/docs');
  } catch (err) {
    console.error('Error al cargar listas:', err);
  } finally {
    cargandoGestion.value = false;
  }
};

const confirmarEliminarAlbum = (album) => {
  mostrarModal(
    '🗑️ Eliminar Álbum',
    `¿Estás seguro de eliminar "${album.titulo}"?`,
    `Se eliminarán ${album.fotos.length} fotos. Esta acción no se puede deshacer.`,
    'Eliminar',
    () => eliminarAlbum(album.id)
  );
};

const eliminarAlbum = async (id) => {
  try {
    await api.eliminar(`/api/albums/${id}`);
    cargarListasGestion();
    cargarEstadisticas();
  } catch (err) {
    alert('Error al eliminar el álbum');
  }
};

const confirmarEliminarDoc = (doc) => {
  mostrarModal(
    '🗑️ Eliminar Documento',
    `¿Estás seguro de eliminar "${doc.titulo}"?`,
    'Esta acción no se puede deshacer.',
    'Eliminar',
    () => eliminarDoc(doc.id)
  );
};

const eliminarDoc = async (id) => {
  try {
    await api.eliminar(`/api/docs/${id}`);
    cargarListasGestion();
    cargarEstadisticas();
  } catch (err) {
    alert('Error al eliminar el documento');
  }
};

const mostrarModal = (titulo, mensaje, pista, textoConfirmar, accion) => {
  modalDatos.value = { titulo, mensaje, pista, textoConfirmar, accion };
  modalVisible.value = true;
};

const cerrarModal = () => {
  modalVisible.value = false;
};

const confirmarAccionModal = () => {
  if (modalDatos.value.accion) {
    modalDatos.value.accion();
  }
  cerrarModal();
};

const cerrarSesion = () => {
  mostrarModal(
    '🚪 Cerrar Sesión',
    '¿Estás seguro de que deseas cerrar sesión?',
    'Perderás cualquier progreso no guardado.',
    'Cerrar Sesión',
    () => {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      enrutador.push('/login');
    }
  );
};

const obtenerNombreMes = (mesAnio) => {
  const [anio, mes] = mesAnio.split('-');
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${meses[parseInt(mes) - 1]} ${anio}`;
};

onMounted(() => {
  if (verificarAutenticacion()) {
    cargarEstadisticas();
  }
});

watch(pestañaActiva, (nueva) => {
  if (nueva === 'gestionar') {
    cargarListasGestion();
  }
});
</script>

<template>
  <div class="admin-cuerpo-container">
    <!-- Barra superior -->
    <header class="admin-barra-superior">
      <div class="admin-contenido-barra-superior">
        <div class="admin-marca">
          <h1>📚 Panel de Administración</h1>
          <p class="admin-info-usuario">Bienvenido, <span>{{ nombreRol }}</span></p>
        </div>

        <!-- Botón hamburguesa (móvil) -->
        <button
          class="admin-alternar-menu"
          @click="menuExpandido = !menuExpandido"
          :aria-expanded="menuExpandido"
        >
          <span class="solo-lectores">Abrir menú</span>☰
        </button>

        <!-- Menú de navegación -->
        <nav class="admin-acciones" :class="{ 'show': menuExpandido }">
          <button @click="cerrarSesion" class="boton-peligro">🚪 Cerrar sesión</button>
        </nav>
      </div>
    </header>

    <!-- Contenido principal -->
    <main class="admin-principal">
      <!-- Dashboard con estadísticas -->
      <section class="admin-tablero">
        <h2>Resumen General</h2>
        <div class="cuadricula-estadisticas">
          <div class="tarjeta-estadistica">
            <div class="icono-estadistica">📸</div>
            <div class="info-estadistica">
              <h3>{{ estadisticas.albums }}</h3>
              <p>Álbumes publicados</p>
            </div>
          </div>
          <div class="tarjeta-estadistica">
            <div class="icono-estadistica">📄</div>
            <div class="info-estadistica">
              <h3>{{ estadisticas.docs }}</h3>
              <p>Documentos subidos</p>
            </div>
          </div>
          <div class="tarjeta-estadistica">
            <div class="icono-estadistica">🖼️</div>
            <div class="info-estadistica">
              <h3>{{ estadisticas.fotos }}</h3>
              <p>Fotos totales</p>
            </div>
          </div>
          <div class="tarjeta-estadistica">
            <div class="icono-estadistica">📅</div>
            <div class="info-estadistica">
              <h3>{{ estadisticas.ultimaFecha }}</h3>
              <p>Última actualización</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Sistema de pestañas -->
      <section class="admin-seccion-pestanas">
        <div class="cabecera-pestanas">
          <button
            class="boton-pestana"
            :class="{ active: pestañaActiva === 'albums' }"
            @click="pestañaActiva = 'albums'"
          >
            📸 Subir Álbum
          </button>
          <button
            class="boton-pestana"
            :class="{ active: pestañaActiva === 'documentos' }"
            @click="pestañaActiva = 'documentos'"
          >
            📄 Subir Documento
          </button>
          <button
            class="boton-pestana"
            :class="{ active: pestañaActiva === 'gestionar' }"
            @click="pestañaActiva = 'gestionar'"
          >
            ⚙️ Gestionar Contenido
          </button>
        </div>

        <!-- Tab: Álbumes -->
        <div class="contenido-pestana" :class="{ active: pestañaActiva === 'albums' }">
          <div class="admin-tarjeta">
            <h3>📤 Publicar Nuevo Álbum</h3>
            <form @submit.prevent="subirAlbum" class="admin-formulario">
              <div class="fila-formulario">
                <div class="grupo-formulario">
                  <label for="titulo">Título del evento *</label>
                  <input type="text" id="titulo" v-model="formularioAlbum.titulo" placeholder="Ej: Feria de Ciencias 2025" required>
                </div>
                <div class="grupo-formulario">
                  <label for="fecha">Fecha del evento *</label>
                  <input type="date" id="fecha" v-model="formularioAlbum.fecha" required>
                </div>
              </div>

              <div class="grupo-formulario">
                <label for="descripcion">Descripción (opcional)</label>
                <textarea id="descripcion" v-model="formularioAlbum.descripcion" rows="3" placeholder="Breve reseña del evento"></textarea>
              </div>

              <div class="grupo-formulario">
                <label for="fotos">Seleccionar fotos (máx. 30, solo JPG) *</label>
                <div class="contenedor-entrada-archivo">
                  <input type="file" id="fotos" @change="manejarCambioFotos" accept="image/jpeg" multiple required>
                  <span class="etiqueta-entrada-archivo">
                    {{ formularioAlbum.fotos.length > 0 ? `${formularioAlbum.fotos.length} archivo(s) seleccionado(s)` : 'Haz clic para seleccionar archivos' }}
                  </span>
                </div>
              </div>

              <!-- Preview de fotos -->
              <div class="cuadricula-previsualizacion">
                <img v-for="(src, index) in previewFotos" :key="index" :src="src" alt="preview">
              </div>

              <!-- Barra de progreso -->
              <div class="contenedor-progreso" v-if="subiendoAlbum">
                <progress :value="progresoAlbum" max="100"></progress>
                <span>{{ progresoAlbum }}%</span>
              </div>

              <button type="submit" class="boton-primario" :disabled="subiendoAlbum">
                {{ subiendoAlbum ? 'Subiendo…' : 'Publicar álbum' }}
              </button>

              <p v-if="errorAlbum" class="mensaje-error" role="alert">{{ errorAlbum }}</p>
              <p v-if="exitoAlbum" class="mensaje-exito" role="status">{{ exitoAlbum }}</p>
            </form>
          </div>
        </div>

        <!-- Tab: Documentos -->
        <div class="contenido-pestana" :class="{ active: pestañaActiva === 'documentos' }">
          <div class="admin-tarjeta">
            <h3>📤 Subir Nuevo Documento</h3>
            <form @submit.prevent="subirDocumento" class="admin-formulario">
              <div class="fila-formulario">
                <div class="grupo-formulario">
                  <label for="doc-titulo">Título del documento *</label>
                  <input type="text" id="doc-titulo" v-model="formularioDoc.titulo" placeholder="Ej: Rendición de Cuentas - Junio 2025" required>
                </div>
                <div class="grupo-formulario">
                  <label for="doc-mes">Mes del documento *</label>
                  <input type="month" id="doc-mes" v-model="formularioDoc.mes" required>
                </div>
              </div>

              <div class="grupo-formulario">
                <label for="doc-file">Seleccionar PDF (máx. 10 MB) *</label>
                <div class="contenedor-entrada-archivo">
                  <input type="file" id="doc-file" @change="manejarCambioDoc" accept=".pdf" required>
                  <span class="etiqueta-entrada-archivo">{{ nombreArchivoDoc }}</span>
                </div>
                <small class="pista-formulario">Tamaño máximo: 10 MB</small>
              </div>

              <!-- Barra de progreso -->
              <div class="contenedor-progreso" v-if="subiendoDoc">
                <progress :value="progresoDoc" max="100"></progress>
                <span>{{ progresoDoc }}%</span>
              </div>

              <button type="submit" class="boton-primario" :disabled="subiendoDoc">
                {{ subiendoDoc ? 'Subiendo…' : 'Subir documento' }}
              </button>

              <p v-if="errorDoc" class="mensaje-error" role="alert">{{ errorDoc }}</p>
              <p v-if="exitoDoc" class="mensaje-exito" role="status">{{ exitoDoc }}</p>
            </form>
          </div>
        </div>

        <!-- Tab: Gestionar Contenido -->
        <div class="contenido-pestana" :class="{ active: pestañaActiva === 'gestionar' }">
          <div class="admin-tarjeta">
            <h3>📸 Álbumes Publicados</h3>
            <div class="lista-contenido">
              <p v-if="cargandoGestion" class="cargando-contenido">Cargando álbumes...</p>
              <p v-else-if="listaAlbums.length === 0" class="lista-vacia">No hay álbumes publicados.</p>
              <div v-else v-for="album in listaAlbums" :key="album.id" class="item-contenido">
                <div class="info-contenido">
                  <h4>{{ album.titulo }}</h4>
                  <div class="meta-contenido">
                    <span>📅 {{ new Date(album.fecha).toLocaleDateString('es-SV') }}</span>
                    <span>📸 {{ album.fotos.length }} fotos</span>
                  </div>
                </div>
                <button class="boton-eliminar" @click="confirmarEliminarAlbum(album)">🗑️ Eliminar</button>
              </div>
            </div>
          </div>

          <div class="admin-tarjeta">
            <h3>📄 Documentos Publicados</h3>
            <div class="lista-contenido">
              <p v-if="cargandoGestion" class="cargando-contenido">Cargando documentos...</p>
              <p v-else-if="listaDocs.length === 0" class="lista-vacia">No hay documentos publicados.</p>
              <div v-else v-for="doc in listaDocs" :key="doc.id" class="item-contenido">
                <div class="info-contenido">
                  <h4>{{ doc.titulo }}</h4>
                  <div class="meta-contenido">
                    <span>📅 {{ obtenerNombreMes(doc.mes) }}</span>
                    <span>📄 PDF</span>
                  </div>
                </div>
                <button class="boton-eliminar" @click="confirmarEliminarDoc(doc)">🗑️ Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Modal de confirmación reutilizable -->
    <div class="capa-modal" :class="{ active: modalVisible }" @click.self="cerrarModal">
      <div class="contenedor-modal">
        <div class="cabecera-modal">
          <h3>{{ modalDatos.titulo }}</h3>
        </div>
        <div class="cuerpo-modal">
          <p>{{ modalDatos.mensaje }}</p>
          <p class="pista-modal">{{ modalDatos.pista }}</p>
        </div>
        <div class="pie-modal">
          <button @click="cerrarModal" class="boton-modal boton-modal-cancelar">Cancelar</button>
          <button @click="confirmarAccionModal" class="boton-modal boton-modal-confirmar">{{ modalDatos.textoConfirmar }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-cuerpo-container {
  min-height: 100vh;
  background-color: #f4f7f6;
  width: 100%;
}
</style>
