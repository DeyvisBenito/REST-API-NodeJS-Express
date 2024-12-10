import { encryptar, compararEncrypt } from '../services/password.service.js'
import { sequelize } from '../database/database.js'
import { generarJWT } from '../services/jwb.service.js'
import { user } from '../models/usuarios.model.js'

//Middelware de validacion de correo existente
const correoExist = async (req, res) => {
    try {
        const {correoElectronico} = req.body
        console.log(correoElectronico)
        const exist = await user.findOne({
            where: {
                correo_electronico: correoElectronico
            }
        })

        if (exist) {
            return res.status(406).send('El correo electronico ya existe')
        }
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}


export const registrarUsuarioCliente = async (req, res) => {
    try {
        const { razonSocial, nombreComercial, direccionEntrega, correoElectronico, nombreCompleto, password, telefono, fechaNac } = req.body;

        if (!razonSocial || !nombreComercial || !direccionEntrega || !correoElectronico || !nombreCompleto || !password || !telefono || !fechaNac) {
            return res.status(400).send('Faltan parametros')
        }

        const passwordEncrypted = await encryptar(password)

        const exist = await correoExist(req, res)
        if(exist) return

        const resul = await sequelize.query(
            `EXEC SP_INSERTAR_USUARIO_CLIENTE @razonSocial=:razonSocial, @nombreComercial=:nombreComercial, 
             @direccionEntrega=:direccionEntrega, @correoElectronico=:correoElectronico, @nombreCompleto=:nombreCompleto, 
             @contraseña=:passwordEncrypted, @telefono=:telefono, @fechaNac=:fechaNac`,
            {
                replacements: {
                    razonSocial,
                    nombreComercial,
                    direccionEntrega,
                    correoElectronico,
                    nombreCompleto,
                    passwordEncrypted,
                    telefono,
                    fechaNac
                }
            }
        );

        const cliente = resul[0]
        const idUsuario = cliente[0].idUsuario
        const correo_electronico = cliente[0].correoElectronico

        const token = generarJWT(idUsuario, correo_electronico)

        res.status(201).json(token)

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const registrarUsuarioOperador= async (req, res) =>{
    try{

        const {correoElectronico, nombre_completo, password, telefono, fecha_nacimiento} = req.body

        if(!correoElectronico || !nombre_completo || !password || !telefono || !fecha_nacimiento) 
            return res.status(400).send('Faltan parametros')


        const exist = await correoExist(req, res)
        if(exist) return
    
        const passwordEncrypted = await encryptar(password)

        const response = await sequelize.query(
            `EXEC SP_INSERTAR_USUARIO_OPERADOR @correoElectronico=:correoElectronico, @nombre_completo=:nombre_completo, 
             @contraseña=:passwordEncrypted, @telefono=:telefono, @fecha_nacimiento=:fecha_nacimiento`,
             {
                replacements:{
                    correoElectronico,
                    nombre_completo,
                    passwordEncrypted,
                    telefono,
                    fecha_nacimiento
                }
             }
        )
        
        const resp = response[0]
        const idUsuario = resp[0].idUsuario
        const correo_electronico = resp[0].correo_electronico

        const token = generarJWT(idUsuario, correo_electronico)

        res .status(201).json({message: token})

    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

export const login = async (req, res)=>{
    try{
        const {correoElectronico, password} = req.body

        if(!correoElectronico || !password){
            return res.status(400).send('Faltan parametros')
        }

        const usuario = await user.findOne({
            where:{
                correo_electronico: correoElectronico
            }
        })

        if(!usuario) return res.status(404).json({message: 'Usuario no encontrado'})
        
        const matchPassword = await compararEncrypt(password, usuario.contraseña)

        if(!matchPassword) return res.status(401).json({message: 'El usuario y contraseña no coinciden'})

        const token = generarJWT(usuario.idUsuarios, usuario.correo_electronico)

        res.status(200).json({Token: token})

    }catch(error){
        return res.status(500).json({message: error.message})
    }
}