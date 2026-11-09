# REST API Potensi Desa Bendungan

Backend Database (PostgreSQL) dan REST API (Express.js) untuk **Sistem Informasi Potensi Desa Bendungan, Kecamatan Gondang, Kabupaten Tulungagung**.
Tugas: *Backend Development – Individual Challenge (Backend Database and REST API Practice)*.

## Studi Kasus & Kebutuhan Fitur
Dibutuhkan sistem informasi potensi Desa Bendungan agar masyarakat, pengunjung, dan pelaku usaha lokal dapat menemukan potensi desa (wisata, UMKM, pertanian, fasilitas umum), sementara admin desa dapat mengelola datanya sendiri.
Kebutuhan fitur backend:
1. Admin memiliki akun dan profil.
2. Admin mengelola kategori potensi.
3. Admin menambah, melihat, mengubah, dan menghapus data potensi desa.
4. Setiap potensi punya lokasi (latitude/longitude, boleh kosong sampai data resmi tersedia), kontak, dan status.
5. Setiap potensi dapat memiliki banyak foto.
6. Setiap potensi dapat diberi banyak tag, dan satu tag dapat dipakai banyak potensi.

## Struktur Database (7 tabel)
| Tabel | Keterangan |
|---|---|
| `admin` | Akun admin |
| `admin_profile` | Profil admin |
| `kategori_potensi` | Kategori potensi |
| `potensi_desa` | Data potensi desa |
| `foto_potensi` | Foto milik potensi |
| `tag` | Label/tag |
| `potensi_tag` | Tabel penghubung potensi ↔ tag |

| Jenis relasi | Tabel |
|---|---|
| **One to One** | `admin` 1 — 1 `admin_profile` (kolom `id_admin` bersifat UNIQUE) |
| **One to Many** | `admin` 1 — N `potensi_desa`; `kategori_potensi` 1 — N `potensi_desa`; `potensi_desa` 1 — N `foto_potensi` |
| **Many to Many** | `potensi_desa` N — N `tag` lewat `potensi_tag` |

File SQL: `sql/schema.sql` (struktur), `sql/seed.sql` (data contoh), `sql/drop.sql` (reset).

## Cara Menjalankan
Prasyarat: Node.js 18+ dan PostgreSQL.

```bash
# 1. Buat database
psql -U postgres -c "CREATE DATABASE desa_bendungan;"

# 2. Buat tabel dan isi data contoh
psql -U postgres -d desa_bendungan -f sql/schema.sql
psql -U postgres -d desa_bendungan -f sql/seed.sql

# 3. Install dependency
npm install

# 4. Salin .env.example menjadi .env lalu isi password PostgreSQL
cp .env.example .env      # Windows: copy .env.example .env

# 5. Jalankan server
npm start                 # atau: npm run dev
```
Server berjalan di `http://localhost:3000`.

## Endpoint Utama: `/api/potensi`
| Method | URL | Fungsi |
|---|---|---|
| GET | `/api/potensi` | Semua data (opsional `?q=`, `?id_kategori=`, `?status=`) |
| GET | `/api/potensi/:id` | Data berdasarkan ID |
| POST | `/api/potensi` | Buat data baru |
| PUT | `/api/potensi/:id` | Perbarui data (field yang dikirim saja yang diubah) |
| DELETE | `/api/potensi/:id` | Hapus data |

Endpoint tambahan dengan pola sama: `/api/kategori` (GET, GET by id, POST, PUT, DELETE).

Contoh body POST:
```json
{
  "id_kategori": 1,
  "id_admin": 1,
  "nama_potensi": "Contoh Potensi Baru",
  "deskripsi": "Data uji",
  "alamat": "Desa Bendungan, Kec. Gondang, Kab. Tulungagung",
  "latitude": null,
  "longitude": null,
  "kontak": null,
  "status": "aktif",
  "tag_ids": [1, 4]
}
```
Field wajib: `id_kategori`, `id_admin`, `nama_potensi`. `status` bernilai `aktif`, `nonaktif`, atau `draft`.

## Tes di Postman
1. Import `postman/Desa-Bendungan-API.postman_collection.json`.
2. Urutan tes untuk screenshot:
   1. **POST** — buat data baru, lalu catat `id_potensi` pada respons (status 201).
   2. **GET** semua data.
   3. **GET** berdasarkan ID — ubah variabel koleksi `id` ke ID dari langkah 1.
   4. **PUT** — update data dengan ID yang sama.
   5. **DELETE** — hapus data dengan ID yang sama.
3. Screenshot jendela Postman yang menampilkan **URL, method, body, status code, dan respons**.

## Pengumpulan
- `.gitignore` sudah berisi `node_modules` dan `.env`.
- GitHub: buat repository **publik**, lalu:
  ```bash
  git init
  git add .
  git commit -m "Backend REST API potensi desa Bendungan"
  git branch -M main
  git remote add origin https://github.com/USERNAME/NAMA-REPO.git
  git push -u origin main
  ```
- Atau ZIP semua file dan folder **kecuali** `node_modules` dan `.env`, unggah ke Google Drive, lalu set akses publik.
- dbdiagram: dbdiagram.io → *Import* → *PostgreSQL* → paste isi `sql/schema.sql` → Save → Share (publik).
