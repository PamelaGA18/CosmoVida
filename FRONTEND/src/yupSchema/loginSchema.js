import { object, string} from 'yup';

let loginSchema = object({
    email: string().email("Debe ser un correo electrónico").required("El correo electrónico es requerido."),
    password: string().min(6, "Se requieren al menos 6 carácteres.").required("La contraseña es requerida."),
});

export {loginSchema};