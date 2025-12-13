import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { useEffect, useState } from "react";
import ProductCard from "../../products/sub-components/ProductCard";
import Alert from "../../../../basicUtilityComp/alert/Alert";
import { baseUrl } from '../../../../environment';

export default function Featured() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([])
    const [isLoading, setIsLoading] = useState(true);

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

    const fetchProducts = () => {
        setIsLoading(true);
        axios.get(`${baseUrl}/products`, { params:{} }).then(resp => {
            console.log("Products", resp.data);
            setProducts(resp.data.products)
            setIsLoading(false);
        }).catch(e => {
            console.log("Error fetching products:", e);
            setIsLoading(false);
        })
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    const handleViewAllProducts = () => {
        navigate('/products'); // Asegúrate de que esta ruta coincida con tu configuración de rutas
    }

    return (
        <div className="relative bg-gradient-to-r from-[#FDE2E4] via-[#EADCF8] to-[#aee2fa] py-24 sm:py-32 overflow-hidden">
            {/* Elementos decorativos de fondo */}
            <div className="absolute inset-0">
                <div className="absolute top-10 left-10 w-20 h-20 bg-pink-200/30 rounded-full blur-2xl"></div>
                <div className="absolute top-1/3 right-20 w-32 h-32 bg-purple-200/30 rounded-full blur-2xl"></div>
                <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-blue-200/30 rounded-full blur-2xl"></div>
                <div className="absolute bottom-10 right-10 w-28 h-28 bg-indigo-200/30 rounded-full blur-2xl"></div>
            </div>

            {message && <Alert message={message} type={messageType} handleMessageClear={handleMessageClear} />}
            
            <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8 relative z-10">
                {/* Encabezado mejorado */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 mb-4 border border-white/60 shadow-sm">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                        <span className="text-sm font-medium text-indigo-700">Productos recientes</span>
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl bg-gradient-to-r from-gray-900 to-purple-900 bg-clip-text text-transparent">
                        Productos Destacados
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                        Descubre nuestra selección especial de productos cuidadosamente elegidos para ti
                    </p>
                </div>

                {/* Grid de productos mejorado */}
                <div className="relative">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 xl:gap-8">
                            {products && products.slice(0, 4).map((product, i) => (
                                <div 
                                    key={i} 
                                    className="group relative bg-white/80 backdrop-blur-sm rounded-3xl border border-white/60 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 hover:bg-white/90 overflow-hidden"
                                >
                                    {/* Efecto de brillo al hover */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                    
                                    {/* Badge de destacado */}
                                    <div className="absolute top-4 left-4 z-10">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg">
                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                            </svg>
                                            Destacado
                                        </span>
                                    </div>

                                    {/* Contenedor del producto */}
                                    <div className="relative p-1">
                                        <ProductCard product={product} handleMessage={handleMessage} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Llamada a la acción */}
                <div className="mt-16 text-center">
                    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-white/60 shadow-lg">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            ¿No encuentras lo que buscas?
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                            Explora nuestra colección completa de productos y descubre mucho más
                        </p>
                        <button 
                            onClick={handleViewAllProducts}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                        >
                            Ver todos los productos
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}