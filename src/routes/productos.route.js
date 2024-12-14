import { Router } from "express"
import jwt from 'jsonwebtoken'
import {sequelize} from '../database/database.js'
import {insertarProducto, obtenerProductos, obtenerProducto, actualizarProducto, actualizarEstado} from '../controllers/productos.controller.js'

export const routerProductos = Router();

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

//Middelware validar si el usuario existe y si es Operador
const autenticarRol = async (req, res, next) =>{
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

        if(usuario.rol_idRol !== 2) return res.status(401).json({message: 'Usuario no autorizado'})

        next()

    }catch(error){
        return res.status(500).json({message: error.message})
    }
}


routerProductos.get("/", autenticarToken, obtenerProductos)

routerProductos.get("/:Id", autenticarToken, obtenerProducto)

routerProductos.post("/insertarProducto", autenticarToken, autenticarRol, insertarProducto)

routerProductos.put("/actualizarProducto/:Id", autenticarToken, autenticarRol, actualizarProducto)

routerProductos.put("/estado/:Id", autenticarToken, autenticarRol, actualizarEstado)