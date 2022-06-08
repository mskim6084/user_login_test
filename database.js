if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

const db = require('pg').Pool

const db_pool = new db({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE
});

module.exports = db_pool;