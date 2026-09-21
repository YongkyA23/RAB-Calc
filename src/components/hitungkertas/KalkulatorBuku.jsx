import React, { useState, useMemo } from 'react';
import { BookOpen } from 'lucide-react';

const PAPER_PRESETS = [
  { id: 'a3plus', label: 'A3+', sub: '48×32 cm', w: 48, h: 32 },
  { id: 'a3',     label: 'A3',  sub: '42×29.7 cm', w: 42, h: 29.7 },
  { id: 'a4',     label: 'A4',  sub: '29.7×21 cm', w: 29.7, h: 21 },
];

const BOOK_SIZE_PRESETS = [
  { id: 'a5',    label: 'A5',    sub: '14.8×21 cm', w: 14.8, h: 21 },
  { id: 'a4',    label: 'A4',    sub: '21×29.7 cm', w: 21,   h: 29.7 },
  { id: 'a6',    label: 'A6',    sub: '10.5×14.8 cm', w: 10.5, h: 14.8 },
  { id: '17x24', label: '17×24', sub: '17×24 cm',   w: 17,   h: 24 },
];

const MODE_CETAK = ['Bolak-balik / duplex', 'Satu muka / simplex'];
const JENIS_JILID = ['Perfect binding', 'Saddle stitch (kawat)', 'Hard cover', 'Spiral'];
const JENIS_COVER = ['Soft cover', 'Hard cover', 'Tanpa cover terpisah'];

export default function KalkulatorBuku() {
  const [paperPreset, setPaperPreset] = useState('a3plus');
  const [paperW, setPaperW] = useState(50);
  const [paperH, setPaperH] = useState(70);
  const [bookPreset, setBookPreset] = useState('a5');
  const [bookW, setBookW] = useState(14.8);
  const [bookH, setBookH] = useState(21);
  const [jumlahHalaman, setJumlahHalaman] = useState('');
  const [jumlahEksemplar, setJumlahEksemplar] = useState('');
  const [modeCetak, setModeCetak] = useState('Bolak-balik / duplex');
  const [jenisJilid, setJenisJilid] = useState('Perfect binding');
  const [jenisCover, setJenisCover] = useState('Soft cover');
  const [tebalPunggung, setTebalPunggung] = useState(0);
  const [hargaRimIsi, setHargaRimIsi] = useState('');
  const [hargaRimCover, setHargaRimCover] = useState('');
  const [laPerRim, setLaPerRim] = useState(500);
  const [wasteProduksi, setWasteProduksi] = useState(0);

  const calc = useMemo(() => {
    const halamanFinal = Number(jumlahHalaman) || 0;
    const eks = Number(jumlahEksemplar) || 0;
    const isDuplex = modeCetak.toLowerCase().includes('duplex') || modeCetak.toLowerCase().includes('bolak');
    const isTanpaCover = jenisCover.toLowerCase().includes('tanpa cover');

    const pagesPerSheetUnit = isDuplex ? 4 : 2;
    const spreadW = (Number(bookW) || 0) * 2;
    const spreadH = Number(bookH) || 0;

    const pw = Number(paperW) || 0;
    const ph = Number(paperH) || 0;

    const booksPerSheetIsi = (spreadW > 0 && spreadH > 0 && pw > 0 && ph > 0)
      ? Math.max(1, Math.floor(pw / spreadW) * Math.floor(ph / spreadH))
      : 1;

    const coverSpreadW = (Number(bookW) || 0) * 2 + (Number(tebalPunggung) || 0);
    const coverSpreadH = Number(bookH) || 0;
    const booksPerSheetCover = (!isTanpaCover && coverSpreadW > 0 && coverSpreadH > 0 && pw > 0 && ph > 0)
      ? Math.max(1, Math.floor(pw / coverSpreadW) * Math.floor(ph / coverSpreadH))
      : (isTanpaCover ? 0 : 1);

    const isiPerBukuSheets = halamanFinal > 0 ? Math.ceil(halamanFinal / pagesPerSheetUnit) : 0;
    const isiTotal = Math.ceil((isiPerBukuSheets * eks) / Math.max(booksPerSheetIsi, 1));
    const coverTotal = (!isTanpaCover && eks > 0) ? Math.ceil(eks / Math.max(booksPerSheetCover, 1)) : 0;

    const wasteVal = Number(wasteProduksi) || 0;
    const wasteMultiplier = 1 + wasteVal / 100;
    const totalWithWaste = Math.ceil((isiTotal + coverTotal) * wasteMultiplier);

    const rimIsiVal = Number(hargaRimIsi) || 0;
    const rimCoverVal = Number(hargaRimCover) || 0;
    const sheetsPerRim = Math.max(1, Number(laPerRim) || 500);

    const biayaIsi = (isiTotal / sheetsPerRim) * rimIsiVal;
    const biayaCetak = isTanpaCover ? 0 : (coverTotal / sheetsPerRim) * rimCoverVal;
    const totalBiaya = biayaIsi + biayaCetak;
    const biayaPerBuku = eks > 0 ? totalBiaya / eks : 0;

    return {
      halamanFinal,
      isiPerBuku: booksPerSheetIsi,
      coverPerLembar: isTanpaCover ? 0 : booksPerSheetCover,
      isiTotal,
      coverTotal,
      totalWithWaste,
      lembarPerBuku: isiPerBukuSheets,
      biayaIsi: Math.round(biayaIsi),
      biayaCetak: Math.round(biayaCetak),
      totalBiaya: Math.round(totalBiaya),
      biayaPerBuku: Math.round(biayaPerBuku),
    };
  }, [paperW, paperH, bookW, bookH, jumlahHalaman, jumlahEksemplar, modeCetak, jenisCover, tebalPunggung, hargaRimIsi, hargaRimCover, laPerRim, wasteProduksi]);

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
          <span className="hk-topbar-label">Layout {paperW}×{paperH} · {jumlahEksemplar ? `${jumlahEksemplar} eks` : 'tanpa eks'}</span>
          <button className="hk-save-btn">
            <BookOpen size={15} />
            <span>Simpan Perhitungan</span>
          </button>
        </div>
      </div>

      <div className="hk-body">
        {/* Left Panel: Inputs matching Gambar 1 & 2 */}
        <div className="hk-left-panel">
          <div className="hk-card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header */}
            <div className="hk-card-header" style={{ marginBottom: 0 }}>
              <div className="hk-card-icon blue" style={{ width: 34, height: 34, borderRadius: 8 }}>
                <BookOpen size={17} />
              </div>
              <div>
                <div className="hk-section-label hk-blue-label">PRODUKSI BUKU</div>
                <div className="hk-card-title" style={{ fontSize: 16 }}>Kalkulator Buku</div>
              </div>
            </div>

            {/* Section 1: KERTAS CETAK */}
            <div>
              <div className="hk-label" style={{ marginBottom: 10, letterSpacing: '0.06em' }}>KERTAS CETAK</div>
              <div className="hk-preset-pills" style={{ marginBottom: 14 }}>
                {PAPER_PRESETS.map(p => (
                  <button
                    key={p.id}
                    className={`hk-preset-pill ${paperPreset === p.id ? 'is-active' : ''}`}
                    onClick={() => selectPaper(p)}
                  >
                    <span className="hk-pill-label">{p.label}</span>
                    <span className="hk-pill-sub">{p.sub}</span>
                  </button>
                ))}
              </div>
              <div className="hk-inline-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="hk-field-group">
                  <label className="hk-label" style={{ textTransform: 'none', fontWeight: 600 }}>Lebar kertas</label>
                  <div className="hk-input-suffix-row">
                    <input
                      type="number"
                      min="1"
                      className="hk-input"
                      value={paperW}
                      onChange={e => { setPaperW(Number(e.target.value)); setPaperPreset('custom'); }}
                    />
                    <span className="hk-suffix">CM</span>
                  </div>
                </div>
                <div className="hk-field-group">
                  <label className="hk-label" style={{ textTransform: 'none', fontWeight: 600 }}>Tinggi kertas</label>
                  <div className="hk-input-suffix-row">
                    <input
                      type="number"
                      min="1"
                      className="hk-input"
                      value={paperH}
                      onChange={e => { setPaperH(Number(e.target.value)); setPaperPreset('custom'); }}
                    />
                    <span className="hk-suffix">CM</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hk-divider" style={{ margin: '4px 0' }} />

            {/* Section 2: UKURAN BUKU JADI */}
            <div>
              <div className="hk-label" style={{ marginBottom: 10, letterSpacing: '0.06em' }}>UKURAN BUKU JADI</div>
              <div className="hk-preset-pills" style={{ marginBottom: 14 }}>
                {BOOK_SIZE_PRESETS.map(b => (
                  <button
                    key={b.id}
                    className={`hk-preset-pill ${bookPreset === b.id ? 'is-active' : ''}`}
                    onClick={() => selectBook(b)}
                  >
                    <span className="hk-pill-label">{b.label}</span>
                    <span className="hk-pill-sub">{b.sub}</span>
                  </button>
                ))}
              </div>
              <div className="hk-inline-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="hk-field-group">
                  <label className="hk-label" style={{ textTransform: 'none', fontWeight: 600 }}>Lebar buku</label>
                  <div className="hk-input-suffix-row">
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      className="hk-input"
                      value={bookW}
                      onChange={e => { setBookW(Number(e.target.value)); setBookPreset('custom'); }}
                    />
                    <span className="hk-suffix">CM</span>
                  </div>
                </div>
                <div className="hk-field-group">
                  <label className="hk-label" style={{ textTransform: 'none', fontWeight: 600 }}>Tinggi buku</label>
                  <div className="hk-input-suffix-row">
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      className="hk-input"
                      value={bookH}
                      onChange={e => { setBookH(Number(e.target.value)); setBookPreset('custom'); }}
                    />
                    <span className="hk-suffix">CM</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hk-divider" style={{ margin: '4px 0' }} />

            {/* Section 3: Detail cetak */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>Detail cetak</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="hk-inline-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="hk-field-group">
                    <label className="hk-label" style={{ textTransform: 'none', fontWeight: 600 }}>Jumlah halaman</label>
                    <div className="hk-input-suffix-row">
                      <input
                        type="number"
                        min="1"
                        className="hk-input"
                        placeholder="—"
                        value={jumlahHalaman}
                        onChange={e => setJumlahHalaman(e.target.value)}
                      />
                      <span className="hk-suffix">HALAMAN</span>
                    </div>
                  </div>
                  <div className="hk-field-group">
                    <label className="hk-label" style={{ textTransform: 'none', fontWeight: 600 }}>Jumlah eksemplar</label>
                    <div className="hk-input-suffix-row">
                      <input
                        type="number"
                        min="1"
                        className="hk-input"
                        placeholder="—"
                        value={jumlahEksemplar}
                        onChange={e => setJumlahEksemplar(e.target.value)}
                      />
                      <span className="hk-suffix">BUKU</span>
                    </div>
                  </div>
                </div>

                <div className="hk-inline-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="hk-field-group">
                    <label className="hk-label" style={{ textTransform: 'none', fontWeight: 600 }}>Mode cetak</label>
                    <select className="hk-select" value={modeCetak} onChange={e => setModeCetak(e.target.value)}>
                      {MODE_CETAK.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="hk-field-group">
                    <label className="hk-label" style={{ textTransform: 'none', fontWeight: 600 }}>Jenis jilid</label>
                    <select className="hk-select" value={jenisJilid} onChange={e => setJenisJilid(e.target.value)}>
                      {JENIS_JILID.map(j => <option key={j}>{j}</option>)}
                    </select>
                  </div>
                </div>

                <div className="hk-inline-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="hk-field-group">
                    <label className="hk-label" style={{ textTransform: 'none', fontWeight: 600 }}>Jenis cover</label>
                    <select className="hk-select" value={jenisCover} onChange={e => setJenisCover(e.target.value)}>
                      {JENIS_COVER.map(j => <option key={j}>{j}</option>)}
                    </select>
                  </div>
                  <div className="hk-field-group">
                    <label className="hk-label" style={{ textTransform: 'none', fontWeight: 600 }}>Tebal punggung</label>
                    <div className="hk-input-suffix-row">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        className="hk-input"
                        value={tebalPunggung}
                        onChange={e => setTebalPunggung(Number(e.target.value))}
                      />
                      <span className="hk-suffix">CM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="hk-divider" style={{ margin: '4px 0' }} />

            {/* Section 4: Harga kertas */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>Harga kertas</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="hk-inline-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="hk-field-group">
                    <label className="hk-label" style={{ textTransform: 'none', fontWeight: 600 }}>Harga rim isi</label>
                    <div className="hk-input-suffix-row">
                      <input
                        type="number"
                        min="0"
                        className="hk-input"
                        placeholder="—"
                        value={hargaRimIsi}
                        onChange={e => setHargaRimIsi(e.target.value)}
                      />
                      <span className="hk-suffix">RP</span>
                    </div>
                  </div>
                  <div className="hk-field-group">
                    <label className="hk-label" style={{ textTransform: 'none', fontWeight: 600 }}>Harga rim cover</label>
                    <div className="hk-input-suffix-row">
                      <input
                        type="number"
                        min="0"
                        className="hk-input"
                        placeholder="—"
                        value={hargaRimCover}
                        onChange={e => setHargaRimCover(e.target.value)}
                      />
                      <span className="hk-suffix">RP</span>
                    </div>
                  </div>
                </div>

                <div className="hk-inline-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="hk-field-group">
                    <label className="hk-label" style={{ textTransform: 'none', fontWeight: 600 }}>Isi per rim</label>
                    <div className="hk-input-suffix-row">
                      <input
                        type="number"
                        min="1"
                        className="hk-input"
                        value={laPerRim}
                        onChange={e => setLaPerRim(Math.max(1, Number(e.target.value)))}
                      />
                      <span className="hk-suffix">LEMBAR</span>
                    </div>
                  </div>
                  <div className="hk-field-group">
                    <label className="hk-label" style={{ textTransform: 'none', fontWeight: 600 }}>Waste produksi</label>
                    <div className="hk-input-suffix-row">
                      <input
                        type="number"
                        min="0"
                        className="hk-input"
                        value={wasteProduksi}
                        onChange={e => setWasteProduksi(Math.max(0, Number(e.target.value)))}
                      />
                      <span className="hk-suffix">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Riwayat */}
          <div className="hk-history-section">
            <div className="hk-history-title">Simpan hasil aktif ke Riwayat</div>
            <div className="hk-history-subtitle">Hanya hasil valid yang dapat masuk ke riwayat.</div>
            {[1, 2, 3].map(i => (
              <div key={i} className="hk-history-item">
                <span className="hk-history-badge">Waktu</span>
                <div className="hk-history-info">
                  <span className="hk-history-name">Layout {paperW} x {paperH} · {i} pcs</span>
                  <span className="hk-history-meta">Ananda Rafii Aflarid Suprayogi · 15/8/2026, 10:06:{10 + i * 10}</span>
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
              <span>⊙ Kalkulasi aktif: {calc.halamanFinal} hal · {jumlahEksemplar ? `${jumlahEksemplar} eks` : '—'}</span>
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
              {jenisCover.toLowerCase().includes('tanpa cover') ? (
                <p>• Tanpa cover terpisah: sampul menggunakan bahan kertas yang sama dengan isi buku.</p>
              ) : (
                <p>• {jenisCover} dihitung sebagai satu bentang depan + punggung + belakang.</p>
              )}
              <p>• Referensi awal: 100 halaman 60 gsm → 0,8 cm; 300 halaman → 1,5 cm.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
