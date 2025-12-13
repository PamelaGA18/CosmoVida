import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useCallback, useState, useEffect } from "react";
import { baseUrl } from "../../../environment";
import { useSelector } from "react-redux";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "pk_test_51RUheLQj0Dr03eMVBwAUYhPIbzHSW2H1NQ1cOjdah8UgP8xjmYerXLA1bAKDM3IRA1xDV9Ou7FLBHYC9ZvFMFmx300dplyYt5a");

export default function Checkout() {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const auth = useSelector((state) => state.auth.auth);
    
    const fetchClientSecret = useCallback(() => {
        setLoading(true);
        setError(null);
        
        // Obtener token del localStorage
        const userDataStr = localStorage.getItem("userData");
        const userData = userDataStr ? JSON.parse(userDataStr) : null;
        const token = userData?.token;
        
        if (!token) {
            setError("No estás autenticado. Por favor, inicia sesión.");
            setLoading(false);
            return Promise.reject("No authentication token");
        }
        
        return axios.get(`${baseUrl}/payment/create-session`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(resp => {
            console.log("Checkout session response:", resp.data);
            if (resp.data.success && resp.data.clientSecret) {
                return resp.data.clientSecret;
            } else {
                throw new Error(resp.data.message || "No se pudo crear la sesión de pago");
            }
        })
        .catch(error => {
            console.error("Error in creating-session", error);
            setError(error.response?.data?.message || "Error al crear la sesión de pago");
            throw error;
        })
        .finally(() => {
            setLoading(false);
        });
    }, []);
    
    const options = { 
        fetchClientSecret,
        onComplete: () => {
            console.log("Checkout completado");
        }
    };
    
    useEffect(() => {
        if (!auth) {
            setError("Debes iniciar sesión para proceder al pago");
        }
    }, [auth]);
    
    if (!auth) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="text-center p-8">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso denegado</h2>
                    <p className="text-gray-700">Debes iniciar sesión para proceder al pago.</p>
                </div>
            </div>
        );
    }
    
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-700">Preparando checkout...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="text-center p-8 max-w-md">
                    <div className="text-red-500 text-5xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-700 mb-6">{error}</p>
                    <button 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                        onClick={() => window.location.href = '/cart'}
                    >
                        Volver al carrito
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div id="checkout" className="min-h-screen">
            <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={options}
            >
                <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
        </div>
    );
}