import { useEffect, useState } from 'react'
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
} from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { FunnelIcon, MinusIcon, PlusIcon } from '@heroicons/react/20/solid'
import axios from 'axios';
import Alert from '../../../basicUtilityComp/alert/Alert';
import ProductCard from './sub-components/ProductCard';
import { baseUrl } from '../../../environment';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function Products() {
    const [categories, setCategories] = useState([])
    const [colors, setColors] = useState([])
    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([])
    const [searchTerm, setSearchTerm] = useState("")

    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState("success");

    const handleMessageClear = () => {
        setMessage("");
        setMessageType("success")
    }

    const handleMessage = (message, type) => {
        setMessage(message);
        setMessageType(type)
    }

    const [products, setProducts] = useState([])
    const fetchProducts = () => {
        axios.get(`${baseUrl}/products`, { params: { category: selectedCategories, color: selectedColors, search: searchTerm } }).then(resp => {
            console.log("Products", resp.data);
            setProducts(resp.data.products);
        }).catch(e => {
            console.log("Error fetching products:", e);
        });
    };

    useEffect(() => {
        fetchProducts()
    }, [message, selectedCategories, selectedColors, searchTerm])
    
    const fetchCategories = () => {
        axios.get(`${baseUrl}/category`).then(resp => {
            console.log("Categories", resp);
            setCategories(resp.data.categories)
        }).catch(e => {
            console.log("Error in fetching category", e)
        })
    }

    const fetchColors = () => {
        axios.get(`${baseUrl}/color`).then(resp => {
            console.log("colors", resp);
            setColors(resp.data.colors)
        }).catch(e => {
            console.log("Error in fetching color", e)
        })
    }

    useEffect(() => {
        fetchCategories();
        fetchColors();
    }, [])

    const handleCategoryChange = (e) => {
        const checked = e.target.checked;
        const id = e.target.value;
        setSelectedCategories((pre) => {
            return checked ? [...pre, id] : pre.filter(x => x !== id)
        })
    }

    const handleColorChange = (e) => {
        const checked = e.target.checked;
        const id = e.target.value;
        setSelectedColors((pre) => {
            return checked ? [...pre, id] : pre.filter(x => x !== id)})
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-lavender-50">

            {message && <Alert message={message} type={messageType} handleMessageClear={handleMessageClear} />}

            <div>

                {/* Mobile filter dialog */}
                <Dialog open={mobileFiltersOpen} onClose={setMobileFiltersOpen} className="relative z-40 lg:hidden">
                    <DialogBackdrop
                        transition
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ease-linear data-closed:opacity-0"
                    />

                    <div className="fixed inset-0 z-40 flex">
                        <DialogPanel
                            transition
                            className="relative ml-auto flex size-full max-w-xs transform flex-col overflow-y-auto bg-white/95 backdrop-blur-xl shadow-xl transition duration-300 ease-in-out data-closed:translate-x-full"
                        >
                            <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
                                <h2 className="text-xl font-semibold text-gray-800">Filtros</h2>
                                <button
                                    type="button"
                                    onClick={() => setMobileFiltersOpen(false)}
                                    className="relative flex size-10 items-center justify-center rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors duration-200"
                                >
                                    <span className="absolute -inset-0.5" />
                                    <span className="sr-only">Cerrar menú</span>
                                    <XMarkIcon aria-hidden="true" className="size-5" />
                                </button>
                            </div>

                            {/* Filters */}
                            <form className="flex-1 px-4 py-6">
                                <h3 className="sr-only">Categorías</h3>

                                <Disclosure as="div" className="border-b border-gray-100 py-6">
                                    {({ open }) => (
                                        <>
                                            <h3 className="-mx-2 -my-3 flow-root">
                                                <DisclosureButton className="group flex w-full items-center justify-between px-2 py-3 text-gray-600 hover:text-gray-900 transition-colors duration-200">
                                                    <span className="font-semibold text-gray-900">Categoría</span>
                                                    <span className="ml-6 flex items-center">
                                                        {open ? (
                                                            <MinusIcon className="size-5 text-rose-600" />
                                                        ) : (
                                                            <PlusIcon className="size-5 text-gray-400 group-hover:text-rose-600" />
                                                        )}
                                                    </span>
                                                </DisclosureButton>
                                            </h3>
                                            <DisclosurePanel className="pt-6 transition-all duration-200">
                                                <div className="space-y-4">
                                                    {categories.map((category, i) => (
                                                        <div key={i} className="flex items-center gap-3 group cursor-pointer">
                                                            <div className="flex h-5 shrink-0 items-center">
                                                                <div className="grid size-5 grid-cols-1">
                                                                    <input
                                                                        value={category._id}
                                                                        checked={selectedCategories.includes(category._id)}
                                                                        onChange={handleCategoryChange}
                                                                        type="checkbox"
                                                                        className="peer col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-rose-500 checked:bg-rose-500 transition-all duration-200 focus:ring-2 focus:ring-rose-200 focus:outline-hidden"
                                                                    />
                                                                    <svg
                                                                        fill="none"
                                                                        viewBox="0 0 14 14"
                                                                        className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
                                                                    >
                                                                        <path
                                                                            d="M3 8L6 11L11 3.5"
                                                                            strokeWidth={2}
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                        />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                            <label className="text-gray-700 group-hover:text-gray-900 transition-colors duration-200 cursor-pointer">
                                                                {category.name}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </DisclosurePanel>
                                        </>
                                    )}
                                </Disclosure>

                                <Disclosure as="div" className="border-b border-gray-100 py-6">
                                    {({ open }) => (
                                        <>
                                            <h3 className="-mx-2 -my-3 flow-root">
                                                <DisclosureButton className="group flex w-full items-center justify-between px-2 py-3 text-gray-600 hover:text-gray-900 transition-colors duration-200">
                                                    <span className="font-semibold text-gray-900">Colores</span>
                                                    <span className="ml-6 flex items-center">
                                                        {open ? (
                                                            <MinusIcon className="size-5 text-rose-600" />
                                                        ) : (
                                                            <PlusIcon className="size-5 text-gray-400 group-hover:text-rose-600" />
                                                        )}
                                                    </span>
                                                </DisclosureButton>
                                            </h3>
                                            <DisclosurePanel className="pt-6 transition-all duration-200">
                                                <div className="space-y-4">
                                                    {colors.map((color, i) => (
                                                        <div key={i} className="flex items-center gap-3 group cursor-pointer">
                                                            <div className="flex h-5 shrink-0 items-center">
                                                                <div className="grid size-5 grid-cols-1">
                                                                    <input
                                                                        value={color._id}
                                                                        checked={selectedColors.includes(color._id)}
                                                                        onChange={handleColorChange}
                                                                        type="checkbox"
                                                                        className="peer col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-rose-500 checked:bg-rose-500 transition-all duration-200 focus:ring-2 focus:ring-rose-200 focus:outline-hidden"
                                                                    />
                                                                    <svg
                                                                        fill="none"
                                                                        viewBox="0 0 14 14"
                                                                        className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
                                                                    >
                                                                        <path
                                                                            d="M3 8L6 11L11 3.5"
                                                                            strokeWidth={2}
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                        />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                            <label className="text-gray-700 group-hover:text-gray-900 transition-colors duration-200 cursor-pointer">
                                                                {color.name}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </DisclosurePanel>
                                        </>
                                    )}
                                </Disclosure>
                            </form>
                        </DialogPanel>
                    </div>
                </Dialog>

                <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-baseline justify-between border-b border-gray-200 pt-24 pb-6">
                        <div>
                            <h1 className="text-5xl font-bold bg-black bg-clip-text text-transparent">
                                Nuevos Productos
                            </h1>
                            <p className="mt-2 text-lg text-gray-600">Descubre nuestras últimas incorporaciones</p>
                        </div>

                        <div className="flex items-center">
                            <button
                                type="button"
                                onClick={() => setMobileFiltersOpen(true)}
                                className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-lg shadow-gray-200/50 ring-1 ring-gray-200 hover:bg-gray-50 hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300 lg:hidden"
                            >
                                <FunnelIcon aria-hidden="true" className="size-4" />
                                Filtros
                            </button>
                        </div>
                    </div>

                    <section aria-labelledby="products-heading" className="pt-8 pb-24">
                        <h2 id="products-heading" className="sr-only">
                            Productos
                        </h2>

                        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
                            {/* Filters Sidebar */}
                            <div className="hidden lg:block">
                                <div className="sticky top-24 rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-lg shadow-gray-200/50 ring-1 ring-gray-200/50">
                                    <div className="space-y-8">
                                        {/* Search */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-3">
                                                Buscar
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Buscar productos..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full rounded-xl border-0 bg-gray-50/50 py-3 px-4 text-gray-900 ring-1 ring-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-rose-300 focus:bg-white transition-all duration-200"
                                            />
                                        </div>

                                        {/* Categories */}
                                        <Disclosure as="div" defaultOpen>
                                            {({ open }) => (
                                                <>
                                                    <DisclosureButton className="flex w-full items-center justify-between text-gray-900 hover:text-gray-700 transition-colors duration-200">
                                                        <span className="font-semibold">Categorías</span>
                                                        {open ? (
                                                            <MinusIcon className="size-4 text-rose-600" />
                                                        ) : (
                                                            <PlusIcon className="size-4 text-gray-400" />
                                                        )}
                                                    </DisclosureButton>
                                                    <DisclosurePanel className="pt-4 transition-all duration-200">
                                                        <div className="space-y-3">
                                                            {categories.map((category, i) => (
                                                                <div key={i} className="flex items-center gap-3 group cursor-pointer">
                                                                    <div className="grid size-5 grid-cols-1">
                                                                        <input
                                                                            value={category._id}
                                                                            checked={selectedCategories.includes(category._id)}
                                                                            onChange={handleCategoryChange}
                                                                            type="checkbox"
                                                                            className="peer col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-rose-500 checked:bg-rose-500 transition-all duration-200 focus:ring-2 focus:ring-rose-200 focus:outline-hidden"
                                                                        />
                                                                        <svg
                                                                            fill="none"
                                                                            viewBox="0 0 14 14"
                                                                            className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
                                                                        >
                                                                            <path
                                                                                d="M3 8L6 11L11 3.5"
                                                                                strokeWidth={2}
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                            />
                                                                        </svg>
                                                                    </div>
                                                                    <label className="text-gray-700 group-hover:text-gray-900 transition-colors duration-200 cursor-pointer text-sm">
                                                                        {category.name}
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </DisclosurePanel>
                                                </>
                                            )}
                                        </Disclosure>

                                        {/* Colors */}
                                        <Disclosure as="div" defaultOpen>
                                            {({ open }) => (
                                                <>
                                                    <DisclosureButton className="flex w-full items-center justify-between text-gray-900 hover:text-gray-700 transition-colors duration-200">
                                                        <span className="font-semibold">Colores</span>
                                                        {open ? (
                                                            <MinusIcon className="size-4 text-rose-600" />
                                                        ) : (
                                                            <PlusIcon className="size-4 text-gray-400" />
                                                        )}
                                                    </DisclosureButton>
                                                    <DisclosurePanel className="pt-4 transition-all duration-200">
                                                        <div className="space-y-3">
                                                            {colors.map((color, i) => (
                                                                <div key={i} className="flex items-center gap-3 group cursor-pointer">
                                                                    <div className="grid size-5 grid-cols-1">
                                                                        <input
                                                                            value={color._id}
                                                                            checked={selectedColors.includes(color._id)}
                                                                            onChange={handleColorChange}
                                                                            type="checkbox"
                                                                            className="peer col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-rose-500 checked:bg-rose-500 transition-all duration-200 focus:ring-2 focus:ring-rose-200 focus:outline-hidden"
                                                                        />
                                                                        <svg
                                                                            fill="none"
                                                                            viewBox="0 0 14 14"
                                                                            className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
                                                                        >
                                                                            <path
                                                                                d="M3 8L6 11L11 3.5"
                                                                                strokeWidth={2}
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                            />
                                                                        </svg>
                                                                    </div>
                                                                    <label className="text-gray-700 group-hover:text-gray-900 transition-colors duration-200 cursor-pointer text-sm">
                                                                        {color.name}
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </DisclosurePanel>
                                                </>
                                            )}
                                        </Disclosure>
                                    </div>
                                </div>
                            </div>

                            {/* Product grid */}
                            <div className="lg:col-span-3">
                                <div className="bg-gradient-to-br from-rose-50/50 via-white to-purple-50/50 rounded-3xl p-1">
                                    <div className="w-full p-1 lg:hidden">
                                        <input
                                            type="text"
                                            placeholder="🔍 Buscar productos..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full rounded-2xl border-0 bg-white/80 py-3 px-4 text-gray-900 ring-1 ring-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-rose-300 focus:bg-white transition-all duration-200 backdrop-blur-sm"
                                        />
                                    </div>
                                    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12 lg:max-w-7xl lg:px-8">
                                        {products.length === 0 ? (
                                            <div className="text-center py-16">
                                                <div className="text-gray-400 text-6xl mb-4">🛍️</div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron productos</h3>
                                                <p className="text-gray-600">Intenta ajustar tus filtros o términos de búsqueda</p>
                                            </div>
                                        ) : (
                                            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-8">
                                                {products.map((product, i) =>
                                                    <ProductCard key={i} product={product} handleMessage={handleMessage} />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    )
}