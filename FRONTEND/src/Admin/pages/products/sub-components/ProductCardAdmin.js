import { baseUrl } from "../../../../environment"


export default function ProductCardAdmin({ product,handleEditForm, handleDeleteForm }) {
    return (
        <>
            <div key={product.id} className="group relative">
                <img
                    alt={product.imageAlt}
                    src={`${baseUrl}/${product.images.length>0?product.images[0]:""}`}
                    className="aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:opacity-75 lg:aspect-auto lg:h-80"
                />
                <div className="mt-4 flex justify-between">
                    <div>
                        <h3 className="text-sm text-gray-700">
                                {product.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">{product.color?product.color.name:""}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{product.price}</p>

                </div>
                <div className="mt-4 flex justify-between">
                    <button type="button" className="bg-gray-600 text-white px-2 rounded" onClick={()=>{ handleEditForm(product._id)}}>Editar</button>
                    <button className="bg-red-600 text-white px-2 rounded" onClick={()=>{ handleDeleteForm(product._id)}}>Eliminar</button>
                </div>
            </div>
        </>
    )
}
