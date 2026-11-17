const path = require('path');
const { Pool } = require('pg');

// Selalu muat .env dari folder backend-unsa, walaupun server dijalankan dari root project.
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD || ''),
  port: Number(process.env.DB_PORT) || 5432,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('Koneksi database terputus:', err.message);
});

pool
  .connect()
  .then((client) => {
    console.log(`Terhubung ke database PostgreSQL: ${process.env.DB_NAME}`);
    client.release();
  })
  .catch((err) => {
    console.error('Gagal terhubung ke database:', err.message);
  });

module.exports = pool;
