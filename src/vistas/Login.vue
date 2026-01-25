<template>
  <header class="escuela-header login-header">
    <img class="vista" src="/img/fondo-index.jpeg" alt="Fondo login" loading="lazy">

    <main>
      <section class="login">
        <h2>Iniciar sesión</h2>

        <form id="login-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="usuario">Correo Electrónico</label>
            <input
              type="email"
              id="usuario"
              v-model="email"
              class="form-input"
              placeholder="usuario@ejemplo.com"
              required
              autocomplete="email"
              autofocus
            >
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input
              :type="showPass ? 'text' : 'password'"
              id="password"
              v-model="password"
              class="form-input"
              autocomplete="current-password"
              required
              minlength="6"
            >
          </div>

          <div class="show-password-container">
            <input type="checkbox" id="show-password" v-model="showPass" class="show-password-checkbox">
            <label for="show-password" class="show-password-label">Mostrar contraseña</label>
          </div>

          <button type="submit" id="btn-login" class="btn" :disabled="loading">
            {{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
          </button>
        </form>

        <div class="forgot-password">
          <router-link to="/recuperar">¿Olvidaste tu contraseña?</router-link>
        </div>
      </section>
    </main>
  </header>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api/clienteApi';

const router = useRouter();
const email = ref('');
const password = ref('');
const showPass = ref(false);
const loading = ref(false);

async function handleLogin() {
  if (!email.value || !password.value) return;

  loading.value = true;
  try {
    const data = await api.enviar('/api/login', { usuario: email.value, contrasena: password.value });
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', email.value);
    router.push('/admin');
  } catch (err) {
    alert(err.message || 'Error al iniciar sesión');
  } finally {
    loading.value = false;
  }
}
</script>

<style src="@/assets/css/login.css"></style>
<style scoped>
.login-header {
  position: relative;
  min-height: 100vh;
}
</style>
