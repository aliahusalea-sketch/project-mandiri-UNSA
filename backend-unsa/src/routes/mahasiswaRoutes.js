const express = require('express');
const router = express.Router();
const {
  getAllMahasiswa,
  getStatistikMahasiswa,
  getProgramStudi,
  createMahasiswa,
  updateMahasiswa,
  deleteMahasiswa,
} = require('../controllers/mahasiswaController');

// Endpoint khusus harus dideklarasikan sebelum route dengan parameter (:id).
router.get('/statistik', getStatistikMahasiswa);
router.get('/prodi', getProgramStudi);

router.get('/', getAllMahasiswa);
router.post('/', createMahasiswa);
router.put('/:id', updateMahasiswa);
router.delete('/:id', deleteMahasiswa);

module.exports = router;
