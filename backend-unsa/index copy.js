const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ==================== AUTH ENDPOINTS ====================

// Register User
app.post('/api/auth/register', async (req, res) => {
  const { id_mhs, email, password } = req.body;
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO users (id_mhs, email, password, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING uuid, email, id_mhs, created_at
    `;
    const values = [id_mhs || null, email, hashedPassword, 'System Registration'];
    const result = await pool.query(query, values);

    res.status(201).json({
      message: 'Registrasi user berhasil',
      user: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const query = `
      SELECT u.*, m.nama, m.nim, m.prodi 
      FROM users u
      LEFT JOIN mahasiswa m ON u.id_mhs = m.id
      WHERE u.email = $1 AND u.deleted_at IS NULL
    `;
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Email atau password salah' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    res.status(200).json({
      message: 'Login berhasil',
      user: {
        uuid: user.uuid,
        email: user.email,
        // DIPERBAIKI: Menggunakan user.nama sesuai kolom asli tabel mahasiswa
        nama_mahasiswa: user.nama || 'Administrator',
        nim: user.nim || '-',
        prodi: user.prodi || 'Akademik',
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== MAHASISWA ROUTES ====================
const mahasiswaRoutes = require('./routes/mahasiswaRoutes');
app.use('/api/mahasiswa', mahasiswaRoutes);

// Jalankan Server
app.listen(PORT, () => {
  console.log(`Server backend berjalan di http://localhost:${PORT}`);
});