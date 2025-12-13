import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../../../environment";
import { useSelector } from "react-redux";

export default function Checkout() {
    const { token } = useSelector((state) => state.auth.userData || {});
    const navigate = useNavigate();

    useEffect(() => {
        // Crear sesión y redirigir automáticamente
        const createSessionAndRedirect = async () => {
            try {
                console.log(" Creando sesión de pago...");
                
                const response = await axios.post(
                    `${baseUrl}/payment/create-session`,
                    {},
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                if (response.data.success && response.data.url) {
                    console.log(" Redirigiendo a Stripe:", response.data.url);
                    // Guardar sessionId en localStorage por si acaso
                    if (response.data.sessionId) {
                        localStorage.setItem('stripe_session_id', response.data.sessionId);
                    }
                    // Redirigir a la página de pago de Stripe
                    window.location.href = response.data.url;
                } else {
                    console.error(" No se pudo obtener URL de Stripe");
                    navigate('/cart');
                }
            } catch (error) {
                console.error(" Error creando sesión:", error);
                navigate('/cart');
            }
        };

        createSessionAndRedirect();
    }, [token, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Redirigiendo a la pasarela de pago...</p>
            <p className="text-sm text-gray-400">Por favor espera un momento</p>
        </div>
    );
}