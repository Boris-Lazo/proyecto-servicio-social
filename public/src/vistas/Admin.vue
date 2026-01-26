<template>
  <div class="admin-body">
    <header class="admin-topbar">
      <div class="admin-topbar-content">
        <div class="admin-brand">
          <h1>📚 Panel de Administración</h1>
          <p class="admin-user-info">Bienvenido, <span>{{ roleName }}</span></p>
        </div>
        <nav class="admin-actions">
          <button @click="confirmarSalida" class="btn-danger">🚪 Cerrar sesión</button>
        </nav>
      </div>
    </header>

    <main class="admin-main">
      <!-- Estadísticas -->
      <section class="admin-dashboard">
        <h2>Resumen General</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📸</div>
            <div class="stat-info">
              <h3>{{ stats.albums }}</h3>
              <p>Álbumes publicados</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📄</div>
            <div class="stat-info">
              <h3>{{ stats.docs }}</h3>
              <p>Documentos subidos</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🖼️</div>
            <div class="stat-info">
              <h3>{{ stats.photos }}</h3>
              <p>Fotos totales</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div class="stat-info">
              <h3>{{ stats.lastUpdate }}</h3>
              <p>Última actualización</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Pestañas -->
      <section class="admin-tabs-section">
        <div class="tabs-header">
          <button class="tab-btn" :class="{ active: tab === 'albums' }" @click="tab = 'albums'">📸 Subir Álbum</button>
          <button class="tab-btn" :class="{ active: tab === 'documentos' }" @click="tab = 'documentos'">📄 Subir Documento</button>
          <button class="tab-btn" :class="{ active: tab === 'gestionar' }" @click="tab = 'gestionar'">⚙️ Gestionar Contenido</button>
        </div>

        <!-- Tab: Álbumes -->
        <div class="tab-content" :class="{ active: tab === 'albums' }">
          <div class="admin-card">
            <h3>📤 Publicar Nuevo Álbum</h3>
            <form @submit.prevent="subirAlbum" class="admin-form">
              <div class="form-row">
                <div class="form-group">
                  <label>Título del evento *</label>
                  <input type="text" v-model="formAlbum.titulo" placeholder="Ej: Feria de Ciencias 2025" required>
                </div>
                <div class="form-group">
                  <label>Fecha del evento *</label>
                  <input type="date" v-model="formAlbum.fecha" required>
                </div>
              </div>
              <div class="form-group">
                <label>Descripción (opcional)</label>
                <textarea v-model="formAlbum.descripcion" rows="3" placeholder="Breve reseña del evento"></textarea>
              </div>
              <div class="form-group">
                <label>Seleccionar fotos (máx. 30, solo JPG) *</label>
                <div class="file-input-wrapper">
                  <input type="file" @change="handleFotosChange" accept="image/jpeg" multiple required>
                  <span class="file-input-label">{{ formAlbum.fotosLabel }}</span>
                </div>
              </div>
              <div class="preview-grid">
                <img v-for="(src, i) in formAlbum.previews" :key="i" :src="src" alt="preview">
              </div>
              <div v-if="uploadingAlbum" class="progress-container">
                <progress :value="formAlbum.progreso" max="100"></progress>
                <span>{{ formAlbum.progreso }}%</span>
              </div>
              <button type="submit" class="btn-primary" :disabled="uploadingAlbum">Publicar álbum</button>
              <p v-if="formAlbum.error" class="error-msg">{{ formAlbum.error }}</p>
              <p v-if="formAlbum.success" class="success-msg">{{ formAlbum.success }}</p>
            </form>
          </div>
        </div>

        <!-- Tab: Documentos -->
        <div class="tab-content" :class="{ active: tab === 'documentos' }">
          <div class="admin-card">
            <h3>📤 Subir Nuevo Documento</h3>
            <form @submit.prevent="subirDoc" class="admin-form">
              <div class="form-row">
                <div class="form-group">
                  <label>Título del documento *</label>
                  <input type="text" v-model="formDoc.titulo" placeholder="Ej: Rendición de Cuentas" required>
                </div>
                <div class="form-group">
                  <label>Mes del documento *</label>
                  <input type="month" v-model="formDoc.mes" required>
                </div>
              </div>
              <div class="form-group">
                <label>Seleccionar PDF (máx. 10 MB) *</label>
                <div class="file-input-wrapper">
                  <input type="file" @change="handleDocChange" accept=".pdf" required>
                  <span class="file-input-label">{{ formDoc.fileLabel }}</span>
                </div>
              </div>
              <div v-if="uploadingDoc" class="progress-container">
                <progress :value="formDoc.progreso" max="100"></progress>
                <span>{{ formDoc.progreso }}%</span>
              </div>
              <button type="submit" class="btn-primary" :disabled="uploadingDoc">Subir documento</button>
              <p v-if="formDoc.error" class="error-msg">{{ formDoc.error }}</p>
              <p v-if="formDoc.success" class="success-msg">{{ formDoc.success }}</p>
            </form>
          </div>
        </div>

        <!-- Tab: Gestionar -->
        <div class="tab-content" :class="{ active: tab === 'gestionar' }">
          <div class="admin-card">
            <h3>📸 Álbumes Publicados</h3>
            <div class="content-list">
              <div v-for="a in albums" :key="a.id" class="content-item">
                <div class="content-info">
                  <h4>{{ a.titulo }}</h4>
                  <div class="content-meta">
                    <span>📅 {{ a.fecha }}</span>
                    <span>📸 {{ a.fotos.length }} fotos</span>
                  </div>
                </div>
                <button class="btn-delete" @click="confirmarBorrado('album', a)">🗑️ Eliminar</button>
              </div>
            </div>
          </div>
          <div class="admin-card">
            <h3>📄 Documentos Publicados</h3>
            <div class="content-list">
              <div v-for="d in docs" :key="d.id" class="content-item">
                <div class="content-info">
                  <h4>{{ d.titulo }}</h4>
                  <div class="content-meta">
                    <span>📅 {{ d.mes }}</span>
                    <span>📄 PDF</span>
                  </div>
                </div>
                <button class="btn-delete" @click="confirmarBorrado('doc', d)">🗑️ Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Modal -->
    <div v-if="modal.show" class="modal-overlay active" @click.self="modal.show = false">
      <div class="modal-container">
        <div class="modal-header"><h3>{{ modal.title }}</h3></div>
        <div class="modal-body">
          <p>{{ modal.message }}</p>
          <p class="modal-hint">{{ modal.hint }}</p>
        </div>
        <div class="modal-footer">
          <button @click="modal.show = false" class="btn-modal btn-modal-cancel">Cancelar</button>
          <button @click="ejecutarAccionModal" class="btn-modal btn-modal-confirm">Confirmar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api/clienteApi';

const router = useRouter();
const tab = ref('albums');
const albums = ref([]);
const docs = ref([]);
const stats = reactive({ albums: 0, docs: 0, photos: 0, lastUpdate: '--' });

const roleName = computed(() => {
  const user = localStorage.getItem('usuario');
  const roles = {
    'directora@amatal.edu.sv': 'Directora',
    'ericka.flores@clases.edu.sv': 'Subdirectora',
    'borisstanleylazocastillo@gmail.com': 'Desarrollador'
  };
  return roles[user] || user;
});

// Formularios
const formAlbum = reactive({ titulo: '', fecha: '', descripcion: '', fotos: [], fotosLabel: 'Haz clic para seleccionar', previews: [], progreso: 0, error: '', success: '' });
const uploadingAlbum = ref(false);

const formDoc = reactive({ titulo: '', mes: '', file: null, fileLabel: 'Haz clic para seleccionar', progreso: 0, error: '', success: '' });
const uploadingDoc = ref(false);

const modal = reactive({ show: false, title: '', message: '', hint: '', action: null });

async function loadData() {
  try {
    albums.value = await api.obtener('/api/albums');
    docs.value = await api.obtener('/api/docs');
    stats.albums = albums.value.length;
    stats.docs = docs.value.length;
    stats.photos = albums.value.reduce((s, a) => s + a.fotos.length, 0);
    if (albums.value.length > 0) stats.lastUpdate = new Date(albums.value[0].fecha).toLocaleDateString('es-SV');
  } catch (e) { console.error(e); }
}

function handleFotosChange(e) {
  const files = Array.from(e.target.files);
  if (files.length > 30) { alert('Máximo 30 fotos'); e.target.value = ''; return; }
  formAlbum.fotos = files;
  formAlbum.fotosLabel = `${files.length} archivo(s)`;
  formAlbum.previews = [];
  files.forEach(f => {
    const r = new FileReader();
    r.onload = ev => formAlbum.previews.push(ev.target.result);
    r.readAsDataURL(f);
  });
}

async function subirAlbum() {
  uploadingAlbum.value = true;
  formAlbum.error = ''; formAlbum.success = '';
  const fd = new FormData();
  fd.append('titulo', formAlbum.titulo);
  fd.append('fecha', formAlbum.fecha);
  fd.append('descripcion', formAlbum.descripcion);
  formAlbum.fotos.forEach(f => fd.append('fotos', f));
  try {
    await api.subir('/api/albums', fd, p => formAlbum.progreso = p);
    formAlbum.success = '✅ Álbum publicado correctamente';
    loadData();
    // reset form
  } catch (e) { formAlbum.error = e.message; }
  finally { uploadingAlbum.value = false; }
}

function handleDocChange(e) {
  const f = e.target.files[0];
  if (f) { formDoc.file = f; formDoc.fileLabel = f.name; }
}

async function subirDoc() {
  uploadingDoc.value = true;
  formDoc.error = ''; formDoc.success = '';
  const fd = new FormData();
  fd.append('titulo', formDoc.titulo);
  fd.append('mes', formDoc.mes);
  fd.append('doc', formDoc.file);
  try {
    await api.subir('/api/docs', fd, p => formDoc.progreso = p);
    formDoc.success = '✅ Documento subido';
    loadData();
  } catch (e) { formDoc.error = e.message; }
  finally { uploadingDoc.value = false; }
}

function confirmarSalida() {
  modal.title = '🚪 Cerrar Sesión';
  modal.message = '¿Estás seguro?';
  modal.hint = 'Perderás progreso no guardado';
  modal.action = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    router.push('/login');
  };
  modal.show = true;
}

function confirmarBorrado(tipo, item) {
  modal.title = `🗑️ Eliminar ${tipo}`;
  modal.message = `¿Borrar "${item.titulo}"?`;
  modal.hint = 'Esta acción no se puede deshacer';
  modal.action = async () => {
    await api.eliminar(`/api/${tipo === 'album' ? 'albums' : 'docs'}/${item.id}`);
    loadData();
  };
  modal.show = true;
}

function ejecutarAccionModal() {
  if (modal.action) modal.action();
  modal.show = false;
}

onMounted(() => {
  if (!localStorage.getItem('token')) router.push('/login');
  loadData();
});

watch(tab, (newTab) => {
  if (newTab === 'gestionar') loadData();
});
</script>

<style src="@/assets/css/admin.css"></style>
<style scoped>
.admin-body { background: #f4f7f6; min-height: 100vh; }
</style>
