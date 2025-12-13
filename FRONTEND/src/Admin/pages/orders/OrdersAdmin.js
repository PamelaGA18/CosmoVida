import { Button } from "@headlessui/react";
import { Link } from "react-router-dom";
import { baseUrl } from "../../../environment";
import axios from "axios";
import { useEffect, useState } from "react";
import Alert from "../../../basicUtilityComp/alert/Alert";

export default function OrdersAdmin() {
    const [orders, setOrders] = useState([])

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState("success");

    const handleMessageClear = () => {
        setMessage("");
        setMessageType("success")
    }
const formatDate = (dateData)=>{
        const date = new Date(dateData);
        const monthArr =["En", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
        return date.getDate()+'-'+monthArr[date.getMonth()]+"-"+date.getFullYear()
    }
    const fetchOrders=()=>{
        axios.get(`${baseUrl}/order`).then(resp=>{
            console.log("Response", resp)
            setOrders(resp.data.orders)
        }).catch(e=>{
            console.log("Error infetching orders", e)
        })
    }

    const handleStatusChange = (e, id)=>{
        axios.put(`${baseUrl}/order/order-status/${id}`,{orderStatus:e.target.value}).then(resp=>{
            console.log("order changed", resp);
            setMessage(resp.data.message);
            setMessageType("success");
        }).catch(e=>{
            setMessage("Error in status change");
            setMessageType("error")
            console.log("Error in order status change", e)
        })
    }
    useEffect(()=>{
        fetchOrders()
    },[message])
    return (<>
    {message && <Alert message={message} type={messageType} handleMessageClear={handleMessageClear} />}
        
        <h1 className="m-auto  text-center text-[24px] font bold">Pedidos</h1>
        <table className="table-auto w-full">
            <thead className="bg-gray-500">
                <tr >
                    <th className="p-2">Datos del pedido</th>
                    <th>Id de pago</th>
                    <th>Precio total</th>
                    <th>Estado de pago</th>
                    <th>Estado del pedido</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
                {orders.length>0 && orders.map(order=>{
                    return (
                    <tr key={order._id}>
                    <td className="p-2" align="center">{formatDate(order.createdAt)}</td>
                    <td align="center">{order.paymentId}</td>
                    <td align="center">$ {order.totalPrice}</td>
                    <td align="center">{order.paymentStatus}</td>
                    <td align="center">
                        <div className="sm:col-span-3">
                            <div className="mt-2 grid grid-cols-1">
                                <select
                                value={order.orderStatus}
                                onChange={(e)=>{handleStatusChange(e, order._id)}}
                                    autoComplete="country-name"
                                    className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                >
                                    <option value={'pending'}>Pendiente</option>
                                    <option value={'confirmed'}>Confirmado</option>
                                    <option value={'delivered'}>Entregado</option>
                                </select>

                            </div>
                        </div></td>
                    <td align="center"><button className="bg-gray-400 hover:bg-gray-700 text-white px-1 rounded"><Link to={`/admin/order-details/${order._id}`}>Detalles</Link></button></td>
                </tr>


                    )
                })}
                


                



            </tbody>
        </table>
    </>)
}