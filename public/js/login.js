// login.js – Solo funcionalidad de inicio de sesión

// ---------- UTILIDADES ----------
function $(id) { return document.getElementById(id); }

// ---------- MOSTRAR/OCULTAR CONTRASEÑA ----------
$('show-password').addEventListener('change', (e) => {
    const passwordInput = $('password');
    passwordInput.type = e.target.checked ? 'text' : 'password';
});

// ---------- LOGIN ----------
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = $('user').value.trim();
    const password = $('password').value;

    if (!email || !password) {
        alert('Por favor completa todos los campos');
        return;
    }

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: email, password })
        });

        // Verificar si la respuesta tiene contenido
        const text = await res.text();
        if (!text) {
            throw new Error('El servidor no respondió correctamente');
        }

        const data = JSON.parse(text);

        if (!res.ok) {
            throw new Error(data.error || 'Credenciales incorrectas');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', email);
        window.location.href = 'admin.html';

    } catch (err) {
        console.error('Error de login:', err);
        alert(err.message || 'Error al iniciar sesión');
    }
});