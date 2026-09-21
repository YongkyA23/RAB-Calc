import React, { useState, useMemo } from 'react';
import { Clock } from 'lucide-react';

const BOOK_SIZES = ['A5', 'A4', 'A6', '17×24'];

const FINISHING_OPTIONS = [
  { id: 'laminasi1', label: 'Laminasi 1 jenis', duration: 15 },
  { id: 'gantiRoll', label: 'Ganti roll laminasi kedua', duration: 10 },
  { id: 'potongStandar', label: 'Potong ukuran standar', duration: 10 },
  { id: 'potongCustom', label: 'Potong ukuran custom', duration: 20 },
  { id: 'dieCut', label: 'Die cut', duration: 30 },
  { id: 'kissCut', label: 'Kiss cut', duration: 25 },
];

const INITIAL_JOBS_STATE = {
  'lembaran-a3': {
    active: true,
    id: 'lembaran-a3',
    label: 'Lembaran A3+',
    desc: 'Cetak lembar simplex atau duplex',
    jumlahLembar: 1,
    modeCetak: 'Bolak-balik / duplex',
  },
  'cetak-meteran': {
    active: true,
    id: 'cetak-meteran',
    label: 'Cetak Meteran',
    desc: 'Estimasi berdasarkan luas m²',
    luas: 1,
  },
  'kartu-nama': {
    active: true,
    id: 'kartu-nama',
    label: 'Kartu Nama',
    desc: '20 lembar A3 per box',
    jumlahBox: 1,
  },
  'saddle-stitch': {
    active: true,
    id: 'saddle-stitch',
    label: 'Buku Saddle Stitch',
    desc: 'Cetak isi dan jilid staples',
    jumlahHalaman: 1,
    eksemplar: 1,
    ukuranBuku: 'A5',
  },
  'perfect-binding': {
    active: true,
    id: 'perfect-binding',
    label: 'Buku Perfect Binding',
    desc: 'Cetak isi dan lem punggung',
    jumlahHalaman: 1,
    eksemplar: 1,
    ukuranBuku: 'A5',
  },
  'hard-cover': {
    active: true,
    id: 'hard-cover',
    label: 'Buku Hard Cover',
    desc: 'Cetak isi dan pengerjaan manual cover',
    jumlahHalaman: 1,
    eksemplar: 1,
    ukuranBuku: 'A5',
  },
};

function formatDuration(totalMinutes) {
  if (!Number.isFinite(totalMinutes)) return '—';
  const minutes = Math.max(0, Math.ceil(totalMinutes));
  if (minutes < 60) {
    return `${minutes} menit`;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (rest === 0) {
    return `${hours} jam`;
  }
  return `${hours} jam ${rest} menit`;
}

export default function EstimasiWaktu() {
  const [jobs, setJobs] = useState(INITIAL_JOBS_STATE);

  const [finishing, setFinishing] = useState({
    laminasi1: true,
    gantiRoll: true,
    potongStandar: true,
    potongCustom: true,
    dieCut: true,
    kissCut: true,
  });

  const [startAt, setStartAt] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });

  const toggleJob = (id) => {
    setJobs((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        active: !prev[id].active,
      },
    }));
  };

  const updateJobField = (id, field, value) => {
    setJobs((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const calculationResult = useMemo(() => {
    const activeJobsList = Object.values(jobs).filter((j) => j.active);
    let jobTotalMinutes = 0;
    let totalFinishingSheets = 0;
    const breakdownItems = [];

    activeJobsList.forEach((j) => {
      let duration = 0;
      let finishingSheets = 0;
      let meta = '';

      if (j.id === 'lembaran-a3') {
        const sheets = Math.max(1, Number(j.jumlahLembar) || 1);
        duration = sheets * 1;
        finishingSheets = sheets;
        meta = `${sheets} lembar`;
      } else if (j.id === 'cetak-meteran') {
        const luas = Math.max(1, Number(j.luas) || 1);
        duration = luas * 10;
        finishingSheets = 0;
        meta = `${luas} m²`;
      } else if (j.id === 'kartu-nama') {
        const box = Math.max(1, Number(j.jumlahBox) || 1);
        duration = box * 2;
        finishingSheets = box * 20;
        meta = `${box} box`;
      } else if (j.id === 'saddle-stitch') {
        const hal = Math.max(1, Number(j.jumlahHalaman) || 1);
        const eks = Math.max(1, Number(j.eksemplar) || 1);
        duration = eks * 3;
        finishingSheets = Math.ceil(hal / 4) * eks;
        meta = `${eks} buku · ${hal} halaman`;
      } else if (j.id === 'perfect-binding') {
        const hal = Math.max(1, Number(j.jumlahHalaman) || 1);
        const eks = Math.max(1, Number(j.eksemplar) || 1);
        duration = eks * 4;
        finishingSheets = Math.ceil(hal / 2) * eks;
        meta = `${eks} buku · ${hal} halaman`;
      } else if (j.id === 'hard-cover') {
        const hal = Math.max(1, Number(j.jumlahHalaman) || 1);
        const eks = Math.max(1, Number(j.eksemplar) || 1);
        duration = eks * 9;
        finishingSheets = Math.ceil(hal / 2) * eks;
        meta = `${eks} buku · ${hal} halaman`;
      }

      jobTotalMinutes += duration;
      totalFinishingSheets += finishingSheets;

      breakdownItems.push({
        id: j.id,
        label: j.label,
        meta,
        duration: formatDuration(duration),
        isFinishing: false,
      });
    });

    // Finishing dynamic calculation based on totalFinishingSheets
    let finishingMinMinutes = 0;
    let finishingMaxMinutes = 0;
    const sheets = totalFinishingSheets;

    if (finishing.laminasi1 && sheets > 0) {
      const mins = 30 + Math.ceil(sheets / 15);
      finishingMinMinutes += mins;
      finishingMaxMinutes += mins;
      breakdownItems.push({
        id: 'laminasi1',
        label: 'Laminasi 1 jenis',
        isFinishing: true,
        duration: `${formatDuration(mins)}`,
      });
    }

    if (finishing.gantiRoll && finishing.laminasi1 && sheets > 0) {
      finishingMinMinutes += 15;
      finishingMaxMinutes += 20;
      breakdownItems.push({
        id: 'gantiRoll',
        label: 'Ganti roll laminasi kedua',
        isFinishing: true,
        duration: `${formatDuration(15)} – ${formatDuration(20)}`,
      });
    }

    if (finishing.potongStandar && sheets > 0) {
      const minM = 30 + sheets * 3;
      const maxM = 30 + sheets * 5;
      finishingMinMinutes += minM;
      finishingMaxMinutes += maxM;
      breakdownItems.push({
        id: 'potongStandar',
        label: 'Potong standar',
        isFinishing: true,
        duration: `${formatDuration(minM)} – ${formatDuration(maxM)}`,
      });
    }

    if (finishing.potongCustom && sheets > 0) {
      const minM = 30 + sheets * 5;
      const maxM = 30 + sheets * 8;
      finishingMinMinutes += minM;
      finishingMaxMinutes += maxM;
      breakdownItems.push({
        id: 'potongCustom',
        label: 'Potong custom',
        isFinishing: true,
        duration: `${formatDuration(minM)} – ${formatDuration(maxM)}`,
      });
    }

    if (finishing.dieCut && sheets > 0) {
      const minM = 45 + sheets * 2;
      const maxM = 60 + sheets * 3;
      finishingMinMinutes += minM;
      finishingMaxMinutes += maxM;
      breakdownItems.push({
        id: 'dieCut',
        label: 'Die cut',
        isFinishing: true,
        duration: `${formatDuration(minM)} – ${formatDuration(maxM)}`,
      });
    }

    if (finishing.kissCut && sheets > 0) {
      const minM = 30 + sheets * 2;
      const maxM = 45 + sheets * 3;
      finishingMinMinutes += minM;
      finishingMaxMinutes += maxM;
      breakdownItems.push({
        id: 'kissCut',
        label: 'Kiss cut',
        isFinishing: true,
        duration: `${formatDuration(minM)} – ${formatDuration(maxM)}`,
      });
    }

    const minTotal = jobTotalMinutes + finishingMinMinutes;
    const maxTotal = jobTotalMinutes + finishingMaxMinutes;

    const startDate = startAt ? new Date(startAt) : new Date();
    const baseTime = Number.isNaN(startDate.getTime()) ? new Date().getTime() : startDate.getTime();

    const selesaiCepatDate = new Date(baseTime + minTotal * 60000);
    const selesaiLamaDate = new Date(baseTime + maxTotal * 60000);

    const fmt = (d) => {
      const dd = d.getDate();
      const mm = d.toLocaleString('id-ID', { month: 'short' });
      const yy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${dd} ${mm} ${yy}, ${hh}.${min}`;
    };

    return {
      minDur: minTotal,
      maxDur: maxTotal,
      lembarFinishing: totalFinishingSheets,
      pekerjaanAktif: activeJobsList.length,
      selesaiCepat: fmt(selesaiCepatDate),
      selesaiLama: fmt(selesaiLamaDate),
      breakdownItems,
    };
  }, [jobs, finishing, startAt]);

  return (
    <div className="hk-screen">
      {/* Top Bar */}
      <div className="hk-topbar">
        <h2 className="hk-topbar-title">Estimasi Waktu</h2>
        <div className="hk-topbar-right">
          <span className="hk-topbar-label">
            {calculationResult.pekerjaanAktif} pekerjaan aktif · {formatDuration(calculationResult.minDur)}
          </span>
          <button className="hk-save-btn">
            <Clock size={15} />
            <span>Simpan Perhitungan</span>
          </button>
        </div>
      </div>

      <div className="hk-body">
        {/* Left Panel: Dynamic Multi-Job Cards */}
        <div className="hk-left-panel">
          <div className="hk-job-type-list">
            {/* 1. Lembaran A3+ */}
            <div className={`ew-job-card ${jobs['lembaran-a3'].active ? 'is-active' : ''}`}>
              <div className="ew-job-header" onClick={() => toggleJob('lembaran-a3')}>
                <input
                  type="checkbox"
                  className="ew-checkbox"
                  checked={jobs['lembaran-a3'].active}
                  onChange={() => {}}
                />
                <div className="ew-job-header-text">
                  <span className="ew-job-title">Lembaran A3+</span>
                  <span className="ew-job-desc">Cetak lembar simplex atau duplex</span>
                </div>
              </div>

              {jobs['lembaran-a3'].active && (
                <div className="ew-job-fields-grid">
                  <div className="ew-job-field">
                    <label className="ew-field-label">Jumlah lembar</label>
                    <div className="hk-input-suffix-row">
                      <input
                        type="number"
                        className="hk-input"
                        value={jobs['lembaran-a3'].jumlahLembar}
                        onChange={(e) => updateJobField('lembaran-a3', 'jumlahLembar', Number(e.target.value))}
                      />
                      <span className="hk-suffix">LEMBAR</span>
                    </div>
                  </div>
                  <div className="ew-job-field">
                    <label className="ew-field-label">Mode cetak</label>
                    <select
                      className="hk-select"
                      value={jobs['lembaran-a3'].modeCetak}
                      onChange={(e) => updateJobField('lembaran-a3', 'modeCetak', e.target.value)}
                    >
                      <option value="Bolak-balik / duplex">Bolak-balik / duplex</option>
                      <option value="1 sisi / simplex">1 sisi / simplex</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Cetak Meteran */}
            <div className={`ew-job-card ${jobs['cetak-meteran'].active ? 'is-active' : ''}`}>
              <div className="ew-job-header" onClick={() => toggleJob('cetak-meteran')}>
                <input
                  type="checkbox"
                  className="ew-checkbox"
                  checked={jobs['cetak-meteran'].active}
                  onChange={() => {}}
                />
                <div className="ew-job-header-text">
                  <span className="ew-job-title">Cetak Meteran</span>
                  <span className="ew-job-desc">Estimasi berdasarkan luas m²</span>
                </div>
              </div>

              {jobs['cetak-meteran'].active && (
                <div className="ew-job-fields-grid">
                  <div className="ew-job-field">
                    <label className="ew-field-label">Luas cetak</label>
                    <div className="hk-input-suffix-row">
                      <input
                        type="number"
                        className="hk-input"
                        value={jobs['cetak-meteran'].luas}
                        onChange={(e) => updateJobField('cetak-meteran', 'luas', Number(e.target.value))}
                      />
                      <span className="hk-suffix">M²</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Kartu Nama */}
            <div className={`ew-job-card ${jobs['kartu-nama'].active ? 'is-active' : ''}`}>
              <div className="ew-job-header" onClick={() => toggleJob('kartu-nama')}>
                <input
                  type="checkbox"
                  className="ew-checkbox"
                  checked={jobs['kartu-nama'].active}
                  onChange={() => {}}
                />
                <div className="ew-job-header-text">
                  <span className="ew-job-title">Kartu Nama</span>
                  <span className="ew-job-desc">20 lembar A3 per box</span>
                </div>
              </div>

              {jobs['kartu-nama'].active && (
                <div className="ew-job-fields-grid">
                  <div className="ew-job-field">
                    <label className="ew-field-label">Jumlah box</label>
                    <div className="hk-input-suffix-row">
                      <input
                        type="number"
                        className="hk-input"
                        value={jobs['kartu-nama'].jumlahBox}
                        onChange={(e) => updateJobField('kartu-nama', 'jumlahBox', Number(e.target.value))}
                      />
                      <span className="hk-suffix">BOX</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Buku Saddle Stitch */}
            <div className={`ew-job-card ${jobs['saddle-stitch'].active ? 'is-active' : ''}`}>
              <div className="ew-job-header" onClick={() => toggleJob('saddle-stitch')}>
                <input
                  type="checkbox"
                  className="ew-checkbox"
                  checked={jobs['saddle-stitch'].active}
                  onChange={() => {}}
                />
                <div className="ew-job-header-text">
                  <span className="ew-job-title">Buku Saddle Stitch</span>
                  <span className="ew-job-desc">Cetak isi dan jilid staples</span>
                </div>
              </div>

              {jobs['saddle-stitch'].active && (
                <div className="ew-job-fields-grid">
                  <div className="ew-job-field">
                    <label className="ew-field-label">Jumlah halaman</label>
                    <div className="hk-input-suffix-row">
                      <input
                        type="number"
                        className="hk-input"
                        value={jobs['saddle-stitch'].jumlahHalaman}
                        onChange={(e) => updateJobField('saddle-stitch', 'jumlahHalaman', Number(e.target.value))}
                      />
                      <span className="hk-suffix">HALAMAN</span>
                    </div>
                  </div>
                  <div className="ew-job-field">
                    <label className="ew-field-label">Eksemplar</label>
                    <div className="hk-input-suffix-row">
                      <input
                        type="number"
                        className="hk-input"
                        value={jobs['saddle-stitch'].eksemplar}
                        onChange={(e) => updateJobField('saddle-stitch', 'eksemplar', Number(e.target.value))}
                      />
                      <span className="hk-suffix">BUKU</span>
                    </div>
                  </div>
                  <div className="ew-job-field">
                    <label className="ew-field-label">Ukuran buku</label>
                    <select
                      className="hk-select"
                      value={jobs['saddle-stitch'].ukuranBuku}
                      onChange={(e) => updateJobField('saddle-stitch', 'ukuranBuku', e.target.value)}
                    >
                      {BOOK_SIZES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Buku Perfect Binding */}
            <div className={`ew-job-card ${jobs['perfect-binding'].active ? 'is-active' : ''}`}>
              <div className="ew-job-header" onClick={() => toggleJob('perfect-binding')}>
                <input
                  type="checkbox"
                  className="ew-checkbox"
                  checked={jobs['perfect-binding'].active}
                  onChange={() => {}}
                />
                <div className="ew-job-header-text">
                  <span className="ew-job-title">Buku Perfect Binding</span>
                  <span className="ew-job-desc">Cetak isi dan lem punggung</span>
                </div>
              </div>

              {jobs['perfect-binding'].active && (
                <div className="ew-job-fields-grid">
                  <div className="ew-job-field">
                    <label className="ew-field-label">Jumlah halaman</label>
                    <div className="hk-input-suffix-row">
                      <input
                        type="number"
                        className="hk-input"
                        value={jobs['perfect-binding'].jumlahHalaman}
                        onChange={(e) => updateJobField('perfect-binding', 'jumlahHalaman', Number(e.target.value))}
                      />
                      <span className="hk-suffix">HALAMAN</span>
                    </div>
                  </div>
                  <div className="ew-job-field">
                    <label className="ew-field-label">Eksemplar</label>
                    <div className="hk-input-suffix-row">
                      <input
                        type="number"
                        className="hk-input"
                        value={jobs['perfect-binding'].eksemplar}
                        onChange={(e) => updateJobField('perfect-binding', 'eksemplar', Number(e.target.value))}
                      />
                      <span className="hk-suffix">BUKU</span>
                    </div>
                  </div>
                  <div className="ew-job-field">
                    <label className="ew-field-label">Ukuran buku</label>
                    <select
                      className="hk-select"
                      value={jobs['perfect-binding'].ukuranBuku}
                      onChange={(e) => updateJobField('perfect-binding', 'ukuranBuku', e.target.value)}
                    >
                      {BOOK_SIZES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* 6. Buku Hard Cover (Gambar 2) */}
            <div className={`ew-job-card ${jobs['hard-cover'].active ? 'is-active' : ''}`}>
              <div className="ew-job-header" onClick={() => toggleJob('hard-cover')}>
                <input
                  type="checkbox"
                  className="ew-checkbox"
                  checked={jobs['hard-cover'].active}
                  onChange={() => {}}
                />
                <div className="ew-job-header-text">
                  <span className="ew-job-title">Buku Hard Cover</span>
                  <span className="ew-job-desc">Cetak isi dan pengerjaan manual cover</span>
                </div>
              </div>

              {jobs['hard-cover'].active && (
                <div className="ew-job-fields-grid">
                  <div className="ew-job-field">
                    <label className="ew-field-label">Jumlah halaman</label>
                    <div className="hk-input-suffix-row">
                      <input
                        type="number"
                        className="hk-input"
                        value={jobs['hard-cover'].jumlahHalaman}
                        onChange={(e) => updateJobField('hard-cover', 'jumlahHalaman', Number(e.target.value))}
                      />
                      <span className="hk-suffix">HALAMAN</span>
                    </div>
                  </div>
                  <div className="ew-job-field">
                    <label className="ew-field-label">Eksemplar</label>
                    <div className="hk-input-suffix-row">
                      <input
                        type="number"
                        className="hk-input"
                        value={jobs['hard-cover'].eksemplar}
                        onChange={(e) => updateJobField('hard-cover', 'eksemplar', Number(e.target.value))}
                      />
                      <span className="hk-suffix">BUKU</span>
                    </div>
                  </div>
                  <div className="ew-job-field">
                    <label className="ew-field-label">Ukuran buku</label>
                    <select
                      className="hk-select"
                      value={jobs['hard-cover'].ukuranBuku}
                      onChange={(e) => updateJobField('hard-cover', 'ukuranBuku', e.target.value)}
                    >
                      {BOOK_SIZES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section: Finishing tambahan */}
          <div className="hk-card" style={{ marginTop: 16, padding: '18px 20px', background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0' }}>
            <div style={{ marginBottom: 12 }}>
              <h3 style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', margin: 0 }}>Finishing tambahan</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {FINISHING_OPTIONS.map((item) => {
                const isChecked = !!finishing[item.id];
                const disabled = item.id === 'gantiRoll' && !finishing.laminasi1;
                return (
                  <label
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      borderRadius: 14,
                      border: `1.5px solid ${isChecked ? '#BFDBFE' : '#E2E8F0'}`,
                      background: isChecked ? '#EFF6FF' : '#FFFFFF',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      opacity: disabled ? 0.5 : 1,
                      transition: 'all 0.15s ease',
                      userSelect: 'none',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={disabled}
                      onChange={(e) => {
                        const next = { ...finishing, [item.id]: e.target.checked };
                        if (item.id === 'laminasi1' && !e.target.checked) {
                          next.gantiRoll = false;
                        }
                        setFinishing(next);
                      }}
                      className="custom-checkbox"
                      style={{ width: 16, height: 16, accentColor: '#2563EB', cursor: disabled ? 'not-allowed' : 'pointer' }}
                    />
                    <span style={{ fontSize: 13, fontWeight: 600, color: isChecked ? '#1E40AF' : '#334155' }}>
                      {item.label}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Mulai produksi divider & field */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #F1F5F9' }}>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', display: 'block' }}>Mulai produksi</label>
              </div>
              <div>
                <input
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '1px solid #E2E8F0',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#1E293B',
                    background: '#FFFFFF',
                  }}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Panel: Results (Gambar 1) */}
        <div className="hk-right-results-panel">
          <div className="hk-card hk-results-card">
            <div>
              <div className="hk-section-label hk-blue-label" style={{ marginBottom: 4 }}>
                RENTANG ESTIMASI
              </div>
              <div className="kb-results-title" style={{ fontSize: 18, fontWeight: 800 }}>
                Waktu pengerjaan
              </div>
            </div>

            <div className="ew-duration-row">
              <div className="ew-duration-card ew-card-primary">
                <div className="ew-card-label">DURASI MINIMUM</div>
                <div className="ew-card-value">{formatDuration(calculationResult.minDur)}</div>
              </div>
              <div className="ew-duration-card ew-card-secondary">
                <div className="ew-card-label">DURASI MAKSIMUM</div>
                <div className="ew-card-value">{formatDuration(calculationResult.maxDur)}</div>
              </div>
            </div>

            <div className="kb-results-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="kb-result-cell">
                <div className="kb-result-label">LEMBAR FINISHING</div>
                <div className="kb-result-big">{calculationResult.lembarFinishing}</div>
              </div>
              <div className="kb-result-cell">
                <div className="kb-result-label">PEKERJAAN AKTIF</div>
                <div className="kb-result-big">{calculationResult.pekerjaanAktif}</div>
              </div>
              <div className="kb-result-cell">
                <div className="kb-result-label">SELESAI TERCEPAT</div>
                <div className="ew-time-value">{calculationResult.selesaiCepat}</div>
              </div>
              <div className="kb-result-cell">
                <div className="kb-result-label">SELESAI TERLAMA</div>
                <div className="ew-time-value">{calculationResult.selesaiLama}</div>
              </div>
            </div>

            <div className="kb-cost-divider" />

            <div className="ew-breakdown-section" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.08em', color: '#94A3B8', marginBottom: 2 }}>
                BREAKDOWN PEKERJAAN
              </div>
              {calculationResult.breakdownItems.length === 0 ? (
                <div style={{ fontSize: 12, color: '#94A3B8', padding: '8px 0' }}>
                  Tidak ada pekerjaan aktif yang dipilih.
                </div>
              ) : (
                calculationResult.breakdownItems.map((item) => (
                  <div 
                    key={item.id} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: item.isFinishing ? '#EFF6FF' : '#F8FAFC',
                      borderRadius: 14,
                      padding: '11px 16px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: item.isFinishing ? '#1D4ED8' : '#0F172A' }}>
                        {item.label}
                      </span>
                      {item.meta && (
                        <span style={{ fontSize: 11.5, fontWeight: 500, color: '#94A3B8' }}>
                          {item.meta}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: item.isFinishing ? '#1E3A8A' : '#0F172A', whiteSpace: 'nowrap' }}>
                      {item.duration}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ marginTop: 14, background: '#F8FAFC', borderRadius: 14, padding: '12px 16px', fontSize: 11, color: '#64748B', lineHeight: 1.5 }}>
              Ukuran buku masih informatif sampai rate berbasis ukuran disetujui. Estimasi memakai menit kalender dan belum memperhitungkan antrean mesin, jam kerja, atau hari libur.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
