<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../servicios/cliente-api';
import '../activos/css/login.css';
const enrutador = useRouter();
const correo = ref('');
const contrasena = ref('');
const manejarEnvio = async () => {
  try {
    const d = await api.enviar('/api/login', { usuario: correo.value, contrasena: contrasena.value });
    localStorage.setItem('token', d.token);
    localStorage.setItem('usuario', correo.value);
    enrutador.push('/admin');
  } catch (e) { alert(e.message); }
};
</script>
<template>
  <header class="escuela-header">
    <img class="vista" src="../activos/img/fondo-index.jpg">
    <section class="login">
      <h2>Iniciar sesión</h2>
      <form @submit.prevent="manejarEnvio">
        <input type="email" v-model="correo" placeholder="Correo" required>
        <input type="password" v-model="contrasena" placeholder="Contraseña" required>
        <button type="submit" class="btn">Ingresar</button>
      </form>
    </section>
  </header>
</template>
