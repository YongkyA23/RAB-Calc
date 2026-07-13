
# Product Requirements Document

# Fitur Hitung Kertas — Kalkulator Cetak

## 1. Ringkasan Produk

**Hitung Kertas** adalah fitur kalkulator cetak berbasis web yang membantu pengguna menghitung kebutuhan kertas, layout desain per lembar, kebutuhan produksi buku, pemotongan plano, estimasi biaya kertas, serta estimasi waktu produksi cetak dan finishing. Fitur ini memiliki empat modul utama: **Layout Cetak**, **Kalkulator Buku**, **Potong Plano**, dan **Estimasi Waktu**.

Tujuan utama fitur ini adalah memberikan perhitungan cepat untuk kebutuhan produksi cetak seperti desain, stiker, kartu, buku, plano, dan pekerjaan finishing, sehingga pengguna dapat memperkirakan jumlah lembar, waste, biaya bahan, dan waktu pengerjaan sebelum produksi dimulai.

---

## 2. Tujuan Produk

Fitur Hitung Kertas bertujuan untuk:

1. Menghitung jumlah desain, stiker, atau kartu yang dapat masuk dalam satu lembar kertas.
2. Menghitung kebutuhan kertas untuk produksi buku, termasuk isi dan cover.
3. Menghitung estimasi biaya kertas berdasarkan harga rim, jumlah lembar per rim, dan margin waste.
4. Menghitung hasil potong dari kertas plano besar ke ukuran potongan tertentu.
5. Menampilkan visualisasi layout atau potongan agar pengguna dapat memahami susunan produksi.
6. Menghitung estimasi waktu pengerjaan berdasarkan jenis pekerjaan cetak dan finishing tambahan.
7. Membuka fitur tertentu melalui sistem registrasi gratis.

---

## 3. Target Pengguna

Target pengguna fitur ini adalah:

| Pengguna                | Kebutuhan                                                        |
| ----------------------- | ---------------------------------------------------------------- |
| Percetakan digital      | Menghitung kebutuhan kertas dan estimasi waktu produksi          |
| Admin order / estimator | Membuat estimasi awal sebelum memberikan harga ke pelanggan      |
| Desainer cetak          | Mengecek efisiensi layout desain dalam ukuran kertas tertentu    |
| Pemilik usaha printing  | Mengontrol waste, kebutuhan bahan, dan estimasi biaya produksi   |
| Operator produksi       | Membantu menentukan jumlah lembar, potongan plano, dan finishing |

---

## 4. Modul Utama

Fitur Hitung Kertas terdiri dari empat modul utama:

1. **Layout Cetak**
2. **Kalkulator Buku**
3. **Potong Plano**
4. **Estimasi Waktu**

Keempat modul ini harus tersedia sebagai pilihan navigasi/tab pada halaman utama kalkulator.

---

# 5. Modul Layout Cetak

## 5.1 Deskripsi

Modul **Layout Cetak** digunakan untuk menghitung berapa banyak desain, stiker, kartu, atau item cetak yang dapat ditempatkan dalam satu lembar kertas berdasarkan ukuran kertas, ukuran desain, bleed/jarak antar, jumlah kebutuhan, dan opsi rotasi.

## 5.2 Input

| Field                | Tipe              | Keterangan                                                 |
| -------------------- | ----------------- | ---------------------------------------------------------- |
| Ukuran Kertas        | Dropdown / preset | Pengguna memilih ukuran kertas                             |
| Lebar kertas         | Number, cm        | Terisi otomatis dari preset atau diisi manual jika custom  |
| Tinggi kertas        | Number, cm        | Terisi otomatis dari preset atau diisi manual jika custom  |
| Simpan ukuran custom | Button            | Menyimpan ukuran custom                                    |
| Lebar desain         | Number, cm        | Lebar desain/item cetak                                    |
| Tinggi desain        | Number, cm        | Tinggi desain/item cetak                                   |
| Bleed / jarak antar  | Number, cm        | Jarak antar desain atau area potong                        |
| Jumlah dibutuhkan    | Number, opsional  | Jumlah total item yang ingin diproduksi                    |
| Optimasi rotasi      | Toggle / radio    | Pilihan “Putar jika lebih efisien” atau “Tanpa rotasi” |

## 5.3 Preset Ukuran Kertas

| Preset | Ukuran                     |
| ------ | -------------------------- |
| A3+    | 48 × 32 cm                |
| A3     | 42 × 29.7 cm              |
| A4     | 29.7 × 21 cm              |
| A5     | 21 × 14.8 cm              |
| Custom | Diisi manual oleh pengguna |

Preset ini harus mengikuti pilihan yang tersedia pada website.

## 5.4 Output

| Output                 | Keterangan                                            |
| ---------------------- | ----------------------------------------------------- |
| Pcs per lembar         | Jumlah desain/item yang muat dalam satu lembar        |
| Lembar dibutuhkan      | Jumlah lembar yang dibutuhkan berdasarkan jumlah item |
| Susunan kolom × baris | Jumlah kolom dan baris layout                         |
| Area terbuang          | Sisa area kertas yang tidak terpakai                  |
| Preview lembar         | Visualisasi susunan desain pada lembar kertas         |
| Navigasi lembar        | Menampilkan posisi seperti “Lembar 1 / 1”           |

## 5.5 Logika Perhitungan

Sistem harus menghitung jumlah item yang dapat masuk berdasarkan:

* ukuran kertas,
* ukuran desain,
* tambahan bleed/jarak antar,
* orientasi normal,
* orientasi rotasi jika opsi rotasi aktif.

Jika opsi **Putar jika lebih efisien** dipilih, sistem harus membandingkan layout normal dan layout rotasi, lalu menggunakan susunan yang menghasilkan jumlah item paling banyak.

Jika **Jumlah dibutuhkan** diisi, sistem menghitung jumlah lembar produksi yang dibutuhkan.

## 5.6 Estimasi Harga Layout Cetak

Modul Layout Cetak juga memiliki fitur estimasi biaya kertas.

### Input Estimasi Harga

| Field               | Tipe       | Keterangan                             |
| ------------------- | ---------- | -------------------------------------- |
| Harga per rim       | Number, Rp | Harga kertas per rim                   |
| Rim = berapa lembar | Number     | Jumlah lembar dalam satu rim           |
| Margin waste (%)    | Number     | Persentase tambahan lembar untuk waste |

### Output Estimasi Harga

| Output                | Keterangan                                 |
| --------------------- | ------------------------------------------ |
| Lembar bersih         | Jumlah lembar sebelum waste                |
| Tambah waste          | Tambahan lembar dari margin waste          |
| Total lembar order    | Total lembar yang perlu disiapkan          |
| Harga per lembar      | Harga per rim dibagi jumlah lembar per rim |
| Estimasi biaya kertas | Total lembar order × harga per lembar     |

---

# 6. Modul Kalkulator Buku

## 6.1 Deskripsi

Modul **Kalkulator Buku** digunakan untuk menghitung kebutuhan kertas untuk produksi buku lengkap, termasuk ukuran kertas cetak, ukuran buku jadi, jumlah halaman isi, jumlah eksemplar, mode cetak, cover, tebal punggung, dan jenis jilid.

## 6.2 Input Ukuran Kertas Cetak

| Field                | Tipe              | Keterangan                                  |
| -------------------- | ----------------- | ------------------------------------------- |
| Ukuran kertas cetak  | Dropdown / preset | Ukuran kertas yang digunakan untuk mencetak |
| Lebar kertas         | Number, cm        | Terisi otomatis atau manual                 |
| Tinggi kertas        | Number, cm        | Terisi otomatis atau manual                 |
| Simpan ukuran custom | Button            | Menyimpan ukuran custom                     |

### Preset Ukuran Kertas Cetak

| Preset | Ukuran        |
| ------ | ------------- |
| A3+    | 48 × 32 cm   |
| A3     | 42 × 29.7 cm |
| A4     | 29.7 × 21 cm |
| Custom | Diisi manual  |

## 6.3 Input Ukuran Buku Jadi

| Field                | Tipe              | Keterangan                  |
| -------------------- | ----------------- | --------------------------- |
| Ukuran buku jadi     | Dropdown / preset | Ukuran akhir buku           |
| Lebar buku           | Number, cm        | Terisi otomatis atau manual |
| Tinggi buku          | Number, cm        | Terisi otomatis atau manual |
| Simpan ukuran custom | Button            | Menyimpan ukuran custom     |

### Preset Ukuran Buku Jadi

| Preset   | Ukuran          |
| -------- | --------------- |
| A5       | 14.8 × 21 cm   |
| A4       | 21 × 29.7 cm   |
| A6       | 10.5 × 14.8 cm |
| 17 × 24 | 17 × 24 cm     |
| Custom   | Diisi manual    |

Preset harus mengikuti pilihan yang tersedia pada website.

## 6.4 Input Detail Cetak Buku

| Field              | Tipe       | Keterangan                                               |
| ------------------ | ---------- | -------------------------------------------------------- |
| Jumlah halaman isi | Number     | Total halaman buku, bukan jumlah lembar                  |
| Jumlah eksemplar   | Number     | Jumlah buku yang akan diproduksi                         |
| Mode cetak         | Radio      | Bolak-balik/duplex atau satu sisi                        |
| Jenis cover        | Radio      | Soft cover, hard cover, atau tanpa cover terpisah        |
| Tebal punggung     | Number, cm | Digunakan untuk estimasi lebar cover                     |
| Jenis jilid        | Radio      | Perfect binding, staples/saddle stitch, atau spiral/ring |

## 6.5 Catatan Sistem

Sistem harus menampilkan catatan berikut sesuai konteks:

* Soft cover terdiri dari satu lembar lipatan: depan, punggung, dan belakang.
* Tebal punggung digunakan untuk estimasi lebar cover.
* Estimasi tebal punggung: 100 halaman × 80gsm sekitar 0.8 cm, 200 halaman sekitar 1.5 cm.
* Perfect binding menggunakan halaman single sheet dan lem punggung.
* Untuk perfect binding, kelipatan 4 disarankan.
* Untuk saddle stitch, halaman harus kelipatan 4.

## 6.6 Output Kalkulator Buku

| Output                           | Keterangan                                             |
| -------------------------------- | ------------------------------------------------------ |
| Buku per lembar                  | Jumlah bagian buku yang dapat dicetak pada satu lembar |
| Halaman final setelah dibulatkan | Jumlah halaman setelah disesuaikan kebutuhan produksi  |
| Lembar isi per buku              | Jumlah lembar isi untuk satu buku                      |
| Cover per lembar kertas          | Jumlah cover yang muat dalam satu lembar               |
| Lembar per buku                  | Total lembar yang dibutuhkan per buku                  |
| Lembar isi total                 | Total lembar isi untuk semua eksemplar                 |
| Lembar cover total               | Total lembar cover untuk semua eksemplar               |
| Total lembar                     | Total kebutuhan lembar isi + cover                     |
| Waste                            | Tambahan lembar berdasarkan margin waste               |
| Rekomendasi order                | Total lembar yang direkomendasikan untuk produksi      |

## 6.7 Estimasi Harga Kertas Buku

Modul Kalkulator Buku harus memiliki estimasi biaya kertas untuk isi dan cover.

### Input Estimasi Harga Buku

| Field               | Tipe       | Keterangan                      |
| ------------------- | ---------- | ------------------------------- |
| Harga per rim isi   | Number, Rp | Harga kertas untuk isi buku     |
| Harga per rim cover | Number, Rp | Harga kertas untuk cover        |
| Rim = berapa lembar | Number     | Jumlah lembar dalam satu rim    |
| Margin waste (%)    | Number     | Opsional, 0 berarti tanpa waste |

### Output Estimasi Harga Buku

| Output                | Keterangan                     |
| --------------------- | ------------------------------ |
| Kertas isi            | Estimasi biaya kertas isi      |
| Kertas cover          | Estimasi biaya kertas cover    |
| Total estimasi kertas | Total biaya kertas isi + cover |
| Per eksemplar         | Estimasi biaya kertas per buku |

---

# 7. Modul Potong Plano

## 7.1 Deskripsi

Modul **Potong Plano** digunakan untuk menghitung hasil potongan dari kertas plano besar berdasarkan ukuran plano dan ukuran potongan utama. Modul ini juga menampilkan waste, visualisasi potongan, dan skema alternatif untuk memanfaatkan sisa potongan.

## 7.2 Input Ukuran Kertas Plano

| Field        | Tipe              | Keterangan                |
| ------------ | ----------------- | ------------------------- |
| Lebar plano  | Number, cm        | Lebar kertas plano        |
| Tinggi plano | Number, cm        | Tinggi kertas plano       |
| Preset plano | Button / shortcut | Pilihan ukuran plano umum |

### Preset Plano

| Preset       |
| ------------ |
| 65 × 100 cm |
| 79 × 109 cm |
| 61 × 86 cm  |
| 72 × 102 cm |

## 7.3 Input Ukuran Potongan Utama

| Field           | Tipe       | Keterangan                  |
| --------------- | ---------- | --------------------------- |
| Lebar potongan  | Number, cm | Lebar hasil potongan utama  |
| Tinggi potongan | Number, cm | Tinggi hasil potongan utama |

## 7.4 Output

| Output                 | Keterangan                                            |
| ---------------------- | ----------------------------------------------------- |
| Hasil per lembar plano | Jumlah potongan utama yang dihasilkan dari satu plano |
| Waste                  | Area sisa dari plano yang tidak terpakai              |
| Skema alternatif       | Daftar alternatif susunan potongan                    |
| Visualisasi potongan   | Tampilan visual susunan potongan pada plano           |

## 7.5 Fitur Maksimalkan Sisa Potongan

Sistem harus menyediakan opsi **Maksimalkan sisa potongan**.

Jika fitur ini diaktifkan, sistem menampilkan skema alternatif yang memanfaatkan strip sisa dengan ukuran potongan kedua. Pengguna dapat memilih skema alternatif untuk mengaktifkan visualisasi sesuai skema tersebut.

## 7.6 Akses Fitur Premium

Modul Potong Plano harus dikunci untuk pengguna yang belum terdaftar.

Sistem menampilkan pesan bahwa fitur potong plano tersedia untuk pengguna terdaftar, pendaftaran gratis, dan tidak membutuhkan kartu kredit.

CTA yang harus tersedia:

* **Daftar & Buka Akses**

---

# 8. Modul Estimasi Waktu

## 8.1 Deskripsi

Modul **Estimasi Waktu** digunakan untuk menghitung perkiraan waktu pengerjaan berdasarkan jenis pekerjaan cetak yang dipilih dan finishing tambahan yang diterapkan ke semua pekerjaan aktif.

## 8.2 Jenis Pekerjaan

Sistem harus menyediakan pilihan pekerjaan berikut:

| Jenis Pekerjaan      | Deskripsi                                         |
| -------------------- | ------------------------------------------------- |
| Lembaran A3+         | Print digital A3+, bolak-balik atau satu sisi     |
| Cetak Meteran        | Spanduk, banner, stiker roll, dan sejenisnya      |
| Kartu Nama           | 1 box = 500 kartu nama, sekitar 20 lembar A3      |
| Buku Saddle Stitch   | Lipat tengah + staples, halaman harus kelipatan 4 |
| Buku Perfect Binding | Lem punggung, single sheet                        |
| Buku Hard Cover      | Cover keras, full manual                          |

## 8.3 Input per Jenis Pekerjaan

### 8.3.1 Lembaran A3+

| Field         | Tipe   | Keterangan                 |
| ------------- | ------ | -------------------------- |
| Jumlah lembar | Number | Jumlah lembar A3+          |
| Mode cetak    | Radio  | Bolak-balik atau satu sisi |

### 8.3.2 Cetak Meteran

| Field      | Tipe        | Keterangan                                                          |
| ---------- | ----------- | ------------------------------------------------------------------- |
| Luas cetak | Number, m² | Total luas cetak untuk spanduk, banner, stiker roll, dan sejenisnya |

### 8.3.3 Kartu Nama

| Field              | Tipe   | Keterangan                                   |
| ------------------ | ------ | -------------------------------------------- |
| Jumlah box         | Number | Jumlah box kartu nama                        |
| Informasi konversi | Text   | 1 box = 500 kartu nama, sekitar 20 lembar A3 |

### 8.3.4 Buku Saddle Stitch

| Field                | Tipe   | Keterangan                       |
| -------------------- | ------ | -------------------------------- |
| Jumlah eksemplar     | Number | Jumlah buku                      |
| Jumlah halaman       | Number | Jumlah halaman buku              |
| Ukuran buku jadi     | Radio  | A5, A4, atau A6                  |
| Validasi kelipatan 4 | Rule   | Jumlah halaman harus kelipatan 4 |

### 8.3.5 Buku Perfect Binding

| Field            | Tipe   | Keterangan              |
| ---------------- | ------ | ----------------------- |
| Jumlah eksemplar | Number | Jumlah buku             |
| Jumlah halaman   | Number | Jumlah halaman buku     |
| Ukuran buku jadi | Radio  | A5, A4, A6, atau 17×24 |

### 8.3.6 Buku Hard Cover

| Field            | Tipe   | Keterangan              |
| ---------------- | ------ | ----------------------- |
| Jumlah eksemplar | Number | Jumlah buku             |
| Jumlah halaman   | Number | Jumlah halaman buku     |
| Ukuran buku jadi | Radio  | A5, A4, A6, atau 17×24 |

---

# 9. Finishing Tambahan

## 9.1 Deskripsi

Finishing tambahan berlaku ke semua pekerjaan aktif. Sistem harus menghitung total lembar untuk finishing secara otomatis dari semua pekerjaan yang sedang aktif.

## 9.2 Pilihan Finishing

| Finishing             | Estimasi Waktu                         |
| --------------------- | -------------------------------------- |
| Laminasi 1 jenis      | Setup 30 menit + 15 lembar/menit       |
| Laminasi 2 jenis      | Tambahan 15–20 menit untuk ganti roll |
| Potong ukuran standar | Setup 30 menit + 3–5 menit/lembar     |
| Potong ukuran custom  | Setup 30 menit + 5–8 menit/lembar     |
| Die cut               | Setup 45–60 menit + 2–3 menit/lembar |
| Kiss cut              | Setup 30–45 menit + 2–3 menit/lembar |

## 9.3 Output Estimasi Waktu

| Output                       | Keterangan                                   |
| ---------------------------- | -------------------------------------------- |
| Total lembar untuk finishing | Dihitung otomatis dari semua pekerjaan aktif |
| Total waktu pengerjaan       | Estimasi durasi keseluruhan                  |
| Estimasi selesai             | Perkiraan waktu selesai                      |
| Breakdown                    | Rincian waktu per pekerjaan dan finishing    |

Jika belum ada pekerjaan aktif, sistem harus menampilkan pesan bahwa pengguna perlu mengaktifkan minimal satu kategori pekerjaan untuk melihat estimasi.

---

# 10. Sistem Registrasi dan Akses

## 10.1 Deskripsi

Beberapa fitur, terutama fitur custom dan kalkulator potong plano, membutuhkan akses pengguna terdaftar. Pendaftaran bersifat gratis.

## 10.2 Form Registrasi

| Field          | Tipe         | Validasi           |
| -------------- | ------------ | ------------------ |
| Nama lengkap   | Text         | Tidak boleh kosong |
| Alamat email   | Email        | Harus email valid  |
| Nomor WhatsApp | Text / phone | Wajib diisi        |

CTA:

* **Daftar & Buka Akses**

## 10.3 Akses Pengguna Terdaftar

Untuk pengguna yang sudah pernah daftar, sistem menyediakan akses menggunakan email terdaftar.

| Field           | Tipe  | Validasi                  |
| --------------- | ----- | ------------------------- |
| Email terdaftar | Email | Harus ditemukan di sistem |

CTA:

* **Buka dengan Email**

Jika email tidak ditemukan, sistem harus menampilkan pesan bahwa email tidak ditemukan dan pengguna diminta daftar terlebih dahulu.

## 10.4 Status Akses

Jika akses berhasil dibuka, sistem menampilkan status:

* Akses dibuka.
* Semua fitur kalkulator tersedia.
* Pengguna dapat mulai menggunakan fitur.

---

# 11. Fitur Pendukung

## 11.1 Chat CS

Sistem menyediakan akses ke **Chat CS** melalui WhatsApp untuk kebutuhan bantuan pengguna.

## 11.2 Donasi

Sistem menyediakan fitur donasi “Buy me an Iced Latte” sebagai dukungan sukarela. Informasi yang ditampilkan mencakup nominal Rp15.000, QRIS, dan klaim bahwa tools gratis dan akan selalu gratis.

---

# 12. Functional Requirements

## FR-001 — Navigasi Modul

Sistem harus menyediakan navigasi ke empat modul utama:

1. Layout Cetak
2. Kalkulator Buku
3. Potong Plano
4. Estimasi Waktu

## FR-002 — Hitung Layout Cetak

Sistem harus dapat menghitung jumlah item/desain yang muat dalam satu lembar kertas berdasarkan ukuran kertas, ukuran desain, bleed/jarak antar, dan opsi rotasi.

## FR-003 — Hitung Lembar Dibutuhkan

Sistem harus menghitung jumlah lembar yang dibutuhkan jika pengguna mengisi jumlah item yang ingin diproduksi.

## FR-004 — Tampilkan Preview Layout

Sistem harus menampilkan visualisasi layout item dalam lembar kertas.

## FR-005 — Hitung Estimasi Biaya Kertas Layout

Sistem harus menghitung lembar bersih, waste, total lembar order, harga per lembar, dan estimasi biaya kertas.

## FR-006 — Hitung Kebutuhan Buku

Sistem harus menghitung kebutuhan kertas buku berdasarkan ukuran cetak, ukuran buku jadi, jumlah halaman isi, jumlah eksemplar, mode cetak, cover, tebal punggung, dan jenis jilid.

## FR-007 — Pembulatan Halaman Buku

Sistem harus membulatkan jumlah halaman final sesuai kebutuhan produksi, terutama untuk skenario yang membutuhkan kelipatan halaman tertentu.

## FR-008 — Hitung Cover Buku

Sistem harus menghitung kebutuhan cover berdasarkan jenis cover yang dipilih.

## FR-009 — Hitung Estimasi Biaya Kertas Buku

Sistem harus menghitung biaya kertas isi, biaya kertas cover, total estimasi kertas, dan biaya per eksemplar.

## FR-010 — Hitung Potong Plano

Sistem harus menghitung jumlah potongan utama yang dapat dihasilkan dari satu lembar plano.

## FR-011 — Hitung Waste Plano

Sistem harus menghitung waste dari proses pemotongan plano.

## FR-012 — Skema Alternatif Plano

Sistem harus menampilkan skema alternatif ketika fitur maksimalkan sisa potongan diaktifkan.

## FR-013 — Visualisasi Potongan Plano

Sistem harus menampilkan visualisasi potongan plano sesuai skema yang dipilih.

## FR-014 — Kunci Fitur Potong Plano

Sistem harus membatasi akses kalkulator potong plano untuk pengguna terdaftar.

## FR-015 — Estimasi Waktu Pekerjaan Cetak

Sistem harus menghitung estimasi waktu untuk pekerjaan lembaran A3+, cetak meteran, kartu nama, buku saddle stitch, buku perfect binding, dan buku hard cover.

## FR-016 — Finishing Tambahan

Sistem harus menghitung tambahan waktu dari finishing laminasi, potong, die cut, dan kiss cut.

## FR-017 — Total Lembar Finishing Otomatis

Sistem harus menghitung total lembar finishing dari semua pekerjaan aktif secara otomatis.

## FR-018 — Breakdown Estimasi Waktu

Sistem harus menampilkan breakdown estimasi waktu berdasarkan pekerjaan aktif dan finishing tambahan.

## FR-019 — Registrasi Pengguna

Sistem harus menyediakan form registrasi dengan nama lengkap, email, dan nomor WhatsApp.

## FR-020 — Buka Akses dengan Email Terdaftar

Sistem harus memungkinkan pengguna lama membuka akses menggunakan email yang sudah terdaftar.

---

# 13. Non-Functional Requirements

## 13.1 Usability

* UI harus sederhana dan mudah digunakan oleh pengguna percetakan.
* Input angka harus jelas satuannya, seperti cm, m², %, Rp, dan lembar.
* Output utama harus langsung terlihat setelah input dimasukkan.
* Visualisasi layout dan potongan harus mudah dipahami.

## 13.2 Performance

* Perhitungan harus terjadi secara cepat dan real-time setelah input berubah.
* Perubahan ukuran, jumlah, bleed, waste, dan rotasi harus langsung memperbarui output.

## 13.3 Responsiveness

* Halaman harus dapat digunakan di desktop dan mobile.
* Tabel, preview, dan form input harus tetap terbaca pada layar kecil.

## 13.4 Data Validation

* Field wajib tidak boleh kosong.
* Input numerik tidak boleh bernilai negatif.
* Email harus menggunakan format valid.
* Jumlah halaman saddle stitch harus divalidasi sebagai kelipatan 4.

## 13.5 Access Control

* Fitur potong plano dan fitur custom tertentu hanya tersedia untuk pengguna terdaftar.
* Pengguna yang belum terdaftar harus diarahkan ke form registrasi.

---

# 14. Acceptance Criteria

## AC-001 — Layout Cetak

**Given** pengguna memilih ukuran kertas dan mengisi ukuran desain,
**When** sistem menghitung layout,
**Then** sistem menampilkan pcs per lembar, lembar dibutuhkan, susunan kolom × baris, area terbuang, dan preview lembar.

## AC-002 — Optimasi Rotasi

**Given** pengguna memilih opsi “Putar jika lebih efisien”,
**When** orientasi rotasi menghasilkan jumlah item lebih banyak,
**Then** sistem menggunakan hasil rotasi sebagai layout terbaik.

## AC-003 — Estimasi Harga Layout

**Given** pengguna mengisi harga per rim, jumlah lembar per rim, dan margin waste,
**When** jumlah lembar produksi sudah diketahui,
**Then** sistem menampilkan lembar bersih, tambah waste, total lembar order, harga per lembar, dan estimasi biaya kertas.

## AC-004 — Kalkulator Buku

**Given** pengguna mengisi ukuran kertas cetak, ukuran buku jadi, jumlah halaman, jumlah eksemplar, mode cetak, cover, dan jilid,
**When** sistem menghitung kebutuhan buku,
**Then** sistem menampilkan buku per lembar, halaman final, lembar isi per buku, cover per lembar, lembar per buku, total produksi, waste, dan rekomendasi order.

## AC-005 — Estimasi Harga Buku

**Given** pengguna mengisi harga rim isi, harga rim cover, jumlah lembar per rim, dan margin waste,
**When** sistem menghitung biaya buku,
**Then** sistem menampilkan biaya kertas isi, biaya kertas cover, total estimasi kertas, dan biaya per eksemplar.

## AC-006 — Potong Plano

**Given** pengguna terdaftar mengisi ukuran plano dan ukuran potongan utama,
**When** sistem menghitung pemotongan,
**Then** sistem menampilkan hasil per lembar plano, waste, skema alternatif, dan visualisasi potongan.

## AC-007 — Akses Potong Plano

**Given** pengguna belum terdaftar membuka fitur Potong Plano,
**When** fitur ditampilkan,
**Then** sistem menampilkan informasi fitur premium dan tombol daftar untuk membuka akses.

## AC-008 — Estimasi Waktu

**Given** pengguna mengaktifkan minimal satu jenis pekerjaan,
**When** sistem menghitung estimasi,
**Then** sistem menampilkan total waktu pengerjaan, estimasi selesai, dan breakdown.

## AC-009 — Finishing Tambahan

**Given** pengguna memilih finishing tambahan,
**When** pekerjaan aktif memiliki total lembar,
**Then** sistem menghitung tambahan waktu finishing berdasarkan aturan setup dan kecepatan pengerjaan.

## AC-010 — Registrasi

**Given** pengguna mengisi nama lengkap, email valid, dan nomor WhatsApp,
**When** pengguna menekan “Daftar & Buka Akses”,
**Then** sistem membuka akses ke semua fitur kalkulator.

---

# 15. Out of Scope

PRD ini tidak mencakup fitur di luar halaman Hitung Kertas. Fitur berikut tidak termasuk dalam cakupan:

1. Manajemen user admin kompleks.
2. Login Google/Firebase.
3. Penyimpanan histori order.
4. Export PDF.
5. Export CSV.
6. Integrasi payment gateway.
7. Integrasi database produksi percetakan.
8. Workflow approval.
9. Multi-cabang.
10. Multi-currency.
11. Perhitungan pajak, PPN, margin profit, atau diskon.

---

# 16. Prioritas Pengembangan

## P0 — Wajib

1. Layout Cetak
2. Kalkulator Buku
3. Estimasi biaya kertas layout
4. Estimasi biaya kertas buku
5. Potong Plano
6. Estimasi Waktu
7. Finishing Tambahan
8. Registrasi akses

## P1 — Penting

1. Preview visual layout cetak
2. Visualisasi potongan plano
3. Skema alternatif potong plano
4. Simpan ukuran custom
5. Buka akses dengan email terdaftar

## P2 — Pendukung

1. Chat CS
2. Donasi / Buy me an Iced Latte
3. Pesan status akses
4. Empty state ketika belum ada pekerjaan aktif

---

# 17. Kesimpulan

Fitur Hitung Kertas harus dibangun sebagai kalkulator cetak lengkap dengan empat modul utama: Layout Cetak, Kalkulator Buku, Potong Plano, dan Estimasi Waktu. Seluruh input, output, pilihan preset, fitur waste, estimasi harga, finishing tambahan, visualisasi, dan sistem akses harus mengikuti struktur yang tersedia pada website acuan, tanpa menambahkan fitur lain di luar cakupan halaman tersebut.
