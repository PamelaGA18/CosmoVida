import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { baseUrl } from "../../../environment";
import { useEffect, useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import Alert from "../../../basicUtilityComp/alert/Alert";
import { useDispatch } from "react-redux";
import { updateTotal } from "../../../state/cartSlice";
export default function Cart() {
    const [products, setProducts] = useState([])

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState("success");

    const handleMessageClear = () => {
        setMessage("");
        setMessageType("success")
    }

    const handleMessage = (message, type) => {
        setMessage(message);
        setMessageType(type)
    }


    const totalCartPrice = () => {
        if (!products || !Array.isArray(products)) return 0; return products.reduce((total, item) => total + (parseInt(item.product?.price || 0) * parseInt(item.quantity || 0)), 0);
    };

    const updateQuantity = (type, quantity, productId) => {
        let qty;
        if (type === 'increase') {
            qty = quantity + 1;
        } else if (type === 'decrease' && quantity > 1) {
            qty = quantity - 1;
        }

        axios.put(`${baseUrl}/cart/${productId}`, { quantity: qty }).then(resp => {
            console.log("Response after update", resp)
            handleMessage(resp.data.message, 'success')
        }).catch(e => {
            handleMessage(e.response.data.message, "error")
            console.log("Error in cart update", e)
        })
    }

    const dispatch = useDispatch();
    const deleteCartItem = (productId) => {
        if (window.confirm("¿Estas seguro de eliminar?")) {
            axios.delete(`${baseUrl}/cart/${productId}`).then(resp => {
                handleMessage(resp.data.message, "success")
                dispatch(updateTotal(resp.data.cart.products.length))
            }).catch(e => {
                handleMessage(e.response.data.message, "error")
            }
            )
        }
    }

    const fetchCart = () => {
        axios.get(`${baseUrl}/cart`).then(resp => {
            console.log("cart response", resp.data);

            setProducts(resp.data.cart.products);

        }).catch(e => {
            console.log("Cart fetch error", e)
        })
    }

    useEffect(() => {
        fetchCart()
    }, [message])


    return (<>
        {message && <Alert message={message} type={messageType} handleMessageClear={handleMessageClear} />}
        <h1 className="m-auto  text-center text-[24px] font bold">Carrito</h1>
        <table className="table-auto w-full">
            <thead className="bg-gradient-to-r from-[#f599a9] via-[#bf88f7] to-[#6cbdd8]">
                <tr >
                    <th className="p-2" align="center">Nombre</th>
                    <th>Imagen</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Total</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
                {products && products.length > 0 ? products.map((x, i) => {
                    return <tr key={i}>
                        <td className="p-2" align="center">{x.product.name}</td>
                        <td align="center"><img style={{ height: "240px" }}
                            src={`${baseUrl}/${x.product.images.length > 0 ? x.product.images[0] : ""}`}
                            alt="Image" /></td>
                        <td align="center">
                            <button className="w-6 bg-gray-300 mr-1" onClick={() => { updateQuantity('decrease', x.quantity, x.product._id) }} >-</button>
                            {x.quantity}
                            <button className="mr-1 w-6 bg-gray-300" onClick={() => { updateQuantity('increase', x.quantity, x.product._id) }}>+</button></td>
                        <td align="center">${x.product.price}</td>
                        <td align="center">$ {parseInt(x.product.price) * parseInt(x.quantity)}</td>
                        <td align="center"><button onClick={() => { deleteCartItem(x.product._id) }}><TrashIcon className="w-6" color="red" /></button></td>
                    </tr>

                }) : <h1>El carrito está vacío.</h1>}




                {/* GRAND TOTAL */}
                <tr className="bg-gray-100">
                    <td colSpan={5}></td>
                    <td align="center" className="p-2">Total: $ {products?.length ? totalCartPrice() : 0}</td>
                </tr>

                {/* PAGAR */}
                <tr className="">
                    <td colSpan={3}></td>
                    <td colSpan={3} align="right" className="p-2" >
                        {products.length>0 && <Link className="bg-blue-400 text-white p-1 rounded shadow" to="/checkout">Pagar</Link>
                        }
                    </td>
                </tr>
            </tbody>
        </table>
    </>)
}