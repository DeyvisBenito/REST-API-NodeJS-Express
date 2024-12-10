import {sequelize} from '../database/database.js'
import {DataTypes} from 'sequelize'

export const catProducto = sequelize.define('CategoriaProductos', {
    idCategoriaProductos : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuarios_idUsuarios:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    nombre:{
        type: DataTypes.STRING,
        allowNull: false
    },
    estados_idEstados:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fecha_creacion:{
        type: DataTypes.DATE
    }
},{
    tableName: 'CategoriaProductos',
    timestamps: false
}
)