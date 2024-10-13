require("dotenv").config();
const mysql = require("mysql2/promise");

const dbConfig = {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  multipleStatements: false,
  namedPlaceholders: true,
};

function printEnv()
{
  console.log("This is bad. Delete this later.");
  console.log(
    `Host: ${process.env.MYSQL_HOST}\nPort: ${process.env.MYSQL_PORT}\nUser: ${process.env.MYSQL_USER}\nPassword: ${process.env.MYSQL_PASSWORD}\nDB: ${process.env.MYSQL_DATABASE}\n`
  );
}

var database = mysql.createPool(dbConfig);

module.exports = database;
