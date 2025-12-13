import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { baseUrl } from "../../../environment";
import axios from "axios";
import { useDispatch } from "react-redux";
import { updateTotal } from "../../../state/cartSlice";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

export default function PaymentReturn() {
    const [status, setStatus] = useState(null);
    const [customerEmail, setCustomerEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();

    const fetchCart = async () => {
        try {
            const resp = await axios.get(`${baseUrl}/cart`);
            if (!resp.data.cart || !resp.data.cart.products) {
                dispatch(updateTotal(0));
            } else {
                dispatch(updateTotal(resp.data.cart.products.length));
            }
        } catch (e) {
            console.log("❌ Error carrito:", e);
            dispatch(updateTotal(0));
        }
    };

    const verifyPayment = async (sessionId) => {
        try {
            setLoading(true);
            console.log("🔍 Verificando pago con sessionId:", sessionId);
            
            const response = await axios.get(`${baseUrl}/payment/session-status?session_id=${sessionId}`);
            
            console.log("✅ Respuesta del pago:", response.data);
            setStatus(response.data.status);
            setCustomerEmail(response.data.customer_email || '');
            
            // Limpiar storage
            sessionStorage.removeItem('stripe_session_id');
            sessionStorage.removeItem('last_payment_session_id');
            
            // Actualizar carrito
            await fetchCart();
            
            setError(null);
        } catch (error) {
            console.error("❌ Error verificando pago:", error);
            setError("No se pudo verificar el estado del pago. Verifica tu correo para la confirmación.");
            
            // Intentar nuevamente después de 3 segundos
            setTimeout(() => {
                if (sessionId) verifyPayment(sessionId);
            }, 3000);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Obtener session_id de múltiples fuentes
        let sessionId = null;
        
        // 1. De los parámetros URL
        sessionId = searchParams.get('session_id');
        console.log("🎫 session_id de URL:", sessionId);
        
        // 2. De sessionStorage (fallback)
        if (!sessionId) {
            sessionId = sessionStorage.getItem('last_payment_session_id') || 
                       sessionStorage.getItem('stripe_session_id');
            console.log("🔄 session_id de sessionStorage:", sessionId);
        }
        
        // 3. Verificar URL completa (por si acaso)
        if (!sessionId && window.location.search) {
            const urlParams = new URLSearchParams(window.location.search);
            sessionId = urlParams.get('session_id');
        }

        if (sessionId) {
            verifyPayment(sessionId);
        } else {
            console.error("❌ No se encontró session_id");
            console.log("URL completa:", window.location.href);
            setError("No se pudo identificar la transacción. Verifica tu correo para la confirmación.");
            setLoading(false);
            
            // Redirigir al inicio después de 5 segundos
            setTimeout(() => {
                window.location.href = '/';
            }, 5000);
        }
    }, [searchParams]);

    if (loading) {
        return (
            <section className="flex min-h-screen flex-col justify-center items-center bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                <p className="mt-6 text-gray-600 text-lg font-medium">Verificando tu pago...</p>
                <p className="text-sm text-gray-400 mt-2">Esto puede tomar unos segundos</p>
            </section>
        );
    }

    if (error) {
        return (
            <section className="flex min-h-screen flex-col justify-center items-center p-4 bg-gray-50">
                <XCircleIcon className="h-20 w-20 text-red-500" />
                <h2 className="text-red-500 text-2xl font-bold mt-4">Error</h2>
                <p className="text-gray-600 mt-2 text-center max-w-md">{error}</p>
                <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 mt-6 rounded-lg shadow transition"
                    onClick={() => window.location.href = '/'}
                >
                    Volver al inicio
                </button>
            </section>
        );
    }

    if (status === 'open' || status === 'processing') {
        return (
            <section className="flex min-h-screen flex-col justify-center items-center bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500"></div>
                <h2 className="text-yellow-600 text-2xl font-bold mt-4">Pago en proceso</h2>
                <p className="text-gray-600 mt-2">Tu pago está siendo procesado.</p>
                <p className="text-sm text-gray-400 mt-2">Por favor espera unos momentos...</p>
            </section>
        );
    }

    if (status === 'paid') {
        return (
            <section className="flex min-h-screen flex-col justify-center items-center p-4 bg-gray-50">
                <CheckCircleIcon className="h-24 w-24 text-green-500 animate-pulse" />
                <h2 className="text-green-500 text-3xl font-bold mt-6">¡Pago Exitoso!</h2>
                <h3 className="text-gray-700 text-xl mt-2">Gracias por tu compra</h3>
                
                {customerEmail && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 max-w-md">
                        <p className="text-gray-700">
                            Se enviará un correo de confirmación a <strong className="text-green-600">{customerEmail}</strong>
                        </p>
                    </div>
                )}
                
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow font-medium transition">
                        <Link to={'/orders'}>Ver mis pedidos</Link>
                    </button>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg shadow font-medium transition">
                        <Link to={'/products'}>Continuar comprando</Link>
                    </button>
                </div>
                
                <p className="text-xs text-gray-400 mt-8">
                    ID de transacción: {searchParams.get('session_id')?.substring(0, 25)}...
                </p>
            </section>
        );
    }

    if (status === 'unpaid' || status === 'canceled') {
        return (
            <section className="flex min-h-screen flex-col justify-center items-center p-4 bg-gray-50">
                <XCircleIcon className="h-24 w-24 text-red-500" />
                <h2 className="text-red-500 text-3xl font-bold mt-6">Pago Cancelado</h2>
                <p className="text-gray-600 mt-2 text-center max-w-md">
                    El pago fue cancelado o no se completó. No se ha realizado ningún cargo.
                </p>
                
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow font-medium transition">
                        <Link to={'/cart'}>Volver al carrito</Link>
                    </button>
                    <button className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg shadow font-medium transition">
                        <Link to={'/products'}>Seguir comprando</Link>
                    </button>
                </div>
            </section>
        );
    }

    // Estado desconocido
    return (
        <section className="flex min-h-screen flex-col justify-center items-center bg-gray-50">
            <h2 className="text-gray-500 text-2xl font-bold">Estado de pago desconocido</h2>
            <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 mt-6 rounded-lg shadow transition"
                onClick={() => window.location.href = '/orders'}
            >
                Verificar mis pedidos
            </button>
        </section>
    );
}