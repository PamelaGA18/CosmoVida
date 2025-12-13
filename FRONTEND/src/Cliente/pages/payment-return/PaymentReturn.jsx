import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { baseUrl } from "../../../environment";
import axios from "axios";
import { useDispatch } from "react-redux";
import { updateTotal } from "../../../state/cartSlice";
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

export default function PaymentReturn() {
    const [status, setStatus] = useState(null);
    const [customerEmail, setCustomerEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const fetchCart = async () => {
        try {
            const resp = await axios.get(`${baseUrl}/cart`);
            console.log("cart response", resp.data.cart);
            if (!resp.data.cart || !resp.data.cart.products) {
                dispatch(updateTotal(0));
            } else {
                dispatch(updateTotal(resp.data.cart.products.length));
            }
        } catch (e) {
            console.log("Cart fetch error", e);
            dispatch(updateTotal(0));
        }
    }

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                setLoading(true);
                const queryString = window.location.search;
                const urlParams = new URLSearchParams(queryString);
                const sessionId = urlParams.get('session_id');
                
                if (!sessionId) {
                    setError("No se encontró session_id en la URL");
                    setLoading(false);
                    return;
                }
                
                // Obtener token del localStorage
                const userDataStr = localStorage.getItem("userData");
                const userData = userDataStr ? JSON.parse(userDataStr) : null;
                
                if (!userData || !userData.token) {
                    setError("No estás autenticado");
                    setLoading(false);
                    navigate('/login');
                    return;
                }
                
                const response = await axios.get(
                    `${baseUrl}/payment/session-status?session_id=${sessionId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${userData.token}`
                        }
                    }
                );
                
                console.log("Payment verification response:", response.data);
                setStatus(response.data.status);
                setCustomerEmail(response.data.customer_email);
                await fetchCart();
            } catch (err) {
                console.error("Error verifying payment:", err);
                setError(err.response?.data?.message || "Error al verificar el pago");
            } finally {
                setLoading(false);
            }
        };
        
        verifyPayment();
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="mt-4">Verificando pago...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen flex-col justify-center items-center">
                <ExclamationCircleIcon className="h-20 w-20 text-red-500" />
                <h2 className="text-red-500 mt-4">Error</h2>
                <p className="text-gray-700">{error}</p>
                <button 
                    className="bg-blue-600 shadow text-white px-4 py-2 mt-4 rounded"
                    onClick={() => navigate('/orders')}
                >
                    Ver mis pedidos
                </button>
            </div>
        );
    }

    if (status === 'open') {
        return <Navigate to="/checkout" />;
    }

    if (status === 'paid') {
        return (
            <section id="success" className="flex min-h-screen flex-col justify-center items-center p-4">
                <CheckCircleIcon className="h-20 w-20 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold text-green-600 mb-2">¡Pago exitoso!</h2>
                <h3 className="text-lg text-gray-800 mb-4">¡Gracias por tu compra!</h3>
                <p className="text-gray-600 mb-6">
                    Se enviará un correo de confirmación a {customerEmail || 'tu correo registrado'}.
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow">
                    <Link to={'/orders'}>Ver mis pedidos</Link>
                </button>
                <button className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg">
                    <Link to={'/products'}>Seguir comprando</Link>
                </button>
            </section>
        );
    }

    return (
        <div className="flex min-h-screen flex-col justify-center items-center">
            <ExclamationCircleIcon className="h-20 w-20 text-yellow-500" />
            <h2 className="text-yellow-600 mt-4">Estado de pago desconocido</h2>
            <p className="text-gray-700">Status: {status}</p>
            <button 
                className="bg-blue-600 shadow text-white px-4 py-2 mt-4 rounded"
                onClick={() => navigate('/')}
            >
                Volver al inicio
            </button>
        </div>
    );
}