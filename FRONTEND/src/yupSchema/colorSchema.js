import { object, string} from 'yup';

let colorSchema = object({
    name: string().min(3, "Se requieren al menos 3 carácteres").required("Color es requerido."),
    descriptión: string()
});

export {colorSchema};