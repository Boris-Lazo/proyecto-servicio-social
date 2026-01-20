export function sanitizarHTML(cadenaInsegura) {
  if (typeof cadenaInsegura !== 'string') return '';
  const mapaEntidades = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;'
  };
  return cadenaInsegura.replace(/[&<>"'`=\/]/g, (caracter) => mapaEntidades[caracter]);
}
