import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useCallback } from "react";
import { baseUrl } from "../../../environment";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "pk_test_51RUheLQj0Dr03eMVBwAUYhPIbzHSW2H1NQ1cOjdah8UgP8xjmYerXLA1bAKDM3IRA1xDV9Ou7FLBHYC9ZvFMFmx300dplyYt5a");

export default function Checkout() {
    const { token } = useSelector((state) => state.auth.userData || {});
    const navigate = useNavigate();

    const fetchClientSecret = useCallback(() => {
        console.log(" Solicitando client secret...");
        
        return axios.post(
            `${baseUrl}/payment/create-session`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        )
        .then(resp => {
            console.log(" Respuesta del backend:", resp.data);
            
            if (resp.data.success && resp.data.clientSecret) {
                // Guardar sessionId en localStorage como backup
                if (resp.data.sessionId) {
                    localStorage.setItem('stripe_session_id', resp.data.sessionId);
                    console.log(" SessionId guardado:", resp.data.sessionId);
                }
                
                return resp.data.clientSecret;
            } else {
                throw new Error(resp.data.message || "No se pudo obtener clientSecret");
            }
        })
        .catch(e => {
            console.error("Error detallado:", {
                message: e.message,
                response: e.response?.data,
                status: e.response?.status
            });
            throw e;
        });
    }, [token]);

    const options = { 
        fetchClientSecret,
        onComplete: (result) => {
            console.log(" Checkout completado:", result);
            // Redirigir a la página de retorno
            navigate('/payment-return');
        }
    };

    return (
        <div id="checkout" style={{ minHeight: '500px', padding: '20px' }}>
            <h2 className="text-xl font-bold mb-4">Proceso de Pago</h2>
            <div className="border rounded-lg p-4">
                <EmbeddedCheckoutProvider
                    stripe={stripePromise}
                    options={options}
                >
                    <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
            </div>
        </div>
    );
}