const express = require('express');
const pool = require('../db');

const router = express.Router();
const isId = (v) => /^\d+$/.test(String(v));

// GET /api/kategori
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM kategori_potensi ORDER BY id_kategori ASC');
    res.json({ success: true, message: 'Berhasil mengambil semua kategori', total: rows.length, data: rows });
  } catch (err) { next(err); }
});

// GET /api/kategori/:id
router.get('/:id', async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ success: false, message: 'ID harus berupa angka' });
    const { rows } = await pool.query('SELECT * FROM kategori_potensi WHERE id_kategori = $1', [Number(req.params.id)]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    res.json({ success: true, message: 'Berhasil mengambil kategori', data: rows[0] });
  } catch (err) { next(err); }
});

// POST /api/kategori
router.post('/', async (req, res, next) => {
  try {
    const { nama_kategori, deskripsi, icon } = req.body || {};
    if (typeof nama_kategori !== 'string' || !nama_kategori.trim()) {
      return res.status(400).json({ success: false, message: 'nama_kategori wajib diisi (teks)' });
    }
    const { rows } = await pool.query(
      'INSERT INTO kategori_potensi (nama_kategori, deskripsi, icon) VALUES ($1,$2,$3) RETURNING *',
      [nama_kategori.trim(), deskripsi ?? null, icon ?? null],
    );
    res.status(201).json({ success: true, message: 'Kategori berhasil dibuat', data: rows[0] });
  } catch (err) { next(err); }
});

// PUT /api/kategori/:id
router.put('/:id', async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ success: false, message: 'ID harus berupa angka' });
    const b = req.body || {};
    if (b.nama_kategori !== undefined && (typeof b.nama_kategori !== 'string' || !b.nama_kategori.trim())) {
      return res.status(400).json({ success: false, message: 'nama_kategori harus berupa teks tidak kosong' });
    }
    const { rows } = await pool.query(
      `UPDATE kategori_potensi
         SET nama_kategori = COALESCE($1, nama_kategori),
             deskripsi     = COALESCE($2, deskripsi),
             icon          = COALESCE($3, icon)
       WHERE id_kategori = $4 RETURNING *`,
      [b.nama_kategori ? b.nama_kategori.trim() : null, b.deskripsi ?? null, b.icon ?? null, Number(req.params.id)],
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    res.json({ success: true, message: 'Kategori berhasil diperbarui', data: rows[0] });
  } catch (err) { next(err); }
});

// DELETE /api/kategori/:id  (ditolak 409 jika masih dipakai potensi_desa)
router.delete('/:id', async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ success: false, message: 'ID harus berupa angka' });
    const { rows } = await pool.query(
      'DELETE FROM kategori_potensi WHERE id_kategori = $1 RETURNING id_kategori, nama_kategori',
      [Number(req.params.id)],
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    res.json({ success: true, message: 'Kategori berhasil dihapus', data: rows[0] });
  } catch (err) { next(err); }
});

module.exports = router;
