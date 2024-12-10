import {Router} from 'express'
import {registrarUsuarioCliente, registrarUsuarioOperador, login} from '../controllers/usuarios.controller.js'

export const routerUsuarios = Router()

routerUsuarios.post('/registrarCliente', registrarUsuarioCliente)

routerUsuarios.post('/registrarOperador', registrarUsuarioOperador)

routerUsuarios.post('/login', login)