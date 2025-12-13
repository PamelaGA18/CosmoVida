import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
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
            console.log("Cart fetch error", e);
            dispatch(updateTotal(0));
        }
    };

    const verifyPayment = async (sessionId) => {
        try {
            setLoading(true);
            console.log(" Verificando pago con sessionId:", sessionId);
            
            const response = await axios.get(`${baseUrl}/payment/session-status?session_id=${sessionId}`);
            
            console.log(" Respuesta del pago:", response.data);
            setStatus(response.data.status);
            setCustomerEmail(response.data.customer_email || '');
            
            // Limpiar localStorage
            localStorage.removeItem('last_payment_session');
            localStorage.removeItem('payment_redirected');
            
            // Actualizar carrito
            await fetchCart();
            
            setError(null);
        } catch (error) {
            console.error(" Error verificando pago:", error);
            setError("No se pudo verificar el estado del pago. Por favor intenta más tarde.");
            
            // Intentar nuevamente después de 3 segundos
            setTimeout(() => {
                if (sessionId) verifyPayment(sessionId);
            }, 3000);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Intentar obtener session_id de múltiples fuentes
        
        // 1. De los parámetros URL
        let sessionId = searchParams.get('session_id');
        
        // 2. Si no hay en URL, buscar en localStorage
        if (!sessionId) {
            sessionId = localStorage.getItem('last_payment_session');
            console.log(" Usando session_id de localStorage:", sessionId);
        }
        
        // 3. Si aún no hay, verificar si Stripe dejó algo en sessionStorage
        if (!sessionId) {
            const stripeData = sessionStorage.getItem('stripe_checkout_data');
            if (stripeData) {
                try {
                    const data = JSON.parse(stripeData);
                    sessionId = data.sessionId;
                    console.log(" SessionId de Stripe sessionStorage:", sessionId);
                } catch (e) {
                    console.error("Error parsing Stripe data:", e);
                }
            }
        }

        if (sessionId) {
            verifyPayment(sessionId);
        } else {
            console.error(" No se encontró session_id");
            setError("No se pudo identificar la sesión de pago.");
            setLoading(false);
            
            // Redirigir al inicio después de 5 segundos
            setTimeout(() => {
                window.location.href = '/';
            }, 5000);
        }
    }, [searchParams]);

    if (loading) {
        return (
            <section className="flex min-h-screen flex-col justify-center items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                <p className="mt-6 text-gray-600 text-lg">Verificando tu pago...</p>
                <p className="text-sm text-gray-400">Esto puede tomar unos segundos</p>
            </section>
        );
    }

    if (error) {
        return (
            <section className="flex min-h-screen flex-col justify-center items-center p-4">
                <XCircleIcon className="h-20 w-20 text-red-500" />
                <h2 className="text-red-500 text-2xl font-bold mt-4">Error</h2>
                <p className="text-gray-600 mt-2 text-center max-w-md">{error}</p>
                <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 mt-6 rounded-lg shadow"
                    onClick={() => window.location.href = '/'}
                >
                    Volver al inicio
                </button>
            </section>
        );
    }

    if (status === 'open' || status === 'processing') {
        return (
            <section className="flex min-h-screen flex-col justify-center items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500"></div>
                <h2 className="text-yellow-600 text-2xl font-bold mt-4">Pago en proceso</h2>
                <p className="text-gray-600 mt-2">Tu pago está siendo procesado.</p>
                <p className="text-sm text-gray-400 mt-2">Por favor espera unos momentos...</p>
            </section>
        );
    }

    if (status === 'paid') {
        return (
            <section className="flex min-h-screen flex-col justify-center items-center p-4">
                <CheckCircleIcon className="h-24 w-24 text-green-500" />
                <h2 className="text-green-500 text-3xl font-bold mt-6">¡Pago Exitoso!</h2>
                <h3 className="text-gray-700 text-xl mt-2">Gracias por tu compra</h3>
                
                {customerEmail && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-gray-700">
                            Se enviará un correo de confirmación a <strong className="text-green-600">{customerEmail}</strong>
                        </p>
                    </div>
                )}
                
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow font-medium">
                        <Link to={'/orders'}>Ver mis pedidos</Link>
                    </button>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg shadow font-medium">
                        <Link to={'/products'}>Continuar comprando</Link>
                    </button>
                </div>
                
                <p className="text-sm text-gray-400 mt-8">
                    Número de transacción: {searchParams.get('session_id')?.substring(0, 20)}...
                </p>
            </section>
        );
    }

    if (status === 'unpaid' || status === 'canceled') {
        return (
            <section className="flex min-h-screen flex-col justify-center items-center p-4">
                <XCircleIcon className="h-24 w-24 text-red-500" />
                <h2 className="text-red-500 text-3xl font-bold mt-6">Pago Cancelado</h2>
                <p className="text-gray-600 mt-2 text-center max-w-md">
                    El pago fue cancelado o no se completó. No se ha realizado ningún cargo.
                </p>
                
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow font-medium">
                        <Link to={'/cart'}>Volver al carrito</Link>
                    </button>
                    <button className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg shadow font-medium">
                        <Link to={'/products'}>Seguir comprando</Link>
                    </button>
                </div>
            </section>
        );
    }

    // Estado desconocido
    return (
        <section className="flex min-h-screen flex-col justify-center items-center">
            <h2 className="text-gray-500 text-2xl font-bold">Estado de pago desconocido</h2>
            <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 mt-6 rounded-lg shadow"
                onClick={() => window.location.href = '/orders'}
            >
                Verificar mis pedidos
            </button>
        </section>
    );
}