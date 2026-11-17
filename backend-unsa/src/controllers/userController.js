const pool = require('../config/db');

// GET: Ambil semua data users beserta data mahasiswanya (JOIN)
exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT users.*, m.nama, m.nim, m.kelas
      FROM users 
      JOIN mahasiswa AS m ON users.id_mhs = m.id
      WHERE users.deleted_at IS NULL
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// POST: Tambah user baru
exports.createUser = async (req, res) => {
  try {
    const { uuid, id_mhs, email, password, created_by } = req.body;
    const newUser = await pool.query(
      `INSERT INTO users (uuid, id_mhs, email, password, created_by, updated_by) 
       VALUES ($1, $2, $3, $4, $5, $5) RETURNING *`,
      [uuid, id_mhs, email, password, created_by || 'Admin']
    );
    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// PATCH: Edit data user berdasarkan UUID
exports.updateUser = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { email, password, updated_by } = req.body;
    
    const updateUser = await pool.query(
      `UPDATE users SET email = COALESCE($1, email), password = COALESCE($2, password), 
       updated_at = CURRENT_TIMESTAMP, updated_by = COALESCE($3, updated_by) 
       WHERE uuid = $4 RETURNING *`,
      [email, password, updated_by, uuid]
    );

    if (updateUser.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json({ message: 'Data user berhasil diperbarui', data: updateUser.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// DELETE: Hapus user berdasarkan UUID
exports.deleteUser = async (req, res) => {
  try {
    const { uuid } = req.params;
    const result = await pool.query('DELETE FROM users WHERE uuid = $1 RETURNING *', [uuid]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json({ message: 'User berhasil dihapus.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};