const pool = require('../config/db');

// Kolom yang dikembalikan API harus sama persis dengan kolom tabel `mahasiswa`
// agar frontend dapat melakukan property mapping tanpa konversi nama.
const MAHASISWA_COLUMNS = `
  id, nim, nama, jenis_kelamin, ttl, prodi, kelas,
  semester, alamat, nama_ibu, no_hp, keterangan, created_at
`;

const emptyToNull = (value) => {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text === '' ? null : text;
};

const toSemester = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const semester = Number(value);
  return Number.isInteger(semester) && semester > 0 ? semester : null;
};

// GET /api/mahasiswa
const getAllMahasiswa = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${MAHASISWA_COLUMNS} FROM mahasiswa ORDER BY id ASC`
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Gagal mengambil data mahasiswa:', err.message);
    res.status(500).json({ error: 'Gagal mengambil data mahasiswa dari database.' });
  }
};

// GET /api/mahasiswa/statistik
const getStatistikMahasiswa = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*)::int AS total_mahasiswa,
        COUNT(*) FILTER (
          WHERE LOWER(TRIM(COALESCE(keterangan, 'aktif'))) = 'aktif'
        )::int AS mahasiswa_aktif,
        COUNT(DISTINCT NULLIF(TRIM(kelas), ''))::int AS total_kelas,
        COUNT(DISTINCT NULLIF(TRIM(prodi), ''))::int AS total_prodi
      FROM mahasiswa
    `);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Gagal mengambil statistik mahasiswa:', err.message);
    res.status(500).json({ error: 'Gagal mengambil statistik mahasiswa dari database.' });
  }
};

// GET /api/mahasiswa/prodi
const getProgramStudi = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COALESCE(NULLIF(TRIM(prodi), ''), 'Belum ditentukan') AS prodi,
        COUNT(*)::int AS jumlah_mahasiswa,
        COALESCE(
          ARRAY_AGG(DISTINCT NULLIF(TRIM(kelas), ''))
            FILTER (WHERE NULLIF(TRIM(kelas), '') IS NOT NULL),
          '{}'
        ) AS daftar_kelas
      FROM mahasiswa
      GROUP BY COALESCE(NULLIF(TRIM(prodi), ''), 'Belum ditentukan')
      ORDER BY prodi ASC
    `);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Gagal mengambil data program studi:', err.message);
    res.status(500).json({ error: 'Gagal mengambil data program studi dari database.' });
  }
};

// POST /api/mahasiswa
const createMahasiswa = async (req, res) => {
  const {
    nim,
    nama,
    jenis_kelamin,
    ttl,
    prodi,
    kelas,
    semester,
    alamat,
    nama_ibu,
    no_hp,
    keterangan,
  } = req.body;

  if (!emptyToNull(nim) || !emptyToNull(nama)) {
    return res.status(400).json({ message: 'NIM dan nama mahasiswa wajib diisi.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO mahasiswa
         (nim, nama, jenis_kelamin, ttl, prodi, kelas, semester, alamat, nama_ibu, no_hp, keterangan)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING ${MAHASISWA_COLUMNS}`,
      [
        emptyToNull(nim),
        emptyToNull(nama),
        emptyToNull(jenis_kelamin),
        emptyToNull(ttl),
        emptyToNull(prodi),
        emptyToNull(kelas),
        toSemester(semester),
        emptyToNull(alamat),
        emptyToNull(nama_ibu),
        emptyToNull(no_hp),
        emptyToNull(keterangan) || 'Aktif',
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'NIM sudah terdaftar. Gunakan NIM lain.' });
    }
    console.error('Gagal menambah mahasiswa:', err.message);
    res.status(500).json({ error: 'Gagal menambah data mahasiswa.' });
  }
};

// PUT /api/mahasiswa/:id
const updateMahasiswa = async (req, res) => {
  const { id } = req.params;
  const {
    nim,
    nama,
    jenis_kelamin,
    ttl,
    prodi,
    kelas,
    semester,
    alamat,
    nama_ibu,
    no_hp,
    keterangan,
  } = req.body;

  if (!emptyToNull(nim) || !emptyToNull(nama)) {
    return res.status(400).json({ message: 'NIM dan nama mahasiswa wajib diisi.' });
  }

  try {
    const result = await pool.query(
      `UPDATE mahasiswa
       SET nim = $1,
           nama = $2,
           jenis_kelamin = $3,
           ttl = $4,
           prodi = $5,
           kelas = $6,
           semester = $7,
           alamat = $8,
           nama_ibu = $9,
           no_hp = $10,
           keterangan = $11
       WHERE id = $12
       RETURNING ${MAHASISWA_COLUMNS}`,
      [
        emptyToNull(nim),
        emptyToNull(nama),
        emptyToNull(jenis_kelamin),
        emptyToNull(ttl),
        emptyToNull(prodi),
        emptyToNull(kelas),
        toSemester(semester),
        emptyToNull(alamat),
        emptyToNull(nama_ibu),
        emptyToNull(no_hp),
        emptyToNull(keterangan) || 'Aktif',
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Mahasiswa tidak ditemukan.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'NIM sudah terdaftar. Gunakan NIM lain.' });
    }
    console.error('Gagal memperbarui mahasiswa:', err.message);
    res.status(500).json({ error: 'Gagal memperbarui data mahasiswa.' });
  }
};

// DELETE /api/mahasiswa/:id
const deleteMahasiswa = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM mahasiswa WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Mahasiswa tidak ditemukan.' });
    }
    res.status(200).json({ message: 'Data mahasiswa berhasil dihapus.' });
  } catch (err) {
    console.error('Gagal menghapus mahasiswa:', err.message);
    res.status(500).json({ error: 'Gagal menghapus data mahasiswa.' });
  }
};

module.exports = {
  getAllMahasiswa,
  getStatistikMahasiswa,
  getProgramStudi,
  createMahasiswa,
  updateMahasiswa,
  deleteMahasiswa,
};
