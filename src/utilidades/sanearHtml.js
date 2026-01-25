/**
 * utilidades/sanearHtml.js
 * Funciones para prevenir ataques XSS
 */

/**
 * Sanitiza una cadena de texto para evitar la inyección de HTML.
 * Reemplaza los caracteres especiales de HTML con sus entidades correspondientes.
 *
 * @param {string} unsafeString - La cadena de texto a sanitizar.
 * @returns {string} - La cadena de texto sanitizada.
 */
export function sanearHTML(unsafeString) {
  if (typeof unsafeString !== 'string') {
    return '';
  }

  const entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  return unsafeString.replace(/[&<>"'`=\/]/g, (char) => entityMap[char]);
}
