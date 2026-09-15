import React, { useState, useMemo } from 'react';
import { Clock } from 'lucide-react';

const JOB_TYPES = [
  {
    id: 'lembaran-a3',
    label: 'Lembaran A3+',
    desc: 'Cetak lembaran simplex atau duplex',
    baseMinutes: 5,
    perLembar: 0.1,
  },
  {
    id: 'cetak-meteran',
    label: 'Cetak Meteran',
    desc: 'Estimasi berdasarkan luas (m²)',
    baseMinutes: 8,
    perLembar: 0.2,
  },
  {
    id: 'kartu-nama',
    label: 'Kartu Nama',
    desc: '20 lembar A3 per box',
    baseMinutes: 3,
    perLembar: 0.05,
  },
  {
    id: 'saddle-stitch',
    label: 'Buku Saddle Stitch',
    desc: 'Cetak isi dan jilid staples',
    baseMinutes: 15,
    perLembar: 0.3,
  },
  {
    id: 'perfect-binding',
    label: 'Buku Perfect Binding',
    desc: 'Cetak isi dan laminasi punggung',
    baseMinutes: 20,
    perLembar: 0.4,
  },
  {
    id: 'hard-cover',
    label: 'Buku Hard Cover',
    desc: 'Cetak isi dan pengerjaan manual cover',
    baseMinutes: 30,
    perLembar: 0.6,
  },
];

const BOOK_SIZES = ['A5', 'A4', 'A6', '17×24'];

const FINISHING_OPTIONS = [
  { id: 'laminasi', label: 'Laminasi 1 jenis', col: 1 },
  { id: 'ganti-roll', label: 'Ganti roll laminasi kedua', col: 2 },
  { id: 'potong-standar', label: 'Potong ukuran standar', col: 1 },
  { id: 'potong-custom', label: 'Potong ukuran custom', col: 2 },
  { id: 'die-cut', label: 'Die cut', col: 1 },
  { id: 'kiss-cut', label: 'Kiss cut', col: 2 },
];

export default function EstimasiWaktu() {
  const [selectedJob, setSelectedJob] = useState('hard-cover');
  const [jumlahHalaman, setJumlahHalaman] = useState(4);
  const [eksemplar, setEksemplar] = useState(1);
  const [bookSize, setBookSize] = useState('A5');
  const [finishing, setFinishing] = useState({ laminasi: true, 'potong-standar': true });
  const [mulaiProduksi, setMulaiProduksi] = useState('2026-12-08T17:42');

  const toggleFinishing = (id) => {
    setFinishing(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const job = JOB_TYPES.find(j => j.id === selectedJob);

  const result = useMemo(() => {
    if (!job) return null;
    const lembarFinishing = Math.ceil(jumlahHalaman / 4) * eksemplar;
    const baseMin = job.baseMinutes + lembarFinishing * job.perLembar;
    const finishingExtra = Object.entries(finishing).filter(([, v]) => v).length * 2;
    const minDur = Math.round(baseMin + finishingExtra);
    const maxDur = Math.round(minDur * 1.25);
    const pekerjaanAktif = 1;

    const start = new Date(mulaiProduksi);
    const selesaiCepat = new Date(start.getTime() + minDur * 60000);
    const selesaiLama = new Date(start.getTime() + maxDur * 60000);

    const fmt = (d) => {
      const dd = d.getDate(), mm = d.getMonth() + 1, yy = d.getFullYear();
      const hh = d.getHours(), min = String(d.getMinutes()).padStart(2, '0');
      return `${dd} Agu ${yy}, ${hh}.${min}`;
    };

    return {
      minDur,
      maxDur,
      lembarFinishing,
      pekerjaanAktif,
      selesaiCepat: fmt(selesaiCepat),
      selesaiLama: fmt(selesaiLama),
      breakdown: job.label,
      nooks: eksemplar,
    };
  }, [job, jumlahHalaman, eksemplar, finishing, mulaiProduksi]);

  return (
    <div className="hk-screen">
      {/* Top Bar */}
      <div className="hk-topbar">
        <h2 className="hk-topbar-title">Estimasi Waktu {eksemplar}</h2>
        <div className="hk-topbar-right">
          <span className="hk-topbar-label">Layout 48×32 · tanpa qty pcs</span>
          <button className="hk-save-btn">
            <Clock size={15} />
            <span>Simpan Perhitungan</span>
          </button>
        </div>
      </div>

      <div className="hk-body">
        {/* Left Panel */}
        <div className="hk-left-panel">
          <div className="hk-card">
            <div className="hk-card-header">
              <div className="hk-card-icon blue"><Clock size={15} /></div>
              <span className="hk-card-title">Estimasi Waktu</span>
            </div>

            {/* Jenis Pekerjaan */}
            <div className="hk-form-section">
              <div className="hk-form-section-title">Jenis pekerjaan</div>
              <div className="hk-job-type-list">
                {JOB_TYPES.map(j => (
                  <label key={j.id} className={`hk-job-option ${selectedJob === j.id ? 'is-active' : ''}`}>
                    <input
                      type="radio"
                      name="jobType"
                      value={j.id}
                      checked={selectedJob === j.id}
                      onChange={() => setSelectedJob(j.id)}
                      className="hk-radio"
                    />
                    <div className="hk-job-option-content">
                      <span className="hk-job-label">{j.label}</span>
                      <span className="hk-job-desc">{j.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Params */}
            <div className="hk-form-section">
              <div className="hk-inline-fields">
                <div className="hk-field-group">
                  <label className="hk-label">Jumlah halaman</label>
                  <div className="hk-input-suffix-row">
                    <input type="number" className="hk-input" value={jumlahHalaman} onChange={e => setJumlahHalaman(Number(e.target.value))} />
                    <span className="hk-suffix">HALAMAN</span>
                  </div>
                </div>
                <div className="hk-field-group">
                  <label className="hk-label">Eksemplar</label>
                  <div className="hk-input-suffix-row">
                    <input type="number" className="hk-input" value={eksemplar} onChange={e => setEksemplar(Number(e.target.value))} />
                    <span className="hk-suffix">BUKU</span>
                  </div>
                </div>
              </div>

              <div className="hk-form-section-title" style={{ marginTop: 12 }}>Ukuran buku</div>
              <div className="hk-size-pills">
                {BOOK_SIZES.map(s => (
                  <button key={s} className={`hk-size-pill ${bookSize === s ? 'is-active' : ''}`} onClick={() => setBookSize(s)}>{s}</button>
                ))}
              </div>
            </div>

            {/* Finishing Tambahan */}
            <div className="hk-form-section">
              <div className="hk-form-section-title">Finishing tambahan</div>
              <div className="hk-finishing-grid">
                {FINISHING_OPTIONS.map(opt => (
                  <label key={opt.id} className="hk-checkbox-label">
                    <input
                      type="checkbox"
                      className="hk-checkbox"
                      checked={!!finishing[opt.id]}
                      onChange={() => toggleFinishing(opt.id)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Mulai Produksi */}
            <div className="hk-form-section">
              <div className="hk-field-group">
                <label className="hk-label">Mulai produksi</label>
                <input
                  type="datetime-local"
                  className="hk-input hk-datetime-input"
                  value={mulaiProduksi}
                  onChange={e => setMulaiProduksi(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Riwayat */}
          <div className="hk-history-section">
            <div className="hk-history-title">Riwayat Perhitungan</div>
            <div className="hk-history-subtitle">Snapshot hasil yang tersimpan di Firestore.</div>
          </div>
        </div>

        {/* Right Panel: Results */}
        {result && (
          <div className="hk-right-results-panel">
            <div className="hk-card hk-results-card">
              <div className="kb-results-title">Waktu pengerjaan</div>

              <div className="ew-duration-row">
                <div className="ew-duration-card ew-card-primary">
                  <div className="ew-card-label">DURASI MINIMUM</div>
                  <div className="ew-card-value">{result.minDur} menit</div>
                </div>
                <div className="ew-duration-card ew-card-secondary">
                  <div className="ew-card-label">DURASI MAKSIMUM</div>
                  <div className="ew-card-value">{result.maxDur} menit</div>
                </div>
              </div>

              <div className="kb-results-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="kb-result-cell">
                  <div className="kb-result-label">LEMBAR FINISHING</div>
                  <div className="kb-result-big">{result.lembarFinishing}</div>
                </div>
                <div className="kb-result-cell">
                  <div className="kb-result-label">PEKERJAAN AKTIF</div>
                  <div className="kb-result-big">{result.pekerjaanAktif}</div>
                </div>
                <div className="kb-result-cell">
                  <div className="kb-result-label">SELESAI TERCEPAT</div>
                  <div className="ew-time-value">{result.selesaiCepat}</div>
                </div>
                <div className="kb-result-cell">
                  <div className="kb-result-label">SELESAI TERLAMA</div>
                  <div className="ew-time-value">{result.selesaiLama}</div>
                </div>
              </div>

              <div className="kb-cost-divider" />

              <div className="ew-breakdown-section">
                <div className="hk-form-section-title">BREAKDOWN PEKERJAAN</div>
                <div className="ew-breakdown-item">
                  <div className="ew-breakdown-left">
                    <span className="ew-breakdown-name">{result.breakdown}</span>
                    <span className="ew-breakdown-meta">{result.nooks} buku · 1 mesin</span>
                  </div>
                  <div className="ew-breakdown-duration">{result.minDur} menit</div>
                </div>
              </div>

              <div className="ew-note">
                Ukuran buku memiliki format yang berbeda-beda sesuai ukuran desain. Estimasi memertimbangkan
                kemampuan dari jam kerja, jam kerja, dan faktor lain.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
