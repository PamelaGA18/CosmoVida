require('dotenv').config();
const User = require("../models/user.model");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ✅ VARIABLE DINÁMICA PARA BACKEND URL
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// CONTROLADORES
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) {
            return res.status(403).json({ success: false, message: "¡Usuario ya registrado!" });
        }

        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(password, salt);
        user = new User({ name, email, password: hashPassword });
        await user.save();

        res.status(200).json({ success: true, message: "¡El usuario está registrado!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error al registrar." });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "Usuario no registrado." });
        }

        const isAuth = bcrypt.compareSync(password, user.password);
        if (!isAuth) {
            return res.status(404).json({ success: false, message: "La contraseña es incorrecta." });
        }

        const token = jwt.sign(
            { id: user._id, name: user.name, role: user.role },
            process.env.JWT_SECRET
        );

        // ✅ CORRECCIÓN COMPLETA: Usar BACKEND_URL variable
        let imageUrl = "";
        if (user.imageUrl) {
            imageUrl = user.imageUrl.startsWith('http')
                ? user.imageUrl
                : `${BACKEND_URL}/uploads/${user.imageUrl}`;
        }

        res.header("Authorization", token).status(200).json({
            success: true,
            message: "Iniciaste sesión correctamente.",
            userData: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token,
                imageUrl: imageUrl
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error al iniciar sesión." });
    }
};

const fetchUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error al obtener usuarios." });
    }
};

const deleteUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "Usuario no eliminado." });
        if (user.role === "admin") return res.status(405).json({ success: false, message: "No se puede eliminar el Administrador." });

        await User.findByIdAndDelete(req.params.id);
        const users = await User.find();
        res.status(200).json({ success: true, message: "Usuario eliminado correctamente.", users });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error al eliminar usuario." });
    }
};

// Obtener perfil del usuario autenticado
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "Usuario no encontrado." });

        // ✅ CORRECCIÓN COMPLETA: Usar BACKEND_URL variable
        let imageUrl = "";
        if (user.imageUrl) {
            imageUrl = user.imageUrl.startsWith('http')
                ? user.imageUrl
                : `${BACKEND_URL}/uploads/${user.imageUrl}`;
        }

        res.status(200).json({
            success: true,
            userData: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                imageUrl: imageUrl
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (req.body.name) user.name = req.body.name;
        if (req.body.email) user.email = req.body.email;
        if (req.body.password) {
            const salt = bcrypt.genSaltSync(10);
            user.password = bcrypt.hashSync(req.body.password, salt);
        }
        if (req.file) {
            user.imageUrl = req.file.filename;
        }

        await user.save();

        // ✅ CORRECCIÓN COMPLETA: Usar BACKEND_URL variable
        let imageUrl = "";
        if (user.imageUrl) {
            imageUrl = user.imageUrl.startsWith('http')
                ? user.imageUrl
                : `${BACKEND_URL}/uploads/${user.imageUrl}`;
        }

        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            imageUrl: imageUrl
        };

        console.log("userData enviado:", userData);

        res.status(200).json({ success: true, userData });
    } catch (error) {
        console.error("Error updating profile:", error);
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