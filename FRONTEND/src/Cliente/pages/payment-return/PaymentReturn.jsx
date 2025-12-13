import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { baseUrl } from "../../../environment";
import axios from "axios";
import { useDispatch } from "react-redux";
import { updateTotal } from "../../../state/cartSlice";
import {
    CheckCircleIcon
} from "@heroicons/react/24/outline";
export default function PaymentReturn() {
    const [status, setStatus] = useState(null);
    const [customerEmail, setCustomerEmail] = useState('');
    const dispatch = useDispatch();

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
            dispatch(updateTotal(0)); // fallback seguro
        }
    }


    // En PaymentReturn.js
    useEffect(() => {
        console.log(" PaymentReturn montado");
        console.log("URL completa:", window.location.href);

        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);

        const sessionId = urlParams.get('session_id');
        const userId = urlParams.get('user_id');

        console.log("Session ID:", sessionId);
        console.log("User ID:", userId);
        console.log("URL de API:", `${baseUrl}/payment/session-status?session_id=${sessionId}&user_id=${userId}`);

        axios.get(`${baseUrl}/payment/session-status?session_id=${sessionId}&user_id=${userId}`)
            .then(resp => {
                console.log(" Respuesta de API:", resp.data);
                setStatus(resp.data.status);
                setCustomerEmail(resp.data.customer_email);
                fetchCart();
            })
            .catch(e => {
                console.log(" Error en API:", e.response?.data || e.message);
            });
    }, []);


    if (status === 'open') {
        return (
            <Navigate to="/checkout" />
        )
    }

    if (status === 'paid') {
        return (
            <section id="success" className="flex min-h-screen flex-col justify-center items-center">
                <CheckCircleIcon className="h-20 w-20 text-blue-500" />
                <h2 className="text-blue-500">Pago exitoso</h2>
                <h3 className="text-black">¡Apreciamos su compra!</h3>

                <p>Se enviará un correo de confirmación a {customerEmail}.</p>

                <button className="bg-blue-600 shadow text-white px-2 py-1 mt-2 rounded">
                    <Link to={'/products'}>Continúa comprando.</Link>
                </button>
            </section>
        )
    }


    return null;
}