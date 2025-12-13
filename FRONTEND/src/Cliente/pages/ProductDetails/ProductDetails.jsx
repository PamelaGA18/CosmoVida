import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { baseUrl } from "../../../environment";
import { useDispatch, useSelector } from "react-redux";
import { updateTotal } from "../../../state/cartSlice";

const ProductDetails = () => {
    const [productDetails, setProductDetails] = useState(null);
    const [mainImage, setMainImage] = useState("");

    const { id } = useParams();

    const auth = useSelector(state => state.auth.auth);
    const dispatch = useDispatch();

    // 🔹 Mensajes locales
    const handleMessage = (message, type) => {
        alert(`${type.toUpperCase()}: ${message}`);
    };

    const fetchProductById = () => {
        axios.get(`${baseUrl}/products/${id}`)
            .then(resp => {
                setProductDetails(resp.data.product);
                setMainImage(resp.data.product.images[0]);
            })
            .catch(e => console.log("Fetch product details error", e));
    };

    useEffect(() => {
        fetchProductById();
    }, []);

    // ⭐⭐ MISMA LÓGICA QUE ProductCart ⭐⭐
    const addToCart = (id) => {
        axios.post(`${baseUrl}/cart/add`, { productId: id })
            .then(resp => {
                console.log("Response add to cart", resp);
                dispatch(updateTotal(resp.data.cart.products.length));
                handleMessage(resp.data.message, "success");
            })
            .catch(e => {
                handleMessage(e.response.data.message, "error");
                console.log("err add to cart", e);
            });
    };

    return (
        <>
            {productDetails && (
                <div className="mt-4 min-h-screen bg-gradient-to-r from-[#F7C8D0] via-[#EADCF8] to-[#C7E8F3] p-6 flex flex-col md:flex-row justify-center gap-10">

                    {/* Image section */}
                    <div className="md:w-1/2 flex flex-col items-center">
                        <img
                            src={`${baseUrl}/${mainImage}`}
                            alt="Product"
                            className="w-80 h-80 object-cover rounded-xl shadow-lg"
                        />

                        <div className="flex mt-4 space-x-2">
                            {productDetails.images.map((img, index) => (
                                <img
                                    key={index}
                                    src={`${baseUrl}/${img}`}
                                    alt="Thumbnail"
                                    className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 ${
                                        mainImage === img ? "border-purple-500" : "border-transparent"
                                    }`}
                                    onClick={() => setMainImage(img)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Product info */}
                    <div className="md:w-1/2 p-6 flex flex-col justify-center">
                        <h2 className="text-3xl font-bold text-gray-800">
                            {productDetails.name}
                        </h2>

                        <p className="text-gray-700 mt-3">
                            {productDetails.description}
                        </p>

                        <span className="text-2xl font-semibold text-purple-600 mt-4">
                            ${productDetails.price}
                        </span>

                        {auth ? (
                            <button
                                className="mt-6 bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg shadow-md transition-all"
                                onClick={() => addToCart(productDetails._id)}
                            >
                                Agregar al carrito
                            </button>
                        ) : (
                            <a
                                href="/login"
                                className="mt-6 bg-gray-400 text-white px-6 py-2 rounded-lg text-center shadow-md"
                            >
                                Inicia sesión para comprar
                            </a>
                        )}

                    </div>
                </div>
            )}
        </>
    );
};

export default ProductDetails;
