import {sequelize} from '../database/database.js'

//Validar si el producto existe en el Carrito
 const proExistInCarrito = async (req) =>{
    const {idUsuario} = req.user
    const {idProducto} = req.body
    try{
        const buscar = await sequelize.query(
            `EXEC SP_Buscar_ProCarritoId @idProducto=:idProducto , @idusuario=:idUsuario`,{
                replacements:{
                    idProducto,
                    idUsuario
                }
            }
        )

        const proCarrito = buscar[0][0]

        if(!proCarrito) return false

        return proCarrito
    }catch(error){
        throw new Error(error.message);
    }
} 


//Validar si el registro del carrito existe
const proCarrtioExist = async (req) =>{
    try{
        const {Id} = req.params
        const {idUsuario} = req.user
        const exist = await sequelize.query(
            `EXEC SP_Buscar_ProductoInCarrito_Usuario @idProCarrito=:Id, @idUsuario=:idUsuario`,{
                replacements:{
                    Id,
                    idUsuario
                }
            })
        const producto = exist[0][0]
        
        if(producto){
            //El producto existe en el carrito entonces se actualizara su cantidad
            return producto
        }
        //No existe en el carrito entonces se ingresara al carrito
        return false

    }catch(error){
        throw new Error(error.message)
    }
}

//Creacion de endpoints


//Obtiene todos los producto del carrito del usuario logueado
export const getProductosCarrito = async(req, res) =>{
    try{
        const {idUsuario} = req.user
        if(!idUsuario) return res.status(404).json({message:'El usuario no existe'})
        const resp = await sequelize.query(
            `EXEC SP_Buscar_TodosProCarrito @idUsuario=:idUsuario`,{
                replacements:{
                    idUsuario
                }
            }
        )

        const proCarrito = resp[0]
        if(proCarrito.length === 0) return res.status(200).json({message:'El usuario no tiene productos en carrito'})

        res.status(200).json(proCarrito)
    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

//Obtiene un producto del carrito especifico del usuario logueado
export const getProductoCarrito = async(req, res) =>{
    try{
        const {Id} = req.params
        const {idUsuario} = req.user
        if(!idUsuario) return res.status(400).json({message:'Faltan parametros'})

        const proCarrito = await proCarrtioExist(req)

        if(!proCarrito) return res.status(404).json({message:'El producto del carrito no existe para el usuario'})

        res.status(200).json(proCarrito)
    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

//Insertar producto al carrito del usuario logueado
//Si ya existe el producto en el carrito, se le suma la cantidad a agregar
export const insertarProCarrito = async (req, res) =>{
    try{
        const {idUsuario} = req.user
        const {idProducto, cantidad} = req.body
        if(!idUsuario || !idProducto || !cantidad) return res.status(400).json({message:'Faltan parametros'})

        const productoExiste = await sequelize.query(
            `EXEC SP_Buscar_ProductoId @idProducto=:idProducto`,{
                replacements: {
                    idProducto
                }
            }
        )
        
        const prod = productoExiste[0][0] 
        if(!prod) return res.status(404).json({message:'El producto no existe'})
        
        const productoExisteInCarrito = await proExistInCarrito(req)
        if(productoExisteInCarrito){

            const resp = await sequelize.query(
                `EXEC SP_Agregar_Cantidad_inCarrito @idUsuarios =:idUsuario, @idProducto =:idProducto, @cantidad=:cantidad`,{
                    replacements:{
                        idUsuario,
                        idProducto,
                        cantidad
                    }
                }
            )

            return res.status(200).json({message:'La cantidad a solicitar ha aumentado'})
        }

        const resp = await sequelize.query(
            `EXEC SP_Insertar_Producto_inCarrito @idUsuario=:idUsuario, @idProducto=:idProducto, @cantidad=:cantidad`,{
                replacements:{
                    idUsuario,
                    idProducto,
                    cantidad
                }
            }
        )

        return res.status(201).json({message:'Producto agregado al carrito'})
    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

//Se cancela el producto del carrito y se devuelve el stock al producto
export const cancelarProCarrito = async (req, res) =>{
    try{
        const {Id} = req.params
        const {idUsuario} = req.user
        const idEstado = 6 
        if(!idUsuario || !idEstado) return res.status(400).json({message:'Faltan parametros'})
        
        const exist = await proCarrtioExist(req)
        if(!exist) return res.status(404).json({message:'El producto no existe en el carrito del usuario'})
        const idProducto = exist.idProductos
        const cantidad = exist.cantidad

        if(idEstado !== 6) return res.status(400).json({message:'El estado es invalido'})
            
        const resp = await sequelize.query(
            `EXEC SP_Activar_Inactivar_ProCarrito @idproCarrito=:Id, @idUsuario=:idUsuario, @idProducto=:idProducto, 
            @idEstado=:idEstado, @cantidad=:cantidad`,{
                replacements:{
                    Id,
                    idUsuario,
                    idProducto,
                    idEstado,
                    cantidad
                }
            }
        )

        const confir=resp[1]

        if(confir===Number(0)) return res.status(400).json({error: 'El registro ya no esta pendiente en el carrito'})

        return res.status(200).json({message:`El producto del carrito ha sido cancelado`})
    }catch(error){
        return res.status(500).json({message: error.message})
    }
}


