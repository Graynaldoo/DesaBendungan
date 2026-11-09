# Jawaban Tugas Backend Development – Individual Challenge

**Program / Nama / Universitas:** (isi sendiri)
**Mentor Trainer:** Ahmad Thomthomi Barosimi
**Module:** Backend Development
**Tugas:** Membuat Backend Database dan REST API
**Deadline:** Senin, 9 November 2026 pukul 23:59 WIB

## 1. Studi Kasus
Sistem Informasi Potensi Desa Bendungan (Kecamatan Gondang, Kabupaten Tulungagung), sejalan dengan final project penulis.

Dibutuhkan sistem informasi potensi Desa Bendungan agar masyarakat, pengunjung, dan pelaku usaha lokal dapat menemukan potensi desa (wisata, UMKM, pertanian, fasilitas umum), sementara admin desa dapat mengelola datanya sendiri.

Kebutuhan fitur:
- Admin memiliki akun beserta profil.
- Admin mengelola kategori potensi.
- Admin menambah, melihat, mengubah, dan menghapus data potensi desa.
- Setiap potensi menyimpan lokasi (latitude/longitude, boleh kosong sampai data resmi tersedia), kontak, dan status.
- Setiap potensi dapat memiliki banyak foto.
- Setiap potensi dapat diberi banyak tag, dan satu tag dapat dipakai banyak potensi.

## 2. Database (7 tabel, PostgreSQL)
`admin`, `admin_profile`, `kategori_potensi`, `potensi_desa`, `foto_potensi`, `tag`, `potensi_tag`.

| Relasi | Tabel |
|---|---|
| One to One | admin — admin_profile |
| One to Many | admin — potensi_desa; kategori_potensi — potensi_desa; potensi_desa — foto_potensi |
| Many to Many | potensi_desa — tag (tabel penghubung potensi_tag) |

## 3. REST API (Express.js + PostgreSQL)
Tabel yang dibuat API: `potensi_desa` (utama) dan `kategori_potensi`.
Routes `/api/potensi`: GET semua, GET by ID, POST, PUT, DELETE.

## 4. Template isian Form Pengumpulan
- Link dbdiagram (publik): `<ISI SETELAH SHARE DI dbdiagram.io>`
- Link project backend dan SQL (GitHub publik / ZIP Google Drive publik): `<ISI>`

## 5. Screenshot Postman (dikerjakan sendiri di komputer)
1. POST  2. GET semua  3. GET by ID  4. PUT  5. DELETE.
Ambil screenshot yang memperlihatkan URL, method, body, status code, dan respons.

---

# HANDOFF untuk AI lain (status pengerjaan)

**Sudah dibuat (ada di zip `backend-desa-bendungan.zip`):**
- `sql/schema.sql`, `sql/seed.sql`, `sql/drop.sql`, `sql/dbdiagram.dbml`
- `src/server.js`, `src/db.js`, `src/routes/potensi.js`, `src/routes/kategori.js`
- `package.json`, `.gitignore` (node_modules, .env), `.env.example`
- `postman/Desa-Bendungan-API.postman_collection.json`
- `README.md` (cara setup, endpoint, tes Postman, push GitHub)

**Belum dilakukan oleh AI (harus dikerjakan pemilik tugas):**
1. Install PostgreSQL lokal, jalankan `schema.sql` dan `seed.sql`.
2. Isi `.env` (salin dari `.env.example`).
3. `npm install` lalu `npm start`.
4. Tes 5 route di Postman dan ambil screenshot (tidak bisa dilakukan AI).
5. Buat akun dbdiagram.io, Import PostgreSQL dari `sql/schema.sql`, Save, Share publik.
6. Push ke GitHub publik atau ZIP (tanpa `node_modules` dan `.env`) lalu set link publik.
7. Isi form pengumpulan (Airtable) sebelum 9 November 2026 23:59 WIB.

**Catatan teknis:**
- Latitude/longitude pada data contoh sengaja NULL (tidak boleh mengarang koordinat).
- Kolom `status` divalidasi di API (`aktif`, `nonaktif`, `draft`), bukan di SQL, agar skema mudah diimpor ke dbdiagram.
- Password admin pada seed hanya placeholder; belum ada fitur login karena di luar kebutuhan tugas.
