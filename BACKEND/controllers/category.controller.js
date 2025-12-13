const Category = require("../models/category.model.js")

module.exports = {
    createCategory: async (req, res) => {
        try {
            const {name, description } = req.body;
            const newCategory = new Category({
                name,
                description
            })

            await newCategory.save();

            res.status(200).json({ success: true, message: "Éxito en la creación de Categoría"})
        } catch (error) {
            res.status(500).json({ success: false, message: "Error en Crear categoría." })
        }
    },
    getCategory: async (req, res) => {
        try {
            const categories = await Category.find();

            res.status(200).json({ success: true, categories })

        } catch (error) {
            res.status(500).json({ success: false, message: "Error  en obtener categoría." })
        }
    },
    updateCategoryById: async (req, res) => {
        try {
            const id = req.params.id;
            const { name, description } = req.body;
            await Category.findOneAndUpdate({ _id: id }, { $set: { name, description } });
            const categories = await Category.find();
            res.status(200).json({ success: true, message: "Actualización de categoría exitosa", categories })
        } catch (error) {
            res.status(500).json({ success: false, message: "Error en actualizar categoría." })
        }
    },
    deleteCategoryById: async (req, res) => {
        try {
            const id = req.params.id;
            await Category.findOneAndDelete({ _id: id });
            const categories = await Category.find();
            res.status(200).json({ success: true, message: "Categoría eliminada correctamente.", categories })
        } catch (error) {
            res.status(500).json({ success: false, message: "Error en eliminar categoría." })
        }
    }


}