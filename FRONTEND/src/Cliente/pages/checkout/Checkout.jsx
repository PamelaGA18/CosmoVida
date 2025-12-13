import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useCallback } from "react";
import { baseUrl } from "../../../environment";
import { useSelector } from "react-redux";

//  Usar variable de entorno para clave pública
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "pk_test_51RUheLQj0Dr03eMVBwAUYhPIbzHSW2H1NQ1cOjdah8UgP8xjmYerXLA1bAKDM3IRA1xDV9Ou7FLBHYC9ZvFMFmx300dplyYt5a");

export default function Checkout() {
    const { token } = useSelector((state) => state.auth.userData || {});

    const fetchClientSecret = useCallback(() => {
        return axios.post(
            `${baseUrl}/payment/create-session`,
            {}, // cuerpo vacío o datos necesarios
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        )
        .then(resp => {
            if (resp.data.success && resp.data.clientSecret) {
                console.log(" Client secret obtenido");
                return resp.data.clientSecret;
            } else {
                throw new Error("No se pudo obtener clientSecret");
            }
        })
        .catch(e => {
            console.error(" Error en create-session:", e.response?.data || e.message);
            throw e; // Importante propagar el error
        });
    }, [token]);

    const options = { 
        fetchClientSecret,
        onComplete: () => {
            console.log(" Pago completado");
            // Redirigir o actualizar estado
        }
    };

    return (
        <div id="checkout" style={{ minHeight: '400px' }}>
            <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={options}
            >
                <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
        </div>
    );
}