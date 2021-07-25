"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
var mysql = require('mysql2/promise');
var _a = process.env, DB_HOST_RDS = _a.DB_HOST_RDS, DB_USERNAME_RDS = _a.DB_USERNAME_RDS, DB_PASSWORD_RDS = _a.DB_PASSWORD_RDS, DB_DATABASE_RDS = _a.DB_DATABASE_RDS, DB_CONNECTION_LIMIT = _a.DB_CONNECTION_LIMIT;
var config = {
    host: DB_HOST_RDS,
    user: DB_USERNAME_RDS,
    password: DB_PASSWORD_RDS,
    database: DB_DATABASE_RDS,
    waitForConnections: true,
    connectionLimit: parseInt(DB_CONNECTION_LIMIT || '66')
};
var pool = mysql.createPool(config);
module.exports = { pool: pool };
