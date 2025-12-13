import axios from "axios";
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { baseUrl } from "../../../environment";

export default function OrderDetails() {

    const [orderDetails, setOrderDetails] = useState(null)
    const id = useParams().id;
    const fetchOrdersById = () => {
        axios.get(`${baseUrl}/order/${id}`).then(resp => {
            setOrderDetails(resp.data.order)
        }).catch(e => {
            console.log("Fetch order details error", e)
        })
    }
    useEffect(() => {
        fetchOrdersById();

    }, [])
    
    return (<>
        {orderDetails &&
            <div className=" py-24 sm:py-32">
                <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
                    <p className="mx-auto mt-2 max-w-lg text-center text-4xl font-semibold tracking-tight text-balance text-gray-950 sm:text-5xl">
                        Detalles del pedido
                    </p>
                    <p className="bg-gray-200 p-2 shadow rounded">ID de pago({orderDetails.paymentId})</p>
                    


                    <div className="mt-10 grid gap-4 sm:mt-16 lg:grid-cols-2 lg:grid-rows-1">
                        <div className="relative lg:row-span-2">
                            <div className="absolute inset-px rounded-lg bg-white lg:rounded-l-4xl" />
                            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] lg:rounded-l-[calc(2rem+1px)]">
                                <div className="px-8 pb-3 pt-8 sm:px-10 sm:pb-0 sm:pt-10">
                                    <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
                                        Detalles
                                    </p>
                                    <table className="table-auto border-separate border-spacing-2 w-full">

                                        <tbody>

                                            <tr>
                                                <td className="p-1 font-bold bg-gray-400 rounded-l-lg">Fecha de pedido</td>
                                                <td>{orderDetails.createdAt}</td>
                                            </tr>


                                            <tr>
                                                <td className="p-1 font-bold bg-gray-400 rounded-l-lg">Precio total</td>
                                                <td>{orderDetails.totalPrice}</td>
                                            </tr>
                                            <tr>
                                                <td className="p-1 font-bold bg-gray-400 rounded-l-lg">Estado de pago</td>
                                                <td>{orderDetails.paymentStatus}</td>
                                            </tr>
                                            <tr>
                                                <td className="p-1 font-bold bg-gray-400 rounded-l-lg">Estado del pedido</td>
                                                <td>{orderDetails.orderStatus}</td>
                                            </tr>





                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm outline outline-black/5 lg:rounded-l-4xl" />
                        </div>

                        <div className="relative lg:row-span-2">
                            <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-b-[2rem] lg:rounded-r-[2rem]" />
                            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] max-lg:rounded-b-[calc(2rem+1px)] lg:rounded-r-[calc(2rem+1px)]">
                                <div className="px-8 pb-3 pt-8 sm:px-10 sm:pb-0 sm:pt-10">
                                    <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
                                        Productos
                                    </p>
                                    <table className="table-auto w-full">
                                        <thead className="bg-gray-500">
                                            <tr >
                                                <th className="p-2">Nombre</th>
                                                <th>Imagen</th>
                                                <th>Cantidad</th>
                                                <th>Precio</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orderDetails.products.length > 0 && orderDetails.products.map((item, i) => {
                                                return (
                                                    <tr key={i}>
                                                        <td className="p-2" align="center">{item.product.name}</td>
                                                        <td align="center">
                                                            <img style={{ height: "240px" }} src={`${baseUrl}/${item.product.images[0]}`} alt="Image" /></td>
                                                        <td align="center">{item.quantity}</td>
                                                        <td align="center">{item.product.price}</td>
                                                        <td align="center">{item.product.price * item.quantity}</td>
                                                    </tr>

                                                )
                                            })}



                                        </tbody>
                                    </table>
                                </div>

                            </div>
                            <div className="pointer-events-none absolute inset-px rounded-lg shadow outline outline-1 outline-black/5 max-lg:rounded-b-[2rem] lg:rounded-r-[2rem]" />
                        </div>
                    </div>
                </div>
            </div>
        }
    </>

    )
}
