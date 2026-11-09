const express = require('express');
const pool = require('../db');

const router = express.Router();

const STATUS_VALID = ['aktif', 'nonaktif', 'draft'];
const FIELDS = [
  'id_kategori', 'id_admin', 'nama_potensi', 'deskripsi',
  'alamat', 'latitude', 'longitude', 'kontak', 'status',
];

// SELECT dasar: potensi + kategori + admin + daftar tag (many to many) + foto (one to many)
const BASE_SELECT = `
  SELECT
    p.*,
    k.nama_kategori,
    a.nama AS nama_admin,
    COALESCE((
      SELECT json_agg(json_build_object('id_tag', t.id_tag, 'nama_tag', t.nama_tag) ORDER BY t.id_tag)
      FROM potensi_tag pt JOIN tag t ON t.id_tag = pt.id_tag
      WHERE pt.id_potensi = p.id_potensi
    ), '[]'::json) AS tags,
    COALESCE((
      SELECT json_agg(json_build_object('id_foto', f.id_foto, 'url_foto', f.url_foto, 'caption', f.caption) ORDER BY f.id_foto)
      FROM foto_potensi f
      WHERE f.id_potensi = p.id_potensi
    ), '[]'::json) AS foto
  FROM potensi_desa p
  JOIN kategori_potensi k ON k.id_kategori = p.id_kategori
  JOIN admin a ON a.id_admin = p.id_admin
`;

const isId = (v) => /^\d+$/.test(String(v));
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

// Validasi body. partial=true untuk PUT (hanya field yang dikirim yang dicek)
function validate(body, partial) {
  const errors = [];
  const has = (k) => body[k] !== undefined;

  if (!partial || has('nama_potensi')) {
    if (typeof body.nama_potensi !== 'string' || !body.nama_potensi.trim()) {
      errors.push('nama_potensi wajib diisi (teks)');
    }
  }
  for (const k of ['id_kategori', 'id_admin']) {
    if (!partial || has(k)) {
      if (!Number.isInteger(body[k]) || body[k] < 1) errors.push(`${k} wajib berupa angka bulat positif`);
    }
  }
  if (has('latitude') && body.latitude !== null && !(isNum(body.latitude) && body.latitude >= -90 && body.latitude <= 90)) {
    errors.push('latitude harus angka antara -90 sampai 90');
  }
  if (has('longitude') && body.longitude !== null && !(isNum(body.longitude) && body.longitude >= -180 && body.longitude <= 180)) {
    errors.push('longitude harus angka antara -180 sampai 180');
  }
  if (has('status') && !STATUS_VALID.includes(body.status)) {
    errors.push(`status harus salah satu dari: ${STATUS_VALID.join(', ')}`);
  }
  if (has('tag_ids') && !(Array.isArray(body.tag_ids) && body.tag_ids.every((n) => Number.isInteger(n) && n > 0))) {
    errors.push('tag_ids harus berupa array angka bulat positif');
  }
  return errors;
}

async function getOne(id) {
  const { rows } = await pool.query(`${BASE_SELECT} WHERE p.id_potensi = $1`, [id]);
  return rows[0];
}

// GET /api/potensi  -> semua data (opsional filter: ?q=&id_kategori=&status=)
router.get('/', async (req, res, next) => {
  try {
    const where = [];
    const params = [];
    if (req.query.q) {
      params.push(`%${req.query.q}%`);
      where.push(`(p.nama_potensi ILIKE $${params.length} OR p.alamat ILIKE $${params.length})`);
    }
    if (req.query.id_kategori) {
      if (!isId(req.query.id_kategori)) return res.status(400).json({ success: false, message: 'id_kategori harus angka' });
      params.push(Number(req.query.id_kategori));
      where.push(`p.id_kategori = $${params.length}`);
    }
    if (req.query.status) {
      params.push(req.query.status);
      where.push(`p.status = $${params.length}`);
    }
    const sql = `${BASE_SELECT} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY p.id_potensi ASC`;
    const { rows } = await pool.query(sql, params);
    res.json({ success: true, message: 'Berhasil mengambil semua data potensi desa', total: rows.length, data: rows });
  } catch (err) { next(err); }
});

// GET /api/potensi/:id  -> data berdasarkan ID
router.get('/:id', async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ success: false, message: 'ID harus berupa angka' });
    const data = await getOne(Number(req.params.id));
    if (!data) return res.status(404).json({ success: false, message: 'Data potensi tidak ditemukan' });
    res.json({ success: true, message: 'Berhasil mengambil data potensi desa', data });
  } catch (err) { next(err); }
});

// POST /api/potensi  -> buat data baru
router.post('/', async (req, res, next) => {
  const errors = validate(req.body || {}, false);
  if (errors.length) return res.status(400).json({ success: false, message: 'Validasi gagal', errors });

  const b = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const ins = await client.query(
      `INSERT INTO potensi_desa
        (id_kategori, id_admin, nama_potensi, deskripsi, alamat, latitude, longitude, kontak, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,COALESCE($9,'aktif'))
       RETURNING id_potensi`,
      [b.id_kategori, b.id_admin, b.nama_potensi.trim(), b.deskripsi ?? null, b.alamat ?? null,
        b.latitude ?? null, b.longitude ?? null, b.kontak ?? null, b.status ?? null],
    );
    const id = ins.rows[0].id_potensi;
    if (b.tag_ids && b.tag_ids.length) {
      await client.query(
        'INSERT INTO potensi_tag (id_potensi, id_tag) SELECT $1, UNNEST($2::int[]) ON CONFLICT DO NOTHING',
        [id, b.tag_ids],
      );
    }
    await client.query('COMMIT');
    const data = await getOne(id);
    res.status(201).json({ success: true, message: 'Data potensi desa berhasil dibuat', data });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// PUT /api/potensi/:id  -> perbarui data (field yang dikirim saja yang diubah)
router.put('/:id', async (req, res, next) => {
  if (!isId(req.params.id)) return res.status(400).json({ success: false, message: 'ID harus berupa angka' });
  const b = req.body || {};
  const errors = validate(b, true);
  if (errors.length) return res.status(400).json({ success: false, message: 'Validasi gagal', errors });

  const sent = FIELDS.filter((f) => b[f] !== undefined);
  if (!sent.length && b.tag_ids === undefined) {
    return res.status(400).json({ success: false, message: 'Tidak ada field yang dikirim untuk diperbarui' });
  }

  const id = Number(req.params.id);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const sets = sent.map((f, i) => `${f} = $${i + 1}`);
    const values = sent.map((f) => (typeof b[f] === 'string' ? b[f].trim() : b[f]));
    sets.push('updated_at = CURRENT_TIMESTAMP');
    const upd = await client.query(
      `UPDATE potensi_desa SET ${sets.join(', ')} WHERE id_potensi = $${sent.length + 1} RETURNING id_potensi`,
      [...values, id],
    );
    if (!upd.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Data potensi tidak ditemukan' });
    }
    if (b.tag_ids !== undefined) {
      await client.query('DELETE FROM potensi_tag WHERE id_potensi = $1', [id]);
      if (b.tag_ids.length) {
        await client.query(
          'INSERT INTO potensi_tag (id_potensi, id_tag) SELECT $1, UNNEST($2::int[]) ON CONFLICT DO NOTHING',
          [id, b.tag_ids],
        );
      }
    }
    await client.query('COMMIT');
    const data = await getOne(id);
    res.json({ success: true, message: 'Data potensi desa berhasil diperbarui', data });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// DELETE /api/potensi/:id  -> hapus data (foto & relasi tag ikut terhapus: ON DELETE CASCADE)
router.delete('/:id', async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(400).json({ success: false, message: 'ID harus berupa angka' });
    const { rows } = await pool.query(
      'DELETE FROM potensi_desa WHERE id_potensi = $1 RETURNING id_potensi, nama_potensi',
      [Number(req.params.id)],
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Data potensi tidak ditemukan' });
    res.json({ success: true, message: 'Data potensi desa berhasil dihapus', data: rows[0] });
  } catch (err) { next(err); }
});

module.exports = router;
