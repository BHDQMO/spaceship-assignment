require('dotenv').config()
const mysql = require('mysql2/promise')

const {
  DB_HOST_RDS,
  DB_USERNAME_RDS,
  DB_PASSWORD_RDS,
  DB_DATABASE_RDS,
  DB_CONNECTION_LIMIT
} = process.env

const config = {
  host: DB_HOST_RDS,
  user: DB_USERNAME_RDS,
  password: DB_PASSWORD_RDS,
  database: DB_DATABASE_RDS,
  waitForConnections: true,
  connectionLimit: parseInt(DB_CONNECTION_LIMIT || '66')
}

const pool = mysql.createPool(config)

module.exports = { pool }

export { }