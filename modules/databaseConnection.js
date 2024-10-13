const mysql = require("mysql2/promise");
const dns = require("dns").promises;

async function getResolvedHost() {
  try {
    // Resolve the IP address of the MySQL host (sql.freedb.tech)
    const addresses = await dns.lookup(
      process.env.MYSQL_HOST || "sql.freedb.tech"
    );
    return addresses.address;
  } catch (err) {
    console.error("Error resolving DNS for MySQL host:", err);
    throw new Error("Unable to resolve MySQL host");
  }
}

async function createPool() {
  const resolvedHost = await getResolvedHost(); // Resolve the host manually

  const dbConfig = {
    host: resolvedHost, // Use the resolved IP address
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    multipleStatements: false,
    namedPlaceholders: true,
  };

  return mysql.createPool(dbConfig);
}

const database = await createPool();

module.exports = database;
