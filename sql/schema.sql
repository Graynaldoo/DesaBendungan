-- =====================================================================
-- Database : desa_bendungan (PostgreSQL)
-- Studi kasus : Sistem Informasi Potensi Desa Bendungan
-- Relasi :
--   One to One   : admin 1--1 admin_profile
--   One to Many  : admin 1--N potensi_desa
--                  kategori_potensi 1--N potensi_desa
--                  potensi_desa 1--N foto_potensi
--   Many to Many : potensi_desa N--N tag  (lewat tabel potensi_tag)
-- Total tabel : 7
-- =====================================================================

CREATE TABLE admin (
  id_admin      SERIAL PRIMARY KEY,
  nama          VARCHAR(100) NOT NULL,
  email         VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ONE TO ONE: satu admin hanya punya satu profil (kolom id_admin UNIQUE)
CREATE TABLE admin_profile (
  id_profil  SERIAL PRIMARY KEY,
  id_admin   INTEGER NOT NULL UNIQUE,
  jabatan    VARCHAR(100),
  no_hp      VARCHAR(20),
  foto_url   TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE kategori_potensi (
  id_kategori   SERIAL PRIMARY KEY,
  nama_kategori VARCHAR(100) NOT NULL UNIQUE,
  deskripsi     TEXT,
  icon          VARCHAR(100),
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE potensi_desa (
  id_potensi   SERIAL PRIMARY KEY,
  id_kategori  INTEGER NOT NULL,
  id_admin     INTEGER NOT NULL,
  nama_potensi VARCHAR(150) NOT NULL,
  deskripsi    TEXT,
  alamat       TEXT,
  latitude     DECIMAL(10,7),
  longitude    DECIMAL(10,7),
  kontak       VARCHAR(50),
  status       VARCHAR(20) NOT NULL DEFAULT 'aktif',
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE foto_potensi (
  id_foto    SERIAL PRIMARY KEY,
  id_potensi INTEGER NOT NULL,
  url_foto   TEXT NOT NULL,
  caption    VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tag (
  id_tag   SERIAL PRIMARY KEY,
  nama_tag VARCHAR(50) NOT NULL UNIQUE
);

-- MANY TO MANY: potensi_desa <-> tag (tabel penghubung, primary key gabungan)
CREATE TABLE potensi_tag (
  id_potensi INTEGER NOT NULL,
  id_tag     INTEGER NOT NULL,
  PRIMARY KEY (id_potensi, id_tag)
);

-- ---------------------------------------------------------------------
-- Foreign key
-- ---------------------------------------------------------------------
ALTER TABLE admin_profile ADD FOREIGN KEY (id_admin) REFERENCES admin (id_admin) ON DELETE CASCADE;
ALTER TABLE potensi_desa  ADD FOREIGN KEY (id_kategori) REFERENCES kategori_potensi (id_kategori) ON DELETE RESTRICT;
ALTER TABLE potensi_desa  ADD FOREIGN KEY (id_admin) REFERENCES admin (id_admin) ON DELETE RESTRICT;
ALTER TABLE foto_potensi  ADD FOREIGN KEY (id_potensi) REFERENCES potensi_desa (id_potensi) ON DELETE CASCADE;
ALTER TABLE potensi_tag   ADD FOREIGN KEY (id_potensi) REFERENCES potensi_desa (id_potensi) ON DELETE CASCADE;
ALTER TABLE potensi_tag   ADD FOREIGN KEY (id_tag) REFERENCES tag (id_tag) ON DELETE CASCADE;

-- Index pendukung pencarian / filter
CREATE INDEX idx_potensi_kategori ON potensi_desa (id_kategori);
CREATE INDEX idx_potensi_admin    ON potensi_desa (id_admin);
CREATE INDEX idx_foto_potensi     ON foto_potensi (id_potensi);
