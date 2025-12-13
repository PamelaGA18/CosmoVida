import { number, object, string} from 'yup';

let productSchema = object({
    name: string().min(3, "Se requieren al menos 3 carácteres").required("El nombre es un campo obligatorio."),
    description: string().min(10, "Se requieren al menos 10 carácteres").required("La descripción es un campo obligatorio."),
    short_desc:string().min(8, "Se requieren al menos 8 carácteres").required("Es un campo obligatorio."),
    //images:string().url("La imagen debe ser una URL válida"),
    price: number().required("El precio es requerido."),
    stock:number().required("Stock es requerido."),
    category: string().required("La categoría es requerida."),
    color: string().required("El color es requerido.")
});

export {productSchema};