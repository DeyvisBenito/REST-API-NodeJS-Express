import {Router} from 'express'
import jwt from 'jsonwebtoken'
import {sequelize} from '../database/database.js'
import {getProductosCarrito, getProductoCarrito, insertarProCarrito, cancelarProCarrito} from '../controllers/productosCarrito.controller.js'

export const routerProCarrito = Router()

//Middelware de JWT para verificar autentificacion de login
const autenticarToken = (req, res, next) => {
    const autHeader = req.headers['authorization']
    const token = autHeader && autHeader.split(' ')[1]

    if(!token){
        return res.status(401).json({error: 'No autorizado, no se ha recibido Token'})
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decode)=> {
        if(err){
            
            return res.status(403).json({error: 'Sin permisos para obtener estos recursos, Token invalido'})
        }
        req.user = decode;
        next()
    })
}

//Middelware validar si el usuario existe
const autenticarUsuarioExist = async (req, res, next) =>{
    try{
        const {idUsuario} = req.user
        if(!idUsuario) return res.status(400).json({message: 'Faltan parametros idUsuario'})
            
        const buscar = await sequelize.query(
            `EXEC SP_Buscar_UsuarioId @idUsuario=:idUsuario`,
            {
                replacements:{
                    idUsuario
                }
            }
        )

        
        const usuario = buscar[0][0]
        
        if(!usuario) return res.status(404).json({message: 'El usuario no existe'})

        next()

    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

routerProCarrito.get("/", autenticarToken, autenticarUsuarioExist, getProductosCarrito)

routerProCarrito.get("/:Id", autenticarToken, autenticarUsuarioExist, getProductoCarrito)

routerProCarrito.post("/", autenticarToken, autenticarUsuarioExist, insertarProCarrito)

routerProCarrito.put("/cancelarProCarrito/:Id", autenticarToken, autenticarUsuarioExist, cancelarProCarrito)