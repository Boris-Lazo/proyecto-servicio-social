// anio-dinamico.js - Actualiza automáticamente el año en el pie de página

document.addEventListener('DOMContentLoaded', () => {
  const elementoAnio = document.getElementById('year');
  if (elementoAnio) {
    elementoAnio.textContent = new Date().getFullYear();
  }
});
