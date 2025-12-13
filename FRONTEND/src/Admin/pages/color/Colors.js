
//import {EyeDropperIcon} from '@heroicons/react/24/outline'
import { PencilSquareIcon, TrashIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { colorSchema } from "../../../yupSchema/colorSchema";
import axios from "axios";
import Alert from "../../../basicUtilityComp/alert/Alert";
import { baseUrl } from "../../../environment";


export default function Colors() {
    const [colors, setColor] = useState([])
    const [formOpen, setFormOpen] = useState(false)
    const [editId, setEditId] = useState(null)
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState("success");

    const handleMessageClear = () => {
        setMessage("");
        setMessageType("success")
    }


    const handleEdit = (id) => {
        setFormOpen(true);
        setEditId(id);
        const selectedColor = colors.filter(x => x._id === id);
        Formik.setFieldValue("name", selectedColor[0].name);
        Formik.setFieldValue("description", selectedColor[0].description)
    }


    const handleDeleteSubmit = (id) => {
        if (window.confirm("¿Estas seguro de eliminar esta color?")) {
            axios.delete(`${baseUrl}/color/${id}`).then(resp => {
                console.log("color eliminado", resp);
                setMessage(resp.data.message);
                setMessageType("success")
            }).catch(e => {
                setMessage(e.response.data.message);
                setMessageType("error");
                console.log("Error al eliminar color.", e)
            })
        }

    }





    const Formik = useFormik({
        initialValues: { name: "", description: "" },
        validationSchema: colorSchema,
        onSubmit: (values) => {
            handleMessageClear()
            if (editId) {
                axios.put(`${baseUrl}/color/${editId}`,{...values}).then(resp => {
                    setMessage(resp.data.message);
                    setMessageType("success");
                    setFormOpen(false);
                    Formik.resetForm();
                    
                }).catch(e => {
                    setMessage(e.response.data.message);
                    setMessageType("error")
                    console.log("Errors in color update", e)
                })
            } else {
                axios.post(`${baseUrl}/color/create`, { ...values }).then(resp => {
                    setMessage(resp.data.message);
                    setMessageType("success");
                    Formik.resetForm();
                    setFormOpen(false)
                }).catch(e => {
                    setMessage(e.response.data.message);
                    setMessageType("error")
                    console.log("Errors in color submit", e)
                })
            }

        }
    })


    const fetchColors = () => {
        axios.get(`${baseUrl}/color`).then(resp => {
            console.log("colors", resp);
            setColor(resp.data.colors)
        }).catch(e => {
            console.log("Error in fetching color", e)
        })
    }

    useEffect(() => {
        fetchColors()
    }, [message])
    return (
        <>
            {message && <Alert message={message} type={messageType} handleMessageClear={handleMessageClear} />}
            {formOpen &&
                <form className="p-5 shadow mx-auto my-4 max-w-xl" onSubmit={Formik.handleSubmit}>
                    <h1 className="font-semibold">Añadir nuevo formulario</h1>
                    <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        <div className="sm:col-span-6">
                            <label for="first-name" className="block text-sm/6 font-medium text-gray-900">Nombre</label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="name"
                                    onChange={Formik.handleChange}
                                    onBlur={Formik.handleBlur}
                                    value={Formik.values.name}
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
                            </div>
                            {Formik.touched.name && Formik.errors.name && <p className="text-red-500">{Formik.errors.name}</p>}

                        </div>

                        <div className="sm:col-span-6">
                            <label className="block text-sm/6 font-medium text-gray-900">Descripción</label>
                            <div className="mt-2">
                                <input type="text" name="description"
                                    onChange={Formik.handleChange}
                                    onBlur={Formik.handleBlur}
                                    value={Formik.values.description}
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
                            </div>
                            {Formik.touched.description && Formik.errors.description && <p className="text-red-500">{Formik.errors.description}</p>}
                        </div>

                        <div className="flex flex-row">
                            <button type="submit" className="px-2 rounded bg-blue-800 text-white">Entregar</button>
                            <button type="button" className="ml-2 px-2 rounded bg-blue-600 text-white" onClick={() => { setFormOpen(false) }}>Cancelar</button>
                        </div>
                    </div>
                </form>}


            {!formOpen && <button onClick={() => { setFormOpen(true) }} className="mx-auto flex flex-row items-center">
                <PlusCircleIcon className="w-8 h-8" />
                Añadir color
            </button>}


            <div className="flex flex-row flex-wrap">
                {colors && colors.map((color, i) => {
                    return (
                        <div key={i} className="bg-slate-50 border-b-gray-900 mx-2 p-3 rounded shadow min-h-20 min-w-24 max-w-60 relative">
                            <h2 className="font-medium">{color.name}</h2>
                            <p>{color.description}</p>
                            <div className="h-4"></div>
                            <div className="flex justify-between w-full absolute bottom-0 left-0 p-2">
                                <button onClick={() => { handleEdit(color._id) }}><PencilSquareIcon className="h-6 w-6 text-blue-500" /></button>
                                <button onClick={() => { handleDeleteSubmit(color._id) }}><TrashIcon className="h-6 w-6 text-red-500" /></button>
                            </div>
                        </div>
                    )
                })}




            </div>


        </>
    )
}