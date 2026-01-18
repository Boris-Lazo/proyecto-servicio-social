// login.js – Solo funcionalidad de inicio de sesión

// ---------- UTILIDADES ----------
function $(id) { return document.getElementById(id); }

// ---------- MOSTRAR/OCULTAR CONTRASEÑA ----------
$('show-password').addEventListener('change', (e) => {
    const passwordInput = $('password');
    passwordInput.type = e.target.checked ? 'text' : 'password';
});

// ---------- LOGIN ----------
$('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = $('user').value.trim();
    const password = $('password').value;

    if (!email || !password) {
        alert('Por favor completa todos los campos');
        return;
    }

    try {
        const data = await api.post('/api/login', { user: email, password });

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', email);
        window.location.href = 'admin.html';

    } catch (err) {
        console.error('Error de login:', err);
        alert(err.message || 'Error al iniciar sesión');
    }
});