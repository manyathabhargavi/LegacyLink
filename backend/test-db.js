
const pool = require("./config/db");

async function testDatabaseConnection() {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database_name"
    );

    console.log("Database connection successful!");
    console.log("Connected database:", result.rows[0].database_name);
  } catch (error) {
    console.error("Database connection failed:", error.message);
  } finally {
    await pool.end();
  }
}

testDatabaseConnection();
