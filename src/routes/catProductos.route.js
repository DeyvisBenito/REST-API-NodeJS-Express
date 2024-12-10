import { Router } from "express"
import jwt from 'jsonwebtoken'
import {getCatProducto} from '../controllers/catProductos.controller.js'

export const routerCatProductos = Router()

//Middelware de JWT para verificar autentificacion de login
const autenticarToken = (req, res, next) => {
    const autHeader = req.headers['authorization']
    const token = autHeader && autHeader.split(' ')[1]

    if(!token){
        return res.status(401).json({error: 'No autorizado'})
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decode)=> {
        if(err){
            console.error('Error en la autenticacion: ', err)
            return res.status(403).json({error: 'Sin permisos para obtener estos recursos'})
        }

        next()
    })

}


routerCatProductos.get('/', autenticarToken, getCatProducto)
 
