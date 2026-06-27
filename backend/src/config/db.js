import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.query("SELECT NOW()")
    .then(() => {
        console.log("✅ Connected to Neon PostgreSQL");
    })
    .catch((err) => {
        console.error("❌ Database Connection Error");
        console.error(err.message);
    });

export default pool;