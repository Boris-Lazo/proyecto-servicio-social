// navbar-mobile.js
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('nav-menu');
  const nav = document.getElementById('header-top');
  if (!toggle || !menu) return;

  // Toggle menú móvil
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    menu.classList.toggle('show');
  });

  // Cerrar al pulsar enlaces
  document.querySelectorAll('#nav-menu a').forEach(link =>
    link.addEventListener('click', () => menu.classList.remove('show'))
  );

  // Cerrar al pulsar fuera
  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && menu.classList.contains('show')) menu.classList.remove('show');
  });

  // Cerrar con Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('show')) {
      menu.classList.remove('show');
      toggle.focus();
    }
  });
});