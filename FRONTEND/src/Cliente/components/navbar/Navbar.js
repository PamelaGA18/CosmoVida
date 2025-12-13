import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useSelector } from 'react-redux';
import { baseUrl } from '../../../environment';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
    const auth = useSelector((state) => state.auth.auth);
    const isAdmin = useSelector((state) => state.auth.admin);
    const cartTotal = useSelector((state) => state.cart.total);

    // ✅ CORRECCIÓN: Acceder correctamente a los datos según tu authSlice
    const userData = useSelector(state => state.auth.userData);
    const name = userData?.name || '';
    const imageUrl = userData?.imageUrl || '';

    console.log("=== NAVBAR DEBUG ===");
    console.log("auth:", auth);
    console.log("isAdmin:", isAdmin);
    console.log("userData completo:", userData);
    console.log("name:", name);
    console.log("imageUrl:", imageUrl);
    console.log("Estado completo de auth:", useSelector(state => state.auth));
    console.log("=====================");

    const navigation = [
        { name: 'Inicio', link: '', current: true },
        { name: 'Productos', link: '/products', current: false },
    ]

    return (
        <Disclosure as="nav" className="bg-gradient-to-r from-[#6A5A8C] to-[#A6789F]">
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                <div className="relative flex h-16 items-center justify-between">

                    {/* Mobile button */}
                    <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                        <DisclosureButton className="group inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-white/40 hover:text-gray-900 transition">
                            <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
                            <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
                        </DisclosureButton>
                    </div>

                    {/* Logo + links */}
                    <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                        <div className="flex shrink-0 items-center text-gray-100 font-bold text-lg">
                            CosmoVida
                        </div>

                        <div className="hidden sm:ml-6 sm:block">
                            <div className="flex space-x-4">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.link}
                                        aria-current={item.current ? 'page' : undefined}
                                        className={classNames(
                                            item.current
                                                ? 'bg-pink-300/70 text-gray-900'
                                                : 'text-gray-100 hover:bg-white/50 hover:text-gray-900',
                                            'rounded-md px-3 py-2 text-sm font-medium transition'
                                        )}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">

                        {/* Login / Register */}
                        {!auth && (
                            <>
                                <Link
                                    to={'login'}
                                    className="text-gray-100 hover:bg-white/50 hover:text-gray-900 rounded-md px-3 py-2 text-sm font-medium transition"
                                >
                                    Iniciar sesión
                                </Link>

                                <Link
                                    to={'register'}
                                    className="text-gray-100 hover:bg-white/50 hover:text-gray-900 rounded-md px-3 py-2 text-sm font-medium transition"
                                >
                                    Registrarse
                                </Link>
                            </>
                        )}

                        {/* Pedidos */}
                        {auth && (
                            <Link
                                to={'orders'}
                                className="text-gray-700 hover:bg-white/50 hover:text-gray-900 rounded-md px-3 py-2 text-sm font-medium transition"
                            >
                                Pedidos
                            </Link>
                        )}

                        {/* Cart */}
                        {auth && (
                            <Link
                                to={'cart'}
                                className="relative text-gray-700 hover:bg-white/50 hover:text-gray-900 rounded-md px-3 py-2 text-sm font-medium transition"
                            >
                                <ShoppingCartIcon className="h-6 w-6 text-gray-700" />
                                <div className="absolute right-0 top-0 bg-white rounded-full text-gray-900 text-xs px-1 shadow">
                                    {cartTotal}
                                </div>
                            </Link>
                        )}

                        {/* Profile dropdown */}
                        {auth && (
                            <Menu as="div" className="relative ml-3">
                                <MenuButton className="flex rounded-full focus-visible:outline-none items-center gap-2">
                                    <img
                                        src={imageUrl || "/default-avatar.png"}
                                        alt="Avatar"
                                        className="h-8 w-8 rounded-full object-cover border-2 border-white"
                                        onError={(e) => {
                                            console.log("❌ Error cargando imagen:", imageUrl);
                                            e.target.src = "/default-avatar.png";
                                        }}
                                        onLoad={(e) => {
                                            console.log("✅ Imagen cargada correctamente:", imageUrl);
                                        }}
                                    />
                                    <span className="text-gray-900 text-sm font-medium hidden md:block">{name}</span>
                                </MenuButton>

                                <MenuItems
                                    transition
                                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-purple-100 py-2 shadow-lg ring-1 ring-black/5 transition"
                                >
                                    <MenuItem>
                                        <Link
                                            to={'/profile'}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-white rounded-md"
                                        >
                                            Tu perfil
                                        </Link>
                                    </MenuItem>

                                    {auth && isAdmin && (
                                        <MenuItem>
                                            <Link
                                                to={'/admin'}
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-white rounded-md"
                                            >
                                                Panel
                                            </Link>
                                        </MenuItem>
                                    )}

                                    <MenuItem>
                                        <Link
                                            to={'/sign-out'}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-white rounded-md"
                                        >
                                            Cerrar sesión
                                        </Link>
                                    </MenuItem>
                                </MenuItems>
                            </Menu>
                        )}

                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <DisclosurePanel className="sm:hidden">
                <div className="space-y-1 px-2 pt-2 pb-3">
                    {navigation.map((item) => (
                        <DisclosureButton
                            key={item.name}
                            as="a"
                            href={item.href}
                            aria-current={item.current ? 'page' : undefined}
                            className={classNames(
                                item.current
                                    ? 'bg-pink-300/70 text-gray-900'
                                    : 'text-gray-700 hover:bg-white/50 hover:text-gray-900',
                                'block rounded-md px-3 py-2 text-base font-medium transition'
                            )}
                        >
                            {item.name}
                        </DisclosureButton>
                    ))}
                </div>
            </DisclosurePanel>
        </Disclosure>
    )
}