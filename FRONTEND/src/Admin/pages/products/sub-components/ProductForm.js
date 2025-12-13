import { PhotoIcon,  XMarkIcon } from '@heroicons/react/24/solid'
import { ChevronDownIcon } from '@heroicons/react/16/solid'
import { useFormik } from 'formik'
import { productSchema } from '../../../../yupSchema/productSchema'
import axios from 'axios'
import { baseUrl } from '../../../../environment'
import { useEffect, useState } from 'react'
import Alert from '../../../../basicUtilityComp/alert/Alert'
import { object, string } from 'yup'

export default function ProductForm({ setFormOpen, colors, categories, handleMessage, handleMessageClear, editProduct, setEditProduct }) {


    const initialValues = {
        name: "",
        description: "",
        short_desc: "",
        price: 0,
        stock: 0,
        category: "",
        color: ""
    }

    const Formik = useFormik({
        initialValues,
        validationSchema:productSchema,
        onSubmit: (values) => {
            handleMessageClear()

            // update product
            if(editProduct){
                const fd = new FormData();
                fd.append("name", values.name);
                fd.append("description", values.description);
                fd.append("short_desc", values.short_desc);
                fd.append("price", values.price);
                fd.append("stock", values.stock);
                fd.append("category", values.category);
                fd.append("color", values.color);
                imageArr.forEach(image => {
                    fd.append("images", image)
                })

                axios.put(`${baseUrl}/products/${editProduct._id}`, fd).then(resp => {
                    console.log("Products update", resp)
                    handleMessage(resp.data.message, "success")
                    Formik.resetForm();
                    setFormOpen(false)
                }).catch(e => {
                    handleMessage(e.response.data.message, "error")
                    console.log("Error in updating product", e)
                })


            }else{
                if (imageArr.length > 0) {
                const fd = new FormData();
                fd.append("name", values.name);
                fd.append("description", values.description);
                fd.append("short_desc", values.short_desc);
                fd.append("price", values.price);
                fd.append("stock", values.stock);
                fd.append("category", values.category);
                fd.append("color", values.color);
                imageArr.forEach(image => {
                    fd.append("images", image)
                })

                axios.post(`${baseUrl}/products/create`, fd).then(resp => {
                    console.log("Products save", resp)
                    handleMessage(resp.data.message, "success")
                    Formik.resetForm();
                    setFormOpen(false)
                }).catch(e => {
                    handleMessage(e.response.data.message, "error")
                    console.log("Error in creating product", e)
                })
            } else {
                handleMessage("Por favor añade imagenes", "error")
            }
            }
            
        }
    })

    const [imagesEdit, setImagesEdit] = useState([])
    const [imageArr, setImageArr] = useState([])

    const handleFileChange = (e) => {
        setImageArr((preArr) => {
            if (preArr.filter(image => image.name===e.target.files[0].name).length === 0) {
                return [...preArr, e.target.files[0]]
            } else {
                return preArr;
            }
        })
    }

    const deleteImage = (index) => {
        setImageArr((preArr) => {
            const newArr = preArr.filter((image,i) => index!==i);
            return newArr;
        })
    }

    const deleteEditImage = (id) => {
        if(window.confirm("¿Estas seguro de eliminar esta imagen?")){
            axios.delete(`${baseUrl}/products/${editProduct._id}/image/${id}`).then(resp=>{
                console.log("delete image response", resp)
                setImagesEdit(resp.data.images)
                handleMessage(resp.data.message, "success")
            }).catch(e=>{
                handleMessage(e.response.data.message, "error")
                console.log("Delete image Error", e)
            })
        }
    }

    const cancelFormHandle=()=>{
        Formik.resetForm()
        setEditProduct(null);
        setFormOpen(false)
    }

    useEffect(() => {
        if (editProduct) {
            setImagesEdit(editProduct['images'])
            Object.keys(editProduct).forEach((key) => {
                if (typeof(editProduct[key]) == 'object') {
                    Formik.setFieldValue(key, editProduct[key]._id)
                } else {
                    Formik.setFieldValue(key, editProduct[key])
                }
            })
        }
    }, [])
    return (
        <>

            <form className='m-3 p-3' onSubmit={Formik.handleSubmit}>
                <div className="space-y-12">
                    <div className="">
                        <h2 className="text-base/7 font-semibold text-gray-900">Producto</h2>


                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="col-span-full">
                                <label className="block text-sm/6 font-medium text-gray-900">
                                    Nombre
                                </label>
                                <div className="mt-2">
                                    <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">

                                        <input
                                            id="title"
                                            name="name"
                                            value={Formik.values.name}
                                            onChange={Formik.handleChange}
                                            onBlur={Formik.handleBlur}
                                            type="text"
                                            className="block w-full min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                                        />
                                    </div>
                                    {Formik.touched.name && Formik.errors.name && <p className='text-red-500'>{Formik.errors.name}</p>}
                                </div>
                            </div>

                            <div className="col-span-full">
                                <label htmlFor="description" className="block text-sm/6 font-medium text-gray-900">
                                    Descripción
                                </label>
                                <div className="mt-2">
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={4}
                                        value={Formik.values.description}
                                        onChange={Formik.handleChange}
                                        onBlur={Formik.handleBlur}

                                        className="block w-full min-w-0 grow  py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                                    />
                                </div>
                                {Formik.touched.description && Formik.errors.description && <p className='text-red-500'>{Formik.errors.description}</p>}
                            </div>


                            <div className="col-span-full">
                                <label htmlFor="short_desc" className="block text-sm/6 font-medium text-gray-900">
                                    Descripción breve
                                </label>
                                <div className="mt-2">
                                    <textarea
                                        id="short_desc"
                                        name="short_desc"
                                        rows={2}
                                        value={Formik.values.short_desc}
                                        onChange={Formik.handleChange}
                                        onBlur={Formik.handleBlur}

                                        className="block w-full min-w-0 grow  py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                                    />
                                </div>
                                {Formik.touched.short_desc && Formik.errors.short_desc && <p className='text-red-500'>{Formik.errors.short_desc}</p>}
                            </div>






                            <div className="col-span-full">
                                <label htmlFor="cover-photo" className="block text-sm/6 font-medium text-gray-900">
                                    Imagen del producto
                                </label>
                                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                                    <div className="text-center">
                                        <PhotoIcon aria-hidden="true" className="mx-auto size-12 text-gray-300" />
                                        <div className="mt-4 flex text-sm/6 text-gray-600">
                                            <label
                                                htmlFor="file-upload"
                                                className="relative cursor-pointer rounded-md bg-transparent font-semibold text-indigo-600 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-indigo-600 hover:text-indigo-500"
                                            >
                                                <span>Sube un archivo</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                            </label>
                                            <p className="pl-1">o arrástralo y suéltalo</p>
                                        </div>
                                        <p className="text-xs/5 text-gray-600">PNG, JPG, GIF (hasta 10 MB)</p>
                                    </div>
                                </div>
                            </div>


                            <div className="col-span-full flex flex-row flex-wrap ">
                                {imageArr && imageArr.map((image, i) => {
                                    return <div key={i} className='relative mt-2 shadow-md rounded bg-gray-200 p-3 mr-2'>
                                        <img className=' max-w-64' src={URL.createObjectURL(image)} alt={image.name} />
                                        <button className='absolute top-0.5 right-0.5 rounded-full bg-red-500 p-1' onClick={() => { deleteImage(i) }}><XMarkIcon className='h-6 w-6 bg-red-500 text-white' /></button>
                                    </div>
                                })}
                            </div>
                            <div className="col-span-full flex flex-row flex-wrap ">

                                {editProduct && <h2>Imagenes anteriores</h2>}
                                {imagesEdit && imagesEdit.map((image, i) => {
                                    return <div key={i} className='relative mt-2 shadow-md rounded bg-gray-200 p-3 mr-2'>
                                        <img className=' max-w-64' src={`${baseUrl}/${image}`} alt={image} />
                                        <button className='absolute top-0.5 right-0.5 rounded-full bg-red-500 p-1' onClick={() => { deleteEditImage(i) }}><XMarkIcon className='h-6 w-6 bg-red-500 text-white' /></button>
                                    </div>
                                })}
                            </div>

                        </div>
                    </div>





                    <div className="col-span-3">
                        <label htmlFor="precio" className="block text-sm/6 font-medium text-gray-900">
                            Precio
                        </label>
                        <div className="mt-2">
                            <input
                                id="price"
                                name="price"
                                value={Formik.values.price}
                                onChange={Formik.handleChange}
                                onBlur={Formik.handleBlur}
                                type="number"
                                placeholder="escribe aquí..."
                                className="block w-full min-w-0 grow  py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                            />
                        </div>
                        {Formik.touched.price && Formik.errors.price && <p className='text-red-500'>{Formik.errors.price}</p>}
                    </div>

                    <div className="border-b border-gray-900/10 pb-12">

                        <div className="sm:col-span-3">
                            <label htmlFor="first-name" className="block text-sm/6 font-medium text-gray-900">
                                Stock
                            </label>
                            <div className="mt-2">
                                <input
                                    id="first-name"
                                    name="stock"
                                    value={Formik.values.stock}
                                    onChange={Formik.handleChange}
                                    onBlur={Formik.handleBlur}
                                    type="number"
                                    className="block w-full min-w-0 grow  py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                                />
                            </div>
                            {Formik.touched.stock && Formik.errors.stock && <p className='text-red-500'>{Formik.errors.stock}</p>}
                        </div>


                        <div className="sm:col-span-3">
                            <label htmlFor="categoria" className="block text-sm/6 font-medium text-gray-900">
                                Categoría
                            </label>
                            <div className="mt-2 grid grid-cols-1">
                                <select
                                    id="category"
                                    name="category"
                                    value={Formik.values.category}
                                    onChange={Formik.handleChange}
                                    onBlur={Formik.handleBlur}
                                    autoComplete="country-name"
                                    className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                >
                                    <option value={""}>Selecciona categoría</option>
                                    {categories.map((category) => {
                                        return (<option key={category._id} value={category._id}>{category.name}</option>)
                                    })}

                                </select>
                                <ChevronDownIcon
                                    aria-hidden="true"
                                    className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                                />
                            </div>
                            {Formik.touched.category && Formik.errors.category && <p className='text-red-500'>{Formik.errors.category}</p>}
                        </div>
                        <div className="sm:col-span-3">
                            <label htmlFor="color" className="block text-sm/6 font-medium text-gray-900">
                                Color
                            </label>
                            <div className="mt-2 grid grid-cols-1">
                                <select
                                    id="color"
                                    name="color"
                                    autoComplete="country-name"
                                    value={Formik.values.color}
                                    onChange={Formik.handleChange}
                                    onBlur={Formik.handleBlur}
                                    className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                >
                                    <option value={""}>Selecciona color</option>
                                    {colors.map((color) => {
                                        return (<option key={color._id} value={color._id}>{color.name}</option>)
                                    })}

                                </select>
                                <ChevronDownIcon
                                    aria-hidden="true"
                                    className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                                />
                            </div>
                            {Formik.touched.color && Formik.errors.color && <p className='text-red-500'>{Formik.errors.color}</p>}

                        </div>


                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <button type="button" className="text-sm/6 font-semibold text-gray-900" onClick={() => {cancelFormHandle()}}>
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Guardar
                    </button>
                </div>
            </form>
        </>
    )
}
