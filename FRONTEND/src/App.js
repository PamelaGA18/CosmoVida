import './App.css';
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
// ... otros imports

// Componente para manejar redirecciones de pago
function PaymentRedirectHandler() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Verificar si hay parámetros de pago en la URL
        const searchParams = new URLSearchParams(location.search);
        const sessionId = searchParams.get('session_id');
        const success = searchParams.get('success');
        
        if (sessionId && success === 'true') {
            console.log("💰 Pago exitoso detectado, sessionId:", sessionId);
            
            // Guardar en localStorage por si acaso
            localStorage.setItem('last_payment_session', sessionId);
            localStorage.setItem('payment_redirected', 'true');
            
            // Redirigir a PaymentReturn
            navigate(`/payment-return?session_id=${sessionId}`, { replace: true });
        }
        
        // También verificar si hay parámetros en el hash (Stripe a veces los pone ahí)
        if (location.hash) {
            const hashParams = new URLSearchParams(location.hash.substring(1));
            const hashSessionId = hashParams.get('session_id');
            if (hashSessionId) {
                console.log("🔗 SessionId encontrado en hash:", hashSessionId);
                navigate(`/payment-return?session_id=${hashSessionId}`, { replace: true });
            }
        }
    }, [location, navigate]);

    return null; // Este componente no renderiza nada
}

function App() {
  const dispatch = useDispatch();

  const fetchCart = () => {
    axios.get(`${baseUrl}/cart`).then(resp => {
      console.log("cart response", resp.data.cart);
      dispatch(updateTotal(resp.data.cart.products.length));
    }).catch(e => {
      console.log("Cart fetch error", e);
    });
  };

  useEffect(() => {
    fetchCart();

    const userDataStr = localStorage.getItem("userData");
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      if (userData.token && userData.role === 'admin') {
        dispatch(login({ auth: true, admin: true }));
      }

      if (userData.token && userData.role === 'user') {
        dispatch(login({ auth: true, admin: false }));
      }
    }
    
    // Verificar si hay un pago pendiente de procesar
    const lastPaymentSession = localStorage.getItem('last_payment_session');
    const paymentRedirected = localStorage.getItem('payment_redirected');
    
    if (lastPaymentSession && paymentRedirected !== 'true') {
      console.log("🔄 Procesando pago pendiente:", lastPaymentSession);
      // Podrías redirigir automáticamente o procesar aquí
    }
  }, []);

  return (
    <BrowserRouter>
      {/* Componente para manejar redirecciones de pago */}
      <PaymentRedirectHandler />
      
      <Routes>
        <Route path="/admin" element={<PrivateAdminRoute><AdminModule /></PrivateAdminRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductsAdmin />} />
          <Route path='users' element={<UsersAdmin />} />
          <Route path='orders' element={<OrdersAdmin />} />
          <Route path='order-details/:id' element={<OrderDetails />} />
          <Route path='category' element={<Category />} />
          <Route path='colors' element={<Colors />} />
        </Route>

        <Route path="/" element={<ClienteModule />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="product-details/:id" element={<ProductDetails />} />
          <Route path="cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
          <Route path="orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
          <Route path="order-details/:id" element={<OrderDetails />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path='sign-out' element={<SignOut />} />
          <Route path='checkout' element={<Checkout />} />
          <Route path="/payment-return" element={<PaymentReturn />} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          
          {/* Ruta catch-all para manejar 404s */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;