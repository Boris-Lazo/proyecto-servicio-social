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
        const res = await fetch('/api/recover', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'No se pudo generar el enlace');

        msgBox.textContent = 'Enlace generado. Revísalo en tu correo institucional.';
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

    const tempToken = $('recover-token').value.trim();
    const newPass = $('recover-new-pass').value;

    if (!tempToken || !newPass || newPass.length < 6) {
        msgBox.textContent = 'Completa el enlace y la nueva contraseña (mín. 6 caracteres)';
        msgBox.className = 'error-msg';
        return;
    }

    try {
        const res = await fetch('/api/recover/change', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tempToken, newPass })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Enlace expirado o inválido');

        msgBox.textContent = 'Contraseña actualizada. Redirigiendo...';
        msgBox.className = 'success-msg';
        setTimeout(() => window.location.href = 'login.html', 2000);

    } catch (err) {
        msgBox.textContent = err.message;
        msgBox.className = 'error-msg';
    }
});
