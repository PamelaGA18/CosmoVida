const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

module.exports={
    authenticate:async(req, res, next)=>{
        try {
            const authHeader = req.header("Authorization");
            if(!authHeader){ return res.status(404).json({success:false, message:"El encabezado de autenticación no está allí."})};
            const token = authHeader.split(" ")[1];
            var decoded = jwt.verify(token, process.env.JWT_SECRET);
            if(!decoded){ return res.status(404).json({success:false, message:"Token is not valid."})};
            req.user = decoded;
            next();

        } catch (error) {
            console.log("Error", error)
            res.status(500).json({success:false, message:"Error en autenticación."})
            
        }
    },
    isAdmin:async(req, res, next)=>{
        try {
            if(req.user.role==="admin"){
                next()
            }else{
                res.status(500).json({success:false, message:"El Usuario no es Administrador."})
            }
        } catch (error) {
            res.status(500).json({success:false, message:"Error en la autenticación de administrador."})
        }
    }
}