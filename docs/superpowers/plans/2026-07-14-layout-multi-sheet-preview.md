# Layout Cetak — Multi-Sheet Preview Implementation Plan

**Goal:** Mengembangkan preview Layout Cetak agar merepresentasikan seluruh kebutuhan produksi sebagai beberapa lembar, termasuk lembar terakhir yang hanya terisi sebagian.

**Contoh target:** jika jumlah dibutuhkan `125 pcs` dan kapasitas layout `10 pcs / lembar`, hasil harus menjelaskan `13 lembar`: `12 lembar penuh × 10 pcs` dan `1 lembar sisa × 5 pcs`. User dapat berpindah dari preview lembar pertama sampai lembar ke-13 dan melihat hanya 5 slot terisi pada lembar terakhir.

**Scope:** perubahan ini hanya untuk modul **Layout Cetak**. Kalkulator Buku, Potong Plano, Estimasi Waktu, route, autentikasi, dan menu aplikasi tidak berubah.

**Terminologi UI:** gunakan kata **lembar**, bukan `page`, agar tidak tertukar dengan halaman buku. Nama internal React/domain juga memakai `sheet`.

**Dasar requirement:** `NewPRD.md` bagian 5.4 sudah menetapkan output **Preview lembar** dan **Navigasi lembar**. Perubahan ini melengkapi implementasi existing agar navigasinya mengikuti quantity produksi aktual.

---

## 1. Keputusan produk dan perilaku

1. Preview tetap menampilkan satu SVG pada satu waktu, lalu menyediakan navigasi antarlembar.
2. Jangan merender seluruh lembar sekaligus. Order dapat memiliki ratusan atau ribuan lembar dan tidak boleh membuat DOM/SVG sangat besar.
3. Tampilkan ringkasan produksi di atas atau di bawah preview:
   - `12 lembar penuh × 10 pcs`;
   - `1 lembar sisa × 5 pcs`.
4. Lembar penuh menampilkan seluruh slot terisi.
5. Lembar parsial menampilkan:
   - slot terisi dengan warna biru existing;
   - slot yang belum digunakan sebagai outline/dashed slate yang tetap memperlihatkan kapasitas layout.
6. Preview menghitung **lembar bersih** dari `requiredSheets`, bukan `totalOrderSheets`.
7. Waste produksi tetap muncul pada metrik hasil dan biaya, tetapi tidak dibuat sebagai lembar berisi item pada preview.
8. Jika jumlah dibutuhkan kosong, pertahankan perilaku saat ini: tampilkan satu template kapasitas maksimum tanpa pagination.
9. Index lembar aktif adalah state presentasi lokal. Index tersebut tidak perlu disimpan ke Firestore.
10. Perubahan input ukuran, gap, rotasi, atau quantity harus mengembalikan preview ke lembar pertama secara deterministik.

---

## 2. Model kalkulasi yang ditambahkan

Tambahkan breakdown serializable ke hasil `calculateLayout`:

```js
sheetPreview: {
  mode: 'production',
  totalSheets: 13,
  fullSheets: 12,
  partialSheets: 1,
  partialItems: 5,
  lastSheetItems: 5,
}
```

Jika quantity habis dibagi kapasitas:

```js
// 120 pcs, 10 pcs / lembar
sheetPreview: {
  mode: 'production',
  totalSheets: 12,
  fullSheets: 12,
  partialSheets: 0,
  partialItems: 0,
  lastSheetItems: 10,
}
```

Jika quantity kosong:

```js
sheetPreview: {
  mode: 'capacity',
  totalSheets: 1,
  fullSheets: null,
  partialSheets: 0,
  partialItems: null,
  lastSheetItems: 10,
}
```

Rumus produksi:

```text
totalSheets    = ceil(requiredQty / pcsPerSheet)
fullSheets     = floor(requiredQty / pcsPerSheet)
partialItems   = requiredQty % pcsPerSheet
partialSheets  = partialItems > 0 ? 1 : 0
lastSheetItems = partialItems > 0 ? partialItems : pcsPerSheet
```

Jangan membuat array sepanjang `totalSheets`. Domain hanya menyimpan metadata konstan di atas. Jumlah item untuk lembar aktif dihitung on demand:

```text
Jika mode capacity                 → pcsPerSheet
Jika sheetNumber < totalSheets     → pcsPerSheet
Jika sheetNumber = totalSheets     → lastSheetItems
```

---

## 3. Perubahan file

### Task 1 — Tambahkan breakdown multi-lembar pada domain

**Modify:**

- `src/features/paperCalculator/domain/layoutCalculator.js`
- `src/features/paperCalculator/domain/layoutCalculator.test.js`

**Implementation:**

- Tambahkan pure helper `buildSheetPreview(requiredQty, pcsPerSheet)`.
- Tambahkan pure helper `getSheetItemCount(sheetPreview, pcsPerSheet, sheetNumber)` atau helper setara.
- Masukkan `sheetPreview` ke `result.data` hanya setelah kapasitas layout diketahui.
- Pertahankan `requiredSheets` sebagai source of truth untuk jumlah lembar bersih.
- Jangan mengubah rumus ukuran, gap, rotasi, waste, atau biaya.
- Untuk status `no-fit`, jangan membuat jumlah lembar tak hingga; gunakan metadata preview kosong/null yang aman.
- Jangan memasukkan React state atau fungsi ke object hasil karena hasil dapat disimpan sebagai snapshot Firestore.

**Domain tests:**

- `125 pcs / 10` menghasilkan 13 total, 12 penuh, dan 5 item terakhir.
- `120 pcs / 10` menghasilkan 12 lembar penuh tanpa lembar parsial.
- `5 pcs / 10` menghasilkan 1 lembar parsial dengan 5 item.
- Quantity kosong menghasilkan mode `capacity` dan satu template penuh.
- Layout tidak muat tetap menghasilkan `no-fit` tanpa `Infinity`/`NaN`.
- Quantity sangat besar tidak menghasilkan array per lembar.

### Task 2 — Ubah preview menjadi preview lembar aktif

**Modify:**

- `src/features/paperCalculator/previews/LayoutPreview.jsx`
- `src/features/paperCalculator/previews/LayoutPreview.test.jsx`

**Implementation:**

- Simpan navigasi sebagai state lokal 1-based: `activeSheet`.
- Gunakan signature dari input geometry, orientasi, kapasitas, dan quantity agar state lama tidak terbawa saat hasil kalkulasi berubah.
- Hindari sinkronisasi `setState` langsung di `useEffect`; derive lembar aktif dari signature dan state navigasi agar lolos aturan lint React yang ada.
- Ambil `visibleItemCount` melalui helper domain, bukan menghitung ulang formula produksi di JSX.
- Render semua slot yang tersedia sebagai outline slate, lalu overlay hanya `visibleItemCount` slot pertama sebagai item biru.
- Tetap hormati batas `placements` existing (maksimal 500 rectangle) dan tampilkan caption bila kapasitas aktual lebih besar dari rectangle yang dirender.
- Ubah accessible name SVG menjadi contoh: `Lembar 13 dari 13, 5 dari 10 slot terisi pada kertas 48 × 32 cm`.
- Tambahkan status teks dengan `aria-live="polite"` agar perpindahan lembar diumumkan screen reader.

### Task 3 — Tambahkan navigasi dan ringkasan lembar

**Modify:**

- `src/features/paperCalculator/previews/LayoutPreview.jsx`

**Controls:**

- Tombol lembar pertama.
- Tombol lembar sebelumnya.
- Label `Lembar 1 dari 13`.
- Tombol lembar berikutnya.
- Tombol lembar terakhir.

Gunakan icon Lucide yang konsisten dengan aplikasi. Setiap tombol harus:

- menggunakan elemen `<button type="button">`;
- mempunyai `aria-label` yang eksplisit;
- mempunyai focus ring yang terlihat;
- mempunyai target sentuh minimal 44 × 44 px;
- disabled pada boundary yang sesuai;
- tidak bergantung pada hover.

Jangan membuat 1 tombol untuk setiap lembar karena jumlah lembar dapat sangat besar. Tombol pertama/terakhir memberi akses cepat tanpa membuat DOM tumbuh mengikuti order.

**Ringkasan:**

- Mode production dengan sisa: `12 lembar penuh × 10 pcs` dan `1 lembar sisa × 5 pcs`.
- Mode production tanpa sisa: `12 lembar penuh × 10 pcs`.
- Mode capacity: `Kapasitas maksimum 10 pcs / lembar` dan navigasi disembunyikan.
- Lembar aktif menampilkan badge `10 / 10 pcs` atau `5 / 10 pcs`.
- Jika waste lebih dari nol, tampilkan catatan sekunder seperti `Preview: 13 lembar bersih · +1 lembar waste pada total order` agar jumlah pager dan metrik total order tidak terlihat bertentangan.

### Task 4 — Integrasikan tanpa mengubah layout panel

**Review/modify only if needed:**

- `src/features/paperCalculator/modules/LayoutCalculatorPanel.jsx`

`LayoutCalculatorPanel` tetap merender `<LayoutPreview result={result} />` di kolom kanan. Jangan pindahkan pagination ke container utama dan jangan masukkan `activeSheet` ke workspace draft karena:

- bukan input kalkulasi;
- tidak perlu autosave;
- tidak perlu masuk history Firestore;
- tidak boleh memicu write draft ketika user hanya melihat lembar berikutnya.

Styling mengikuti card existing: white/slate surfaces, `blue-600`, radius, shadow, spacing, dan typography yang sudah dipakai. Tidak membuat stylesheet atau tema baru.

### Task 5 — Pastikan persistence tetap kompatibel

**Review:**

- `src/features/paperCalculator/PaperCalculatorContainer.jsx`
- `src/firebase/payloads.js`
- `src/features/paperCalculator/persistence/paperCalculatorPersistence.js`

Tidak diperlukan collection, document, index, atau security rule Firestore baru. `sheetPreview` merupakan tambahan field nested pada snapshot hasil yang sudah disanitasi oleh payload existing.

Compatibility requirements:

- calculation lama tetap dapat dibuka karena workspace direkonstruksi dari `inputs`, lalu hasil dihitung ulang;
- `schemaVersion` tetap `1` karena perubahan bersifat additive dan tidak mengubah bentuk input tersimpan;
- index lembar aktif tidak disimpan.

---

## 4. Test dan QA plan

### Automated tests

1. Jalankan domain test:

```powershell
npm test -- src/features/paperCalculator/domain/layoutCalculator.test.js
```

2. Jalankan preview test:

```powershell
npm test -- src/features/paperCalculator/previews/LayoutPreview.test.jsx
```

3. Jalankan seluruh fitur Hitung Kertas:

```powershell
npm test -- src/features/paperCalculator
```

4. Jalankan scoped lint dan production build:

```powershell
npx eslint src/features/paperCalculator
npm run build
```

### Component test cases

- Initial view berada di lembar 1 dan tombol first/previous disabled.
- Next berpindah ke lembar 2.
- Last langsung berpindah ke lembar 13.
- Pada lembar 13 hanya 5 slot biru; 5 slot lain tetap terlihat sebagai slot kosong.
- Previous dari lembar terakhir kembali ke lembar 12 dengan 10 slot terisi.
- Next/last disabled pada lembar terakhir.
- Perubahan result dari 13 lembar menjadi 2 lembar mereset tampilan ke lembar 1.
- Quantity kosong tidak menampilkan pager.
- Accessible name dan live status menyebut nomor lembar dan item terisi.
- Kapasitas lebih dari 500 tetap menampilkan caption pembatasan render.

### Browser QA

- Desktop: 125 pcs, kapasitas 10, verifikasi summary dan lembar 1/12/13.
- Mobile 375 px: kontrol tidak overflow dan setiap tombol mudah disentuh.
- Keyboard: seluruh kontrol dapat dicapai dengan Tab dan diaktifkan dengan Enter/Space.
- Pastikan tidak ada error/warning console ketika berpindah cepat dan ketika input quantity berubah.
- Verifikasi order tepat kelipatan serta order lebih kecil dari kapasitas.

---

## 5. Acceptance criteria

1. Input `125 pcs` dengan kapasitas `10 pcs / lembar` menampilkan `13 lembar`.
2. Ringkasan menampilkan `12 lembar penuh × 10 pcs` dan `1 lembar sisa × 5 pcs`.
3. User dapat membuka lembar ke-13 tanpa harus membuat 13 SVG sekaligus.
4. Lembar ke-13 memperlihatkan tepat 5 item terisi dan 5 slot kosong.
5. Lembar 1–12 masing-masing memperlihatkan 10 item terisi.
6. Quantity kosong tetap menampilkan template kapasitas seperti perilaku existing.
7. Waste tidak mengubah jumlah lembar isi pada pager.
8. Pergantian lembar tidak memicu autosave Firestore.
9. Saved calculation lama tetap dapat dibuka.
10. Test fitur, lint scope, build, dan QA mobile/keyboard lulus.

---

## 6. Out of scope

- Preview multi-lembar untuk Kalkulator Buku.
- Preview beberapa plano pada Potong Plano.
- Mencetak atau mengekspor seluruh preview ke PDF.
- Drag-and-drop urutan item.
- Layout berbeda pada tiap lembar.
- Menampilkan lembar waste sebagai lembar produksi berisi item.
