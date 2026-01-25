<template>
  <div id="recover-main">
    <section class="recover-box">
      <h2>Recuperar Contraseña</h2>

      <form v-if="!tokenSent" @submit.prevent="solicitarEnlace" class="recover-form">
        <label for="recover-user">Correo Electrónico</label>
        <input type="email" v-model="email" class="form-input" placeholder="usuario@ejemplo.com" required autocomplete="email">
        <button type="submit" class="btn" :disabled="loading">Solicitar enlace</button>
        <p :class="msgType">{{ message }}</p>
      </form>

      <div v-else>
        <p class="success-msg">Correo enviado. Revisa tu bandeja e ingresa el código.</p>
        <form @submit.prevent="cambiarClave" class="recover-form">
          <label>Código de verificación</label>
          <input type="text" v-model="token" class="form-input" placeholder="123456" required>
          <label>Nueva contraseña</label>
          <input :type="showPass ? 'text' : 'password'" v-model="nuevaClave" class="form-input" required minlength="6">
          <div class="show-password-container">
            <input type="checkbox" v-model="showPass" class="show-password-checkbox">
            <label class="show-password-label">Mostrar contraseña</label>
          </div>
          <button type="submit" class="btn" :disabled="loading">Establecer contraseña</button>
          <p :class="msgType">{{ message }}</p>
        </form>
      </div>

      <div class="back-to-login">
        <router-link to="/login">← Volver al inicio de sesión</router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api/clienteApi';

const router = useRouter();
const email = ref('');
const tokenSent = ref(false);
const token = ref('');
const nuevaClave = ref('');
const loading = ref(false);
const message = ref('');
const msgType = ref('');
const showPass = ref(false);

async function solicitarEnlace() {
  loading.value = true;
  try {
    await api.enviar('/api/recover', { correo: email.value });
    tokenSent.value = true;
    message.value = '';
  } catch (e) {
    message.value = e.message;
    msgType.value = 'error-msg';
  } finally {
    loading.value = false;
  }
}

async function cambiarClave() {
  loading.value = true;
  try {
    await api.enviar('/api/recover/change', { tokenTemporal: token.value, nuevaClave: nuevaClave.value });
    message.value = 'Contraseña actualizada. Redirigiendo...';
    msgType.value = 'success-msg';
    setTimeout(() => router.push('/login'), 2000);
  } catch (e) {
    message.value = e.message;
    msgType.value = 'error-msg';
  } finally {
    loading.value = false;
  }
}
</script>

<style src="@/assets/css/recuperar.css"></style>
