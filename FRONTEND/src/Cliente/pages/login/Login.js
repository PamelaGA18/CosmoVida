import { useFormik } from "formik"
import { loginSchema } from "../../../yupSchema/loginSchema"
import axios from "axios"
import { useState } from "react"
import Alert from "../../../basicUtilityComp/alert/Alert"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { login } from "../../../state/authSlice"
import { baseUrl } from "../../../environment"

export default function Login() {
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState("success");

    const dispatch = useDispatch();
    const handleMessageClear = () => {
        setMessage("");
        setMessageType("success");
    }

    const navigate = useNavigate()
    const initialValues = { email: "", password: "" }
    const Formik = useFormik({
        initialValues: initialValues,
        validationSchema: loginSchema,
        onSubmit: (values) => {
            console.log("Login formik submit", values)
            // En el onSubmit del Formik
            axios.post(`${baseUrl}/user/login`, { ...values }).then(response => {
                localStorage.setItem("userData", JSON.stringify(response.data.userData))
                setMessage(response.data.message);
                setMessageType("success");
                Formik.resetForm();

                // Dispatch con todos los datos del usuario, incluyendo imageUrl
                dispatch(login({
                    auth: true,
                    admin: response.data.userData.role === "admin",
                    userData: response.data.userData // <- Incluir userData completo
                }))

                if (response.data.userData.role === "admin") {
                    navigate("/admin")
                } else {
                    navigate("/products")
                }
            }).catch(e => {
                setMessage(e.response.data.message);
                setMessageType("error")
                console.log("Error al iniciar sesión", e.response.data.message)
            })
        }

    })
    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f9dbe2] via-[#efe4fb] to-[#d8edf5]">

            {message && (
                <Alert
                    message={message}
                    type={messageType}
                    handleMessageClear={handleMessageClear}
                />
            )}

            <form
                onSubmit={Formik.handleSubmit}
                className="
            backdrop-blur-xl bg-white/30
            border border-white/40
            shadow-2xl rounded-3xl
            max-w-md w-full mx-4
            p-10
            animate-fadeIn
        "
            >
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
                    Iniciar Sesión
                </h2>

                {/* Email */}
                <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-900">Correo electrónico</label>
                    <input
                        value={Formik.values.email}
                        name="email"
                        type="email"
                        onChange={Formik.handleChange}
                        onBlur={Formik.handleBlur}
                        className="
                    mt-2 block w-full rounded-xl 
                    bg-white/60 backdrop-blur-sm 
                    px-3 py-2 border border-gray-300
                    focus:ring-2 focus:ring-purple-300
                "
                    />
                    {Formik.touched.email && Formik.errors.email && (
                        <p className="text-red-600 text-sm">{Formik.errors.email}</p>
                    )}
                </div>

                {/* Password */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-900">Contraseña</label>
                    <input
                        value={Formik.values.password}
                        name="password"
                        type="password"
                        onChange={Formik.handleChange}
                        onBlur={Formik.handleBlur}
                        className="
                    mt-2 block w-full rounded-xl 
                    bg-white/60 backdrop-blur-sm 
                    px-3 py-2 border border-gray-300
                    focus:ring-2 focus:ring-purple-300
                "
                    />
                    {Formik.touched.password && Formik.errors.password && (
                        <p className="text-red-600 text-sm">{Formik.errors.password}</p>
                    )}
                </div>
                <Link to="/register" className=" block text-center mt-4 mb-6 text-purple-700 font-semibold hover:text-purple-900 underline underline-offset-4 transition-all">¿No tienes cuenta? Regístrate aquí</Link>



                {/* Botón */}
                <button
                    type="submit"
                    className="
                px-5 py-2 rounded-xl
                bg-purple-500 hover:bg-purple-600
                text-white font-bold
                shadow-lg shadow-purple-300/50
                block mx-auto
                transition-all
            "
                >
                    Iniciar Sesión
                </button>
            </form>
        </div>

    )
}
