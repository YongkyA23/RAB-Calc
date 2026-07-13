# Hitung Kertas — Revised Internal Integration Implementation Plan

> Plan ini menggantikan seluruh rencana Hitung Kertas sebelumnya. Implementasi harus menjadi fitur internal RAB Calculator, bukan aplikasi publik atau produk terpisah.

**Goal:** Menambahkan fitur Hitung Kertas untuk seluruh user aktif RAB Calculator, terintegrasi ke menu dan `AppShell` yang sudah ada, dengan empat modul kalkulasi produksi, penyimpanan Firestore, dan tanpa registrasi tambahan atau access gate.

**Architecture:** Route `/hitung-kertas` tetap berada di dalam alur autentikasi aplikasi saat ini. `PaperCalculatorContainer` mengorkestrasi draft empat modul dan persistence Firestore, `PaperCalculatorView` merender UI mengikuti pola Tailwind aplikasi, dan kalkulasi berada di pure domain functions yang tidak bergantung pada React atau Firebase.

**Tech Stack:** React 19, React Router, Tailwind CSS v4, shared UI components aplikasi, Lucide React, Vitest, Testing Library.

---

## 1. Urutan sumber keputusan

Jika ada konflik requirement, gunakan prioritas berikut:

1. Instruksi terbaru user pada 13 Juli 2026.
2. Rumus produksi di `CalculateFunctions.md`.
3. Modul dan output di `NewPRD.md` yang tidak berkaitan dengan registrasi atau access gate.
4. Arsitektur, komponen, dan styling aplikasi RAB Calculator yang sudah ada.

Konsekuensinya, requirement registrasi dan access-lock khusus kalkulator pada PRD lama tidak berlaku:

- Public calculator yang melewati autentikasi aplikasi.
- Premium lock atau penguncian Potong Plano.
- Registrasi khusus kalkulator.
- Buka akses menggunakan email terdaftar.
- FR-014, FR-019, FR-020, AC-007, AC-010, dan access-lock pada `CalculateFunctions.md` bagian 5.7 serta bagian 9.

Semua user yang sudah lolos autentikasi dan berstatus aktif di aplikasi memperoleh akses langsung ke seluruh modul.

---

## 2. Pengalaman user yang dituju

1. User login menggunakan mekanisme Google dan allowlist aplikasi yang sekarang.
2. Sidebar desktop dan navigasi mobile menampilkan menu **Hitung Kertas**.
3. Menu membuka `/hitung-kertas` di dalam `AppShell`.
4. Header aplikasi menampilkan judul dan deskripsi Hitung Kertas seperti halaman internal lain.
5. Di dalam halaman terdapat empat tab:
   - Layout Cetak
   - Kalkulator Buku
   - Potong Plano
   - Estimasi Waktu
6. Semua tab langsung dapat digunakan tanpa proses unlock.
7. Perhitungan berubah real-time ketika input berubah.
8. Draft setiap tab tetap tersimpan selama halaman belum ditutup, sehingga perpindahan tab tidak menghapus input.
9. Draft aktif dipulihkan dari Firestore ketika user kembali membuka halaman.
10. User dapat menyimpan hasil yang valid dan membuka kembali riwayat perhitungan.
11. Ukuran custom tersimpan di Firestore dan tersedia untuk seluruh user aktif.

---

## 3. Keputusan UI dan styling

- Jangan membuat landing page, header, logo, warna, atau stylesheet bertema khusus.
- Gunakan bahasa visual aplikasi saat ini:
  - latar `#eef2f7` dari `AppShell`;
  - panel putih/slate;
  - `blue-600` sebagai warna utama;
  - card `rounded-4xl`, border putih/slate, dan shadow yang sama dengan Dashboard/Estimasi;
  - heading `font-black tracking-tight text-slate-950`;
  - label kecil uppercase biru seperti halaman lain.
- Gunakan `Button`, `Field`, `Input`, `Select`, dan `Card` dari `src/components/ui` apabila kontraknya sesuai.
- Gunakan utility Tailwind di JSX. Jangan menambah `PaperCalculator.css` terpisah kecuali ada kebutuhan teknis yang tidak dapat diekspresikan dengan Tailwind.
- Layout desktop mengikuti pola worksheet aplikasi: input di kolom utama dan hasil/preview sticky di kolom kanan.
- Layout mobile bertumpuk dan tab dapat di-scroll secara horizontal tanpa overflow halaman.
- Preview SVG menggunakan geometry dari domain calculator; komponen preview tidak menghitung ulang rumus.

---

## 4. Keputusan data dan persistence

- Rumus kalkulasi tetap dijalankan di client; Firestore hanya menangani persistence dan retrieval.
- State input disimpan di `PaperCalculatorContainer` sebagai raw strings agar nilai kosong dan desimal yang sedang diketik tetap aman.
- Draft aktif di-autosave ke Firestore per user dengan debounce 500–800 ms, sehingga tidak ada write pada setiap keystroke.
- Draft yang belum lengkap boleh disimpan; hasil historis hanya dapat disimpan jika kalkulasi berstatus `ready`.
- Tombol **Simpan Perhitungan** membuat snapshot immutable dari module, input, output, dan metadata user.
- Riwayat hasil dapat dilihat kembali oleh seluruh user aktif, konsisten dengan data estimates dan vendor estimates pada aplikasi.
- Ukuran custom menjadi library bersama di Firestore. Creator atau Admin dapat menghapusnya.
- Semua payload memakai `schemaVersion: 1` dan timestamp ISO yang konsisten dengan helper Firestore aplikasi saat ini.
- Error load/save ditampilkan melalui shared `ToastProvider`; kalkulasi lokal tetap dapat berjalan ketika write gagal.

### Firestore collections

#### `paperCalculatorDrafts/{uid}`

```js
{
  schemaVersion: 1,
  userId: 'firebase-uid',
  activeTab: 'layout',
  drafts: { layout: {}, book: {}, plano: {}, time: {} },
  updatedAt: 'ISO-8601'
}
```

- Satu document per user.
- Hanya owner yang dapat read/write.
- Digunakan untuk restore workspace, bukan riwayat.

#### `paperCalculations/{calculationId}`

```js
{
  schemaVersion: 1,
  id: 'generated-id',
  title: 'A3+ · Kartu Nama · 1000 pcs',
  module: 'layout',
  inputs: {},
  result: {},
  createdBy: 'firebase-uid',
  createdByName: 'User Name',
  createdAt: 'ISO-8601'
}
```

- Seluruh user aktif dapat membaca riwayat.
- User aktif dapat membuat record dengan `createdBy` miliknya sendiri.
- Record bersifat immutable; hanya creator atau Admin yang dapat delete.

#### `paperCustomSizes/{sizeId}`

```js
{
  schemaVersion: 1,
  id: 'generated-id',
  type: 'paper',
  label: 'Plano Supplier A',
  width: 65,
  height: 100,
  createdBy: 'firebase-uid',
  createdByName: 'User Name',
  createdAt: 'ISO-8601',
  updatedAt: 'ISO-8601'
}
```

- Type yang valid: `paper`, `book`, atau `plano`.
- Seluruh user aktif dapat membaca dan memakai ukuran.
- Hanya creator atau Admin yang dapat update/delete.

---

## 5. Struktur file target

### Modify

- `src/App.jsx`
- `src/features/auth/authRules.js`
- `src/features/auth/authRules.test.js`
- `src/features/shell/AppShell.jsx`
- `src/features/shell/AppShell.test.jsx`
- `src/features/dashboard/DashboardView.jsx`
- `src/firebase/collections.js`
- `src/firebase/payloads.js`
- `src/firebase/payloads.test.js`
- `src/firebase/firestoreHelpers.js`
- `src/firebase/firestoreHelpers.test.js`
- `firestore.rules`

### Create or rewrite

- `src/features/paperCalculator/PaperCalculatorContainer.jsx`
- `src/features/paperCalculator/PaperCalculatorContainer.test.jsx`
- `src/features/paperCalculator/PaperCalculatorView.jsx`
- `src/features/paperCalculator/PaperCalculatorView.test.jsx`
- `src/features/paperCalculator/paperCalculatorDefaults.js`
- `src/features/paperCalculator/domain/numbers.js`
- `src/features/paperCalculator/domain/numbers.test.js`
- `src/features/paperCalculator/domain/resultState.js`
- `src/features/paperCalculator/domain/layoutCalculator.js`
- `src/features/paperCalculator/domain/layoutCalculator.test.js`
- `src/features/paperCalculator/domain/bookCalculator.js`
- `src/features/paperCalculator/domain/bookCalculator.test.js`
- `src/features/paperCalculator/domain/planoCalculator.js`
- `src/features/paperCalculator/domain/planoCalculator.test.js`
- `src/features/paperCalculator/domain/timeRules.js`
- `src/features/paperCalculator/domain/timeCalculator.js`
- `src/features/paperCalculator/domain/timeCalculator.test.js`
- `src/features/paperCalculator/components/CalculatorTabs.jsx`
- `src/features/paperCalculator/components/CalculatorField.jsx`
- `src/features/paperCalculator/components/PresetButtons.jsx`
- `src/features/paperCalculator/components/ResultMetric.jsx`
- `src/features/paperCalculator/components/ValidationSummary.jsx`
- `src/features/paperCalculator/components/CustomSizeControls.jsx`
- `src/features/paperCalculator/components/SavedCalculationsPanel.jsx`
- `src/features/paperCalculator/persistence/paperCalculatorPersistence.js`
- `src/features/paperCalculator/persistence/paperCalculatorPersistence.test.js`
- `src/features/paperCalculator/modules/LayoutCalculatorPanel.jsx`
- `src/features/paperCalculator/modules/BookCalculatorPanel.jsx`
- `src/features/paperCalculator/modules/PlanoCalculatorPanel.jsx`
- `src/features/paperCalculator/modules/TimeEstimatorPanel.jsx`
- `src/features/paperCalculator/previews/LayoutPreview.jsx`
- `src/features/paperCalculator/previews/LayoutPreview.test.jsx`
- `src/features/paperCalculator/previews/PlanoPreview.jsx`
- `src/features/paperCalculator/previews/PlanoPreview.test.jsx`

File partial yang saat ini belum tracked—`paperCalculatorDefaults.js`, `domain/numbers.js`, dan `domain/resultState.js`—harus direview terhadap plan ini dan diberi test sebelum dianggap reusable.

---

## Task 0: Kunci arsitektur internal dan baseline

**Files:**

- Verify: `src/App.jsx`
- Verify: `src/features/paperCalculator/`

- [ ] Pastikan `src/App.jsx` tetap memakai satu alur auth existing dan tidak memindahkan aplikasi internal ke wrapper `InternalApp`.
- [ ] Pastikan tidak ada route `/hitung-kertas` di luar return authenticated yang membungkus `AppShell`.
- [ ] Jalankan baseline `npm test`, `npm run lint`, dan `npm run build` sebelum menulis feature baru.
- [ ] Catat failure existing; jangan mencampur perbaikannya ke scope ini kecuali perubahan feature menyentuh file yang sama.

**Exit criteria:** aplikasi existing kembali menjadi satu-satunya shell dan baseline terdokumentasi.

---

## Task 1: Integrasikan menu dan route ke aplikasi existing

**Files:**

- Modify: `src/features/auth/authRules.js`
- Modify: `src/features/auth/authRules.test.js`
- Modify: `src/features/shell/AppShell.jsx`
- Modify: `src/features/shell/AppShell.test.jsx`
- Modify: `src/App.jsx`
- Modify: `src/features/dashboard/DashboardView.jsx`
- Create: skeleton `src/features/paperCalculator/PaperCalculatorContainer.jsx`

- [ ] Tambahkan navigation item:

  ```js
  { key: 'paperCalculator', label: 'Hitung Kertas', adminOnly: false }
  ```

- [ ] Tambahkan title, description, icon, route, dan path detection `paperCalculator` pada `AppShell`.
- [ ] Gunakan path internal `/hitung-kertas`.
- [ ] Lazy-load `PaperCalculatorContainer` di `App.jsx`.
- [ ] Tambahkan route sebelum wildcard redirect dan tetap di dalam `AppShell` serta protected auth flow.
- [ ] Pass `profile` ke container untuk scope preset custom user.
- [ ] Tambahkan quick action Hitung Kertas pada Dashboard tanpa mengganti menu utama sebagai entry point canonical.
- [ ] Tambahkan test bahwa Admin dan Estimator sama-sama melihat menu Hitung Kertas.
- [ ] Tambahkan test bahwa path `/hitung-kertas` menghasilkan heading Hitung Kertas dan active navigation yang benar.
- [ ] Pastikan user signed-out tetap melihat login existing, bukan calculator.

**Exit criteria:** setelah login, menu tersedia pada desktop/mobile dan route render di dalam shell tanpa mengubah route existing.

---

## Task 2: Bangun fondasi angka, preset, result state, dan shared UI

**Domain contracts:**

- Raw input tetap string di React state.
- `parseCalculatorDecimal` menerima `29,7` dan `29.7`.
- `parseWholeQuantity` hanya menerima bilangan bulat non-negatif.
- `parseIdrInput` memahami separator ribuan tanpa mengubah `1.000.000` menjadi angka desimal.
- Dimensi pembagi wajib `> 0`.
- Gap, waste, harga, dan quantity opsional boleh kosong atau nol sesuai konteks.
- Hasil memiliki status stabil: `empty`, `invalid`, `no-fit`, atau `ready`.
- Output yang belum dapat dihitung menggunakan `—`; jangan membocorkan `NaN` atau `Infinity`.
- Output Rupiah memakai `formatIdr` dari `src/lib/format.js`.

**Preset:**

- Kertas: A3+ `48×32`, A3 `42×29.7`, A4 `29.7×21`, A5 `21×14.8`.
- Buku: A5 `14.8×21`, A4 `21×29.7`, A6 `10.5×14.8`, `17×24`.
- Plano: `65×100`, `79×109`, `61×86`, `72×102`.

- [ ] Tulis test parser untuk blank, whitespace, koma/titik desimal, IDR grouping, nilai negatif, integer-only, dan angka tidak finite.
- [ ] Review lalu rewrite helper partial yang sudah ada jika kontraknya tidak sesuai.
- [ ] Implement shared field yang selalu menampilkan label, satuan, error, dan accessible name.
- [ ] Implement preset buttons dengan state selected yang mengikuti styling button aplikasi.
- [ ] Implement metrics dan validation summary menggunakan palette slate/blue/rose existing.
- [ ] Implement tab dengan semantics `tablist`, `tab`, `tabpanel`, keyboard arrows, Enter/Space, dan focus state.

**Exit criteria:** semua modul memakai satu parsing/validation contract dan shared UI tidak memperkenalkan design system baru.

---

## Task 3: Implement Layout Cetak

**Input:** ukuran kertas, ukuran desain, gap/bleed, jumlah pcs opsional, izin rotasi, harga/rim, isi/rim default 500, dan waste persen.

**Formula utama:**

```text
columns = floor((paperWidth + gap) / (designWidth + gap))
rows = floor((paperHeight + gap) / (designHeight + gap))
pcsPerSheet = columns × rows
requiredSheets = ceil(requiredQty / pcsPerSheet)
wasteSheets = ceil(requiredSheets × wastePercent / 100)
totalOrderSheets = requiredSheets + wasteSheets
pricePerSheet = pricePerRim / sheetsPerRim
estimatedPaperCost = totalOrderSheets × pricePerSheet
```

- [ ] Test normal, rotated, tie normal, no rotation, exact fit, design lebih besar dari kertas, gap, dan input invalid.
- [ ] Pilih rotated hanya jika kapasitasnya lebih besar; normal menang saat seri.
- [ ] Hitung paper area, used area, wasted area, dan wasted percent.
- [ ] Quantity kosong tetap mengizinkan preview dan kapasitas, tetapi kebutuhan/order/biaya tampil `—`.
- [ ] Harga kosong tidak membuat seluruh hasil layout invalid.
- [ ] Sheets-per-rim nol menghasilkan error biaya yang jelas, bukan pembagian nol.
- [ ] Bangun panel menggunakan card/input existing dan kalkulasi real-time.
- [ ] Bangun preview SVG dari placement rectangles domain.
- [ ] Batasi rectangle yang dirender untuk mencegah preview membeku pada potongan sangat kecil.
- [ ] Sertakan text summary yang setara dengan preview visual.

**Output:** pcs/lembar, lembar dibutuhkan, grid, orientasi, waste area/%, clean/waste/order sheets, harga/lembar, dan estimasi biaya.

**Exit criteria:** FR-002 sampai FR-005 dan AC-001 sampai AC-003 terpenuhi dalam tampilan internal app.

---

## Task 4: Implement Kalkulator Buku

**Input:** ukuran kertas cetak, ukuran buku jadi, halaman, eksemplar, duplex/simplex, jenis jilid, jenis cover, tebal punggung, harga rim isi/cover, isi/rim, dan waste.

**Formula utama:**

- Saddle dan perfect: `finalPages = ceil(ceil(pageCount) / 4) × 4`.
- Spiral: `finalPages = ceil(pageCount)`.
- Kapasitas buku/lembar membandingkan grid normal dan rotated tanpa gap.
- Duplex: `contentSheetsPerBook = ceil(finalPages / 2 / booksPerSheet)`.
- Simplex: `contentSheetsPerBook = ceil(finalPages / booksPerSheet)`.
- Cover soft/hard: `coverWidth = 2 × bookWidth + spineThickness`; `coverHeight = bookHeight`.
- Cover none: seluruh kebutuhan dan biaya cover nol.
- `coverSheetsTotal = ceil(copies / coverPerSheet)`.
- `contentSheetsTotal = contentSheetsPerBook × copies`.
- Waste isi dan cover dibulatkan terpisah agar rincian biaya transparan.
- `totalCost = contentCost + coverCost` dan `costPerCopy = totalCost / copies`.

- [ ] Test pembulatan halaman untuk saddle, perfect, spiral, nilai pecahan, dan bukan kelipatan empat.
- [ ] Test simplex/duplex, orientasi, cover fit/no-fit, no-cover, copies nol, dan harga kosong.
- [ ] Non-multiple-of-four pada saddle menampilkan warning tetapi tetap menghitung hasil rounded.
- [ ] Perfect binding menampilkan pembulatan otomatis dan rekomendasi kelipatan empat.
- [ ] Tampilkan catatan soft cover, penggunaan spine, dan referensi ketebalan 80 gsm secara kontekstual.
- [ ] Bangun panel dan result card mengikuti pola Layout Cetak.

**Output:** buku/lembar, halaman final, isi/buku, cover/lembar, lembar/buku, isi total, cover total, waste, order, biaya isi/cover/total, dan biaya per eksemplar.

**Exit criteria:** FR-006 sampai FR-009 dan AC-004 sampai AC-005 terpenuhi.

---

## Task 5: Implement Potong Plano tanpa gate

**Input:** ukuran plano, ukuran potongan, dan toggle maksimalkan sisa.

**Skema:**

1. Normal.
2. Rotated.
3. Optimasi strip sisa dari base normal sesuai heuristic dokumen, hanya ketika toggle aktif.

```text
columns = floor(planoWidth / effectiveCutWidth)
rows = floor(planoHeight / effectiveCutHeight)
totalCuts = columns × rows
usedArea = totalCuts × cutWidth × cutHeight
wasteArea = max(planoArea - usedArea, 0)
wastePercent = wasteArea / planoArea × 100
```

- [ ] Test normal, rotated, tie, no-fit, input nol/negatif, dan rectangle geometry.
- [ ] Untuk optimasi sisa, hitung right strip dan bottom strip tanpa overlap.
- [ ] Selalu bandingkan skema yang tersedia dan tandai skema dengan hasil tertinggi sebagai rekomendasi.
- [ ] Semua skema dapat dipilih dan preview menampilkan exact scheme terpilih.
- [ ] Potong Plano langsung render untuk semua user; jangan membuat `isRegistered`, `canAccessPlano`, locked state, CTA, atau access repository.
- [ ] Custom plano dimensions dan saved preset langsung aktif.

**Output:** hasil/plano, grid, orientasi, used/waste area, waste %, rekomendasi, daftar skema, dan preview.

**Exit criteria:** FR-010 sampai FR-013 dan AC-006 terpenuhi tanpa syarat tambahan selain login aplikasi.

---

## Task 6: Implement Estimasi Waktu dan Finishing

**Production rules:**

- A3+ simplex: `ceil(sheetCount / 15)` menit.
- A3+ duplex: `ceil(sheetCount / 8)` menit.
- Meter print: `ceil(areaM2 × 10)` menit.
- Kartu nama: `sheets = boxes × 20`; waktu `ceil(sheets / 15)`.
- Saddle: rounded pages `/4`, cetak `ceil(totalSheets / 10)`, jilid `ceil(copies × 1.5)`.
- Perfect: rounded pages `/2`, cetak `ceil(totalSheets / 10)`, jilid `ceil(copies × 3)`.
- Hard cover: rule lembar perfect, cetak `ceil(totalSheets / 10)`, manual `ceil(copies × 8)`.

**Finishing rules:**

- Laminasi 1 jenis: `30 + ceil(totalFinishingSheets / 15)` menit.
- Roll laminasi kedua: tambahan 15–20 menit dan hanya dapat dipilih bersama laminasi utama.
- Potong standar: `30 + sheets × 3` sampai `30 + sheets × 5`.
- Potong custom: `30 + sheets × 5` sampai `30 + sheets × 8`.
- Die cut: `45 + sheets × 2` sampai `60 + sheets × 3`.
- Kiss cut: `30 + sheets × 2` sampai `45 + sheets × 3`.

- [ ] Pindahkan semua rate ke named constants di `timeRules.js` agar mudah dikoreksi tanpa menyentuh UI.
- [ ] Test keenam job, setiap finishing option, kombinasi job, dan range min/max.
- [ ] Active job dengan input invalid tetap terlihat sebagai invalid, bukan dianggap tidak aktif.
- [ ] Meter print tidak menambah finishing sheets.
- [ ] Finishing tanpa job yang menghasilkan lembar menampilkan warning dan tidak menghasilkan angka palsu.
- [ ] Tambahkan start date/time dan hitung finish min/max menggunakan menit kalender lokal.
- [ ] Jelaskan bahwa ukuran buku informatif sampai ada rate berbasis ukuran yang disetujui.
- [ ] Jelaskan bahwa hasil tidak memperhitungkan jam kerja, antrean mesin, istirahat, atau hari libur.

**Output:** breakdown job, total finishing sheets, breakdown finishing, duration min/max, serta estimated finish min/max.

**Exit criteria:** FR-015 sampai FR-018 dan AC-008 sampai AC-009 terpenuhi.

---

## Task 7: Implement Firestore persistence, riwayat, dan custom sizes

**Files:**

- Modify: `src/firebase/collections.js`
- Modify: `src/firebase/payloads.js`
- Modify: `src/firebase/payloads.test.js`
- Modify: `src/firebase/firestoreHelpers.js`
- Modify: `src/firebase/firestoreHelpers.test.js`
- Modify: `firestore.rules`
- Create: `src/features/paperCalculator/persistence/paperCalculatorPersistence.js`
- Create: `src/features/paperCalculator/persistence/paperCalculatorPersistence.test.js`
- Create: `src/features/paperCalculator/components/SavedCalculationsPanel.jsx`
- Modify: `src/features/paperCalculator/components/CustomSizeControls.jsx`
- Modify: `src/features/paperCalculator/PaperCalculatorContainer.jsx`
- Modify: `src/features/paperCalculator/PaperCalculatorView.jsx`

**Firestore helper contract:**

- `getPaperCalculatorDraft(userId)`
- `savePaperCalculatorDraft(userId, workspace)`
- `listPaperCalculations()`
- `savePaperCalculation(calculation, profile)`
- `deletePaperCalculation(calculationId)`
- `listPaperCustomSizes()`
- `savePaperCustomSize(size, profile)`
- `deletePaperCustomSize(sizeId)`

- [ ] Tambahkan tiga nama collection ke `COLLECTIONS`.
- [ ] Buat payload builders yang whitelist field; jangan menyimpan state React, function, `undefined`, atau object non-serializable.
- [ ] Simpan `schemaVersion: 1` pada semua document.
- [ ] Buat direct-document read/write untuk draft pada ID `profile.uid`.
- [ ] Container harus menyelesaikan hydration draft sebelum mengaktifkan autosave agar default kosong tidak menimpa data Firestore.
- [ ] Autosave `activeTab` dan keempat raw draft menggunakan debounce 500–800 ms.
- [ ] Tampilkan status ringkas `Menyimpan…`, `Tersimpan`, atau error tanpa menghalangi kalkulasi lokal.
- [ ] Tombol **Simpan Perhitungan** hanya aktif untuk result `ready` dan menyimpan input serta result module aktif.
- [ ] Gunakan title yang dapat diedit dengan default ringkas dari module dan preset/dimensi utama.
- [ ] Render **Riwayat Perhitungan** dengan module, title, creator, timestamp, tombol buka, dan tombol hapus sesuai permission.
- [ ] Membuka riwayat menyalin snapshot input ke draft module terkait lalu mengaktifkan tab tersebut; record asli tidak berubah.
- [ ] Urutkan riwayat berdasarkan `createdAt` descending.
- [ ] Validasi custom-size type `paper`, `book`, atau `plano` dan dimensi positif.
- [ ] Deduplicate custom sizes berdasarkan type + normalized width + normalized height sebelum create.
- [ ] Ukuran Firestore yang baru tersimpan langsung muncul pada preset module terkait.
- [ ] Seluruh user aktif dapat memakai library ukuran; creator atau Admin melihat aksi delete.
- [ ] Gunakan shared toast untuk load/save/delete errors dan lakukan optimistic UI hanya jika rollback-nya jelas.

### Firestore security rules

- [ ] `paperCalculatorDrafts/{uid}`: read/create/update/delete hanya ketika `hasActiveProfile()` dan `request.auth.uid == uid`.
- [ ] `paperCalculations/{id}`: read untuk seluruh active profile; create hanya jika `request.resource.data.createdBy == request.auth.uid`.
- [ ] `paperCalculations/{id}`: update selalu ditolak; delete hanya creator atau Admin.
- [ ] `paperCustomSizes/{id}`: read untuk seluruh active profile; create hanya dengan `createdBy` current user.
- [ ] `paperCustomSizes/{id}`: update/delete hanya creator atau Admin dan ownership tidak boleh diubah.
- [ ] Field penting seperti `schemaVersion`, `module`, `type`, `width`, dan `height` divalidasi pada rule agar payload yang rusak ditolak.
- [ ] Verifikasi rule menggunakan Firebase emulator bila tersedia; minimal lakukan rules deploy dry-run dan manual permission matrix sebelum release.

**Tests:**

- [ ] Payload test untuk draft, calculation snapshot, custom size, stripping unknown fields, dan timestamp.
- [ ] Helper test untuk collection path, document ID, query ordering, save, load, delete, dan Firestore error propagation.
- [ ] Container test untuk hydration-before-autosave, debounced save, retry/error toast, serta tab-state persistence.
- [ ] UI test untuk save valid result, blok invalid result, open history, delete permission, dan custom-size synchronization.

**Exit criteria:** reload memulihkan draft dari Firestore, hasil valid dapat disimpan/dibuka kembali, dan custom sizes tersedia lintas perangkat sesuai permission.

---

## Task 8: Integrated verification dan regression review

### Automated checks

- [ ] `npm test -- src/features/paperCalculator`
- [ ] `npm test -- src/features/auth/authRules.test.js src/features/shell/AppShell.test.jsx`
- [ ] `npm test -- src/firebase/payloads.test.js src/firebase/firestoreHelpers.test.js`
- [ ] `npx eslint src/App.jsx src/features/auth/authRules.js src/features/shell/AppShell.jsx src/features/paperCalculator src/firebase`
- [ ] `npm test`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `git diff --check`

Target: tidak ada failure atau lint error baru. Failure baseline di luar feature dicatat terpisah.

### Browser checks

- [ ] Signed-out user tetap diarahkan ke login existing.
- [ ] Admin melihat Hitung Kertas pada sidebar desktop dan mobile nav.
- [ ] Estimator juga melihat menu dan dapat membuka semua modul.
- [ ] Refresh langsung pada `/hitung-kertas` tetap merender halaman setelah auth siap.
- [ ] Tidak ada route publik atau bypass auth.
- [ ] Tab switching mempertahankan input.
- [ ] Reload memulihkan draft module dan active tab dari Firestore.
- [ ] Simpan Perhitungan membuat record riwayat dan record dapat dibuka kembali.
- [ ] Firestore write failure menampilkan error tanpa menghentikan hasil real-time.
- [ ] Custom size yang dibuat pada satu sesi tersedia pada sesi/perangkat user lain.
- [ ] User biasa tidak dapat menghapus calculation/custom size milik user lain; Admin dapat.
- [ ] Koma desimal berfungsi pada seluruh field ukuran/persentase.
- [ ] Test pada lebar 320, 375, 768, 1024, dan 1440 px tanpa horizontal page overflow.
- [ ] Keyboard dapat mengoperasikan tab, preset, toggle, scheme selection, dan field.
- [ ] SVG memiliki text alternative dan tidak membeku pada input ekstrem.
- [ ] Browser console tidak memiliki error atau warning baru.

---

## 6. Revised acceptance criteria

1. User aktif melihat menu **Hitung Kertas** setelah login.
2. Menu membuka `/hitung-kertas` di dalam `AppShell` existing.
3. Admin dan Estimator sama-sama dapat memakai keempat modul secara langsung.
4. Tidak ada registrasi tambahan atau penguncian fitur khusus kalkulator.
5. Layout Cetak menghasilkan kapasitas, kebutuhan lembar, waste, biaya, dan preview yang sesuai rumus.
6. Kalkulator Buku menghasilkan pembulatan halaman, kebutuhan isi/cover, waste, order, dan biaya.
7. Potong Plano menghasilkan skema normal, rotated, optimasi sisa, rekomendasi, dan preview tanpa gate.
8. Estimasi Waktu menjumlahkan job aktif, finishing, range durasi, dan perkiraan selesai.
9. Seluruh hasil diperbarui real-time dan input tab lain tidak hilang saat berpindah modul.
10. Draft aktif tersimpan otomatis ke Firestore dan dipulihkan setelah reload.
11. Hasil valid dapat disimpan, dilihat dalam riwayat, dan dibuka kembali.
12. Custom sizes tersimpan di Firestore dan tersedia sesuai permission.
13. UI menggunakan shared components dan styling slate/white/blue aplikasi existing pada desktop maupun mobile.
14. Invalid, incomplete, no-fit, dan valid-zero dapat dibedakan tanpa `NaN` atau `Infinity`.
15. Test feature, Firestore helpers, integrasi shell, lint scoped, dan production build lulus tanpa regression baru.

---

## 7. Out of scope

- Public/signed-out calculator.
- Registrasi atau login kedua.
- Role/permission baru khusus calculator.
- Paywall, subscription, premium tier, atau payment.
- Order produksi dari hasil kalkulasi.
- Export PDF/CSV.
- Menyalin hasil otomatis ke Estimasi Harga.
- Kalender jam kerja, antrean mesin, dan hari libur pada estimasi selesai.

---

## 8. Urutan eksekusi yang direkomendasikan

1. Cleanup dan baseline.
2. Navigation + protected route.
3. Shared domain foundation.
4. Layout Cetak.
5. Kalkulator Buku.
6. Potong Plano tanpa gate.
7. Estimasi Waktu.
8. Firestore persistence, riwayat, dan custom sizes.
9. Full regression + browser QA.

Setiap task menggunakan urutan test-first: tambahkan failing test, implementasikan behavior minimum, jalankan focused test, lalu lanjut ke task berikutnya.
