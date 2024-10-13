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

  return mysql.createPool(dbConfig); // Return the created pool
}

// Function to create the patients table after DB connection is initialized
async function createPatientsTable(database) {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS patients (
      patientid INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100),
      dateOfBirth DATE
    ) ENGINE=InnoDB;
  `;

  try {
    await database.query(createTableQuery); // Use the initialized pool
    console.log("Patients table created or already exists.");
  } catch (err) {
    console.error("Error creating patients table:", err.message);
  }
}

// Initialize the pool and create the table
async function initDatabase() {
  try {
    const database = await createPool(); // Wait for the pool to be created
    await createPatientsTable(database); // Create the patients table
    return database; // Return the pool for further use
  } catch (err) {
    console.error("Error during database initialization:", err);
    throw err; // Propagate the error if something goes wrong
  }
}

module.exports = initDatabase;
