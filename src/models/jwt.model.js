import {DataTypes} from 'sequelize'
import {sequelize} from '../database/database.js'

//Este apartado no ha sido utilizado
export const jwToken = sequelize.define('jwTokens',{
    idToken: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    token:{
        type: DataTypes.STRING,
        allowNull: false
    },
    usuarioId:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    expiracion:{
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'jwTokens',
    timestamps: false
})

