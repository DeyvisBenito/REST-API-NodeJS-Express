import {sequelize} from '../database/database.js'

//Validar si el productoCarrito existe
 const proCarritoExist = async (req) =>{
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

//Validar si el producto ya esta en el carrito
const productoExistInCarrito = async (req) =>{
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

export const getProductoCarrito = async(req, res) =>{
    try{
        const {Id} = req.params
        const {idUsuario} = req.user
        if(!idUsuario) return res.status(400).json({message:'Faltan parametros'})

        const proCarrito = await productoExistInCarrito(req)

        if(!proCarrito) return res.status(404).json({message:'El producto del carrito no existe'})

        res.status(200).json(proCarrito)
    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

export const insertarProCarrito = async (req, res) =>{
    try{
        const {idUsuario} = req.user
        const {idProducto, cantidad} = req.body
        if(!idUsuario || !idProducto || !cantidad) return res.status(400).json({message:'Faltan parametros'})
        
        const productoExiste = await proCarritoExist(req)
        if(productoExiste){

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

export const actualizarEstadoProCarrito = async (req, res) =>{
    try{
        const {Id} = req.params
        const {idUsuario} = req.user
        const {idEstado=6} = req.body
        if(!idUsuario || !idEstado) return res.status(400).json({message:'Faltan parametros'})
        
        const exist = await productoExistInCarrito(req)
        if(!exist) return res.status(404).json({message:'El producto no existe en el carrito del usuario'})
        const idProducto = exist.idProductos
        const cantidad = exist.cantidad

        if(idEstado !== "6" && idEstado !== "3") return res.status(400).json({message:'El estado es invalido'})
            
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

        let estado =''
        if(idEstado==='3'? estado='confirmado' : estado='cancelado')
        return res.status(200).send(`El producto del carrito ha sido ${estado}`)
    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

//Listo busqueda de productos del carrito del usuario, insertar producto al carrito descontando del stock del carrito
//y actualizar estado a cancelado y devuelve stock o confirmado y no devuelve stock
