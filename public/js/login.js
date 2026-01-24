// login.js – Solo funcionalidad de inicio de sesión

// ---------- UTILIDADES ----------
function $(id) { return document.getElementById(id); }

// ---------- MOSTRAR/OCULTAR CONTRASEÑA ----------
$('show-password').addEventListener('change', (evento) => {
    const entradaPassword = $('password');
    entradaPassword.type = evento.target.checked ? 'text' : 'password';
});

// ---------- LOGIN ----------
$('login-form').addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const correo = $('usuario').value.trim();
    const contrasena = $('password').value;

    if (!correo || !contrasena) {
        alert('Por favor completa todos los campos');
        return;
    }

    try {
        const datos = await api.enviar('/api/login', { usuario: correo, contrasena: contrasena });

        localStorage.setItem('token', datos.token);
        localStorage.setItem('usuario', correo);
        window.location.href = 'admin.html';

    } catch (error) {
        console.error('Error de login:', error);
        alert(error.message || 'Error al iniciar sesión');
    }
});
