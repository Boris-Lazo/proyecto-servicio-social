<template>
  <div>
    <header class="escuela-header">
      <img class="vista" src="@/assets/img/fondo-index.jpeg" alt="Niños en el evento de la escuela" loading="lazy">

      <section class="escuela-info">
        <p>BIENVENIDOS. <br>El Centro Escolar Cantón El Amatal es una institución educativa de El Salvador que se
          encuentra ubicada en la comunidad rural del mismo nombre. La escuela fue creada con el objetivo de
          brindar una educación de calidad a los niños y jóvenes de la zona.</p>
      </section>
    </header>

    <main>
      <section>
        <h2>📸 Eventos</h2>
        <p>Descubre los momentos más especiales de nuestra comunidad educativa.</p>
        <div id="latest-album-container" class="dynamic-content">
          <div v-if="loadingAlbum" class="loading-content">Cargando último evento...</div>
          <div v-else-if="ultimoAlbum" class="album-card-index">
             <!-- Simplificación para el inicio -->
             <div class="album-collage" @click="verAlbum">
                <div class="collage-item main">
                  <img :src="`/api/uploads/${ultimoAlbum.id}/${ultimoAlbum.fotos[0]}`" alt="Portada">
                </div>
             </div>
             <div class="album-info">
                <h3>{{ ultimoAlbum.titulo }}</h3>
                <p>{{ formattedDate(ultimoAlbum.fecha) }}</p>
                <router-link to="/eventos" class="btn-cta">Ver todos los eventos →</router-link>
             </div>
          </div>
          <div v-else class="empty-content">No hay eventos recientes.</div>
        </div>
      </section>

      <section>
        <h2>📄 Documentos</h2>
        <p>Accede a los documentos de rendición de cuentas de nuestra institución.</p>
        <div id="latest-doc-container" class="dynamic-content">
          <div v-if="loadingDoc" class="loading-content">Cargando último documento...</div>
          <div v-else-if="ultimoDoc" class="documento-card-index">
            <a :href="`/api/docs/file/${ultimoDoc.filename}`" target="_blank" class="documento-card-link-index">
              <div class="documento-card-index">
                <div class="documento-preview-index">
                  <img :src="`/api/docs/thumbnail/${ultimoDoc.filename}`" alt="Vista previa">
                </div>
                <h4>{{ ultimoDoc.titulo }}</h4>
                <p class="preview-date">{{ formatDocMonth(ultimoDoc.mes) }}</p>
              </div>
            </a>
            <div style="margin-top: 1rem; text-align: left;">
                <router-link to="/documentos" class="btn-cta">Ver todos los documentos →</router-link>
            </div>
          </div>
          <div v-else class="empty-content">No hay documentos recientes.</div>
        </div>
      </section>

      <section id="ubicacion">
        <h2>Ubicación</h2>
        <p>En esta sección se encuentra la ubicación de la escuela.</p>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1668.6272057614071!2d-89.8954317614071!3d13.651859335790586!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f62af0024634021%3A0xde9494161729e7ab!2sCENTRO%20ESCOLAR%20%22CANT%C3%93N%20EL%20AMATAL%22.%2010560!5e0!3m2!1ses-419!2ssv!4v1764794971231!5m2!1ses-419!2ssv"
          width="800" height="600" style="border:0;" allowfullscreen="" loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"></iframe>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api/clienteApi';

const router = useRouter();
const ultimoAlbum = ref(null);
const ultimoDoc = ref(null);
const loadingAlbum = ref(true);
const loadingDoc = ref(true);

function formattedDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-SV', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatDocMonth(mesStr) {
  const [year, month] = mesStr.split('-');
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${months[parseInt(month) - 1]} ${year}`;
}

function verAlbum() {
  router.push('/eventos');
}

onMounted(async () => {
  try {
    const albums = await api.obtener('/api/albums');
    if (albums.length > 0) ultimoAlbum.value = albums[0];
  } catch (e) { console.error(e); }
  loadingAlbum.value = false;

  try {
    const docs = await api.obtener('/api/docs');
    if (docs.length > 0) ultimoDoc.value = docs[0];
  } catch (e) { console.error(e); }
  loadingDoc.value = false;
});
</script>

<style src="@/assets/css/galeria.css"></style>
