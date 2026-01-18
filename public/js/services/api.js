/**
 * Cliente de API centralizado para el frontend
 * Maneja autenticación, headers y errores de forma consistente
 */
const api = {
    /**
     * Realiza una petición fetch con manejo de errores y auth
     */
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');

        const headers = {
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Si no es FormData, añadir Content-Type JSON
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(endpoint, {
            ...options,
            headers
        });

        // Manejar errores de sesión expirada
        if (response.status === 401 && !endpoint.includes('/login')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
            return;
        }

        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.error || data.msg || 'Error en la petición');
            error.status = response.status;
            throw error;
        }

        return data;
    },

    /**
     * Atajos para métodos comunes
     */
    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    post(endpoint, body) {
        const isFormData = body instanceof FormData;
        return this.request(endpoint, {
            method: 'POST',
            body: isFormData ? body : JSON.stringify(body)
        });
    },

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    },

    /**
     * Manejo de subida de archivos con progreso (usando XMLHttpRequest)
     */
    upload(endpoint, formData, onProgress) {
        return new Promise((resolve, reject) => {
            const token = localStorage.getItem('token');
            const xhr = new XMLHttpRequest();

            xhr.open('POST', endpoint);

            if (token) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable && onProgress) {
                    const percentage = Math.round((e.loaded / e.total) * 100);
                    onProgress(percentage);
                }
            };

            xhr.onload = () => {
                const data = JSON.parse(xhr.responseText);
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(data);
                } else {
                    reject(new Error(data.error || 'Error al subir archivo'));
                }
            };

            xhr.onerror = () => reject(new Error('Falló la conexión'));
            xhr.send(formData);
        });
    }
};

// Hacerlo disponible globalmente (como no usamos módulos en el frontend actual)
window.api = api;
