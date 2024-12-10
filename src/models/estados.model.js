import {sequelize} from '../database/database.js'
import {DataTypes} from 'sequelize'
import {user} from './usuarios.model.js'
import {catProducto} from './catProductos.model.js'

export const estado = sequelize.define('Estados',{
    idEstados:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre:{
        type: DataTypes.STRING,
        allowNull: false
    }
})

estado.hasMany(user,{
    foreignKey: 'estados_idEstados',
    sourceKey: 'idEstados'
})

user.belongsTo(estado,{
    primaryKey: 'estados_idEstados',
    targetKey: 'idEstados'
})

estado.hasMany(catProducto, {
    foreignKey: 'estados_idEstados',
    sourceKey: 'idEstados'
})

catProducto.belongsTo(estado, {
    foreignKey: 'estados_idEstados',
    targetKey: 'idEstados'
})
