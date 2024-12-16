import {sequelize} from '../database/database.js'


//Buscar orden por Id y idUsuario
const buscarOrden = async (req) =>{
    try{
        const {Id} = req.params
        const {idUsuario} = req.user

        const resp = await sequelize.query(
            `EXEC SP_Buscar_Orden_Id_idUsuario @idOrden=:Id, @idUsuario=:idUsuario`,{
                replacements:{
                    Id,
                    idUsuario
                }
            }
        )

        const orden = resp[0][0]

        if(!orden) return false

        return orden
    }catch(error){
        throw new Error(error.message)
    }
}

//Buscar orden por Id y idUsuario pero el usuario de la orden para confirmarla
const buscarOrdenConfirmar = async (req) =>{
    try{
        const {Id} = req.params
        const {idUsarioOrden} = req.body

        const resp = await sequelize.query(
            `EXEC SP_Buscar_Orden_Id_idUsuario @idOrden=:Id, @idUsuario=:idUsarioOrden`,{
                replacements:{
                    Id,
                    idUsarioOrden
                }
            }
        )

        const orden = resp[0][0]

        if(!orden) return false

        return orden
    }catch(error){
        throw new Error(error.message)
    }
}


//EndPoints

//Obtiene todas las ordenes de todos los usuarios (acceso solo Operador)
export const getOrdenesGeneral = async (req, res) =>{
    try{
        const resp = await sequelize.query(
            `SP_Buscar_Ordenes_General `
        )
        const ordenes = resp [0]
        if(ordenes.length === 0) return res.status(200).json({message:'No existen ordenes'})
        return res.status(200).json(ordenes)
    }catch(error){
        return res.status(500).json({message:error.message})
    }
}

//Obtiene las ordenes del usuario logueado
export const getOrdenesUsuario= async (req, res) =>{
    try{
        const {idUsuario} = req.user
        const obtenerOr = await sequelize.query(
            `EXEC SP_Buscar_Ordenes_UsuarioId @idUsuario=:idUsuario`,{
                replacements:{
                    idUsuario
                }
            }
        )

        const ordenes= obtenerOr[0]
       
        if(ordenes.length>0){
            return res.status(200).json(ordenes)
        }
        return res.status(200).json({message:'El usuario no tiene ordenes'})
    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

//Obtiene una orden con su Id, para le usuario logueado
export const getOrden = async(req, res) =>{
    try{
        const {Id} = req.params
        const {idUsuario} = req.user

        const orden = await buscarOrden(req)
        if(!orden) return res.status(404).json({message:'La orden no existe'})

        return res.status(200).json(orden)
        
    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

//Crea la orden, registra cada producto del carrito en ordenDetalle
//actualiza los estados de los registros de CarritoProductosc a confirmado (3)
export const crearOrden_deCarrito = async(req, res) =>{
    try{
        const {idUsuario} = req.user 
        const {nombreCompleto, direccion, telefono, correoElectronico, fechaEntrega} = req.body

        if(!idUsuario || !nombreCompleto || !direccion || !telefono || !correoElectronico || !fechaEntrega) return res.status(400).json({message:'Faltan parametros'})

        const resp = await sequelize.query(
            `EXEC SP_Buscar_TodosProCarrito @idUsuario =:idUsuario`,{
                replacements:{
                    idUsuario
                }
            }
        )
        const proInCarrito = resp[0]
        if(proInCarrito.length === 0) return res.status(400).json({message:'No se puede crear una orden sin productos'})
            
        const proJson = JSON.stringify(proInCarrito)

        const creacionOrden = await sequelize.query(
            `SP_INSERTAR_ORDEN_y_ORDENDETALLES @usuarios_idUsuarios=:idUsuario, @nombre_completo=:nombreCompleto,
            @direccion=:direccion, @telefono=:telefono, @correo_electronico=:correoElectronico, @fecha_entrega=:fechaEntrega,
            @productos_json=:proJson`,{
                replacements:{
                    idUsuario,
                    nombreCompleto,
                    direccion,
                    telefono,
                    correoElectronico,
                    fechaEntrega,
                    proJson
                }
            }
        )

        return res.status(201).json({message:'Orden creada'})
    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

//Actualiza una orden del usuario logueado. Solo informacion general como el nombre, direccion, etc.
export const updateOrden = async(req, res) =>{
    try{
        const {idUsuario} = req.user
        const {Id} = req.params
        const {nombreCompleto, direccion, telefono, correoElectronico, fechaEntrega} = req.body

        if(!idUsuario || !nombreCompleto || !direccion || !telefono || !correoElectronico || !fechaEntrega)
            return res.status(400).json({message:'Faltan parametros'})

        const exist = await buscarOrden(req)
        if(!exist) return res.status(404).json({message:'La orden no existe'})

        const resp = await sequelize.query(
            `EXEC SP_Editar_Orden @idOrden=:Id, @idUsuario=:idUsuario, @nombre_completo=:nombreCompleto, @direccion=:direccion, 
                @telefono=:telefono, @correo_electronico=:correoElectronico, @fecha_entrega=:fechaEntrega`,{
                    replacements:{
                        Id,
                        idUsuario,
                        nombreCompleto,
                        direccion,
                        telefono,
                        correoElectronico,
                        fechaEntrega
                    }
                }
        )

        return res.status(200).json({message:'Orden actualizada'})
    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

//Los usuarios podran cancelar orden, se cancela cambiando estado a cancelado (6)
//Los productos del carrito que se agregaron a esa orden cambian estado a cancelado (6)
//Se devuelve el stock a los productos que estaban en el carrito
export const cancelarOrden = async(req, res) =>{
    try{
        const {Id} = req.params
        const {idUsuario} = req.user
        if(!idUsuario) return res.status(400).json({message:'Faltan parametros'})

        const orden = await buscarOrden(req)
        if(!orden) return res.status(404).json({message:'La orden del usuario no existe'})

        if(orden.estados_idEstados !== 3) return res.status(404).json({message:'La orden ya fue procesada o cancelada'})

        const resp = await sequelize.query(
            ` EXEC SP_Cancelar_Orden @idOrden=:Id, @idUsuario=:idUsuario`,{
                replacements:{
                    Id,
                    idUsuario
                }
            }
        )

        res.status(200).json({message:'Orden cancelada'})
    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

//Cambia de estado a entregado (4) la orden y los productos del carrito que se agregaron a esa orden
//Solo un operador puede hacerlo
export const entregarOrden = async(req, res) =>{
    try{
        const {Id} = req.params
        const {idUsuario} = req.user
        const {idUsarioOrden} = req.body
        if(!idUsuario || !idUsarioOrden) return res.status(400).json({message:'Faltan parametros'})

        const orden = await buscarOrdenConfirmar(req)
        if(!orden) return res.status(404).json({message:'La orden del usuario no existe'})
    
        if(orden.estados_idEstados !== 3) return res.status(404).json({message:'La orden ya fue procesada o cancelada'})

        const resp = await sequelize.query(
            `EXEC SP_ENTREGAR_ORDEN @idOrden=:Id, @idUsuario=:idUsarioOrden`,{
                replacements:{
                    Id,
                    idUsarioOrden
                }
            }
        )

        return res.status(200).json({message:'La orden ha sido entregada'})
    }catch(error){
        return res.status(500).json({message:error.message})
    }
}

