<template>
  <footer>
    <p>Todos los derechos reservados &copy;
      <span>{{ currentYear }}</span>
      Centro Escolar "Cantón El Amatal"
    </p>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear();
</script>
