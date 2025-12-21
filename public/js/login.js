// login.js – Solo funcionalidad de inicio de sesión

// ---------- UTILIDADES ----------
function $(id) { return document.getElementById(id); }

// ---------- MOSTRAR/OCULTAR CONTRASEÑA ----------
$('show-password').addEventListener('change', (e) => {
    const campoContrasena = $('password');
    campoContrasena.type = e.target.checked ? 'text' : 'password';
});

// ---------- LOGIN ----------
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const correo = $('user').value.trim();
    const contrasena = $('password').value;

    if (!correo || !contrasena) {
        alert('Por favor completa todos los campos');
        return;
    }

    try {
        const respuesta = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: correo, password: contrasena })
        });

        // Verificar si la respuesta tiene contenido
        const texto = await respuesta.text();
        if (!texto) {
            throw new Error('El servidor no respondió correctamente');
        }

        const datos = JSON.parse(texto);

        if (!respuesta.ok) {
            throw new Error(datos.error || 'Credenciales incorrectas');
        }

        localStorage.setItem('token', datos.token);
        localStorage.setItem('user', correo);
        window.location.href = 'admin.html';

    } catch (err) {
        console.error('Error de login:', err);
        alert(err.message || 'Error al iniciar sesión');
    }
});