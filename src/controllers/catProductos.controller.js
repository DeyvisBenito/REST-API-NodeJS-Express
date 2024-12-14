import {sequelize} from '../database/database.js'

//Validar si la categoria existe
const categoriaExisId = async (req) =>{
    try{
        const {Id} = req.params
        const exist = await sequelize.query(
            `EXEC SP_Buscar_categoriaProductoId @idCategoriaProducto=:Id`,
            {
                replacements:{
                    Id
                }
            }
        )
        const categoria = exist[0][0]

        if(!categoria) {
            //La categoria no existe
            return false
        } 

        return categoria
    }catch(error){
        throw new Error(error.message);
    }
}

//Validar Categoria por nombre
const categoriaExistName = async (req) => {
    try{
        const {Id} = req.params
        const {nombre} = req.body
        const exist = await sequelize.query(
            `EXEC SP_Buscar_CategoriaProductoNombre @nombre=:nombre`,
            {
                replacements:{
                    nombre
                }
            }
        )
        const categoria = exist[0][0]

        if(Id){
            if(categoria && categoria.idCategoria !== Id) {
                //Existe otra categoria con el mismo nombre
                return true
            }else{
                return false
            }
        }else if(!categoria){
            return false
        }
        

        //Existe una categoria con ese nombre
        return categoria

    }catch(error){
        throw new Error(error.message);
    }
}

//Funciones para los endpoints
export const getCatProductos = async (req, res) => {
    try{
        const buscarCategorias = await sequelize.query(
            `SP_Buscar_TodasCategorias`
        )
        const categorias = buscarCategorias[0]

        res.status(200).json(categorias)
    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

export const getCatProducto = async (req, res) => {
    try{
        const categoriaExist = await categoriaExisId(req, res)
        
        if(!categoriaExist) return res.status(404).json({error: 'La categoria no existe'})

        return res.status(200).json(categoriaExist)

    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

export const insertarCategoria = async(req, res) =>{
    try{
        const {idUsuario} = req.user
        const {nombre} = req.body
        if(!idUsuario || !nombre) return res.status(400).json({message: 'Faltan parametros'})

        const existe = await categoriaExistName(req)
        if(existe) return res.status(406).json({message: 'La categoria ya existe'})

        const resp = await sequelize.query(
            `EXEC SP_INSERTAR_CATEGORIAPRODUCTOS @usuarios_idUsuarios=:idUsuario, @nombre=:nombre`,
            {
                replacements:{
                    idUsuario,
                    nombre
                }
            }
        )

        res.status(201).send('Categoria creada')
        
    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

export const actualizarCategoria = async (req, res)=>{
    try{
        const {Id} = req.params
        const {idUsuario} = req.user
        const {nombre} = req.body
        if(!idUsuario || !nombre) return res.status(400).json({error: 'Faltan parametros'})

        const categoria = await categoriaExisId(req, res)
        if(!categoria) return res.status(404).json({error: 'La categoria no existe'})

        const existNombre = await categoriaExistName(req)
        if(existNombre) return res.status(406).json({error: 'El nombre de la categoria ya existe'})

        const resul = await sequelize.query(
            `EXEC SP_EDITAR_CATEGORIAPRODUCTO @idCategoriaProducto=:Id, @nombre=:nombre`,
            {
                replacements:{
                    Id,
                    nombre
                }
            }
        )

        res.status(200).send('Categoria actualizada')

    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

export const actualizarEstadoCat = async (req, res) =>{
    try{
        const {Id} = req.params
        const {idUsuario} = req.user
        const {idEstados} = req.body

        if(!idUsuario || !idEstados) return res.status(400).json({message:'Faltan parametros'})
        
        if(idEstados !== "1" && idEstados !== "2") return res.status(400).json({message: 'Estado invalido'})

        const exist = await categoriaExisId(req)
        if(!exist) return res.status(404).json({message: 'La categoria no existe'})

        const resul = await sequelize.query(
            `EXEC SP_ACTIVAR_INACTIVAR_CATEGORIAPRODUCTOS @idCategoriaProductos=:Id, @estados_idEstados=:idEstados`,
            {
                replacements:{
                    Id,
                    idEstados
                }
            }
        )
        let estado = ''
        if(idEstados === "1"? estado='activo' : estado='inactivo')

        res.status(200).send(`La categoria ahora esta ${estado}`)
    }catch(error){
        return res.status(500).json({message: error.message})
    }
}

//Endpoints de categoriaProductos terminados