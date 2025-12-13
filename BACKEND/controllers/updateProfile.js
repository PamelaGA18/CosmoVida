const User = require("../models/user.model");

// Obtener perfil del propio usuario
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error al obtener perfil" });
    }
};

// Actualizar perfil del propio usuario
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: "Usuario no encontrado" });

        // Actualizar campos básicos
        if (req.body.name) user.name = req.body.name;
        if (req.body.email) user.email = req.body.email;

        // Si el usuario sube foto, actualizarla
        if (req.file) {
            user.imageUrl = `uploads/${req.file.filename}`; // ruta relativa para frontend
        }

        await user.save();

        // Retornar usuario actualizado
        res.status(200).json({
            success: true,
            message: "Datos actualizados correctamente",
            userData: user
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error al actualizar perfil" });
    }
};

module.exports = {
    register,
    login,
    fetchUsers,
    deleteUserById,
    getProfile,
    updateProfile
};
