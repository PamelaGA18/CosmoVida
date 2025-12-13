import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../../../environment";
import { useSelector } from "react-redux";

export default function Checkout() {
    const { token } = useSelector((state) => state.auth.userData || {});
    const navigate = useNavigate();

    useEffect(() => {
        // Crear sesión y redirigir automáticamente a Stripe
        const createSessionAndRedirect = async () => {
            try {
                console.log("🔄 Creando sesión de pago...");
                
                if (!token) {
                    console.error("❌ No hay token de autenticación");
                    navigate('/login');
                    return;
                }

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
                    console.log("✅ Redirigiendo a Stripe:", response.data.url);
                    
                    // Guardar sessionId en sessionStorage por si acaso
                    if (response.data.sessionId) {
                        sessionStorage.setItem('stripe_session_id', response.data.sessionId);
                    }
                    
                    // Redirigir a la página de pago de Stripe
                    window.location.href = response.data.url;
                } else {
                    console.error("❌ No se pudo obtener URL de Stripe");
                    navigate('/cart');
                }
            } catch (error) {
                console.error("❌ Error creando sesión:", error.response?.data || error.message);
                alert("Error al procesar el pago: " + (error.response?.data?.message || error.message));
                navigate('/cart');
            }
        };

        createSessionAndRedirect();
    }, [token, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
                <h2 className="mt-6 text-xl font-semibold text-gray-700">Procesando tu pedido</h2>
                <p className="mt-2 text-gray-500">Estamos redirigiéndote a la pasarela de pago segura...</p>
                <p className="text-sm text-gray-400 mt-4">Por favor no cierres esta ventana</p>
            </div>
        </div>
    );
}