import {sequelize} from '../database/database.js'

//Validar si el producto ya existe (coincidencia de codigo)
const existProduct= async (req) => {
    try{
        const {codigo} = req.body
        const {Id} = req.params

        const cod = await sequelize.query(
            'EXEC SP_Buscar_ProductoCodigo @codigo = :codigo',
            {
                replacements:{
                    codigo
                }  
            }
        )

        const existProduct = cod[0][0] 

        //Si trae Id se valida cuando se quiere actualizar un producto
        if(Id){
            //Si existe un producto con ese codigo y no es el mismo que se esta actualizando entonces devuelve true
            if(existProduct && existProduct.idProductos !== Number(Id)){ 
                //Ya existe otro producto con el mismo codigo 
                return true
            }
        }else if(existProduct){ //Buscar codigo de producto cuando se desea ingresar un nuevo producto
            //El producto ya existe 
            return true
        }

        return false
    }catch(error){
        throw new Error(error.message);
    }
}

//Validar si el producto existe (Id) este o no activo
const existProductId = async(req) =>{
    try{
        const {Id} = req.params
       
        const buscarPorId = await sequelize.query(
            `EXEC SP_Buscar_ProductoId @idProducto =:Id`,
            {
                replacements:{
                    Id
                }
            }
        )
       
        const producto = buscarPorId[0][0]
        
        if(!producto){
            //No existe el producto 
            return false
        }

        return producto
    }catch(error){
        throw new Error(error.message);
    }
}

//Validar categoria Producto si existe
const catProductosExist = async (req)=>{
    try{
        const {idCatProducto} = req.body
        const categoria = await sequelize.query(
            `EXEC SP_Buscar_categoriaProductoId @idCategoriaProducto=:idCatProducto`,
            {
                replacements:{
                    idCatProducto
                }
            }
        )
        

        const exist = categoria[0][0]
       
        if(!exist) {
            //La categoria no existe 
            return false
        }
        return true

    }catch(error){
        throw new Error(error.message);
    }
}


//Funciones de los endpoints

//Obtiene todos los productos activos o inactivos (requerido solo para los operadores)
export const obtenerProductos = async (req, res) =>{
    try{
        const obtenerPro= await sequelize.query(
            `EXEC SP_Buscar_TodosProductos`
        )
        const productos = obtenerPro[0]

        res.status(200).json(productos)
    }catch(error){
        return res.status(500).json({message: error.message})
    }
}


//Obtiene los productos unicamente en estado activos
export const obtenerProductosActivos = async (req, res) => {
    try{
        const obtenerPorductosActivos = await sequelize.query(
            `SP_Buscar_TodosProductos_Activos`
        )

        const productos = obtenerPorductosActivos[0]
        return res.status(200).json(productos)
    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

//Obtiene un producto especifico este o no activo
export const obtenerProducto = async (req, res) =>{
    try{
        const {Id} = req.params

        const producto = await existProductId(req, res);
        if(!producto) return res.status(404).json({error: 'El producto no existe'})

        res.status(200).json(producto)
    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

//Inserta un producto validando si su codigo de producto no esta en uso
export const insertarProducto = async (req, res) =>{
    try{
        const {idUsuario} = req.user
        const {idCatProducto, nombre, marca, codigo, stock, precio, foto} = req.body
        if(!idCatProducto || !idUsuario || !nombre || !marca || !codigo || !stock || !precio || !foto) return res.status(400).json({conflict: 'Faltan parametros'})
        
        const catExist = await catProductosExist(req)
        if(!catExist) return res.status(404).json({message: 'La categoria de productos no existe'})

        const exist = await existProduct(req)
        if(exist) return res.status(409).json({error: 'El codigo del producto ya existe'})
       
        //Para pruebas en postman por favor en el apartado de 'foto' agregar cualquier valor base64
        const fotoBinaria = Buffer.from(foto, 'base64')

        const resp = await sequelize.query(
            `EXEC SP_INSERTAR_PRODUCTOS @categoriaProductos_idCategoriaProductos=:idCatProducto, @usuarios_idUsuarios=:idUsuario, @nombre=:nombre, 
	        @marca=:marca, @codigo=:codigo, @stock=:stock, @precio=:precio, @foto=:fotoBinaria`,
            {
                replacements:{
                    idCatProducto, 
                    idUsuario, 
                    nombre, 
                    marca, 
                    codigo, 
                    stock, 
                    precio, 
                    fotoBinaria

                }
            }
        )

        res.status(201).json({message:'Producto creado'})
    }catch(error){
        res.status(500).json({message: error.message})
    }
}

//Actualizacion del producto por medio de Id y valida si su nuevo codigo no existe aun
export const actualizarProducto = async (req, res) => {
    try{
        const {Id} = req.params
        const {idUsuario} = req.user
        const {idCatProducto, nombre, marca, codigo, stock, precio, foto} = req.body
        if(!Id || !idCatProducto || !idUsuario || !nombre || !marca || !codigo || !stock || !precio || !foto) return res.status(400).json({conflict: 'Faltan parametros'})
 
        const existProId = await existProductId(req, res)
        if(!existProId) return res.status(404).json({error: 'El producto no existe'})

        const existPorCod = await existProduct(req, res)
        if(existPorCod) return res.status(409).json({message: 'El codigo del producto ya esta en uso'})
        
        const existCatPro = await catProductosExist(req)
        if(!existCatPro) return res.status(404).json({message: 'La categoria de productos no existe'})

        //Para pruebas en postman por favor en el apartado de 'foto' agregar cualquier valo base64
        const fotoBinaria = Buffer.from(foto, 'base64')

        const proAct = await sequelize.query(
            `EXEC SP_EDITAR_PRODUCTOS @idProductos=:Id, @categoriaProductos_idCategoriaProductos=:idCatProducto, 
             @nombre=:nombre, @marca=:marca, @codigo=:codigo, @stock=:stock, @precio=:precio, @foto=:fotoBinaria`,
             {
                replacements:{
                    Id,
                    idCatProducto,
                    nombre,
                    marca,
                    codigo,
                    stock,
                    precio,
                    fotoBinaria
                }
             }
        )

        
        res.status(200).json({message:'Producto actualizado'})
    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

//Actualiza el estado de los productos a activo o inactivo
export const actualizarEstado = async (req, res) => {
    try{
        const {Id} = req.params
        const {idEstados} = req.body
        if(!idEstados) return res.status(400).json({message: 'Faltan parametros'})

        const productExist = await existProductId(req, res)
        if(!productExist) return res.status(404).json({error: 'El producto no existe'})
      
        if(idEstados !== "1" && idEstados !== "2") return res.status(400).json({message: 'Estado invalido'})
        
        const resul = await sequelize.query(
            `EXEC SP_ACTIVAR_INACTIVAR_PRODUCTOS @idProductos=:Id, @estados_idEstados=:idEstados`,
            {
                replacements:{
                    Id,
                    idEstados
                }
            }
        )
        let estado = ''
        if(idEstados === "1"? estado='activo' : estado='inactivo')
        res.status(200).json({message:`El producto ahora esta ${estado}`})
    }catch(error){
        return res.status(500).json({message: error.message})
    }
} 
