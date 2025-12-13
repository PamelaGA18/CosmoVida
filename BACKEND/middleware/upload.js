// middleware/upload.js
const multer = require('multer');
const path = require('path');

console.log("🔄 Cargando middleware upload para usuarios...");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("📁 Guardando archivo en uploads/");
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = uniqueSuffix + ext;
        console.log("📄 Nombre de archivo generado:", filename);
        cb(null, filename);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        console.log("=== UPLOAD MIDDLEWARE EJECUTADO ===");
        console.log("Fieldname:", file.fieldname);
        console.log("Originalname:", file.originalname);
        console.log("Mimetype:", file.mimetype);
        
        // Verificar que el fieldname sea 'image'
        if (file.fieldname !== 'image') {
            console.log("❌ Fieldname incorrecto. Se esperaba 'image' pero se recibió:", file.fieldname);
            return cb(new Error('Fieldname debe ser "image"'), false);
        }
        
        if (file.mimetype.startsWith('image/')) {
            console.log("✅ Archivo aceptado");
            cb(null, true);
        } else {
            console.log("❌ Archivo rechazado - no es imagen");
            cb(new Error('Solo se permiten imágenes!'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

module.exports = upload;