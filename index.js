const http = require("http");
const initDatabase = require("./modules/databaseConnection"); // Updated to load the init function
const messages = require("./lang/en/en"); // Load error messages

let database; // Declare the database pool globally

// Function to handle CORS
function handleCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// Start the server after DB is initialized
async function startServer() {
  try {
    // Initialize the DB pool only once at the start
    database = await initDatabase(); // This will only run once and initialize the pool

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
                const [result] = await database.query(query); // Reuse the initialized pool
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
              const [rows] = await database.query(query); // Reuse the initialized pool
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

    // Start the server on the provided port
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start the server due to DB error:", err);
  }
}

startServer();