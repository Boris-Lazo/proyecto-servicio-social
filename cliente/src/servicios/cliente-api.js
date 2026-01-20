/**
 * Cliente de API centralizado para el frontend Vue.
 * Gestiona la autenticación, los encabezados y los errores de forma consistente.
 */
const clienteApi = {
    async peticion(puntoEntrada, opciones = {}) {
        const token = localStorage.getItem('token');
        const encabezados = { ...opciones.headers };
        if (token) encabezados['Authorization'] = `Bearer ${token}`;
        if (!(opciones.body instanceof FormData)) encabezados['Content-Type'] = 'application/json';

        const respuesta = await fetch(puntoEntrada, { ...opciones, headers: encabezados });

        if (respuesta.status === 401 && !puntoEntrada.includes('/login')) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = '/login';
            return;
        }

        const datos = await respuesta.json();
        if (!respuesta.ok) {
            const error = new Error(datos.error || datos.mensaje || 'Error en la petición');
            error.codigoEstado = respuesta.status;
            throw error;
        }
        return datos;
    },
    obtener(puntoEntrada) { return this.peticion(puntoEntrada, { method: 'GET' }); },
    enviar(puntoEntrada, cuerpo) {
        const esFormData = cuerpo instanceof FormData;
        return this.peticion(puntoEntrada, {
            method: 'POST',
            body: esFormData ? cuerpo : JSON.stringify(cuerpo)
        });
    },
    eliminar(puntoEntrada) { return this.peticion(puntoEntrada, { method: 'DELETE' }); },
    subir(puntoEntrada, datosFormulario, alProgresar) {
        return new Promise((resolver, rechazar) => {
            const token = localStorage.getItem('token');
            const xhr = new XMLHttpRequest();
            xhr.open('POST', puntoEntrada);
            if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable && alProgresar) {
                    const porcentaje = Math.round((e.loaded / e.total) * 100);
                    alProgresar(porcentaje);
                }
            };
            xhr.onload = () => {
                try {
                    const datos = JSON.parse(xhr.responseText);
                    if (xhr.status >= 200 && xhr.status < 300) resolver(datos);
                    else rechazar(new Error(datos.error || 'Error al subir archivo'));
                } catch (e) { rechazar(new Error('Error al procesar la respuesta del servidor')); }
            };
            xhr.onerror = () => rechazar(new Error('Error de conexión con el servidor'));
            xhr.send(datosFormulario);
        });
    }
};
export default clienteApi;
