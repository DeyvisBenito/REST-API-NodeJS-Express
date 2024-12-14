import { encryptar, compararEncrypt } from '../services/password.service.js'
import { sequelize } from '../database/database.js'
import { generarJWT } from '../services/jwb.service.js'


//Validacion de si el correo existente
const correoExist = async (req) => {
    try {
        const {Id} = req.params
        const {idUsuarioClie} = req.body
        const {correoElectronico} = req.body

        const exist = await sequelize.query(
            `EXEC SP_Buscar_UsuarioCorreo @correo_electronico = :correoElectronico`,
            {
                replacements:{
                    correoElectronico
                }
            }
        )
        const userExist = exist[0][0]

        if(Id && !idUsuarioClie){
            if(userExist && userExist.idUsuarios !== Number(Id)) return true
        }else if(idUsuarioClie){
            //Existe otro usuario con ese correo
            if(userExist && userExist.idUsuarios !== Number(idUsuarioClie)) return true
        }else if (userExist) {
            //El correo existe
            return true
        }
        
    } catch (error) {
        throw new Error(error.message);
    }
}

//Validacion de si el cliente existe
const clienteExist = async (req) =>{
    try{
        const {Id} = req.params

        const buscar = await sequelize.query(
            `EXEC SP_Buscar_ClienteId @idCliente =:Id`,{
                replacements:{
                    Id
                }
            }
        )

        const cliente = buscar[0][0]
  
        if(!cliente) return false

        return cliente
        
    }catch(error){
        throw new Error(error.message);
    }
}

//Validacion de si el operador existe
const operadorExist = async(req) =>{
    try{
        const {Id} = req.params

        const buscar = await sequelize.query(
            `EXEC SP_Buscar_OperadorId @idOperador =:Id`,{
                replacements:{
                    Id
                }
            }
        )

        const operador = buscar[0][0]

        if(!operador) return false

        return operador
    }catch(error){
        throw new Error(error.message)
    }
}

//Validacion si el UsuarioCliente existe
const usuarioClieExist = async (req) =>{
    try{
        const {idUsuarioClie} = req.body
        const {Id} = req.params
        const resp = await sequelize.query(
            `EXEC SP_Buscar_UsuarioClienteId @idUsuarioCli=:idUsuarioClie, @idCliente=:Id`,{
                replacements:{
                    idUsuarioClie,
                    Id
                }
            }
        )

        const usuarioCliente = resp[0][0]
        
        if(!usuarioCliente) return false

        return usuarioCliente
    }catch(error){
        throw new Error(error.message)
    }
}

//Validacion si el Usuario existe
const usuarioExist = async (req) =>{
    try{
        const {Id} = req.params

        const buscar = await sequelize.query(
            `EXEC SP_Buscar_UsuarioId @idUsuario=:Id`,{
                replacements:{
                    Id
                }
            }
        )

        const usuario = buscar[0][0]
  
        if(!usuario) return false

        return usuario

    }catch(error){
        throw new Error(error.message)
    }
}
 
//Endpoints

export const getClientes = async (req, res) =>{
    try{
        const buscar = await sequelize.query(
            `EXEC SP_Buscar_TodosClientes`
        )

        const clientes = buscar[0]

        res.status(200).json(clientes)
    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

export const getCliente = async (req, res) =>{
    try{
        const {Id} = req.params

        const cliente = await clienteExist(req)
        if(!cliente) return res.status(404).json({message: 'El cliente no existe'})

        res.status(200).json(cliente)
    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

export const getOperadores = async (req, res) =>{
    try{
        const buscar = await sequelize.query(
            `EXEC SP_Buscar_TodosOperadores`
        )

        const operadores = buscar[0]

        res.status(200).json(operadores)
    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

export const getOperador = async (req, res) =>{
    try{
        const {Id} = req.params
        const operadorExiste = await operadorExist(req)
        if(!operadorExiste) return res.status(404).json({message: 'El operador no existe'})

        res.status(200).json(operadorExiste)
    }catch(error){
        return res.status(500).json({message: error.message})
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
        if(exist) return res.status(406).send('El correo electronico ya existe')

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

       // const cliente = resul[0]
       // const idUsuario = cliente[0].idUsuario
       // const correo_electronico = cliente[0].correoElectronico

       // const token = generarJWT(idUsuario, correo_electronico)

        res.status(201).json({message:'Cliente registrado'})

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
        if(exist) return res.status(406).send('El correo electronico ya existe')
    
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


export const actualizarCliente = async (req, res) => {
    try{
        const {Id} = req.params
        const {idUsuario, idUsuarioClie, correoElectronico, nombreCompleto, telefono, razonSocial, nombreComercial, direccionEntrega, fechaNac} = req.body
        if(!idUsuario || !idUsuarioClie || !correoElectronico || !nombreCompleto || !telefono || !razonSocial || !nombreComercial || !direccionEntrega || !fechaNac)
            return res.status(400).json({message: 'Faltan parametros'})

        const clienteExiste = await clienteExist(req)
        if(!clienteExiste) return res.status(404).json({message: 'El cliente a editar no existe'})

        const usuarioExiste = await usuarioClieExist(req)
        if(!usuarioExiste) return res.status(400).json({message: 'El usuario Cliente no existe'})

        const correoExiste = await correoExist(req)
        if(correoExiste) return res.status(406).json({message: 'El correo ya existe'})

        const resp = await sequelize.query(
            `EXEC SP_EDITAR_USUARIO_CLIENTE @idCliente=:Id, @idUsuario=:idUsuarioClie, @correoElectronico=:correoElectronico, 
            @nombreCompleto=:nombreCompleto, @telefono=:telefono, @razonSocial=:razonSocial, 
            @nombreComercial=:nombreComercial, @direccionEntrega=:direccionEntrega, @fechaNac=:fechaNac`,{
                replacements:{
                    Id,
                    idUsuarioClie,
                    correoElectronico,
                    nombreCompleto,
                    telefono,
                    razonSocial,
                    nombreComercial,
                    direccionEntrega,
                    fechaNac
                }
            }
        )

        res.status(200).send('Usuario Cliente actualizado')
    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

export const actualizarOperador = async (req, res) => {
    try{
        const {Id} = req.params
        const {idUsuario, correoElectronico, nombre_completo, telefono, fechaNac} = req.body
        if(!idUsuario || !correoElectronico || !nombre_completo || !telefono || !fechaNac) return res.status(400).json({message:'Faltan parametros'})
        
        const exist = await operadorExist(req)
        if(!exist) return res.status(400).json({message: 'El operador no existe'})

        const existCorreo = await correoExist(req)
        if(existCorreo) return res.status(406).json({message: 'El correo ya existe'})

        const resp = await sequelize.query(
            `EXEC SP_EDITAR_USUARIO_OPERADOR @idUsuario=:Id, @correo_electronico=:correoElectronico,
            @nombre_completo=:nombre_completo,@telefono=:telefono, @fecha_nacimiento=:fechaNac`,{
                replacements:{
                    Id,
                    correoElectronico,
                    nombre_completo,
                    telefono,
                    fechaNac
                }
            }
        )

        res.status(200).send('Usuario Operador actualizado')

    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

export const actualizarEstadoUsuario= async (req, res) =>{
    try{
        const {Id} = req.params
        const {idUsuario, idEstado} = req.body
        if(!idUsuario || !idEstado) return res.status(400).json({message: 'Faltan parametros'})

        const exist = await usuarioExist(req)
        if(!exist) return res.status(404).json({message: 'El usuario no existe'})

        if(idEstado !== "1" && idEstado !== "2") return res.status(400).json({message: 'Estado invalido'})
        
        const resp = await sequelize.query(
            `EXEC SP_ACTIVAR_INACTIVAR_USUARIOS @idUsuarios=:Id, @estados_idEstados=:idEstado`,{
                replacements:{
                    Id,
                    idEstado
                }
            }
        )
        let estado = ''
        if(idEstado==='1' ? estado='activo' : estado='inactivo')
        res.status(200).send(`El usuario ahora esta ${estado}`)
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

        const resp = await sequelize.query(
            `EXEC SP_Buscar_UsuarioCorreo @correo_electronico =:correoElectronico`,
            {
                replacements:{
                    correoElectronico
                }
            }
        )
        const usuario = resp[0][0]

        if(!usuario) return res.status(404).json({message: 'Usuario no encontrado'})
        
        const matchPassword = await compararEncrypt(password, usuario.contraseña)

        if(!matchPassword) return res.status(401).json({message: 'El usuario y contraseña no coinciden'})

        const token = generarJWT(usuario.idUsuarios, usuario.correo_electronico)

        res.status(200).json({Token: token})

    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

//Completado
