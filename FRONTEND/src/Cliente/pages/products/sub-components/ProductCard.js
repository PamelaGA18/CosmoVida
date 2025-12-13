import axios from "axios"
import { baseUrl } from "../../../../environment"
import { useDispatch, useSelector } from "react-redux"
import { updateTotal } from "../../../../state/cartSlice"
import { Link } from "react-router-dom"


export default function ProductCart({ product, handleMessage}) {
    const auth = useSelector(state=>state.auth.auth)
    const dispatch = useDispatch()
    const addToCart = (id)=>{
        axios.post(`${baseUrl}/cart/add`, {productId:id}).then(resp=>{
            console.log("Response add to cart", resp)
            dispatch(updateTotal(resp.data.cart.products.length))
            handleMessage(resp.data.message,"success")
        }).catch(e=>{
            handleMessage(e.response.data.message, "error")
            console.log('err add to cart', e)
        })
    }

    return (
        <>
            <div key={product.id} className="group relative bg-gray-200 shadow rounded">
                <img
                    alt={product.imageAlt}
                    src={`${baseUrl}/${product.images.length>0?product.images[0]:""}`}
                    className="aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:opacity-75 lg:aspect-auto lg:h-80"
                />
                <div className="mt-4 flex justify-between px-1">
                    <div>
                        <h3 className="text-sm text-gray-700">
                                {product.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">{product.color?product.color.name:""}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{product.price}</p>
                    
                </div>
                <div className="mt-4 flex justify-between px-1 pb-1">
                    {auth? <button type="button" className="bg-gray-600 text-white px-2 rounded" onClick={()=>{addToCart(product._id)}}>Agregar al carrito</button>
                    :<Link to={'/login'} className="bg-gray-400 text-white px-2 rounded">Iniciar sesión para comprar</Link>}
                    <Link to={`/product-details/${product._id}`} className="bg-green-600 text-white px-2 rounded">Ver</Link>

                </div>
                
            </div>
        </>
    )
}
