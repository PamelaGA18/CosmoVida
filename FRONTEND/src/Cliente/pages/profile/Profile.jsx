import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { baseUrl } from "../../../environment";
import { login } from "../../../state/authSlice";
import { useNavigate } from "react-router-dom";

export default function Profile() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAdmin = useSelector(state => state.auth.admin);

    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        imageUrl: null,
        preview: null
    });
    const [message, setMessage] = useState("");

    useEffect(() => {
        axios.get(`${baseUrl}/user/me`)
            .then(resp => {
                const data = resp.data.userData;
                setUser(data);
                setFormData({
                    name: data.name || "",
                    email: data.email || "",
                    password: "",
                    imageUrl: null,
                    preview: null
                });
            })
            .catch(err => console.log(err));
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files && files[0]) {
            const file = files[0];
            setFormData(prev => ({
                ...prev,
                [name]: file,
                preview: URL.createObjectURL(file)
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const data = new FormData();
        if (isAdmin) {
            data.append("name", formData.name);
            data.append("email", formData.email);
            if (formData.password) data.append("password", formData.password);
        } else {
            data.append("email", formData.email);
            if (formData.password) data.append("password", formData.password);
        }

        if (formData.imageUrl instanceof File) {
            data.append("image", formData.imageUrl);
        }

        axios.put(`${baseUrl}/user/me`, data, {
            headers: { "Content-Type": "multipart/form-data" }
        })
        .then(resp => {
            const updatedUser = resp.data.userData;
            
            setUser(updatedUser);
            setFormData({
                name: updatedUser.name,
                email: updatedUser.email,
                password: "",
                imageUrl: null,
                preview: null
            });

            dispatch(login({ 
                auth: true, 
                admin: updatedUser.role === "admin",
                userData: {
                    id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    role: updatedUser.role,
                    imageUrl: updatedUser.imageUrl
                }
            }));

            setMessage("Datos actualizados correctamente");
            setIsEditing(false);
        })
        .catch(err => {
            console.error("Update error:", err);
            setMessage(err.response?.data?.message || "Error al actualizar");
        });
    };

    const handleCancel = () => {
        // Restaurar los datos originales del usuario
        setFormData({
            name: user.name || "",
            email: user.email || "",
            password: "",
            imageUrl: null,
            preview: null
        });
        setIsEditing(false);
        setMessage("");
    };

    if (!user) return (
        <div className="min-h-screen bg-gradient-to-br from-[#f9dbe2] via-[#efe4fb] to-[#d8edf5] flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando perfil...</p>
            </div>
        </div>
    );

    // MODO VISUALIZACIÓN
    if (!isEditing) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#f9dbe2] via-[#efe4fb] to-[#d8edf5] py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Botón Regresar */}
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 flex items-center text-purple-600 hover:text-purple-800 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Regresar
                    </button>

                    <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
                        {/* Header con gradiente */}
                        <div className="bg-gradient-to-r from-[#6A5A8C] to-[#A6789F] py-8 px-6 text-white">
                            <div className="flex items-center space-x-6">
                                <div className="relative">
                                    <img
                                        src={user.imageUrl || "/default-avatar.png"}
                                        alt="Avatar"
                                        className="w-24 h-24 rounded-full border-4 border-white/80 shadow-lg object-cover"
                                    />
                                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">{user.name}</h1>
                                    <p className="text-purple-100 opacity-90">{user.email}</p>
                                    <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm">
                                        {user.role === "admin" ? "Administrador" : "Usuario"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Información del perfil */}
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="bg-white/50 rounded-2xl p-6 shadow-sm">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Información Personal
                                        </h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-sm text-gray-600">Nombre completo</label>
                                                <p className="font-medium text-gray-900">{user.name}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-600">Correo electrónico</label>
                                                <p className="font-medium text-gray-900">{user.email}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-600">Rol</label>
                                                <p className="font-medium text-gray-900 capitalize">{user.role}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-white/50 rounded-2xl p-6 shadow-sm">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            Seguridad
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            Tu cuenta está protegida. Puedes cambiar tu contraseña cuando lo desees.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Botón de Modificar */}
                            <div className="mt-8 flex justify-center">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-8 py-3 bg-gradient-to-r from-[#6A5A8C] to-[#A6789F] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                >
                                    <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Modificar Perfil
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // MODO EDICIÓN
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f9dbe2] via-[#efe4fb] to-[#d8edf5] py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Botón Regresar */}
                <button
                    onClick={handleCancel}
                    className="mb-6 flex items-center text-purple-600 hover:text-purple-800 transition-colors"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Cancelar y volver
                </button>

                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8">
                    {message && (
                        <div className={`mb-6 p-4 rounded-xl ${
                            message.includes("correctamente") 
                                ? "bg-green-100 text-green-800 border border-green-200" 
                                : "bg-red-100 text-red-800 border border-red-200"
                        }`}>
                            {message}
                        </div>
                    )}

                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Editar Perfil</h2>
                    <p className="text-gray-600 mb-6">Actualiza tu información personal</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Foto de perfil */}
                        <div className="text-center">
                            <label className="block text-sm font-medium text-gray-700 mb-4">Foto de perfil</label>
                            <div className="flex items-center justify-center space-x-8">
                                <div className="relative">
                                    <img
                                        src={formData.preview || user.imageUrl || "/default-avatar.png"}
                                        alt="Avatar"
                                        className="w-20 h-20 rounded-full border-4 border-purple-200 object-cover shadow-lg"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="file"
                                        name="imageUrl"
                                        onChange={handleChange}
                                        accept="image/*"
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">PNG, JPG, JPEG hasta 5MB</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {isAdmin && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-colors"
                                        placeholder="Tu nombre completo"
                                    />
                                </div>
                            )}

                            <div className={isAdmin ? "" : "md:col-span-2"}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Correo electrónico</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-colors"
                                    placeholder="tu@email.com"
                                />
                            </div>

                            <div className={isAdmin ? "md:col-span-2" : ""}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nueva contraseña</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Dejar vacío para mantener la actual"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#6A5A8C] to-[#A6789F] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}