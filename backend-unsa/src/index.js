const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const mahasiswaRoutes = require('./routes/mahasiswaRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== INFORMASI & HEALTH CHECK ====================

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Backend Universitas SA aktif.',
    endpoints: {
      health: '/api/health',
      mahasiswa: '/api/mahasiswa',
      statistik: '/api/mahasiswa/statistik',
      prodi: '/api/mahasiswa/prodi',
      auth: '/api/auth',
      users: '/api/users',
    },
  });
});

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT current_database() AS database, NOW() AS waktu'
    );
    res.status(200).json({
      status: 'ok',
      backend: 'aktif',
      database: 'terhubung',
      nama_database: result.rows[0].database,
      waktu_server: result.rows[0].waktu,
    });
  } catch (err) {
    console.error('Health check gagal:', err.message);
    res.status(503).json({
      status: 'error',
      backend: 'aktif',
      database: 'tidak terhubung',
      error: err.message,
    });
  }
});

// ==================== ROUTES ====================

app.use('/api/auth', authRoutes);
app.use('/api/mahasiswa', mahasiswaRoutes);
app.use('/api/users', userRoutes);

// 404 untuk endpoint yang tidak dikenal
app.use((req, res) => {
  res.status(404).json({
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan.`,
  });
});

// Error handler terpusat
app.use((err, req, res, _next) => {
  console.error('Error tidak tertangani:', err);
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Body request bukan JSON yang valid.' });
  }
  res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
});

app.listen(PORT, () => {
  console.log(`Server backend berjalan di http://localhost:${PORT}`);
  console.log(`Endpoint mahasiswa: http://localhost:${PORT}/api/mahasiswa`);
});

module.exports = app;
