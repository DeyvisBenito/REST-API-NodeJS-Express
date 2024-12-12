import {config} from 'dotenv'
import express from 'express'
import {sequelize} from './database/database.js'
import {routerUsuarios} from './routes/usuarios.route.js'
import {routerCatProductos} from './routes/catProductos.route.js'
import {routerProductos} from './routes/productos.route.js'

config()

const app = express()
app.use(express.json()) //para interpretar datos json

//Rutas
app.use('/usuarios', routerUsuarios)
app.use('/catProductos', routerCatProductos)
app.use('/productos', routerProductos)

const PORT = process.env.PORT

export const main = async () =>{
    app.listen(PORT, () => {
        console.log(`App escuchando en el puerto ${PORT}`)
    })

    try{
        await sequelize.sync({force: false})
    }catch(error){
        console.log("Error en BD, conexion fallida")
    }
}