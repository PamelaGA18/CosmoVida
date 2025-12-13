import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react' // Añadido useEffect
import { Link } from 'react-router-dom'
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useSelector } from 'react-redux';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
    const auth = useSelector((state) => state.auth.auth);
    const isAdmin = useSelector((state) => state.auth.admin);
    const cartTotal = useSelector((state) => state.cart.total);

    // ✅ Acceder correctamente a los datos del usuario
    const userData = useSelector(state => state.auth.userData);
    
    // ✅ Estados locales para manejar los datos del usuario
    const [userName, setUserName] = useState('');
    const [userImage, setUserImage] = useState('');
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    console.log("=== NAVBAR DEBUG ===");
    console.log("auth:", auth);
    console.log("isAdmin:", isAdmin);
    console.log("userData completo:", userData);
    console.log("=====================");

    // ✅ Efecto para manejar los datos del usuario de forma segura
    useEffect(() => {
        if (userData && userData.name) {
            setUserName(userData.name);
        } else {
            setUserName('');
        }

        if (userData && userData.imageUrl) {
            setUserImage(userData.imageUrl);
            setIsImageLoaded(false); // Resetear estado de carga
        } else {
            setUserImage('/default-avatar.png');
            setIsImageLoaded(true); // Imagen por defecto siempre está disponible
        }
    }, [userData]);

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
                                {cartTotal > 0 && (
                                    <div className="absolute -right-1 -top-1 bg-white rounded-full text-gray-900 text-xs w-5 h-5 flex items-center justify-center shadow">
                                        {cartTotal}
                                    </div>
                                )}
                            </Link>
                        )}

                        {/* Profile dropdown - Solo mostrar si está autenticado */}
                        {auth && (
                            <Menu as="div" className="relative ml-3">
                                <MenuButton className="flex rounded-full focus-visible:outline-none items-center gap-2 hover:opacity-90 transition-opacity">
                                    <div className="relative">
                                        {/* Contenedor de imagen con loader */}
                                        <img
                                            src={userImage}
                                            alt={userName || "Usuario"}
                                            className="h-8 w-8 rounded-full object-cover border-2 border-white"
                                            onError={(e) => {
                                                console.log("❌ Error cargando imagen, usando avatar por defecto");
                                                e.target.src = "/default-avatar.png";
                                                setIsImageLoaded(true);
                                            }}
                                            onLoad={(e) => {
                                                console.log("✅ Imagen cargada correctamente");
                                                setIsImageLoaded(true);
                                            }}
                                            style={{
                                                opacity: isImageLoaded ? 1 : 0,
                                                transition: 'opacity 0.3s ease'
                                            }}
                                        />
                                        {/* Loader mientras carga la imagen */}
                                        {!isImageLoaded && userImage !== '/default-avatar.png' && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                    </div>
                                    {userName && (
                                        <span className="text-gray-900 text-sm font-medium hidden md:block truncate max-w-[120px]">
                                            {userName}
                                        </span>
                                    )}
                                </MenuButton>

                                <MenuItems
                                    transition
                                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-purple-100 py-2 shadow-lg ring-1 ring-black/5 transition focus:outline-none"
                                >
                                    <MenuItem>
                                        {({ active }) => (
                                            <Link
                                                to={'/profile'}
                                                className={classNames(
                                                    active ? 'bg-white' : '',
                                                    'block px-4 py-2 text-sm text-gray-700 rounded-md'
                                                )}
                                            >
                                                Tu perfil
                                            </Link>
                                        )}
                                    </MenuItem>

                                    {isAdmin && (
                                        <MenuItem>
                                            {({ active }) => (
                                                <Link
                                                    to={'/admin'}
                                                    className={classNames(
                                                        active ? 'bg-white' : '',
                                                        'block px-4 py-2 text-sm text-gray-700 rounded-md'
                                                    )}
                                                >
                                                    Panel de administración
                                                </Link>
                                            )}
                                        </MenuItem>
                                    )}

                                    <MenuItem>
                                        {({ active }) => (
                                            <Link
                                                to={'/sign-out'}
                                                className={classNames(
                                                    active ? 'bg-white' : '',
                                                    'block px-4 py-2 text-sm text-gray-700 rounded-md'
                                                )}
                                            >
                                                Cerrar sesión
                                            </Link>
                                        )}
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
                            as={Link}
                            to={item.link}
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
                    
                    {/* Mobile: Login/Register links */}
                    {!auth && (
                        <>
                            <DisclosureButton
                                as={Link}
                                to={'login'}
                                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-white/50 hover:text-gray-900 transition"
                            >
                                Iniciar sesión
                            </DisclosureButton>
                            <DisclosureButton
                                as={Link}
                                to={'register'}
                                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-white/50 hover:text-gray-900 transition"
                            >
                                Registrarse
                            </DisclosureButton>
                        </>
                    )}
                    
                    {/* Mobile: Menu para usuarios autenticados */}
                    {auth && (
                        <>
                            <DisclosureButton
                                as={Link}
                                to={'orders'}
                                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-white/50 hover:text-gray-900 transition"
                            >
                                Mis pedidos
                            </DisclosureButton>
                            <DisclosureButton
                                as={Link}
                                to={'cart'}
                                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-white/50 hover:text-gray-900 transition flex items-center gap-2"
                            >
                                <ShoppingCartIcon className="h-5 w-5" />
                                Carrito {cartTotal > 0 && `(${cartTotal})`}
                            </DisclosureButton>
                            <DisclosureButton
                                as={Link}
                                to={'/profile'}
                                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-white/50 hover:text-gray-900 transition"
                            >
                                Mi perfil
                            </DisclosureButton>
                            {isAdmin && (
                                <DisclosureButton
                                    as={Link}
                                    to={'/admin'}
                                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-white/50 hover:text-gray-900 transition"
                                >
                                    Panel administrativo
                                </DisclosureButton>
                            )}
                            <DisclosureButton
                                as={Link}
                                to={'/sign-out'}
                                className="block rounded-md px-3 py-2 text-base font-medium text-red-700 hover:bg-red-50 hover:text-red-900 transition"
                            >
                                Cerrar sesión
                            </DisclosureButton>
                        </>
                    )}
                </div>
            </DisclosurePanel>
        </Disclosure>
    )
}