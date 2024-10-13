const http = require("http");
const db = require("./modules/databaseConnection"); // Database connection module
const messages = require("./lang/en/en"); // Load error messages
const { error } = require("console");

// Function to handle CORS
function handleCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// Function to create the patients table if it doesn't exist
async function createPatientsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS patients (
      patientid INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100),
      dateOfBirth DATE
    ) ENGINE=InnoDB;
  `;

  try {
    await db.query(createTableQuery);
    console.log("Patients table created or already exists.");
  } catch (err) {
    console.error(messages.tableCreationError, err.message);
    console.log("Full: " + JSON.stringify(err));
    console.log("DB: " + db);
    console.log("DBJSON: " + JSON.stringify(db));
  }
}

// Call the function to create the table on server start
createPatientsTable();

// Create the HTTP server
const server = http.createServer(async (req, res) => {
  handleCors(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "POST") {
    let body = "";

    // Read incoming data
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const { query } = JSON.parse(body);
        const lowerCaseQuery = query.toLowerCase();

        // Only allow INSERT queries
        if (lowerCaseQuery.startsWith("insert")) {
          try {
            const [result] = await db.query(query);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ message: messages.insertSuccess, result })
            );
          } catch (err) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                error: messages.insertError,
                details: err.message,
              })
            );
          }
        } else {
          res.writeHead(403, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: messages.onlyInsertAllowed }));
        }
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: messages.invalidJson }));
      }
    });
  } else if (req.method === "GET") {
    // Extract the query from the URL after '/api/sql/'
    const urlParts = req.url.split("/api/sql/");
    const query = urlParts[1] ? decodeURIComponent(urlParts[1]) : "";

    if (query) {
      const lowerCaseQuery = query.toLowerCase();

      // Only allow SELECT queries
      if (lowerCaseQuery.startsWith("select")) {
        try {
          const [rows] = await db.query(query);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(rows));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              error: messages.selectError,
              details: err.message,
            })
          );
        }
      } else {
        res.writeHead(403, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: messages.onlySelectAllowed }));
      }
    } else {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "No SQL query provided in URL." }));
    }
  } else {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: messages.methodNotAllowed }));
  }
});

// Start the HTTP server on port 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});