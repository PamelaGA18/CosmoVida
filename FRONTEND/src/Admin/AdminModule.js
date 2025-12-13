import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../state/authSlice"; // Ajusta la ruta según tu estructura
import {
    HomeIcon,
    ShoppingCartIcon,
    UserIcon,
    TagIcon,
    ChartBarIcon,
    CogIcon,
    WalletIcon
} from "@heroicons/react/24/outline";

const sidebarItems = [
    { name: "Inicio", icon: HomeIcon, path: "/" },
    { name: "Panel", icon: ChartBarIcon, path: "/admin" },
    { name: "Productos", icon: ShoppingCartIcon, path: "/admin/products" },
    { name: "Usuarios", icon: UserIcon, path: "/admin/users" },
    { name: "Pedidos", icon: WalletIcon, path: "/admin/orders" },
    { name: "Categorías", icon: TagIcon, path: "/admin/category" },
    { name: "Colores", icon: CogIcon, path: "/admin/colors" },
];

const AdminModule = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = () => {
        // Dispatch para limpiar el estado de Redux
        dispatch(logout());

        // Limpiar localStorage si es necesario
        localStorage.removeItem("userData");

        // Redirigir al login
        navigate("/login");

        // Cerrar el modal
        setIsLogoutModalOpen(false);
    };

    const openLogoutModal = () => {
        setIsLogoutModalOpen(true);
    };

    const closeLogoutModal = () => {
        setIsLogoutModalOpen(false);
    };

    return (
        <div className="flex min-h-screen">
            {/* Modal de confirmación de cierre de sesión */}
            {isLogoutModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={closeLogoutModal}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 transform transition-all duration-300 scale-100"
                        onClick={(e) => e.stopPropagation()} // Previene que el clic se propague al fondo
                    >
                        <div className="text-center">
                            {/* Icono de advertencia */}
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                ¿Cerrar sesión?
                            </h3>
                            <p className="text-gray-600 mb-6">
                                ¿Estás seguro de que deseas cerrar tu sesión? Tendrás que iniciar sesión nuevamente para acceder al panel.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={closeLogoutModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Cerrar sesión
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <div
                className={`${isSidebarOpen ? "w-64" : "w-240"
                    } bg-white border-r border-gray-200 transition-all duration-300 bg-gradient-to-r from-[#6A5A8C] to-[#A6789F]`}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <button
                        className="p-2 rounded-md focus:outline-none hover:bg-gray-100"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="h-6 w-6 text-gray-500"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 6h18M3 12h18M3 18h18"
                            />
                        </svg>
                    </button>
                </div>

                <nav className="mt-4">
                    {sidebarItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-4 py-3 mx-2 rounded-md hover:text-gray-600 hover:bg-gray-100 transition ${isActive ? "bg-gray-200 text-gray-900" : "text-gray-100"
                                }`
                            }
                        >
                            <item.icon className={`h-6 w-6 transition-transform duration-500 ${isSidebarOpen ? "translate-x-0" : "translate-x-0"
                                }`}
                            />
                            <span
                                className={`text-sm font-medium whitespace-nowrap transition-all duration-500 ease-in-out ${isSidebarOpen
                                        ? "opacity-100 translate-x-0"
                                        : "opacity-0 -translate-x-5 pointer-events-none"
                                    }`}
                            >
                                {item.name}
                            </span>
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                <header className="bg-white shadow bg-gradient-to-r from-[#6A5A8C] to-[#A6789F]">
                    <div className="flex items-center justify-between px-6 py-4">
                        <h1 className="text-lg font-semibold text-gray-100">Panel de Administrador</h1>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={openLogoutModal}
                                className="text-sm font-medium text-gray-100 hover:text-gray-300 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Cerrar sesión
                            </button>
                        </div>
                    </div>
                </header>
                <main className="p-1 bg-gradient-to-r from-[#F7C8D0] via-[#EADCF8] to-[#C7E8F3] min-h-screen">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminModule;