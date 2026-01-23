const { z } = require('zod');

// Función auxiliar para sanear texto (remover tags HTML básicos)
// Esto es una capa extra de seguridad, aunque la validación principal rechaza caracteres sospechosos
const sanearTexto = (val) => {
    if (typeof val !== 'string') return val;
    return val
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
};

const esquemaAlbum = z.object({
    titulo: z.string()
        .min(3, "El título debe tener al menos 3 caracteres")
        .max(100, "El título no puede exceder los 100 caracteres")
        .transform(sanearTexto),

    fecha: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener el formato AAAA-MM-DD"),

    descripcion: z.string()
        .max(500, "La descripción no puede exceder los 500 caracteres")
        .optional()
        .transform(val => val ? sanearTexto(val) : "")
});

const esquemaDocumento = z.object({
    titulo: z.string()
        .min(3, "El título debe tener al menos 3 caracteres")
        .max(100, "El título no puede exceder los 100 caracteres")
        .transform(sanearTexto),

    mes: z.string()
        .regex(/^\d{4}-\d{2}$/, "El mes debe tener el formato AAAA-MM")
});



const esquemaSesion = z.object({
    usuario: z.string().email('Email inválido').min(1, 'Email requerido'),
    contrasena: z.string().min(1, 'Contraseña requerida'),
});

const esquemaCambioClave = z.object({
    viejaClave: z.string().min(1, 'Contraseña actual requerida'),
    nuevaClave: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
});

const esquemaRecuperacion = z.object({
    correo: z.string().email('Email inválido').min(1, 'Email requerido'),
});

const esquemaRestablecimiento = z.object({
    tokenTemporal: z.string().min(1, 'Token requerido'),
    nuevaClave: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

module.exports = {
    esquemaAlbum,
    esquemaDocumento,
    esquemaSesion,
    esquemaCambioClave,
    esquemaRecuperacion,
    esquemaRestablecimiento
};
