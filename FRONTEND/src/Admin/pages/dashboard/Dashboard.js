import axios from "axios";
import { useEffect, useState } from "react"
import { baseUrl } from "../../../environment";

export default function Dashboard() {
    const [totalProduct, setTotalProduct] = useState(0)
    const [totalUser, setTotalUser] = useState(0)
    const [totalCategory, setTotalCategory] = useState(0)
    const [totalColor, setTotalColor] = useState(0);

    const fetchTotals = async()=>{
        try {
            const product = await axios.get(`${baseUrl}/products`);
            const user = await axios.get(`${baseUrl}/user`);
            const category = await axios.get(`${baseUrl}/category`);
            const color = await axios.get(`${baseUrl}/color`);
            setTotalProduct(product.data.products.length)
            setTotalUser(user.data.users.length);
            setTotalCategory(category.data.categories.length);
            setTotalColor(color.data.colors.length)
        } catch (error) {
            console.log("Error in fetching Panel Data", error)
        }
    }
    useEffect(()=>{
        fetchTotals()
    },[])
    return (
        <>

            <div className="flex flex-row flex-wrap">

                <div className="bg-blue-100 m-2 p-3 rounded shadow h-40 min-w-24 w-80 relative">
                    <h2 className="text-4xl">Productos</h2>
                    <p className="text-2xl">Total : {totalProduct}</p>
                    <div className="h-4"></div>
                </div>


                <div className="bg-green-100 m-2 p-3 rounded shadow h-40 min-w-24 w-80 relative">
                    <h2 className="text-4xl">Usuarios</h2>
                    <p className="text-2xl">Total : {totalUser}</p>
                    <div className="h-4"></div>
                </div>

                <div className="bg-purple-100 m-2 p-3 rounded shadow h-40 min-w-24 w-80 relative">
                    <h2 className="text-4xl">Categorías</h2>
                    <p className="text-2xl">Total : {totalCategory}</p>
                    <div className="h-4"></div>
                </div>

                <div className="bg-pink-100 m-2 p-3 rounded shadow h-40 min-w-24 w-80 relative">
                    <h2 className="text-4xl">Colors</h2>
                    <p className="text-2xl">Total : {totalColor}</p>
                    <div className="h-4"></div>
                </div>
            </div>

        </>
    )
}