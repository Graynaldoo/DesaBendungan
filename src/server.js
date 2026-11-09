require('dotenv').config();
const express = require('express');
const cors = require('cors');

const potensiRoutes = require('./routes/potensi');
const kategoriRoutes = require('./routes/kategori');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'REST API Potensi Desa Bendungan',
    endpoints: ['/api/potensi', '/api/kategori'],
  });
});

app.use('/api/potensi', potensiRoutes);
app.use('/api/kategori', kategoriRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route tidak ditemukan' });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Body JSON tidak valid' });
  }
  if (err.code === '23503') {
    return res.status(409).json({
      success: false,
      message: 'Melanggar relasi data: id referensi tidak ditemukan atau data masih dipakai tabel lain',
    });
  }
  if (err.code === '23505') {
    return res.status(409).json({ success: false, message: 'Data duplikat (nilai unik sudah ada)' });
  }
  if (err.code === '22P02' || err.code === '22003') {
    return res.status(400).json({ success: false, message: 'Format nilai tidak valid' });
  }
  console.error(err);
  res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
