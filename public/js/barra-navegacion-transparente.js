// barra-navegacion-transparente.js - Cambia la opacidad de la barra al hacer scroll

document.addEventListener('DOMContentLoaded', () => {
  const barraNavegacion = document.getElementById('header-top');
  if (!barraNavegacion) return;

  let ejecutando = false;

  /**
   * Actualiza la clase de la barra de navegación basada en la posición del scroll
   */
  const actualizarNavegacion = () => {
    barraNavegacion.classList.toggle('scrolled', window.scrollY > 50);
    ejecutando = false;
  };

  /**
   * Optimiza el evento de scroll usando requestAnimationFrame
   */
  const solicitarActualizacion = () => {
    if (!ejecutando) {
      window.requestAnimationFrame(actualizarNavegacion);
      ejecutando = true;
    }
  };

  window.addEventListener('scroll', solicitarActualizacion);
  actualizarNavegacion(); // Llamada inicial para establecer el estado correcto al cargar
});
