const fs = require('fs')

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

const db = require('pg').Pool

const db_pool = new db({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    ssl: {
        rejectUnauthorized:false,
        ca: fs.readFileSync('./us-east-2-bundle.pem').toString(),
        key: fs.readFileSync('./us-east-2-bundle.pem').toString(),
        cert: fs.readFileSync('./us-east-2-bundle.pem').toString()
    },
});



module.exports = db_pool;