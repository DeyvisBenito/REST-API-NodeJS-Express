import {Router} from 'express'
import {sequelize} from '../database/database.js'
import jwt from 'jsonwebtoken'
import {getClientes, getCliente, getOperadores, getOperador, registrarUsuarioCliente, registrarUsuarioOperador, actualizarCliente, actualizarOperador, actualizarEstadoUsuario, login} from '../controllers/usuarios.controller.js'

export const routerUsuarios = Router()

//Middelware de JWT para verificar autentificacion de login
const autenticarToken = (req, res, next) => {
    const autHeader = req.headers['authorization']
    const token = autHeader && autHeader.split(' ')[1]

    if(!token){
        return res.status(401).json({error: 'No autorizado'})
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decode)=> {
        if(err){
            
            return res.status(403).json({error: 'Sin permisos para obtener estos recursos'})
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

routerUsuarios.get('/getClientes', autenticarToken, autenticarRol, getClientes)

routerUsuarios.get('/getCliente/:Id', autenticarToken, autenticarRol, getCliente)

routerUsuarios.get('/getOperadores', autenticarToken, autenticarRol, getOperadores)

routerUsuarios.get('/getOperador/:Id', autenticarToken, autenticarRol, getOperador)

routerUsuarios.post('/registrarCliente', autenticarToken, autenticarRol, registrarUsuarioCliente)

routerUsuarios.post('/registrarOperador', autenticarToken, autenticarRol, registrarUsuarioOperador)

routerUsuarios.put('/actualizarCliente/:Id', autenticarToken, autenticarRol, actualizarCliente)

routerUsuarios.put('/actualizarOperador/:Id', autenticarToken, autenticarRol, actualizarOperador)

routerUsuarios.put('/actualizarEstado/:Id', autenticarToken, autenticarRol, actualizarEstadoUsuario)

routerUsuarios.post('/login', login) 