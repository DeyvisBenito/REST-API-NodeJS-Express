import {DataTypes} from 'sequelize'
import {sequelize} from '../database/database.js'
import {jwToken} from './jwt.model.js'

export const user = sequelize.define('Usuarios', {
    idUsuarios: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    rol_idRol:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    estados_idEstados:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    correo_electronico:{
        type: DataTypes.STRING,
        allowNull: false
    },
    nombre_completo:{
        type: DataTypes.STRING,
        allowNull: false
    },
    contraseña:{
        type: DataTypes.STRING,
        allowNull: false
    },
    telefono:{
        type: DataTypes.STRING,
        allowNull: false
    },
    fecha_nacimiento:{
        type: DataTypes.DATEONLY
    },
    fecha_creacion:{
        type: DataTypes.DATE
    },
    clientes_idClientes:{
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'Usuarios',
    timestamps: false
})

user.hasMany(jwToken, {
    foreignKey: 'usuarioId',
    sourceKey: 'idUsuarios'
})

jwToken.belongsTo(user, {
    foreignKey: 'usuarioId',
    targetKey: 'idUsuarios'
})