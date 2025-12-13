import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useCallback, useState } from "react"; // Añadido useState
import { baseUrl } from "../../../environment";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "pk_test_51RUheLQj0Dr03eMVBwAUYhPIbzHSW2H1NQ1cOjdah8UgP8xjmYerXLA1bAKDM3IRA1xDV9Ou7FLBHYC9ZvFMFmx300dplyYt5a");

export default function Checkout() {
    const { token } = useSelector((state) => state.auth.userData || {});
    const navigate = useNavigate();
    const [error, setError] = useState(null); // Estado para manejar errores

    const fetchClientSecret = useCallback(() => {
        console.log("🔄 Solicitando client secret...");
        
        if (!token) {
            const errorMsg = "No estás autenticado. Por favor inicia sesión.";
            setError(errorMsg);
            throw new Error(errorMsg);
        }
        
        return axios.post(
            `${baseUrl}/payment/create-session`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            }
        )
        .then(resp => {
            console.log("✅ Respuesta del backend:", {
                success: resp.data.success,
                hasClientSecret: !!resp.data.clientSecret,
                sessionId: resp.data.sessionId
            });
            
            if (resp.data.success && resp.data.clientSecret) {
                // Guardar sessionId en localStorage
                if (resp.data.sessionId) {
                    localStorage.setItem('stripe_session_id', resp.data.sessionId);
                    console.log("💾 SessionId guardado:", resp.data.sessionId);
                }
                
                setError(null); // Limpiar error si hay éxito
                return resp.data.clientSecret;
            } else {
                const errorMsg = resp.data.message || "No se pudo obtener clientSecret";
                setError(errorMsg);
                throw new Error(errorMsg);
            }
        })
        .catch(e => {
            console.error("❌ Error detallado al obtener clientSecret:", {
                message: e.message,
                response: e.response?.data,
                status: e.response?.status,
                code: e.code
            });
            
            // Manejar diferentes tipos de errores
            let errorMessage = "Error al conectar con el servicio de pagos. Intenta más tarde.";
            
            if (e.response?.status === 401) {
                errorMessage = "Tu sesión ha expirado. Por favor inicia sesión nuevamente.";
            } else if (e.response?.data?.error) {
                errorMessage = `Error del servidor: ${e.response.data.error}`;
            } else if (e.code === 'ECONNABORTED') {
                errorMessage = "El servidor tardó demasiado en responder. Intenta nuevamente.";
            } else if (e.message) {
                errorMessage = e.message;
            }
            
            setError(errorMessage);
            throw new Error(errorMessage);
        });
    }, [token]);

    // CORRECCIÓN: onError NO es válido para EmbeddedCheckoutProvider
    // Usa solo fetchClientSecret y onComplete
    const options = { 
        fetchClientSecret,
        onComplete: () => {
            console.log("🎉 Checkout completado");
            const sessionId = localStorage.getItem('stripe_session_id');
            if (sessionId) {
                navigate(`/payment-return?session_id=${sessionId}`);
            } else {
                navigate('/payment-return');
            }
        }
    };

    return (
        <div id="checkout" className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Proceso de Pago</h2>
                
                {/* Mostrar mensaje de error si existe */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 font-medium">Error: {error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                        >
                            Reintentar
                        </button>
                    </div>
                )}
                
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 min-h-[500px]">
                    <div className="mb-4">
                        <p className="text-gray-600">
                            Completa tu compra de forma segura con Stripe. Todos los pagos están protegidos.
                        </p>
                    </div>
                    
                    <EmbeddedCheckoutProvider
                        stripe={stripePromise}
                        options={options}
                    >
                        <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>
                    
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            <span className="font-semibold">Seguridad garantizada:</span> 
                            Tus datos de pago están encriptados y nunca se almacenan en nuestros servidores.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}