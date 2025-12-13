import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useCallback } from "react";
import { baseUrl } from "../../../environment";

const stripePromise = loadStripe("pk_test_51RUheLQj0Dr03eMVBwAUYhPIbzHSW2H1NQ1cOjdah8UgP8xjmYerXLA1bAKDM3IRA1xDV9Ou7FLBHYC9ZvFMFmx300dplyYt5a");

export default function Checkout() {
    const fetchClientSecret = useCallback(() => {
        //  AÑADIR HEADER DE AUTORIZACIÓN
        const token = localStorage.getItem('token') || '';
        
        return axios.get(`${baseUrl}/payment/create-session`, {
            headers: {
                'Authorization': token
            }
        })
        .then(resp => {
            console.log("Response from create-session:", resp.data);
            if (resp.data.success && resp.data.clientSecret) {
                return resp.data.clientSecret;
            } else {
                throw new Error("No client secret received");
            }
        })
        .catch(e => {
            console.log("Error in creating-session", e.response || e);
            throw e;
        });
    }, []);

    const options = { fetchClientSecret };

    return (
        <div id="checkout" style={{ width: '100%', height: '500px' }}>
            <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={options}
            >
                <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
        </div>
    )
}