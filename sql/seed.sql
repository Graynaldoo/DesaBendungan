-- Data contoh untuk pengujian API.
-- Catatan: latitude/longitude sengaja NULL karena koordinat asli harus
-- diisi dari sumber data yang dapat dipertanggungjawabkan.

INSERT INTO admin (nama, email, password_hash) VALUES
  ('Admin Contoh', 'admin@example.com', 'ganti-dengan-hash-password-asli');

INSERT INTO admin_profile (id_admin, jabatan, no_hp) VALUES
  (1, 'Operator Website Desa', NULL);

INSERT INTO kategori_potensi (nama_kategori, deskripsi, icon) VALUES
  ('Wisata',         'Potensi wisata dan tempat menarik desa', 'map-pin'),
  ('UMKM',           'Usaha mikro, kecil, dan menengah lokal', 'store'),
  ('Pertanian',      'Potensi pertanian dan perkebunan',       'sprout'),
  ('Fasilitas Umum', 'Fasilitas dan sarana umum desa',         'building');

INSERT INTO tag (nama_tag) VALUES
  ('wisata-alam'), ('kuliner'), ('kerajinan'), ('edukasi');

INSERT INTO potensi_desa (id_kategori, id_admin, nama_potensi, deskripsi, alamat, kontak, status) VALUES
  (1, 1, 'Contoh Potensi Wisata', 'Data contoh untuk uji API (bukan data asli).', 'Desa Bendungan, Kec. Gondang, Kab. Tulungagung', NULL, 'aktif'),
  (2, 1, 'Contoh Potensi UMKM',   'Data contoh untuk uji API (bukan data asli).', 'Desa Bendungan, Kec. Gondang, Kab. Tulungagung', NULL, 'aktif');

INSERT INTO potensi_tag (id_potensi, id_tag) VALUES (1, 1), (1, 4), (2, 2), (2, 3);

INSERT INTO foto_potensi (id_potensi, url_foto, caption) VALUES
  (1, 'https://example.com/foto-contoh-1.jpg', 'Foto contoh');
