const Color = require("../models/color.model.js")

module.exports = {
    createColor: async (req, res) => {
        try {
            const {name, description } = req.body;
            const newColor = new Color({
                name,
                description
            })

            await newColor.save();

            res.status(200).json({ success: true, message: "Éxito en la creación de Color"})
        } catch (error) {
            res.status(500).json({ success: false, message: "Error en Crear color." })
        }
    },
    getColor: async (req, res) => {
        try {
            const colors = await Color.find();

            res.status(200).json({ success: true, colors })

        } catch (error) {
            res.status(500).json({ success: false, message: "Error  en obtener categoría." })
        }
    },
    updateColorById: async (req, res) => {
        try {
            const id = req.params.id;
            const { name, description } = req.body;
            console.log(req.body)
            await Color.findOneAndUpdate({ _id: id }, { $set: { name, description } });
            const colors = await Color.find();
            res.status(200).json({ success: true, message: "Actualización de color exitosa", colors })
        } catch (error) {
            res.status(500).json({ success: false, message: "Error en actualizar color." })
        }
    },
    deleteColorById: async (req, res) => {
        try {
            const id = req.params.id;
            await Color.findOneAndDelete({ _id: id });
            const colors = await Color.find();
            res.status(200).json({ success: true, message: "Color eliminado correctamente.", colors })
        } catch (error) {
            res.status(500).json({ success: false, message: "Error en eliminar color." })
        }
    }


}