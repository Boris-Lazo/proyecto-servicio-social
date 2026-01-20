// recuperar.js – Recuperación de contraseña

// ---------- UTILIDADES ----------
function $(id) { return document.getElementById(id); }

// ---------- PASO 1: SOLICITAR ENLACE ----------
$('recover-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgBox = $('recover-msg');
    msgBox.textContent = '';
    msgBox.className = '';

    const email = $('recover-user').value.trim();

    if (!email) {
        msgBox.textContent = 'Por favor ingresa tu correo electrónico';
        msgBox.className = 'error-msg';
        return;
    }

    try {
        const data = await api.enviar('/api/recover', { correo: email });

        msgBox.textContent = 'Correo enviado. Revisa tu bandeja de entrada e ingresa el código.';
        msgBox.className = 'success-msg';
        $('recover-token-details').open = true;

    } catch (err) {
        msgBox.textContent = err.message;
        msgBox.className = 'error-msg';
    }
});

// ---------- PASO 2: CAMBIAR CONTRASEÑA ----------
$('recover-token-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgBox = $('recover-token-msg');
    msgBox.textContent = '';
    msgBox.className = '';

    const tokenTemporal = $('recover-token').value.trim();
    const nuevaClave = $('recover-new-pass').value;

    if (!tokenTemporal || !nuevaClave || nuevaClave.length < 6) {
        msgBox.textContent = 'Ingresa el código y la nueva contraseña (mín. 6 caracteres)';
        msgBox.className = 'error-msg';
        return;
    }

    try {
        await api.enviar('/api/recover/change', { tokenTemporal, nuevaClave });

        msgBox.textContent = 'Contraseña actualizada. Redirigiendo...';
        msgBox.className = 'success-msg';
        setTimeout(() => window.location.href = 'login.html', 2000);

    } catch (err) {
        msgBox.textContent = err.message;
        msgBox.className = 'error-msg';
    }
});


// ---------- MOSTRAR CONTRASEÑA ----------
$('show-password').addEventListener('change', (e) => {
    const passInput = $('recover-new-pass');
    passInput.type = e.target.checked ? 'text' : 'password';
});
