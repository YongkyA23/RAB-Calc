
# Logic Detail

# Fitur Hitung Kertas — Kalkulator Cetak

## 1. Referensi Struktur Fitur

Halaman Hitung Kertas memiliki 4 modul utama:

1. Layout Cetak
2. Kalkulator Buku
3. Potong Plano
4. Estimasi Waktu

Modul tersebut ditampilkan sebagai tab/navigasi utama pada halaman kalkulator.

---

# 2. Global Helper Logic

## 2.1 Parsing Angka

Semua input numerik harus diproses menjadi number.

```js
function toNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}
```

## 2.2 Pembulatan ke Atas

Digunakan untuk kebutuhan lembar, waste, dan rekomendasi order.

```js
function ceil(value) {
  return Math.ceil(toNumber(value))
}
```

## 2.3 Validasi Angka Positif

```js
function isPositive(value) {
  return toNumber(value) > 0
}
```

## 2.4 Format Rupiah

```js
function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(toNumber(value))
}
```

## 2.5 Hitung Waste

```js
function calculateWaste(baseQty, wastePercent) {
  return Math.ceil(baseQty * (toNumber(wastePercent) / 100))
}
```

## 2.6 Total dengan Waste

```js
function calculateTotalWithWaste(baseQty, wastePercent) {
  const waste = calculateWaste(baseQty, wastePercent)
  return {
    baseQty,
    waste,
    total: baseQty + waste,
  }
}
```

---

# 3. Logic Modul Layout Cetak

Modul Layout Cetak menghitung layout desain, stiker, atau kartu dalam satu lembar kertas. Input yang tersedia meliputi ukuran kertas, ukuran desain, bleed/jarak antar, jumlah dibutuhkan, serta opsi rotasi. Output yang ditampilkan adalah pcs per lembar, lembar dibutuhkan, susunan kolom × baris, area terbuang, dan estimasi biaya kertas.

## 3.1 Preset Ukuran Kertas

```js
const PAPER_PRESETS = {
  A3_PLUS: { label: 'A3+', width: 48, height: 32 },
  A3: { label: 'A3', width: 42, height: 29.7 },
  A4: { label: 'A4', width: 29.7, height: 21 },
  A5: { label: 'A5', width: 21, height: 14.8 },
  CUSTOM: { label: 'Custom', width: null, height: null },
}
```

## 3.2 Input State

```js
const layoutInput = {
  paperWidth: 48,
  paperHeight: 32,
  designWidth: 0,
  designHeight: 0,
  gap: 0,
  requiredQty: 0,
  allowRotation: true,
  pricePerRim: 0,
  sheetsPerRim: 500,
  wastePercent: 0,
}
```

## 3.3 Formula Jumlah Kolom dan Baris

Karena ada bleed/jarak antar, jumlah item harus dihitung dengan rumus:

```txt
jumlah kolom = floor((lebar kertas + gap) / (lebar desain + gap))
jumlah baris = floor((tinggi kertas + gap) / (tinggi desain + gap))
pcs per lembar = jumlah kolom × jumlah baris
```

Implementasi:

```js
function calculateGrid(paperWidth, paperHeight, itemWidth, itemHeight, gap) {
  const columns = Math.floor((paperWidth + gap) / (itemWidth + gap))
  const rows = Math.floor((paperHeight + gap) / (itemHeight + gap))

  return {
    columns: Math.max(columns, 0),
    rows: Math.max(rows, 0),
    pcsPerSheet: Math.max(columns, 0) * Math.max(rows, 0),
  }
}
```

## 3.4 Logic Rotasi

Jika opsi **Putar jika lebih efisien** aktif, sistem menghitung dua skenario:

1. Normal: desain tidak diputar.
2. Rotated: lebar desain dan tinggi desain ditukar.

Lalu sistem memilih layout dengan pcs per lembar terbesar.

```js
function calculateBestLayout(input) {
  const {
    paperWidth,
    paperHeight,
    designWidth,
    designHeight,
    gap,
    allowRotation,
  } = input

  if (!isPositive(paperWidth) || !isPositive(paperHeight)) return null
  if (!isPositive(designWidth) || !isPositive(designHeight)) return null

  const normal = {
    orientation: 'normal',
    itemWidth: designWidth,
    itemHeight: designHeight,
    ...calculateGrid(paperWidth, paperHeight, designWidth, designHeight, gap),
  }

  if (!allowRotation) return normal

  const rotated = {
    orientation: 'rotated',
    itemWidth: designHeight,
    itemHeight: designWidth,
    ...calculateGrid(paperWidth, paperHeight, designHeight, designWidth, gap),
  }

  return rotated.pcsPerSheet > normal.pcsPerSheet ? rotated : normal
}
```

## 3.5 Logic Lembar Dibutuhkan

Jika jumlah dibutuhkan kosong atau 0, output lembar dibutuhkan dapat ditampilkan sebagai “—”.

Jika jumlah dibutuhkan diisi:

```txt
lembar dibutuhkan = ceil(jumlah dibutuhkan / pcs per lembar)
```

```js
function calculateRequiredSheets(requiredQty, pcsPerSheet) {
  if (!isPositive(requiredQty) || !isPositive(pcsPerSheet)) return 0
  return Math.ceil(requiredQty / pcsPerSheet)
}
```

## 3.6 Logic Area Terbuang

```txt
area kertas = lebar kertas × tinggi kertas
area desain terpakai = pcs per lembar × lebar desain efektif × tinggi desain efektif
area terbuang = area kertas - area desain terpakai
persentase waste area = area terbuang / area kertas × 100
```

Desain efektif mengikuti orientasi layout terpilih.

```js
function calculateWastedArea(input, layout) {
  const paperArea = input.paperWidth * input.paperHeight
  const usedArea = layout.pcsPerSheet * layout.itemWidth * layout.itemHeight
  const wastedArea = Math.max(paperArea - usedArea, 0)
  const wastedPercent = paperArea > 0 ? (wastedArea / paperArea) * 100 : 0

  return {
    paperArea,
    usedArea,
    wastedArea,
    wastedPercent,
  }
}
```

## 3.7 Logic Estimasi Harga Layout Cetak

Input estimasi harga pada modul Layout Cetak adalah harga per rim, jumlah lembar per rim, dan margin waste. Output yang tampil adalah lembar bersih, tambah waste, total lembar order, harga per lembar, dan estimasi biaya kertas.

```txt
lembar bersih = lembar dibutuhkan
tambah waste = ceil(lembar bersih × waste %)
total lembar order = lembar bersih + tambah waste
harga per lembar = harga per rim / jumlah lembar per rim
estimasi biaya kertas = total lembar order × harga per lembar
```

```js
function calculateLayoutPaperCost({
  cleanSheets,
  pricePerRim,
  sheetsPerRim,
  wastePercent,
}) {
  const baseQty = ceil(cleanSheets)
  const waste = calculateWaste(baseQty, wastePercent)
  const totalOrderSheets = baseQty + waste
  const pricePerSheet = isPositive(sheetsPerRim)
    ? toNumber(pricePerRim) / toNumber(sheetsPerRim)
    : 0

  return {
    cleanSheets: baseQty,
    wasteSheets: waste,
    totalOrderSheets,
    pricePerSheet,
    estimatedPaperCost: totalOrderSheets * pricePerSheet,
  }
}
```

## 3.8 Output Layout Cetak

```js
function calculateLayoutModule(input) {
  const layout = calculateBestLayout(input)

  if (!layout || layout.pcsPerSheet <= 0) {
    return {
      pcsPerSheet: 0,
      requiredSheets: 0,
      arrangement: '—',
      wastedArea: 0,
      cost: null,
    }
  }

  const requiredSheets = calculateRequiredSheets(
    input.requiredQty,
    layout.pcsPerSheet,
  )

  const area = calculateWastedArea(input, layout)

  const cost = calculateLayoutPaperCost({
    cleanSheets: requiredSheets,
    pricePerRim: input.pricePerRim,
    sheetsPerRim: input.sheetsPerRim,
    wastePercent: input.wastePercent,
  })

  return {
    pcsPerSheet: layout.pcsPerSheet,
    requiredSheets,
    arrangement: `${layout.columns} × ${layout.rows}`,
    orientation: layout.orientation,
    wastedArea: area.wastedArea,
    wastedPercent: area.wastedPercent,
    cost,
  }
}
```

---

# 4. Logic Modul Kalkulator Buku

Modul Kalkulator Buku menghitung kebutuhan kertas untuk produksi buku, termasuk ukuran kertas cetak, ukuran buku jadi, jumlah halaman isi, jumlah eksemplar, mode cetak, jenis cover, tebal punggung, dan jenis jilid. Website juga menampilkan output buku per lembar, halaman final, lembar isi per buku, cover per lembar, lembar per buku, total produksi, waste, rekomendasi order, serta estimasi biaya kertas.

## 4.1 Preset Ukuran Kertas Cetak

```js
const BOOK_PRINT_PAPER_PRESETS = {
  A3_PLUS: { label: 'A3+', width: 48, height: 32 },
  A3: { label: 'A3', width: 42, height: 29.7 },
  A4: { label: 'A4', width: 29.7, height: 21 },
  CUSTOM: { label: 'Custom', width: null, height: null },
}
```

## 4.2 Preset Ukuran Buku Jadi

```js
const BOOK_SIZE_PRESETS = {
  A5: { label: 'A5', width: 14.8, height: 21 },
  A4: { label: 'A4', width: 21, height: 29.7 },
  A6: { label: 'A6', width: 10.5, height: 14.8 },
  SIZE_17X24: { label: '17×24', width: 17, height: 24 },
  CUSTOM: { label: 'Custom', width: null, height: null },
}
```

## 4.3 Input State

```js
const bookInput = {
  paperWidth: 48,
  paperHeight: 32,
  bookWidth: 14.8,
  bookHeight: 21,
  pageCount: 0,
  copies: 0,
  printMode: 'duplex', // duplex | simplex
  coverType: 'soft', // soft | hard | none
  spineThickness: 0,
  bindingType: 'perfect', // perfect | saddle | spiral
  contentPricePerRim: 0,
  coverPricePerRim: 0,
  sheetsPerRim: 500,
  wastePercent: 0,
}
```

## 4.4 Logic Pembulatan Halaman

Website mencantumkan bahwa saddle stitch harus kelipatan 4, sementara perfect binding disarankan kelipatan 4.

```js
function roundPages(pageCount, bindingType) {
  const pages = ceil(pageCount)

  if (bindingType === 'saddle') {
    return Math.ceil(pages / 4) * 4
  }

  if (bindingType === 'perfect') {
    return Math.ceil(pages / 4) * 4
  }

  return pages
}
```

## 4.5 Logic Buku per Lembar

Buku per lembar dihitung dari jumlah halaman buku jadi yang dapat masuk ke satu lembar kertas cetak.

```txt
kolom = floor(lebar kertas / lebar buku)
baris = floor(tinggi kertas / tinggi buku)
buku per lembar = kolom × baris
```

Dengan opsi rotasi internal agar hasil paling efisien:

```js
function calculateBookPerSheet(paperWidth, paperHeight, bookWidth, bookHeight) {
  const normal = calculateGrid(paperWidth, paperHeight, bookWidth, bookHeight, 0)
  const rotated = calculateGrid(paperWidth, paperHeight, bookHeight, bookWidth, 0)

  return rotated.pcsPerSheet > normal.pcsPerSheet
    ? { ...rotated, orientation: 'rotated' }
    : { ...normal, orientation: 'normal' }
}
```

## 4.6 Logic Lembar Isi per Buku

```txt
Jika duplex:
lembar isi per buku = ceil(halaman final / 2 / buku per lembar)

Jika simplex:
lembar isi per buku = ceil(halaman final / buku per lembar)
```

```js
function calculateContentSheetsPerBook({
  finalPages,
  booksPerSheet,
  printMode,
}) {
  if (!isPositive(finalPages) || !isPositive(booksPerSheet)) return 0

  if (printMode === 'duplex') {
    return Math.ceil(finalPages / 2 / booksPerSheet)
  }

  return Math.ceil(finalPages / booksPerSheet)
}
```

## 4.7 Logic Ukuran Cover

Jika cover dipilih **soft cover**, cover merupakan satu lembar lipatan: depan + punggung + belakang. Website menampilkan catatan bahwa tebal punggung digunakan untuk estimasi lebar cover.

```txt
lebar cover soft = lebar buku × 2 + tebal punggung
tinggi cover soft = tinggi buku
```

```js
function calculateCoverSize({ bookWidth, bookHeight, spineThickness, coverType }) {
  if (coverType === 'none') {
    return { coverWidth: 0, coverHeight: 0 }
  }

  if (coverType === 'soft') {
    return {
      coverWidth: bookWidth * 2 + toNumber(spineThickness),
      coverHeight: bookHeight,
    }
  }

  if (coverType === 'hard') {
    return {
      coverWidth: bookWidth * 2 + toNumber(spineThickness),
      coverHeight: bookHeight,
    }
  }

  return { coverWidth: 0, coverHeight: 0 }
}
```

## 4.8 Logic Cover per Lembar Kertas

```js
function calculateCoverPerSheet({
  paperWidth,
  paperHeight,
  coverWidth,
  coverHeight,
}) {
  if (!isPositive(coverWidth) || !isPositive(coverHeight)) return 0

  const normal = calculateGrid(paperWidth, paperHeight, coverWidth, coverHeight, 0)
  const rotated = calculateGrid(paperWidth, paperHeight, coverHeight, coverWidth, 0)

  return Math.max(normal.pcsPerSheet, rotated.pcsPerSheet)
}
```

## 4.9 Logic Lembar Cover Total

```txt
Jika tanpa cover terpisah:
lembar cover total = 0

Jika ada cover:
lembar cover total = ceil(jumlah eksemplar / cover per lembar)
```

```js
function calculateCoverSheetsTotal(copies, coverPerSheet, coverType) {
  if (coverType === 'none') return 0
  if (!isPositive(copies) || !isPositive(coverPerSheet)) return 0
  return Math.ceil(copies / coverPerSheet)
}
```

## 4.10 Logic Total Produksi Buku

```txt
lembar isi total = lembar isi per buku × jumlah eksemplar
lembar cover total = ceil(jumlah eksemplar / cover per lembar)
total lembar = lembar isi total + lembar cover total
waste = ceil(total lembar × margin waste %)
rekomendasi order = total lembar + waste
lembar per buku = lembar isi per buku + estimasi cover per buku
```

```js
function calculateBookProduction(input) {
  const finalPages = roundPages(input.pageCount, input.bindingType)

  const bookLayout = calculateBookPerSheet(
    input.paperWidth,
    input.paperHeight,
    input.bookWidth,
    input.bookHeight,
  )

  const booksPerSheet = bookLayout.pcsPerSheet

  const contentSheetsPerBook = calculateContentSheetsPerBook({
    finalPages,
    booksPerSheet,
    printMode: input.printMode,
  })

  const contentSheetsTotal = contentSheetsPerBook * toNumber(input.copies)

  const coverSize = calculateCoverSize(input)

  const coverPerSheet = calculateCoverPerSheet({
    paperWidth: input.paperWidth,
    paperHeight: input.paperHeight,
    coverWidth: coverSize.coverWidth,
    coverHeight: coverSize.coverHeight,
  })

  const coverSheetsTotal = calculateCoverSheetsTotal(
    input.copies,
    coverPerSheet,
    input.coverType,
  )

  const coverSheetsPerBook = input.coverType === 'none'
    ? 0
    : 1 / Math.max(coverPerSheet, 1)

  const sheetsPerBook = contentSheetsPerBook + coverSheetsPerBook

  const totalSheets = contentSheetsTotal + coverSheetsTotal
  const wasteSheets = calculateWaste(totalSheets, input.wastePercent)
  const recommendedOrder = totalSheets + wasteSheets

  return {
    booksPerSheet,
    finalPages,
    contentSheetsPerBook,
    coverPerSheet,
    sheetsPerBook,
    contentSheetsTotal,
    coverSheetsTotal,
    totalSheets,
    wasteSheets,
    recommendedOrder,
  }
}
```

## 4.11 Logic Estimasi Harga Kertas Buku

Website menampilkan input harga per rim isi, harga per rim cover, jumlah lembar per rim, dan margin waste. Outputnya adalah kertas isi, kertas cover, total estimasi kertas, dan per eksemplar.

```txt
harga isi per lembar = harga rim isi / jumlah lembar per rim
harga cover per lembar = harga rim cover / jumlah lembar per rim

biaya isi = lembar isi total dengan waste proporsional × harga isi per lembar
biaya cover = lembar cover total dengan waste proporsional × harga cover per lembar
total estimasi kertas = biaya isi + biaya cover
per eksemplar = total estimasi kertas / jumlah eksemplar
```

```js
function calculateBookPaperCost(input, production) {
  const sheetsPerRim = toNumber(input.sheetsPerRim, 500)

  const contentPricePerSheet = sheetsPerRim > 0
    ? toNumber(input.contentPricePerRim) / sheetsPerRim
    : 0

  const coverPricePerSheet = sheetsPerRim > 0
    ? toNumber(input.coverPricePerRim) / sheetsPerRim
    : 0

  const contentWaste = calculateWaste(
    production.contentSheetsTotal,
    input.wastePercent,
  )

  const coverWaste = calculateWaste(
    production.coverSheetsTotal,
    input.wastePercent,
  )

  const contentCost = (production.contentSheetsTotal + contentWaste)
    * contentPricePerSheet

  const coverCost = (production.coverSheetsTotal + coverWaste)
    * coverPricePerSheet

  const totalCost = contentCost + coverCost

  const costPerCopy = isPositive(input.copies)
    ? totalCost / toNumber(input.copies)
    : 0

  return {
    contentCost,
    coverCost,
    totalCost,
    costPerCopy,
  }
}
```

## 4.12 Output Kalkulator Buku

```js
function calculateBookModule(input) {
  const production = calculateBookProduction(input)
  const cost = calculateBookPaperCost(input, production)

  return {
    ...production,
    cost,
  }
}
```

---

# 5. Logic Modul Potong Plano

Modul Potong Plano menghitung hasil potong dari ukuran plano besar ke ukuran potongan utama. Halaman menyediakan preset plano 65×100, 79×109, 61×86, dan 72×102, lalu menampilkan hasil per lembar plano, waste, skema alternatif, visualisasi potongan, serta fitur maksimalkan sisa potongan. Fitur ini dikunci sebagai fitur premium untuk pengguna terdaftar.

## 5.1 Preset Plano

```js
const PLANO_PRESETS = {
  P65X100: { width: 65, height: 100 },
  P79X109: { width: 79, height: 109 },
  P61X86: { width: 61, height: 86 },
  P72X102: { width: 72, height: 102 },
}
```

## 5.2 Input State

```js
const planoInput = {
  planoWidth: 65,
  planoHeight: 100,
  cutWidth: 0,
  cutHeight: 0,
  maximizeRemainder: false,
  isRegisteredUser: false,
}
```

## 5.3 Logic Potongan Normal

```txt
kolom = floor(lebar plano / lebar potongan)
baris = floor(tinggi plano / tinggi potongan)
jumlah potongan = kolom × baris
```

```js
function calculatePlanoLayout(planoWidth, planoHeight, cutWidth, cutHeight) {
  const columns = Math.floor(planoWidth / cutWidth)
  const rows = Math.floor(planoHeight / cutHeight)

  const totalCuts = Math.max(columns, 0) * Math.max(rows, 0)

  const usedWidth = columns * cutWidth
  const usedHeight = rows * cutHeight

  const usedArea = totalCuts * cutWidth * cutHeight
  const planoArea = planoWidth * planoHeight
  const wasteArea = Math.max(planoArea - usedArea, 0)
  const wastePercent = planoArea > 0 ? (wasteArea / planoArea) * 100 : 0

  return {
    orientation: 'normal',
    columns,
    rows,
    totalCuts,
    usedWidth,
    usedHeight,
    wasteArea,
    wastePercent,
  }
}
```

## 5.4 Logic Potongan Rotasi

```js
function calculateBestPlanoLayout(input) {
  const normal = calculatePlanoLayout(
    input.planoWidth,
    input.planoHeight,
    input.cutWidth,
    input.cutHeight,
  )

  const rotated = calculatePlanoLayout(
    input.planoWidth,
    input.planoHeight,
    input.cutHeight,
    input.cutWidth,
  )

  return rotated.totalCuts > normal.totalCuts ? rotated : normal
}
```

## 5.5 Logic Skema Alternatif

Skema alternatif digunakan untuk membandingkan susunan potongan normal, rotasi, dan kombinasi sisa strip.

```js
function getPlanoAlternativeSchemes(input) {
  const normal = calculatePlanoLayout(
    input.planoWidth,
    input.planoHeight,
    input.cutWidth,
    input.cutHeight,
  )

  const rotated = calculatePlanoLayout(
    input.planoWidth,
    input.planoHeight,
    input.cutHeight,
    input.cutWidth,
  )

  return [
    {
      id: 'normal',
      label: 'Normal',
      ...normal,
    },
    {
      id: 'rotated',
      label: 'Rotasi',
      ...rotated,
    },
  ].sort((a, b) => b.totalCuts - a.totalCuts)
}
```

## 5.6 Logic Maksimalkan Sisa Potongan

Website menyebut fitur ini digunakan untuk melihat skema alternatif yang memanfaatkan strip sisa dengan ukuran potongan kedua.

Implementasi logic:

1. Hitung layout utama.
2. Ambil sisa kanan dan sisa bawah.
3. Coba isi sisa kanan dengan potongan rotasi.
4. Coba isi sisa bawah dengan potongan rotasi.
5. Tambahkan hasilnya sebagai skema alternatif.

```js
function calculateRemainderOptimization(input) {
  const base = calculatePlanoLayout(
    input.planoWidth,
    input.planoHeight,
    input.cutWidth,
    input.cutHeight,
  )

  const rightStripWidth = input.planoWidth - base.usedWidth
  const rightStripHeight = input.planoHeight

  const bottomStripWidth = base.usedWidth
  const bottomStripHeight = input.planoHeight - base.usedHeight

  const rightStripCuts = rightStripWidth > 0
    ? calculatePlanoLayout(
        rightStripWidth,
        rightStripHeight,
        input.cutHeight,
        input.cutWidth,
      )
    : null

  const bottomStripCuts = bottomStripHeight > 0
    ? calculatePlanoLayout(
        bottomStripWidth,
        bottomStripHeight,
        input.cutHeight,
        input.cutWidth,
      )
    : null

  const additionalCuts =
    (rightStripCuts?.totalCuts ?? 0) +
    (bottomStripCuts?.totalCuts ?? 0)

  const totalCuts = base.totalCuts + additionalCuts

  const usedArea = totalCuts * input.cutWidth * input.cutHeight
  const planoArea = input.planoWidth * input.planoHeight
  const wasteArea = Math.max(planoArea - usedArea, 0)
  const wastePercent = planoArea > 0 ? (wasteArea / planoArea) * 100 : 0

  return {
    id: 'maximize-remainder',
    label: 'Maksimalkan sisa potongan',
    base,
    rightStripCuts,
    bottomStripCuts,
    totalCuts,
    wasteArea,
    wastePercent,
  }
}
```

## 5.7 Logic Access Lock

```js
function canAccessPlano(user) {
  return Boolean(user?.isRegistered)
}
```

```js
function renderPlanoModule(user, input) {
  if (!canAccessPlano(user)) {
    return {
      locked: true,
      title: 'Fitur Premium',
      message:
        'Kalkulator potong plano tersedia untuk pengguna terdaftar. Daftar gratis, tidak butuh kartu kredit.',
      cta: 'Daftar & Buka Akses',
    }
  }

  const bestLayout = calculateBestPlanoLayout(input)
  const schemes = input.maximizeRemainder
    ? [
        ...getPlanoAlternativeSchemes(input),
        calculateRemainderOptimization(input),
      ]
    : getPlanoAlternativeSchemes(input)

  return {
    locked: false,
    bestLayout,
    schemes,
  }
}
```

---

# 6. Logic Modul Estimasi Waktu

Modul Estimasi Waktu memiliki jenis pekerjaan: Lembaran A3+, Cetak Meteran, Kartu Nama, Buku Saddle Stitch, Buku Perfect Binding, dan Buku Hard Cover. Finishing tambahan berlaku ke semua pekerjaan aktif. Website menampilkan total waktu pengerjaan, estimasi selesai, dan breakdown.

## 6.1 Input State

```js
const timeInput = {
  jobs: {
    a3Sheets: {
      active: false,
      sheetCount: 0,
      printMode: 'duplex',
    },
    meterPrint: {
      active: false,
      areaM2: 0,
    },
    businessCard: {
      active: false,
      boxes: 0,
    },
    saddleBook: {
      active: false,
      copies: 0,
      pages: 0,
      size: 'A5',
    },
    perfectBook: {
      active: false,
      copies: 0,
      pages: 0,
      size: 'A5',
    },
    hardCoverBook: {
      active: false,
      copies: 0,
      pages: 0,
      size: 'A5',
    },
  },
  finishing: {
    laminationOneType: false,
    laminationTwoTypes: false,
    standardCut: false,
    customCut: false,
    dieCut: false,
    kissCut: false,
  },
  startDateTime: new Date(),
}
```

## 6.2 Logic Lembaran A3+

Input: jumlah lembar dan mode cetak. Website menyediakan mode bolak-balik dan satu sisi.

Karena website hanya menampilkan jenis input, logic produksi dapat dibuat sebagai rule estimasi internal:

```js
function estimateA3Sheets(job) {
  if (!job.active || !isPositive(job.sheetCount)) {
    return { minutes: 0, finishingSheets: 0, label: 'Lembaran A3+' }
  }

  const speedPerMinute = job.printMode === 'duplex' ? 8 : 15
  const minutes = Math.ceil(job.sheetCount / speedPerMinute)

  return {
    label: 'Lembaran A3+',
    minutes,
    finishingSheets: toNumber(job.sheetCount),
  }
}
```

## 6.3 Logic Cetak Meteran

Input: luas cetak dalam m². Website menyebut jenis ini untuk spanduk, banner, stiker roll, dan sejenisnya.

```js
function estimateMeterPrint(job) {
  if (!job.active || !isPositive(job.areaM2)) {
    return { minutes: 0, finishingSheets: 0, label: 'Cetak Meteran' }
  }

  const minutesPerM2 = 10
  const minutes = Math.ceil(job.areaM2 * minutesPerM2)

  return {
    label: 'Cetak Meteran',
    minutes,
    finishingSheets: 0,
  }
}
```

## 6.4 Logic Kartu Nama

Website menyebut 1 box = 500 kartu nama dan 1 box sekitar 20 lembar A3.

```txt
lembar A3 kartu nama = jumlah box × 20
```

```js
function estimateBusinessCard(job) {
  if (!job.active || !isPositive(job.boxes)) {
    return { minutes: 0, finishingSheets: 0, label: 'Kartu Nama' }
  }

  const sheets = toNumber(job.boxes) * 20
  const printSpeed = 15
  const minutes = Math.ceil(sheets / printSpeed)

  return {
    label: 'Kartu Nama',
    minutes,
    finishingSheets: sheets,
  }
}
```

## 6.5 Logic Buku Saddle Stitch

Website menyebut saddle stitch adalah lipat tengah + staples dan halaman harus kelipatan 4.

```js
function validateSaddleBook(job) {
  const errors = []

  if (job.active && job.pages % 4 !== 0) {
    errors.push('Jumlah halaman saddle stitch harus kelipatan 4')
  }

  return errors
}
```

Estimasi lembar:

```txt
lembar per buku = halaman / 4
total lembar produksi = lembar per buku × jumlah eksemplar
```

```js
function estimateSaddleBook(job) {
  if (!job.active || !isPositive(job.copies) || !isPositive(job.pages)) {
    return { minutes: 0, finishingSheets: 0, label: 'Buku Saddle Stitch' }
  }

  const roundedPages = Math.ceil(job.pages / 4) * 4
  const sheetsPerBook = roundedPages / 4
  const totalSheets = sheetsPerBook * toNumber(job.copies)

  const printMinutes = Math.ceil(totalSheets / 10)
  const foldingStapleMinutes = Math.ceil(job.copies * 1.5)

  return {
    label: 'Buku Saddle Stitch',
    minutes: printMinutes + foldingStapleMinutes,
    finishingSheets: totalSheets,
    roundedPages,
  }
}
```

## 6.6 Logic Buku Perfect Binding

Website menyebut perfect binding menggunakan lem punggung dan single sheet.

```txt
halaman final = ceil(halaman / 4) × 4
lembar isi per buku = ceil(halaman final / 2)
total lembar = lembar isi per buku × eksemplar
```

```js
function estimatePerfectBook(job) {
  if (!job.active || !isPositive(job.copies) || !isPositive(job.pages)) {
    return { minutes: 0, finishingSheets: 0, label: 'Buku Perfect Binding' }
  }

  const roundedPages = Math.ceil(job.pages / 4) * 4
  const sheetsPerBook = Math.ceil(roundedPages / 2)
  const totalSheets = sheetsPerBook * toNumber(job.copies)

  const printMinutes = Math.ceil(totalSheets / 10)
  const bindingMinutes = Math.ceil(job.copies * 3)

  return {
    label: 'Buku Perfect Binding',
    minutes: printMinutes + bindingMinutes,
    finishingSheets: totalSheets,
    roundedPages,
  }
}
```

## 6.7 Logic Buku Hard Cover

Website menyebut hard cover sebagai cover keras dan full manual.

```js
function estimateHardCoverBook(job) {
  if (!job.active || !isPositive(job.copies) || !isPositive(job.pages)) {
    return { minutes: 0, finishingSheets: 0, label: 'Buku Hard Cover' }
  }

  const roundedPages = Math.ceil(job.pages / 4) * 4
  const sheetsPerBook = Math.ceil(roundedPages / 2)
  const totalSheets = sheetsPerBook * toNumber(job.copies)

  const printMinutes = Math.ceil(totalSheets / 10)
  const manualCoverMinutes = Math.ceil(job.copies * 8)

  return {
    label: 'Buku Hard Cover',
    minutes: printMinutes + manualCoverMinutes,
    finishingSheets: totalSheets,
    roundedPages,
  }
}
```

---

# 7. Logic Finishing Tambahan

Finishing tambahan berlaku ke semua pekerjaan aktif. Website menyatakan total lembar untuk finishing dihitung otomatis dari semua pekerjaan aktif.

## 7.1 Rule Finishing

Website menampilkan aturan waktu berikut:

| Finishing        | Rule                                   |
| ---------------- | -------------------------------------- |
| Laminasi 1 jenis | Setup 30 menit + 15 lembar/menit       |
| Laminasi 2 jenis | Tambahan 15–20 menit ganti roll       |
| Potong standar   | Setup 30 menit + 3–5 menit/lembar     |
| Potong custom    | Setup 30 menit + 5–8 menit/lembar     |
| Die cut          | Setup 45–60 menit + 2–3 menit/lembar |
| Kiss cut         | Setup 30–45 menit + 2–3 menit/lembar |

## 7.2 Implementasi Range Waktu

Agar output bisa memberi estimasi realistis, finishing yang memiliki range dihitung sebagai min-max.

```js
function calculateFinishingTime(finishing, totalSheets) {
  const result = []

  if (!isPositive(totalSheets)) return result

  if (finishing.laminationOneType) {
    result.push({
      label: 'Laminasi 1 jenis',
      minMinutes: 30 + Math.ceil(totalSheets / 15),
      maxMinutes: 30 + Math.ceil(totalSheets / 15),
    })
  }

  if (finishing.laminationTwoTypes) {
    result.push({
      label: 'Laminasi 2 jenis',
      minMinutes: 15,
      maxMinutes: 20,
    })
  }

  if (finishing.standardCut) {
    result.push({
      label: 'Potong ukuran standar',
      minMinutes: 30 + totalSheets * 3,
      maxMinutes: 30 + totalSheets * 5,
    })
  }

  if (finishing.customCut) {
    result.push({
      label: 'Potong ukuran custom',
      minMinutes: 30 + totalSheets * 5,
      maxMinutes: 30 + totalSheets * 8,
    })
  }

  if (finishing.dieCut) {
    result.push({
      label: 'Die cut',
      minMinutes: 45 + totalSheets * 2,
      maxMinutes: 60 + totalSheets * 3,
    })
  }

  if (finishing.kissCut) {
    result.push({
      label: 'Kiss cut',
      minMinutes: 30 + totalSheets * 2,
      maxMinutes: 45 + totalSheets * 3,
    })
  }

  return result
}
```

---

# 8. Logic Estimasi Total Waktu

## 8.1 Hitung Semua Pekerjaan Aktif

```js
function calculateActiveJobs(input) {
  const jobs = [
    estimateA3Sheets(input.jobs.a3Sheets),
    estimateMeterPrint(input.jobs.meterPrint),
    estimateBusinessCard(input.jobs.businessCard),
    estimateSaddleBook(input.jobs.saddleBook),
    estimatePerfectBook(input.jobs.perfectBook),
    estimateHardCoverBook(input.jobs.hardCoverBook),
  ]

  return jobs.filter((job) => job.minutes > 0)
}
```

## 8.2 Hitung Total Lembar Finishing

```js
function calculateTotalFinishingSheets(activeJobs) {
  return activeJobs.reduce(
    (total, job) => total + toNumber(job.finishingSheets),
    0,
  )
}
```

## 8.3 Hitung Total Menit

```js
function calculateTimeEstimation(input) {
  const activeJobs = calculateActiveJobs(input)

  if (activeJobs.length === 0) {
    return {
      empty: true,
      message: 'Aktifkan minimal satu kategori pekerjaan untuk melihat estimasi',
    }
  }

  const jobMinutes = activeJobs.reduce(
    (total, job) => total + job.minutes,
    0,
  )

  const totalFinishingSheets = calculateTotalFinishingSheets(activeJobs)

  const finishingBreakdown = calculateFinishingTime(
    input.finishing,
    totalFinishingSheets,
  )

  const finishingMinMinutes = finishingBreakdown.reduce(
    (total, item) => total + item.minMinutes,
    0,
  )

  const finishingMaxMinutes = finishingBreakdown.reduce(
    (total, item) => total + item.maxMinutes,
    0,
  )

  const minTotalMinutes = jobMinutes + finishingMinMinutes
  const maxTotalMinutes = jobMinutes + finishingMaxMinutes

  return {
    empty: false,
    activeJobs,
    totalFinishingSheets,
    finishingBreakdown,
    minTotalMinutes,
    maxTotalMinutes,
    estimatedFinishMin: addMinutes(input.startDateTime, minTotalMinutes),
    estimatedFinishMax: addMinutes(input.startDateTime, maxTotalMinutes),
  }
}
```

## 8.4 Helper Estimasi Selesai

```js
function addMinutes(date, minutes) {
  return new Date(new Date(date).getTime() + minutes * 60 * 1000)
}
```

## 8.5 Format Durasi

```js
function formatDuration(minutes) {
  const total = Math.ceil(minutes)
  const hours = Math.floor(total / 60)
  const mins = total % 60

  if (hours <= 0) return `${mins} menit`
  if (mins <= 0) return `${hours} jam`
  return `${hours} jam ${mins} menit`
}
```

---

# 9. Logic Registrasi dan Akses

Website menyediakan form registrasi gratis untuk membuka fitur custom dan kalkulator potong plano. Field yang tersedia adalah nama lengkap, alamat email, dan nomor WhatsApp. Pengguna lama dapat membuka akses dengan email terdaftar. Jika email tidak ditemukan, sistem menampilkan pesan email tidak ditemukan. Jika berhasil, sistem menampilkan akses dibuka dan semua fitur tersedia.

## 9.1 Data User

```js
const registeredUser = {
  name: '',
  email: '',
  whatsapp: '',
  registeredAt: '',
  isRegistered: true,
}
```

## 9.2 Validasi Registrasi

```js
function validateRegistration(form) {
  const errors = {}

  if (!form.name?.trim()) {
    errors.name = 'Nama tidak boleh kosong'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email || '')) {
    errors.email = 'Masukkan email yang valid'
  }

  if (!form.whatsapp?.trim()) {
    errors.whatsapp = 'Masukkan nomor WhatsApp'
  }

  return errors
}
```

## 9.3 Submit Registrasi

```js
function registerUser(form, storage) {
  const errors = validateRegistration(form)

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
    }
  }

  const payload = {
    name: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    whatsapp: form.whatsapp.trim(),
    registeredAt: new Date().toISOString(),
    isRegistered: true,
  }

  storage.saveUser(payload)

  return {
    success: true,
    user: payload,
    message: 'Akses dibuka! Semua fitur kalkulator sekarang tersedia untuk Anda.',
  }
}
```

## 9.4 Buka Akses dengan Email Terdaftar

```js
function unlockWithEmail(email, storage) {
  const normalizedEmail = email.trim().toLowerCase()
  const user = storage.findUserByEmail(normalizedEmail)

  if (!user) {
    return {
      success: false,
      error: 'Email tidak ditemukan. Silakan daftar di atas.',
    }
  }

  return {
    success: true,
    user,
    message: 'Akses dibuka! Semua fitur kalkulator sekarang tersedia untuk Anda.',
  }
}
```

---

# 10. Logic Simpan Ukuran Custom

Website memiliki tombol “+ simpan ukuran ini” pada ukuran kertas dan ukuran buku.

## 10.1 Struktur Custom Size

```js
const customSize = {
  id: 'custom-uuid',
  label: 'Custom 48×32',
  width: 48,
  height: 32,
  type: 'paper', // paper | book | plano
}
```

## 10.2 Simpan Custom Size

```js
function saveCustomSize({ width, height, type }, storage) {
  if (!isPositive(width) || !isPositive(height)) {
    return {
      success: false,
      error: 'Lebar dan tinggi harus lebih besar dari 0',
    }
  }

  const size = {
    id: `custom-${Date.now()}`,
    label: `Custom ${width}×${height}`,
    width: toNumber(width),
    height: toNumber(height),
    type,
  }

  storage.saveCustomSize(size)

  return {
    success: true,
    size,
  }
}
```

---

# 11. Logic Preview Visual

## 11.1 Preview Layout Cetak

Preview layout dibuat dari hasil kolom dan baris.

```js
function buildLayoutPreview(layout) {
  const items = []

  for (let row = 0; row < layout.rows; row++) {
    for (let col = 0; col < layout.columns; col++) {
      items.push({
        x: col,
        y: row,
        width: layout.itemWidth,
        height: layout.itemHeight,
      })
    }
  }

  return items
}
```

## 11.2 Preview Potong Plano

```js
function buildPlanoPreview(layout, cutWidth, cutHeight) {
  const items = []

  for (let row = 0; row < layout.rows; row++) {
    for (let col = 0; col < layout.columns; col++) {
      items.push({
        x: col * cutWidth,
        y: row * cutHeight,
        width: cutWidth,
        height: cutHeight,
      })
    }
  }

  return items
}
```

---

# 12. Edge Cases

## 12.1 Layout Cetak

| Kondisi                               | Perilaku                       |
| ------------------------------------- | ------------------------------ |
| Ukuran desain lebih besar dari kertas | pcs per lembar = 0             |
| Jumlah dibutuhkan kosong              | lembar dibutuhkan = “—”     |
| Bleed kosong                          | dianggap 0                     |
| Harga rim kosong                      | estimasi biaya = 0 atau “—” |
| Rim = 0                               | harga per lembar = 0           |
| Rotasi tidak menambah pcs             | gunakan layout normal          |

## 12.2 Kalkulator Buku

| Kondisi                         | Perilaku                         |
| ------------------------------- | -------------------------------- |
| Jumlah halaman kosong           | semua output produksi = “—”   |
| Jumlah eksemplar kosong         | total produksi = “—”          |
| Saddle stitch bukan kelipatan 4 | tampilkan validasi / pembulatan  |
| Cover tanpa cover terpisah      | lembar cover = 0                 |
| Harga cover kosong              | biaya cover = 0                  |
| Waste 0                         | rekomendasi order = total lembar |

## 12.3 Potong Plano

| Kondisi                         | Perilaku                                   |
| ------------------------------- | ------------------------------------------ |
| User belum terdaftar            | tampilkan lock premium                     |
| Potongan lebih besar dari plano | hasil potong = 0                           |
| Maksimalkan sisa off            | tampilkan skema dasar                      |
| Maksimalkan sisa on             | tampilkan skema alternatif dan visualisasi |

## 12.4 Estimasi Waktu

| Kondisi                                 | Perilaku                                       |
| --------------------------------------- | ---------------------------------------------- |
| Tidak ada pekerjaan aktif               | tampilkan pesan aktivasi minimal satu kategori |
| Finishing aktif tanpa pekerjaan         | total waktu tetap kosong                       |
| Saddle stitch halaman bukan kelipatan 4 | tampilkan warning                              |
| Total lembar finishing 0                | finishing tidak dihitung                       |

---

# 13. End-to-End Flow

## 13.1 Flow Layout Cetak

```txt
User pilih ukuran kertas
→ User isi ukuran desain
→ User isi bleed/jarak antar
→ User pilih rotasi
→ Sistem hitung layout normal
→ Jika rotasi aktif, sistem hitung layout rotasi
→ Sistem pilih layout terbaik
→ Sistem tampilkan pcs per lembar, lembar dibutuhkan, susunan, waste area
→ Jika estimasi harga aktif, sistem hitung biaya kertas
→ Sistem tampilkan preview layout
```

## 13.2 Flow Kalkulator Buku

```txt
User pilih ukuran kertas cetak
→ User pilih ukuran buku jadi
→ User isi halaman dan eksemplar
→ User pilih mode cetak
→ User pilih cover
→ User isi tebal punggung jika perlu
→ User pilih jenis jilid
→ Sistem bulatkan halaman final
→ Sistem hitung buku per lembar
→ Sistem hitung lembar isi per buku
→ Sistem hitung cover per lembar
→ Sistem hitung total produksi
→ Sistem hitung waste dan rekomendasi order
→ Jika estimasi harga aktif, sistem hitung biaya isi dan cover
```

## 13.3 Flow Potong Plano

```txt
User buka tab Potong Plano
→ Sistem cek status registrasi
→ Jika belum terdaftar, tampilkan premium lock
→ Jika sudah terdaftar, user isi ukuran plano
→ User isi ukuran potongan utama
→ Sistem hitung layout normal dan rotasi
→ Sistem tampilkan hasil per plano dan waste
→ Jika maksimalkan sisa aktif, sistem hitung skema alternatif
→ User pilih skema
→ Sistem tampilkan visualisasi potongan
```

## 13.4 Flow Estimasi Waktu

```txt
User aktifkan satu atau lebih pekerjaan
→ User isi input pekerjaan
→ Sistem hitung estimasi tiap pekerjaan
→ Sistem jumlahkan total lembar finishing
→ User pilih finishing tambahan
→ Sistem hitung tambahan waktu finishing
→ Sistem tampilkan total waktu pengerjaan
→ Sistem tampilkan estimasi selesai
→ Sistem tampilkan breakdown
```

---

# 14. Output Data Structure

## 14.1 Layout Result

```js
const layoutResult = {
  pcsPerSheet: 24,
  requiredSheets: 42,
  arrangement: '6 × 4',
  orientation: 'normal',
  wastedArea: 128.5,
  wastedPercent: 18.2,
  cost: {
    cleanSheets: 42,
    wasteSheets: 5,
    totalOrderSheets: 47,
    pricePerSheet: 1000,
    estimatedPaperCost: 47000,
  },
}
```

## 14.2 Book Result

```js
const bookResult = {
  booksPerSheet: 2,
  finalPages: 100,
  contentSheetsPerBook: 25,
  coverPerSheet: 2,
  sheetsPerBook: 25.5,
  contentSheetsTotal: 2500,
  coverSheetsTotal: 50,
  totalSheets: 2550,
  wasteSheets: 255,
  recommendedOrder: 2805,
  cost: {
    contentCost: 2500000,
    coverCost: 150000,
    totalCost: 2650000,
    costPerCopy: 26500,
  },
}
```

## 14.3 Plano Result

```js
const planoResult = {
  totalCuts: 12,
  columns: 3,
  rows: 4,
  wasteArea: 350,
  wastePercent: 12.5,
  schemes: [
    {
      id: 'normal',
      label: 'Normal',
      totalCuts: 12,
    },
    {
      id: 'rotated',
      label: 'Rotasi',
      totalCuts: 10,
    },
  ],
}
```

## 14.4 Time Estimation Result

```js
const timeResult = {
  totalFinishingSheets: 120,
  minTotalMinutes: 360,
  maxTotalMinutes: 420,
  estimatedFinishMin: '2026-07-09T16:00:00.000Z',
  estimatedFinishMax: '2026-07-09T17:00:00.000Z',
  activeJobs: [],
  finishingBreakdown: [],
}
```

---

# 15. Summary Logic

Fitur Hitung Kertas terdiri dari empat kalkulasi inti:

1. **Layout Cetak**
   Menghitung jumlah item per lembar, kebutuhan lembar, waste area, preview layout, dan estimasi biaya kertas.
2. **Kalkulator Buku**
   Menghitung halaman final, lembar isi, cover, total produksi, waste, rekomendasi order, dan biaya kertas isi/cover.
3. **Potong Plano**
   Menghitung jumlah potongan dari plano, waste, skema alternatif, optimasi sisa potong, dan visualisasi.
4. **Estimasi Waktu**
   Menghitung durasi pekerjaan cetak, total lembar finishing, tambahan waktu finishing, estimasi selesai, dan breakdown.

Seluruh logic harus berjalan real-time setiap input berubah, dengan validasi angka, satuan yang jelas, dan fallback “—” jika data belum cukup untuk dihitung.
