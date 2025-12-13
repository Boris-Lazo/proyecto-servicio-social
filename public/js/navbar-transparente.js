// navbar-transparency.js
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('header-top');
  if (!nav) return;

  let ticking = false;
  const updateNav = () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
    ticking = false;
  };
  const requestTick = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateNav);
      ticking = true;
    }
  };
  window.addEventListener('scroll', requestTick);
  updateNav(); // inicial
});