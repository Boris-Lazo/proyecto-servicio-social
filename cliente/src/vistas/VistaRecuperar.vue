<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../servicios/cliente-api';

// Importar estilos específicos de la vista
import '../activos/css/recuperar.css';

const enrutador = useRouter();

// Paso 1
const correo = ref('');
const mensajePaso1 = ref('');
const tipoMensajePaso1 = ref('');
const mostrarDetallesToken = ref(false);

// Paso 2
const token = ref('');
const nuevaClave = ref('');
const mostrarContrasena = ref(false);
const mensajePaso2 = ref('');
const tipoMensajePaso2 = ref('');

const solicitarEnlace = async () => {
  mensajePaso1.value = '';
  tipoMensajePaso1.value = '';

  if (!correo.value.trim()) {
    mensajePaso1.value = 'Por favor ingresa tu correo electrónico';
    tipoMensajePaso1.value = 'error-msg';
    return;
  }

  try {
    await api.enviar('/api/recover', { correo: correo.value.trim() });
    mensajePaso1.value = 'Correo enviado. Revisa tu bandeja de entrada e ingresa el código.';
    tipoMensajePaso1.value = 'success-msg';
    mostrarDetallesToken.value = true;
  } catch (err) {
    mensajePaso1.value = err.message;
    tipoMensajePaso1.value = 'error-msg';
  }
};

const cambiarContrasena = async () => {
  mensajePaso2.value = '';
  tipoMensajePaso2.value = '';

  if (!token.value.trim() || !nuevaClave.value || nuevaClave.value.length < 6) {
    mensajePaso2.value = 'Ingresa el código y la nueva contraseña (mín. 6 caracteres)';
    tipoMensajePaso2.value = 'error-msg';
    return;
  }

  try {
    await api.enviar('/api/recover/change', {
      tokenTemporal: token.value.trim(),
      nuevaClave: nuevaClave.value
    });

    mensajePaso2.value = 'Contraseña actualizada. Redirigiendo...';
    tipoMensajePaso2.value = 'success-msg';
    setTimeout(() => enrutador.push('/login'), 2000);
  } catch (err) {
    mensajePaso2.value = err.message;
    tipoMensajePaso2.value = 'error-msg';
  }
};
</script>

<template>
  <main id="recover-main">
    <section class="recover-box">
      <h2>Recuperar Contraseña</h2>

      <!-- Paso 1: Solicitar enlace de recuperación -->
      <form @submit.prevent="solicitarEnlace" class="recover-form">
        <label for="recover-user">Correo Electrónico</label>
        <input
          type="email"
          id="recover-user"
          v-model="correo"
          class="form-input"
          placeholder="usuario@ejemplo.com"
          required
          autocomplete="email"
          autofocus
        >

        <button type="submit" class="btn">Solicitar enlace de recuperación</button>
        <p v-if="mensajePaso1" :class="tipoMensajePaso1">{{ mensajePaso1 }}</p>
      </form>

      <!-- Paso 2: Ingresar enlace y nueva contraseña -->
      <details :open="mostrarDetallesToken" class="recover-token-details">
        <summary @click.prevent="mostrarDetallesToken = !mostrarDetallesToken">Tengo el código de recuperación</summary>
        <form @submit.prevent="cambiarContrasena" class="recover-form">
          <label for="recover-token">Ingresa el código de verificación</label>
          <input
            type="text"
            id="recover-token"
            v-model="token"
            class="form-input"
            placeholder="123456"
            required
            maxlength="6"
            pattern="[0-9]*"
          >

          <label for="recover-new-pass">Nueva contraseña</label>
          <input
            :type="mostrarContrasena ? 'text' : 'password'"
            id="recover-new-pass"
            v-model="nuevaClave"
            class="form-input"
            required
            minlength="6"
          >

          <div class="show-password-container">
            <input
              type="checkbox"
              id="show-password"
              v-model="mostrarContrasena"
              class="show-password-checkbox"
            >
            <label for="show-password" class="show-password-label">Mostrar contraseña</label>
          </div>

          <button type="submit" class="btn">Establecer nueva contraseña</button>
          <p v-if="mensajePaso2" :class="tipoMensajePaso2">{{ mensajePaso2 }}</p>
        </form>
      </details>

      <!-- Link para volver al login -->
      <div class="back-to-login">
        <router-link to="/login">← Volver al inicio de sesión</router-link>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* Estilos adicionales si son necesarios */
.error-msg {
  color: #dc3545;
  margin-top: 0.5rem;
}
.success-msg {
  color: #28a745;
  margin-top: 0.5rem;
}
</style>
