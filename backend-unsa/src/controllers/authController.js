const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'kunci_rahasia_default';

// POST /api/auth/register
const register = async (req, res) => {
  const { id_mhs, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password wajib diisi.' });
  }

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
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Email sudah terdaftar.' });
    }
    console.error('Gagal registrasi:', err.message);
    res.status(500).json({ message: 'Gagal melakukan registrasi.' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password wajib diisi.' });
  }

  try {
    const query = `
      SELECT u.*, m.nama, m.nim, m.prodi
      FROM users u
      LEFT JOIN mahasiswa m ON u.id_mhs = m.id
      WHERE u.email = $1 AND u.deleted_at IS NULL
    `;
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    const token = jwt.sign(
      { uuid: user.uuid, email: user.email, id_mhs: user.id_mhs },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login berhasil',
      token,
      user: {
        uuid: user.uuid,
        email: user.email,
        nama_mahasiswa: user.nama || 'Administrator',
        nim: user.nim || '-',
        prodi: user.prodi || 'Akademik',
      },
    });
  } catch (err) {
    console.error('Gagal login:', err.message);
    res.status(500).json({ message: 'Gagal melakukan login.' });
  }
};

module.exports = { register, login };
