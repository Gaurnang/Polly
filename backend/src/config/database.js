import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "mydatabase",
  password: "yourpassword",
  port: 5432,
});

export default pool;