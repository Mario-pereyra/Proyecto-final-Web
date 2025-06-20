const mysql = require('mysql2/promise');

const dbConnection = async () => {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || "localhost",
        user: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD || "master123",
        database: process.env.MYSQL_DATABASE || "db_AstroMarket",
        port: process.env.MYSQL_PORT || "3006"
    });
    return connection
}
module.exports = dbConnection;