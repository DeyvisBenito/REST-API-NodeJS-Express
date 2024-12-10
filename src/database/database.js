import { config } from "dotenv";
import {Sequelize} from 'sequelize'


config();
const SERVIDORDB = process.env.SERVIDORDB;
const MSSQL_DATABASE = process.env.MSSQL_DATABASE;
const MSSQL_USER = process.env.MSSQL_USER;
const MSSQL_PASSWORD = process.env.MSSQL_PASSWORD;
const PORT_SQLSERVER= process.env.PORT_SQLSERVER;

export const sequelize = new Sequelize(MSSQL_DATABASE, MSSQL_USER, MSSQL_PASSWORD, {
    host: SERVIDORDB,
    dialect: 'mssql',
    dialectOptions:{
        options:{
            encrypt: true,
            trustServerCertificate: true
        }
    },
    port: PORT_SQLSERVER
})
