const mysql = require("mysql2");

const dbConfig = {
  host: process.env.MYSQL_HOST || "sql.freedb.tech",
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  multipleStatements: false,
  namedPlaceholders: true,
};

// Create a single connection
const database = mysql.createConnection(dbConfig);

// Connect to the database
database.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
  } else {
    console.log("Connected to the database");
  }
});

module.exports = database;
