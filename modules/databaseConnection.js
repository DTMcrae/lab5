require("dotenv").config();
const mysql = require("mysql2/promise");

const dbConfig = {
  host: "sql.freedb.tech",
  port: "3306",
  user: "freedb_p1root",
  password: "UF5J9WMqg!&bWHx",
  database: "freedb_4921_prod",
  multipleStatements: false,
  namedPlaceholders: true,
};

function printEnv() {
  console.log("This is bad. Delete this later.");
  console.log(
    `Host: ${process.env.MYSQL_HOST}\nPort: ${process.env.MYSQL_PORT}\nUser: ${process.env.MYSQL_USER}\nPassword: ${process.env.MYSQL_PASSWORD}\nDB: ${process.env.MYSQL_DATABASE}\n`
  );
}

printEnv();
var database = mysql.createPool(dbConfig);

module.exports = database;