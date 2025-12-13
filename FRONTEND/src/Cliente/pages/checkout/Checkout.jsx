import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useCallback } from "react";
import { baseUrl } from "../../../environment";


const stripePromise = loadStripe("sk_test_51RUheLQj0Dr03eMVi8bA99yUYERm7QQJvZa48td9JIeuPj7HukQtZWK8s25uzvlQzcaT2JG2HEBu86turllrfVGX00ZXNcYdH1");

export default function Checkout() {
    localStorage.setItem('pending_payment_session', sessionId);

    const fetchClientSecret = useCallback(() => {

        return axios.get(`${baseUrl}/payment/create-session`).then(resp=>{
            return resp.data.clientSecret;
        }).catch(e=>{
            console.log("Error in creating-session", e)
        })
        
    }, []);

    const options = { fetchClientSecret };

    return (
        <div id="checkout">
            <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={options}
            >
                <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
        </div>
    )
}
