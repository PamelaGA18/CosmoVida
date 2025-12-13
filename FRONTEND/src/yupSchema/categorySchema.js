import { object, string} from 'yup';

let categorySchema = object({
    name: string().min(3, "Se requieren al menos 3 carácteres").required("Categoría es requerido."),
    descriptión: string()
});

export {categorySchema};