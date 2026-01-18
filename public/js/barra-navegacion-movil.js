// barra-navegacion-movil.js - Funcionalidad del menú hamburguesa para dispositivos móviles

document.addEventListener('DOMContentLoaded', () => {
  const interruptorMenu = document.getElementById('menu-toggle');
  const menuNavegacion = document.getElementById('nav-menu');

  if (interruptorMenu && menuNavegacion) {
    interruptorMenu.addEventListener('click', () => {
      const estaExpandido = interruptorMenu.getAttribute('aria-expanded') === 'true';
      interruptorMenu.setAttribute('aria-expanded', !estaExpandido);
      menuNavegacion.classList.toggle('show');
    });

    // Cerrar el menú al hacer clic en un enlace (útil para anclas en la misma página)
    menuNavegacion.querySelectorAll('a').forEach(enlace => {
      enlace.addEventListener('click', () => {
        interruptorMenu.setAttribute('aria-expanded', 'false');
        menuNavegacion.classList.remove('show');
      });
    });
  }
});
