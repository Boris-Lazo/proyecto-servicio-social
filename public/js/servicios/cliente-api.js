/**
 * Cliente de API centralizado para el frontend.
 * Gestiona la autenticación, los encabezados y los errores de forma consistente.
 */
const clienteApi = {
    /**
     * Realiza una petición fetch con gestión automática de token y errores.
     * @param {string} puntoEntrada - URL del endpoint.
     * @param {Object} opciones - Opciones de la petición fetch.
     */
    async peticion(puntoEntrada, opciones = {}) {
        const token = localStorage.getItem('token');

        const encabezados = {
            ...opciones.headers,
        };

        if (token) {
            encabezados['Authorization'] = `Bearer ${token}`;
        }

        // Si el cuerpo no es FormData, asumimos que es JSON.
        if (!(opciones.body instanceof FormData)) {
            encabezados['Content-Type'] = 'application/json';
        }

        const respuesta = await fetch(puntoEntrada, {
            ...opciones,
            headers: encabezados
        });

        // Gestionar sesiones expiradas o no autorizadas (redirigir al login).
        if (respuesta.status === 401 && !puntoEntrada.includes('/entrar')) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = 'login.html';
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

    /**
     * Realiza una petición GET.
     */
    obtener(puntoEntrada) {
        return this.peticion(puntoEntrada, { method: 'GET' });
    },

    /**
     * Realiza una petición POST.
     */
    enviar(puntoEntrada, cuerpo) {
        const esFormData = cuerpo instanceof FormData;
        return this.peticion(puntoEntrada, {
            method: 'POST',
            body: esFormData ? cuerpo : JSON.stringify(cuerpo)
        });
    },

    /**
     * Realiza una petición DELETE.
     */
    eliminar(puntoEntrada) {
        return this.peticion(puntoEntrada, { method: 'DELETE' });
    },

    /**
     * Gestiona la subida de archivos pesados con seguimiento del progreso.
     */
    subir(puntoEntrada, datosFormulario, alProgresar) {
        return new Promise((resolver, rechazar) => {
            const token = localStorage.getItem('token');
            const xhr = new XMLHttpRequest();

            xhr.open('POST', puntoEntrada);

            if (token) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable && alProgresar) {
                    const porcentaje = Math.round((e.loaded / e.total) * 100);
                    alProgresar(porcentaje);
                }
            };

            xhr.onload = () => {
                try {
                    const datos = JSON.parse(xhr.responseText);
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolver(datos);
                    } else {
                        rechazar(new Error(datos.error || 'Error al subir archivo'));
                    }
                } catch (error) {
                    rechazar(new Error('Error al procesar la respuesta del servidor'));
                }
            };

            xhr.onerror = () => rechazar(new Error('Error de conexión con el servidor'));
            xhr.send(datosFormulario);
        });
    }
};

// Exponer globalmente para ser usado por otros scripts
window.api = clienteApi;
