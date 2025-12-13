import { Button } from "@headlessui/react";
import axios from "axios";
import { Link } from "react-router-dom";
import { baseUrl } from "../../../environment";
import { useEffect, useState } from "react";

export default function Orders() {
    const [orders, setOrders] = useState([])

    const formatDate = (dateData)=>{
        const date = new Date(dateData);
        const monthArr =["En", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
        return date.getDate()+'-'+monthArr[date.getMonth()]+"-"+date.getFullYear()
    }
    const fetchOrders=()=>{
        axios.get(`${baseUrl}/order/user`).then(resp=>{
            console.log("Response", resp)
            setOrders(resp.data.orders)
        }).catch(e=>{
            console.log("Error infetching orders", e)
        })
    }

    useEffect(()=>{
        fetchOrders()
    },[])
    return (<>
        <h1 className="m-auto  text-center text-[24px] font bold">Pedidos</h1>
        <table className="table-auto w-full">
            <thead className="bg-gradient-to-r from-[#f599a9] via-[#bf88f7] to-[#6cbdd8]">
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
                    return <>
                    <tr key={order._id}>
                    <td className="p-2" align="center">{formatDate(order.createdAt)}</td>
                    <td align="center">{order.paymentId}</td>
                    <td align="center">$ {order.totalPrice}</td>
                    <td align="center">{order.paymentStatus}</td>
                    <td align="center">{order.orderStatus}</td>
                    <td align="center"><button className="bg-blue-600 hover:bg-gray-700 text-white px-1 rounded"><Link to={`/order-details/${order._id}`}>Detalles</Link></button></td>
                </tr>
                    </>
                })}
                            
    
            </tbody>
        </table>
    </>)
}