import { object, string, ref } from 'yup';

let registerSchema = object({
    name: string().min(3,"Se requieren al menos 3 carácteres.").required("El nombre es requerido."),
    email: string().email("Debe ser un correo electrónico").required("El correo electrónico es requerido."),
    password: string().min(6, "Se requieren al menos 6 carácteres.").required("La contraseña es requerida."),
    confirmPassword: string().oneOf([ref('password'), null], 'La contraseña debe coincidir').required("Es necesario confirmar la contraseña.")
});

export {registerSchema};