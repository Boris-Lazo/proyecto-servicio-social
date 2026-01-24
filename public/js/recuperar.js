// recuperar.js – Recuperación de contraseña

// ---------- UTILIDADES ----------
function $(id) { return document.getElementById(id); }

// ---------- PASO 1: SOLICITAR ENLACE ----------
$('recover-form').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const cajaMensaje = $('recover-msg');
    cajaMensaje.textContent = '';
    cajaMensaje.className = '';

    const correo = $('recover-user').value.trim();

    if (!correo) {
        cajaMensaje.textContent = 'Por favor ingresa tu correo electrónico';
        cajaMensaje.className = 'error-msg';
        return;
    }

    try {
        await api.enviar('/api/recuperar', { correo });

        cajaMensaje.textContent = 'Correo enviado. Revisa tu bandeja de entrada e ingresa el código.';
        cajaMensaje.className = 'success-msg';
        $('recover-token-details').open = true;

    } catch (error) {
        cajaMensaje.textContent = error.message;
        cajaMensaje.className = 'error-msg';
    }
});

// ---------- PASO 2: CAMBIAR CONTRASEÑA ----------
$('recover-token-form').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const cajaMensaje = $('recover-token-msg');
    cajaMensaje.textContent = '';
    cajaMensaje.className = '';

    const tokenTemporal = $('recover-token').value.trim();
    const nuevaClave = $('recover-new-pass').value;

    if (!tokenTemporal || !nuevaClave || nuevaClave.length < 6) {
        cajaMensaje.textContent = 'Ingresa el código y la nueva contraseña (mín. 6 caracteres)';
        cajaMensaje.className = 'error-msg';
        return;
    }

    try {
        await api.enviar('/api/recuperar/cambiar', { tokenTemporal, nuevaClave });

        cajaMensaje.textContent = 'Contraseña actualizada. Redirigiendo...';
        cajaMensaje.className = 'success-msg';
        setTimeout(() => window.location.href = 'login.html', 2000);

    } catch (error) {
        cajaMensaje.textContent = error.message;
        cajaMensaje.className = 'error-msg';
    }
});


// ---------- MOSTRAR CONTRASEÑA ----------
$('show-password').addEventListener('change', (evento) => {
    const entradaPass = $('recover-new-pass');
    entradaPass.type = evento.target.checked ? 'text' : 'password';
});
