import './App.css';
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import ClienteModule from './Cliente/ClienteModule';
import Home from './Cliente/pages/home/Home';
import Products from './Cliente/pages/products/Products';
import Cart from './Cliente/pages/cart/Cart';
import Orders from './Cliente/pages/orders/Orders';
import Login from './Cliente/pages/login/Login';
import Register from './Cliente/pages/register/Register';
import AdminModule from './Admin/AdminModule';
import Dashboard from './Admin/pages/dashboard/Dashboard';
import OrderDetails from './Cliente/pages/order-details/OrderDetails';
import ProductsAdmin from './Admin/pages/products/ProductsAdmin';
import UsersAdmin from './Admin/pages/users/UsersAdmin';
import OrdersAdmin from './Admin/pages/orders/OrdersAdmin';
import Category from './Admin/pages/category/Category';
import Colors from './Admin/pages/color/Colors';
import PrivateRoute from './guards/PrivateRoute';
import PrivateAdminRoute from './guards/PrivateAdminRoute';
import SignOut from './Cliente/pages/sign-out/SignOut';
import { useDispatch } from 'react-redux';
import { login } from './state/authSlice';
import Checkout from './Cliente/pages/checkout/Checkout';
import axios from 'axios';
import { baseUrl } from './environment';
import { updateTotal } from './state/cartSlice';
import PaymentReturn from './Cliente/pages/payment-return/PaymentReturn';
import ProductDetails from './Cliente/pages/ProductDetails/ProductDetails';
import Profile from './Cliente/pages/profile/Profile';

// Componente para detectar pagos automáticamente
function PaymentDetector() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Verificar si estamos en la raíz con parámetros de pago
    const searchParams = new URLSearchParams(location.search);
    const sessionId = searchParams.get('session_id');
    const paymentSuccess = searchParams.get('payment_success');
    
    console.log("📍 PaymentDetector activado:");
    console.log("   Ruta:", location.pathname);
    console.log("   Parámetros:", location.search);
    console.log("   session_id:", sessionId);
    console.log("   payment_success:", paymentSuccess);
    
    // Detectar pago exitoso
    if (sessionId && paymentSuccess === '1') {
      console.log("💰 ¡PAGO DETECTADO! Redirigiendo a PaymentReturn...");
      
      // Guardar en sessionStorage temporalmente
      sessionStorage.setItem('last_payment_session_id', sessionId);
      
      // Redirigir inmediatamente
      navigate(`/payment-return?session_id=${sessionId}`, { 
        replace: true 
      });
    }
  }, [location, navigate]);

  return null;
}

function App() {
  const dispatch = useDispatch();

  const fetchCart = () => {
    axios.get(`${baseUrl}/cart`).then(resp => {
      console.log("🛒 Carrito:", resp.data.cart);
      dispatch(updateTotal(resp.data.cart.products.length));
    }).catch(e => {
      console.log("❌ Error carrito:", e);
    });
  };

  useEffect(() => {
    fetchCart();

    // Verificar usuario en localStorage
    const userDataStr = localStorage.getItem("userData");
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      if (userData.token && userData.role === 'admin') {
        dispatch(login({ auth: true, admin: true, userData }));
      } else if (userData.token && userData.role === 'user') {
        dispatch(login({ auth: true, admin: false, userData }));
      }
    }
    
    // Detectar pago al cargar la página (fallback)
    const searchParams = new URLSearchParams(window.location.search);
    const sessionId = searchParams.get('session_id');
    const paymentSuccess = searchParams.get('payment_success');
    
    if (sessionId && paymentSuccess === '1') {
      console.log("🚨 Pago detectado en carga inicial, redirigiendo...");
      // Pequeño delay para asegurar que React Router esté listo
      setTimeout(() => {
        window.location.href = `/payment-return?session_id=${sessionId}`;
      }, 300);
    }
  }, [dispatch]);

  return (
    <BrowserRouter>
      {/* Detector de pagos */}
      <PaymentDetector />
      
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