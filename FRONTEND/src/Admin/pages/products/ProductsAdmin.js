import { ShoppingCartIcon, TagIcon, CogIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react'
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
} from '@headlessui/react'
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline'
import { FunnelIcon, MinusIcon } from '@heroicons/react/20/solid'
import ProductCardAdmin from './sub-components/ProductCardAdmin';
import ProductForm from './sub-components/ProductForm';
import axios from 'axios';
import Alert from '../../../basicUtilityComp/alert/Alert';
import { baseUrl } from '../../../environment';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function ProductsAdmin() {
    const [categories, setCategories] = useState([])
    const [colors, setColors] = useState([])
    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
    const [formOpen, setFormOpen] = useState(false);
    const [editProduct, setEditProduct] = useState(null)
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState("success");
    const [isLoading, setIsLoading] = useState(true);

    const handleMessageClear = () => {
        setMessage("");
        setMessageType("success")
    }

    const handleMessage = (message, type) => {
        setMessage(message);
        setMessageType(type)
    }

    const handleEditForm = (id) => {
        setEditProduct(() => products.filter(x => x._id === id)[0])
        setFormOpen(true);
    }

    const handleDeleteForm = (id) => {
        if(window.confirm("¿Estás seguro de eliminar?")){
            axios.delete(`${baseUrl}/products/${id}`).then(resp => {
                setMessage(resp.data.message);
                setMessageType("success");
            }).catch(e => {
                setMessage(e.response.data.message ? e.response.data.message : "Server Error! - Try after sometime.");
                setMessageType("error")
            })
        }
    }

    const [products, setProducts] = useState([])
    const fetchProducts = () => {
        setIsLoading(true);
        axios.get(`${baseUrl}/products`, { params: { category: selectedCategories, color: selectedColors, search: searchTerm } })
        .then(resp => {
            console.log("Products", resp.data);
            setProducts(resp.data.products);
            setIsLoading(false);
        })
        .catch(e => {
            console.log("Error fetching products:", e);
            setIsLoading(false);
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
            return checked ? [...pre, id] : pre.filter(x => x !== id)
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F7C8D0] via-[#EADCF8] to-[#C7E8F3]">
            {message && <Alert message={message} type={messageType} handleMessageClear={handleMessageClear} />}
            {formOpen && <ProductForm setEditProduct={setEditProduct} editProduct={editProduct} handleMessageClear={handleMessageClear} handleMessage={handleMessage} colors={colors} categories={categories} setFormOpen={setFormOpen} />}
            
            <div className="relative">
                {/* Mobile filter dialog */}
                <Dialog open={mobileFiltersOpen} onClose={setMobileFiltersOpen} className="relative z-40 lg:hidden">
                    <DialogBackdrop
                        transition
                        className="fixed inset-0 bg-black/25 backdrop-blur-sm transition-opacity duration-300 ease-linear data-closed:opacity-0"
                    />

                    <div className="fixed inset-0 z-40 flex">
                        <DialogPanel
                            transition
                            className="relative ml-auto flex size-full max-w-xs transform flex-col overflow-y-auto bg-white/95 backdrop-blur-lg pt-4 pb-6 shadow-2xl transition duration-300 ease-in-out data-closed:translate-x-full"
                        >
                            <div className="flex items-center justify-between px-4">
                                <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
                                <button
                                    type="button"
                                    onClick={() => setMobileFiltersOpen(false)}
                                    className="relative -mr-2 flex size-10 items-center justify-center rounded-md bg-white/80 p-2 text-gray-400 hover:bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                                >
                                    <span className="absolute -inset-0.5" />
                                    <span className="sr-only">Cerrar menú</span>
                                    <XMarkIcon aria-hidden="true" className="size-6" />
                                </button>
                            </div>

                            {/* Filters */}
                            <form className="mt-4 border-t border-gray-200">
                                <Disclosure as="div" className="border-t border-gray-200 px-4 py-6">
                                    <h3 className="-mx-2 -my-3 flow-root">
                                        <DisclosureButton className="group flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400 hover:text-gray-500">
                                            <span className="font-medium text-gray-900">Categoría</span>
                                            <span className="ml-6 flex items-center">
                                                <PlusIcon aria-hidden="true" className="size-5 group-data-open:hidden" />
                                                <MinusIcon aria-hidden="true" className="size-5 group-not-data-open:hidden" />
                                            </span>
                                        </DisclosureButton>
                                    </h3>
                                    <DisclosurePanel className="pt-6">
                                        <div className="space-y-4">
                                            {categories.map((category, i) => (
                                                <div key={i} className="flex items-center gap-3 group">
                                                    <div className="flex h-5 shrink-0 items-center">
                                                        <div className="grid size-5 grid-cols-1">
                                                            <input
                                                                value={category._id}
                                                                checked={selectedCategories.includes(category._id)}
                                                                onChange={handleCategoryChange}
                                                                type="checkbox"
                                                                className="peer col-start-1 row-start-1 appearance-none rounded-md border border-gray-300 bg-white checked:border-purple-600 checked:bg-purple-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transition-colors"
                                                            />
                                                            <svg
                                                                fill="none"
                                                                viewBox="0 0 14 14"
                                                                className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white opacity-0 peer-checked:opacity-100 transition-opacity"
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
                                                    <label className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                                                        {category.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </DisclosurePanel>
                                </Disclosure>

                                <Disclosure as="div" className="border-t border-gray-200 px-4 py-6">
                                    <h3 className="-mx-2 -my-3 flow-root">
                                        <DisclosureButton className="group flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400 hover:text-gray-500">
                                            <span className="font-medium text-gray-900">Colores</span>
                                            <span className="ml-6 flex items-center">
                                                <PlusIcon aria-hidden="true" className="size-5 group-data-open:hidden" />
                                                <MinusIcon aria-hidden="true" className="size-5 group-not-data-open:hidden" />
                                            </span>
                                        </DisclosureButton>
                                    </h3>
                                    <DisclosurePanel className="pt-6">
                                        <div className="space-y-4">
                                            {colors.map((color, i) => (
                                                <div key={i} className="flex items-center gap-3 group">
                                                    <div className="flex h-5 shrink-0 items-center">
                                                        <div className="grid size-5 grid-cols-1">
                                                            <input
                                                                value={color._id}
                                                                checked={selectedColors.includes(color._id)}
                                                                onChange={handleColorChange}
                                                                type="checkbox"
                                                                className="peer col-start-1 row-start-1 appearance-none rounded-md border border-gray-300 bg-white checked:border-purple-600 checked:bg-purple-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transition-colors"
                                                            />
                                                            <svg
                                                                fill="none"
                                                                viewBox="0 0 14 14"
                                                                className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white opacity-0 peer-checked:opacity-100 transition-opacity"
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
                                                    <label className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                                                        {color.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </DisclosurePanel>
                                </Disclosure>
                            </form>
                        </DialogPanel>
                    </div>
                </Dialog>

                <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header Section */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-purple-900 bg-clip-text text-transparent">
                                Gestión de Productos
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Administra y organiza todos los productos de tu catálogo
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            {!formOpen && (
                                <button 
                                    onClick={() => { setFormOpen(true); setEditProduct(null); }}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                >
                                    <PlusIcon className="h-5 w-5" />
                                    <span>Añadir Nuevo Producto</span>
                                </button>
                            )}
                            
                            <button
                                type="button"
                                onClick={() => setMobileFiltersOpen(true)}
                                className="lg:hidden p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all"
                            >
                                <FunnelIcon className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/60 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Productos</p>
                                    <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-xl">
                                    <ShoppingCartIcon className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/60 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Categorías</p>
                                    <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <TagIcon className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/60 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Colores</p>
                                    <p className="text-2xl font-bold text-gray-900">{colors.length}</p>
                                </div>
                                <div className="p-3 bg-pink-100 rounded-xl">
                                    <CogIcon className="h-6 w-6 text-pink-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Filters Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg p-6 sticky top-8">
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Búsqueda</h3>
                                    <input
                                        type="text"
                                        placeholder="Buscar productos..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                    />
                                </div>

                                <Disclosure as="div" className="border-t border-gray-200 pt-6">
                                    <h3 className="-my-3 flow-root">
                                        <DisclosureButton className="group flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                                            <span className="font-medium text-gray-900">Categorías</span>
                                            <span className="ml-6 flex items-center">
                                                <PlusIcon aria-hidden="true" className="size-5 group-data-open:hidden" />
                                                <MinusIcon aria-hidden="true" className="size-5 group-not-data-open:hidden" />
                                            </span>
                                        </DisclosureButton>
                                    </h3>
                                    <DisclosurePanel className="pt-4">
                                        <div className="space-y-3">
                                            {categories.map((category, i) => (
                                                <div key={i} className="flex items-center gap-3 group">
                                                    <div className="flex h-5 shrink-0 items-center">
                                                        <div className="grid size-5 grid-cols-1">
                                                            <input
                                                                value={category._id}
                                                                checked={selectedCategories.includes(category._id)}
                                                                onChange={handleCategoryChange}
                                                                type="checkbox"
                                                                className="peer col-start-1 row-start-1 appearance-none rounded-md border border-gray-300 bg-white checked:border-purple-600 checked:bg-purple-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transition-colors"
                                                            />
                                                            <svg
                                                                fill="none"
                                                                viewBox="0 0 14 14"
                                                                className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white opacity-0 peer-checked:opacity-100 transition-opacity"
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
                                                    <label className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors cursor-pointer">
                                                        {category.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </DisclosurePanel>
                                </Disclosure>

                                <Disclosure as="div" className="border-t border-gray-200 pt-6">
                                    <h3 className="-my-3 flow-root">
                                        <DisclosureButton className="group flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                                            <span className="font-medium text-gray-900">Colores</span>
                                            <span className="ml-6 flex items-center">
                                                <PlusIcon aria-hidden="true" className="size-5 group-data-open:hidden" />
                                                <MinusIcon aria-hidden="true" className="size-5 group-not-data-open:hidden" />
                                            </span>
                                        </DisclosureButton>
                                    </h3>
                                    <DisclosurePanel className="pt-4">
                                        <div className="space-y-3">
                                            {colors.map((color, i) => (
                                                <div key={i} className="flex items-center gap-3 group">
                                                    <div className="flex h-5 shrink-0 items-center">
                                                        <div className="grid size-5 grid-cols-1">
                                                            <input
                                                                value={color._id}
                                                                checked={selectedColors.includes(color._id)}
                                                                onChange={handleColorChange}
                                                                type="checkbox"
                                                                className="peer col-start-1 row-start-1 appearance-none rounded-md border border-gray-300 bg-white checked:border-purple-600 checked:bg-purple-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transition-colors"
                                                            />
                                                            <svg
                                                                fill="none"
                                                                viewBox="0 0 14 14"
                                                                className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white opacity-0 peer-checked:opacity-100 transition-opacity"
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
                                                    <label className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors cursor-pointer">
                                                        {color.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </DisclosurePanel>
                                </Disclosure>
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className="lg:col-span-3">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg p-6">
                                {isLoading ? (
                                    <div className="flex justify-center items-center py-20">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {products && products.map((product, i) => (
                                            <ProductCardAdmin 
                                                key={i} 
                                                product={product} 
                                                handleEditForm={handleEditForm} 
                                                handleDeleteForm={handleDeleteForm} 
                                            />
                                        ))}
                                    </div>
                                )}
                                
                                {products.length === 0 && !isLoading && (
                                    <div className="text-center py-12">
                                        <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                                            <ShoppingCartIcon className="h-24 w-24" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
                                        <p className="text-gray-600 mb-6">Intenta ajustar tus filtros de búsqueda</p>
                                        <button 
                                            onClick={() => { setFormOpen(true); setEditProduct(null); }}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                            <PlusIcon className="h-4 w-4" />
                                            Crear primer producto
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
