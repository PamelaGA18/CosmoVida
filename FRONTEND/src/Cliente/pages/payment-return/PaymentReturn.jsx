import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { baseUrl } from "../../../environment";
import axios from "axios";
import { useDispatch } from "react-redux";
import { updateTotal } from "../../../state/cartSlice";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export default function PaymentReturn() {
    const [status, setStatus] = useState(null);
    const [customerEmail, setCustomerEmail] = useState('');
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

    useEffect(() => {
        const sessionId = searchParams.get('session_id');
        
        if (!sessionId) {
            console.error("❌ No se encontró session_id en la URL");
            return;
        }

        console.log("🔍 Verificando sesión:", sessionId);

        axios.get(`${baseUrl}/payment/session-status?session_id=${sessionId}`)
            .then(resp => {
                console.log("✅ Estado de pago:", resp.data);
                setStatus(resp.data.status);
                setCustomerEmail(resp.data.customer_email);
                fetchCart();
            })
            .catch(e => {
                console.error("❌ Error verificando pago:", e.response?.data || e.message);
                // Intentar obtener session_id del localStorage como fallback
                const storedSessionId = localStorage.getItem('stripe_session_id');
                if (storedSessionId) {
                    console.log("🔄 Intentando con session_id del localStorage:", storedSessionId);
                    axios.get(`${baseUrl}/payment/session-status?session_id=${storedSessionId}`)
                        .then(resp => {
                            setStatus(resp.data.status);
                            setCustomerEmail(resp.data.customer_email);
                            fetchCart();
                        });
                }
            });

    }, [searchParams]);

    if (status === 'open') {
        return <Navigate to="/checkout" />;
    }

    if (status === 'paid') {
        return (
            <section id="success" className="flex min-h-screen flex-col justify-center items-center">
                <CheckCircleIcon className="h-20 w-20 text-green-500" />
                <h2 className="text-green-500 text-2xl font-bold mt-4">¡Pago exitoso!</h2>
                <h3 className="text-gray-700 text-lg mt-2">Gracias por tu compra</h3>
                <p className="text-gray-600 mt-2">
                    Se enviará un correo de confirmación a <strong>{customerEmail}</strong>.
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 mt-6 rounded-lg shadow">
                    <Link to={'/products'}>Continuar comprando</Link>
                </button>
            </section>
        );
    }

    if (status === 'unpaid') {
        return (
            <section className="flex min-h-screen flex-col justify-center items-center">
                <h2 className="text-red-500 text-2xl font-bold">Pago pendiente o cancelado</h2>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 mt-6 rounded-lg shadow">
                    <Link to={'/checkout'}>Reintentar pago</Link>
                </button>
            </section>
        );
    }

    // Loading state
    return (
        <section className="flex min-h-screen flex-col justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Verificando estado del pago...</p>
        </section>
    );
}