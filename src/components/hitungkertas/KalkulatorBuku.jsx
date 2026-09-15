import React, { useState, useMemo } from 'react';
import { BookOpen } from 'lucide-react';

const PAPER_PRESETS = [
  { id: 'a3plus', label: 'A3+', sub: '48×32 cm', w: 48, h: 32 },
  { id: 'a3',    label: 'A3',  sub: '42×29.7 cm', w: 42, h: 29.7 },
  { id: 'a4',    label: 'A4',  sub: '29.7×21 cm', w: 29.7, h: 21 },
];

const BOOK_SIZE_PRESETS = [
  { id: 'a5',    label: 'A5',    sub: '14.9×21 cm', w: 14.9, h: 21 },
  { id: 'a4',    label: 'A4',    sub: '21×29.7 cm', w: 21, h: 29.7 },
  { id: 'a6',    label: 'A6',    sub: '10.5×14.8 cm', w: 10.5, h: 14.8 },
  { id: '17x24', label: '17×24', sub: '17×24 cm', w: 17, h: 24 },
];

const MODE_CETAK = ['Simplex (satu muka)', 'Duplex (bolak balik)'];
const JENIS_JILID = ['Perfect Binding', 'Saddle Stitch', 'Hard Cover', 'Spiral'];
const JENIS_COVER = ['Soft Cover', 'Hard Cover', 'Laminated'];

function ResultRow({ label, value, highlight = false, unit = '' }) {
  return (
    <div className={`kb-result-row ${highlight ? 'is-highlight' : ''}`}>
      <span className="kb-result-label">{label}</span>
      <span className={`kb-result-value ${highlight ? 'is-big' : ''}`}>{value}{unit && <span className="kb-result-unit"> {unit}</span>}</span>
    </div>
  );
}

export default function KalkulatorBuku() {
  const [paperPreset, setPaperPreset] = useState('a3plus');
  const [paperW, setPaperW] = useState(48);
  const [paperH, setPaperH] = useState(32);
  const [bookPreset, setBookPreset] = useState('a5');
  const [bookW, setBookW] = useState(14.8);
  const [bookH, setBookH] = useState(21);
  const [jumlahHalaman, setJumlahHalaman] = useState(100);
  const [jumlahEksemplar, setJumlahEksemplar] = useState(500);
  const [modeCetak, setModeCetak] = useState('Duplex (bolak balik)');
  const [jenisJilid, setJenisJilid] = useState('Perfect Binding');
  const [jenisCover, setJenisCover] = useState('Soft Cover');
  const [tebalPunggung, setTebalPunggung] = useState(0.8);
  const [hargaRimIsi, setHargaRimIsi] = useState(385000);
  const [hargaRimCover, setHargaRimCover] = useState(650000);
  const [laPerRim, setLaPerRim] = useState(500);
  const [wasteProduksi, setWasteProduksi] = useState(5);

  const calc = useMemo(() => {
    // Pages per sheet
    const pagesPerSheet = modeCetak.includes('Duplex') ? 4 : 2; // folded: 4 pages per sheet duplex
    const halamanFinal = jumlahHalaman;

    // Isi per book (how many sheets of paper for content)
    const isiPerBuku = Math.ceil(jumlahHalaman / pagesPerSheet);
    const coverPerLembar = 2; // cover fits 2 books per sheet landscape

    // How many books per sheet (isi)
    // paper area / (book width * book height * 2 [for duplex])
    const booksPerSheetIsi = Math.max(1, Math.floor(paperW / (bookW * 2)) * Math.floor(paperH / bookH));
    const booksPerSheetCover = Math.max(1, Math.floor(paperW / (bookW + tebalPunggung + bookW)) * Math.floor(paperH / bookH));

    const isiPerBukuSheets = Math.ceil(halamanFinal / (modeCetak.includes('Duplex') ? 4 : 2));
    const isiTotal = Math.ceil((isiPerBukuSheets * jumlahEksemplar) / Math.max(booksPerSheetIsi, 1));
    const coverTotal = Math.ceil(jumlahEksemplar / Math.max(booksPerSheetCover, 1));

    const wasteMultiplier = 1 + wasteProduksi / 100;
    const totalWithWaste = Math.ceil((isiTotal + coverTotal) * wasteMultiplier);

    const lembarPerBuku = isiPerBukuSheets;

    const biayaIsi = (isiTotal / laPerRim) * hargaRimIsi;
    const biayaCetak = (coverTotal / laPerRim) * hargaRimCover;
    const totalBiaya = biayaIsi + biayaCetak;
    const biayaPerBuku = jumlahEksemplar > 0 ? totalBiaya / jumlahEksemplar : 0;

    return {
      halamanFinal,
      isiPerBuku: booksPerSheetIsi,
      coverPerLembar: booksPerSheetCover,
      isiTotal,
      coverTotal,
      totalWithWaste,
      lembarPerBuku,
      biayaIsi: Math.round(biayaIsi),
      biayaCetak: Math.round(biayaCetak),
      totalBiaya: Math.round(totalBiaya),
      biayaPerBuku: Math.round(biayaPerBuku),
    };
  }, [paperW, paperH, bookW, bookH, jumlahHalaman, jumlahEksemplar, modeCetak, jenisJilid, jenisCover, tebalPunggung, hargaRimIsi, hargaRimCover, laPerRim, wasteProduksi]);

  const fmt = (n) => n.toLocaleString('id-ID');

  const selectPaper = (p) => {
    setPaperPreset(p.id);
    setPaperW(p.w);
    setPaperH(p.h);
  };

  const selectBook = (b) => {
    setBookPreset(b.id);
    setBookW(b.w);
    setBookH(b.h);
  };

  return (
    <div className="hk-screen">
      {/* Top Bar */}
      <div className="hk-topbar">
        <h2 className="hk-topbar-title">Kalkulator Buku</h2>
        <div className="hk-topbar-right">
          <span className="hk-topbar-label">Layout {paperW}×{paperH} · {jumlahEksemplar} eks</span>
          <button className="hk-save-btn">
            <BookOpen size={15} />
            <span>Simpan Perhitungan</span>
          </button>
        </div>
      </div>

      <div className="hk-body">
        {/* Left Panel: Inputs */}
        <div className="hk-left-panel">
          <div className="hk-card">
            <div className="hk-card-header">
              <div className="hk-card-icon blue"><BookOpen size={15} /></div>
              <span className="hk-card-title">Kalkulator Buku</span>
            </div>

            <div className="hk-two-col-inputs">
              {/* Column 1: Kertas & Buku & Harga */}
              <div>
                {/* Section: Kertas Cetak */}
                <div className="hk-form-section">
                  <div className="hk-form-section-title">Kertas cetak</div>
                  <div className="hk-preset-pills">
                    {PAPER_PRESETS.map(p => (
                      <button key={p.id} className={`hk-preset-pill ${paperPreset === p.id ? 'is-active' : ''}`} onClick={() => selectPaper(p)}>
                        <span className="hk-pill-label">{p.label}</span>
                        <span className="hk-pill-sub">{p.sub}</span>
                      </button>
                    ))}
                  </div>
                  <div className="hk-inline-fields">
                    <div className="hk-field-group">
                      <label className="hk-label">Lebar kertas</label>
                      <div className="hk-input-suffix-row">
                        <input type="number" className="hk-input" value={paperW} onChange={e => { setPaperW(Number(e.target.value)); setPaperPreset('custom'); }} />
                        <span className="hk-suffix">CM</span>
                      </div>
                    </div>
                    <div className="hk-field-group">
                      <label className="hk-label">Tinggi kertas</label>
                      <div className="hk-input-suffix-row">
                        <input type="number" className="hk-input" value={paperH} onChange={e => { setPaperH(Number(e.target.value)); setPaperPreset('custom'); }} />
                        <span className="hk-suffix">CM</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Ukuran Buku */}
                <div className="hk-form-section">
                  <div className="hk-form-section-title">Ukuran buku jadi</div>
                  <div className="hk-preset-pills">
                    {BOOK_SIZE_PRESETS.map(b => (
                      <button key={b.id} className={`hk-preset-pill ${bookPreset === b.id ? 'is-active' : ''}`} onClick={() => selectBook(b)}>
                        <span className="hk-pill-label">{b.label}</span>
                        <span className="hk-pill-sub">{b.sub}</span>
                      </button>
                    ))}
                  </div>
                  <div className="hk-inline-fields">
                    <div className="hk-field-group">
                      <label className="hk-label">Lebar buku</label>
                      <div className="hk-input-suffix-row">
                        <input type="number" step="0.1" className="hk-input" value={bookW} onChange={e => { setBookW(Number(e.target.value)); setBookPreset('custom'); }} />
                        <span className="hk-suffix">CM</span>
                      </div>
                    </div>
                    <div className="hk-field-group">
                      <label className="hk-label">Tinggi buku</label>
                      <div className="hk-input-suffix-row">
                        <input type="number" className="hk-input" value={bookH} onChange={e => { setBookH(Number(e.target.value)); setBookPreset('custom'); }} />
                        <span className="hk-suffix">CM</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Harga Kertas */}
                <div className="hk-form-section" style={{ marginBottom: 0 }}>
                  <div className="hk-form-section-title">Harga kertas</div>
                  <div className="hk-detail-grid">
                    <div className="hk-field-group">
                      <label className="hk-label">Harga rim isi</label>
                      <div className="hk-input-suffix-row">
                        <input type="number" className="hk-input" value={hargaRimIsi} onChange={e => setHargaRimIsi(Number(e.target.value))} />
                        <span className="hk-suffix">RP</span>
                      </div>
                    </div>
                    <div className="hk-field-group">
                      <label className="hk-label">Harga rim cover</label>
                      <div className="hk-input-suffix-row">
                        <input type="number" className="hk-input" value={hargaRimCover} onChange={e => setHargaRimCover(Number(e.target.value))} />
                        <span className="hk-suffix">RP</span>
                      </div>
                    </div>
                    <div className="hk-field-group">
                      <label className="hk-label">Isi per rim</label>
                      <div className="hk-input-suffix-row">
                        <input type="number" className="hk-input" value={laPerRim} onChange={e => setLaPerRim(Number(e.target.value))} />
                        <span className="hk-suffix">LEMBAR</span>
                      </div>
                    </div>
                    <div className="hk-field-group">
                      <label className="hk-label">Waste produksi</label>
                      <div className="hk-input-suffix-row">
                        <input type="number" className="hk-input" value={wasteProduksi} onChange={e => setWasteProduksi(Number(e.target.value))} />
                        <span className="hk-suffix">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: Detail Cetak */}
              <div>
                <div className="hk-form-section">
                  <div className="hk-form-section-title">Detail cetak</div>
                  <div className="hk-field-group" style={{ marginBottom: 12 }}>
                    <div className="hk-inline-fields">
                      <div className="hk-field-group">
                        <label className="hk-label">Jumlah halaman</label>
                        <div className="hk-input-suffix-row">
                          <input type="number" className="hk-input" value={jumlahHalaman} onChange={e => setJumlahHalaman(Number(e.target.value))} />
                          <span className="hk-suffix">HALAMAN</span>
                        </div>
                      </div>
                      <div className="hk-field-group">
                        <label className="hk-label">Jumlah eksemplar</label>
                        <div className="hk-input-suffix-row">
                          <input type="number" className="hk-input" value={jumlahEksemplar} onChange={e => setJumlahEksemplar(Number(e.target.value))} />
                          <span className="hk-suffix">BUKU</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="hk-field-group" style={{ marginBottom: 12 }}>
                    <label className="hk-label">Mode cetak</label>
                    <select className="hk-select" value={modeCetak} onChange={e => setModeCetak(e.target.value)}>
                      {MODE_CETAK.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>

                  <div className="hk-field-group" style={{ marginBottom: 12 }}>
                    <label className="hk-label">Jenis jilid</label>
                    <select className="hk-select" value={jenisJilid} onChange={e => setJenisJilid(e.target.value)}>
                      {JENIS_JILID.map(j => <option key={j}>{j}</option>)}
                    </select>
                  </div>

                  <div className="hk-field-group" style={{ marginBottom: 12 }}>
                    <label className="hk-label">Jenis cover</label>
                    <select className="hk-select" value={jenisCover} onChange={e => setJenisCover(e.target.value)}>
                      {JENIS_COVER.map(j => <option key={j}>{j}</option>)}
                    </select>
                  </div>

                  <div className="hk-field-group">
                    <label className="hk-label">Tebal punggung</label>
                    <div className="hk-input-suffix-row">
                      <input type="number" step="0.1" className="hk-input" value={tebalPunggung} onChange={e => setTebalPunggung(Number(e.target.value))} />
                      <span className="hk-suffix">CM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="hk-history-section">
            <div className="hk-history-title">Simpan hasil aktif ke Riwayat</div>
            <div className="hk-history-subtitle">Hanya hasil valid yang dapat masuk ke riwayat.</div>
            {[1,2,3].map(i => (
              <div key={i} className="hk-history-item">
                <span className="hk-history-badge">Waktu</span>
                <div className="hk-history-info">
                  <span className="hk-history-name">Layout {paperW} x {paperH} · {i} pcs</span>
                  <span className="hk-history-meta">Ananda Rafii Aflarid Suprayogi · 15/8/2026, 10:06:{10+i*10}</span>
                </div>
                <button className="hk-history-open">↗ Buka</button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Results */}
        <div className="hk-right-results-panel">
          <div className="hk-card hk-results-card">
            <div className="kb-results-title">Kebutuhan buku</div>
            <div className="kb-active-calc-badge">
              <span>⊙ Kalkulasi aktif: {jumlahHalaman} hal · {jumlahEksemplar} eks</span>
            </div>

            <div className="kb-results-grid">
              <div className="kb-result-cell">
                <div className="kb-result-label">BUKU / LEMBAR</div>
                <div className="kb-result-big">{calc.isiPerBuku}</div>
              </div>
              <div className="kb-result-cell">
                <div className="kb-result-label">HALAMAN FINAL</div>
                <div className="kb-result-big">{calc.halamanFinal}</div>
              </div>
              <div className="kb-result-cell">
                <div className="kb-result-label">ISI / BUKU</div>
                <div className="kb-result-big">{calc.lembarPerBuku}</div>
                <div className="kb-result-unit-label">lembar</div>
              </div>
              <div className="kb-result-cell">
                <div className="kb-result-label">COVER / LEMBAR</div>
                <div className="kb-result-big">{calc.coverPerLembar}</div>
              </div>
              <div className="kb-result-cell">
                <div className="kb-result-label">ISI TOTAL</div>
                <div className="kb-result-big">{fmt(calc.isiTotal)}</div>
                <div className="kb-result-unit-label">lembar</div>
              </div>
              <div className="kb-result-cell">
                <div className="kb-result-label">COVER TOTAL</div>
                <div className="kb-result-big">{fmt(calc.coverTotal)}</div>
                <div className="kb-result-unit-label">lembar</div>
              </div>
              <div className="kb-result-cell">
                <div className="kb-result-label">TOTAL + WASTE</div>
                <div className="kb-result-big">{fmt(calc.totalWithWaste)}</div>
                <div className="kb-result-unit-label">lembar</div>
              </div>
              <div className="kb-result-cell">
                <div className="kb-result-label">LEMBAR / BUKU</div>
                <div className="kb-result-big">{calc.lembarPerBuku}</div>
              </div>
            </div>

            <div className="kb-cost-divider" />

            <div className="kb-cost-row">
              <div className="kb-cost-cell">
                <div className="kb-result-label">BIAYA ISI</div>
                <div className="kb-cost-value">Rp {fmt(calc.biayaIsi)}</div>
              </div>
              <div className="kb-cost-cell">
                <div className="kb-result-label">BIAYA CETAK</div>
                <div className="kb-cost-value">Rp {fmt(calc.biayaCetak)}</div>
              </div>
            </div>

            <div className="kb-total-row">
              <div className="kb-total-cell">
                <div className="kb-result-label">TOTAL BIAYA</div>
                <div className="kb-total-value">Rp {fmt(calc.totalBiaya)}</div>
              </div>
              <div className="kb-total-cell">
                <div className="kb-result-label">BIAYA / BUKU</div>
                <div className="kb-total-value">Rp {fmt(calc.biayaPerBuku)}</div>
              </div>
            </div>

            <div className="kb-notes">
              <p>• {jenisCover} dihitung sebagai satu bentang depan + punggung + belakang.</p>
              <p>• Referensi awal: 100 halaman 60 gsm → 0,8 cm; 300 halaman → 1,5 cm.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
