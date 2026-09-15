import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Scissors } from 'lucide-react';

const PAPER_PRESETS = [
  { id: '65x100', label: '65×100', sub: '65×100 cm', w: 65, h: 100 },
  { id: '79x109', label: '79×109', sub: '79×109 cm', w: 79, h: 109 },
  { id: '61x86',  label: '61×86',  sub: '61×86 cm',  w: 61, h: 86 },
  { id: '72x102', label: '72×102', sub: '72×102 cm', w: 72, h: 102 },
];

function PotongPreview({ paperW, paperH, planoW, planoH }) {
  const canvasRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cvW = canvas.width;
    const cvH = canvas.height;
    ctx.clearRect(0, 0, cvW, cvH);

    // Background
    ctx.fillStyle = '#E8EAF0';
    ctx.fillRect(0, 0, cvW, cvH);

    if (!paperW || !paperH || !planoW || !planoH) return;

    const PAD = 24;
    const maxBoundW = Math.max(paperW, planoW);
    const maxBoundH = Math.max(paperH, planoH);
    const scaleX = (cvW - PAD * 2) / maxBoundW;
    const scaleY = (cvH - PAD * 2) / maxBoundH;
    const scale = Math.min(scaleX, scaleY);

    const drawW = paperW * scale;
    const drawH = paperH * scale;
    const ox = (cvW - drawW) / 2;
    const oy = (cvH - drawH) / 2;

    // Paper background (light sheet)
    ctx.fillStyle = '#EFF6FF';
    ctx.shadowColor = 'rgba(0,0,0,0.08)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;
    ctx.fillRect(ox, oy, drawW, drawH);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    const colsFit = Math.floor(paperW / planoW);
    const rowsFit = Math.floor(paperH / planoH);
    const pW = planoW * scale;
    const pH = planoH * scale;

    const exceedsW = planoW > paperW;
    const exceedsH = planoH > paperH;
    const hasOverflow = exceedsW || exceedsH;

    if (hasOverflow || colsFit === 0 || rowsFit === 0) {
      // Draw 1 object starting at ox, oy that overflows the plano
      const x = ox;
      const y = oy;

      // Inside portion
      const inW = Math.min(pW, drawW);
      const inH = Math.min(pH, drawH);
      if (inW > 0 && inH > 0) {
        ctx.fillStyle = '#3B82F6';
        ctx.fillRect(x, y, inW, inH);
        ctx.strokeStyle = '#2563EB';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, inW, inH);
      }

      // Right overflow
      if (pW > drawW) {
        const ovX = ox + drawW;
        const ovW = pW - drawW;
        const ovH = Math.min(pH, cvH);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
        ctx.fillRect(ovX, y, ovW, ovH);
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(ovX, y, ovW, ovH);
        ctx.setLineDash([]);
      }

      // Bottom overflow
      if (pH > drawH) {
        const ovY = oy + drawH;
        const ovH = pH - drawH;
        const ovW = Math.min(pW, cvW);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
        ctx.fillRect(x, ovY, ovW, ovH);
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(x, ovY, ovW, ovH);
        ctx.setLineDash([]);
      }
    } else {
      // Draw cut pieces (Solid Blue with white dividers)
      for (let r = 0; r < rowsFit; r++) {
        for (let c = 0; c < colsFit; c++) {
          const x = ox + c * pW;
          const y = oy + r * pH;
          ctx.fillStyle = '#3B82F6';
          ctx.fillRect(x + 0.5, y + 0.5, pW - 1, pH - 1);
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 0.5, y + 0.5, pW - 1, pH - 1);
        }
      }
    }

    // Paper boundary border (red if overflow, blue if ok)
    ctx.strokeStyle = hasOverflow ? '#EF4444' : '#93C5FD';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.strokeRect(ox, oy, drawW, drawH);
  }, [paperW, paperH, planoW, planoH]);

  useEffect(() => { draw(); }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={460}
      height={420}
      style={{ width: '100%', height: '100%', borderRadius: 10, display: 'block' }}
    />
  );
}

export default function PotongPiano() {
  const [paperPreset, setPaperPreset] = useState('65x100');
  const [paperW, setPaperW] = useState(65);
  const [paperH, setPaperH] = useState(100);
  const [planoW, setPlanoW] = useState(20);
  const [planoH, setPlanoH] = useState(39);

  const cols = planoW > 0 ? Math.floor(paperW / planoW) : 0;
  const rows = planoH > 0 ? Math.floor(paperH / planoH) : 0;
  const total = cols * rows;
  const usedArea = total * planoW * planoH;
  const paperArea = paperW * paperH;
  const wasteArea = paperArea > 0 ? ((paperArea - usedArea) / paperArea * 100) : 0;
  const efficiency = paperArea > 0 ? (usedArea / paperArea * 100) : 0;

  const selectPreset = (p) => {
    setPaperPreset(p.id);
    setPaperW(p.w);
    setPaperH(p.h);
  };

  return (
    <div className="hk-screen">
      {/* Top Bar */}
      <div className="hk-topbar">
        <h2 className="hk-topbar-title">Potong Piano</h2>
        <div className="hk-topbar-right">
          <span className="hk-topbar-label">Layout {paperW}×{paperH} · {total} plano</span>
          <button className="hk-save-btn">
            <Scissors size={15} />
            <span>Simpan Perhitungan</span>
          </button>
        </div>
      </div>

      <div className="hk-body">
        {/* Left Panel */}
        <div className="hk-left-panel">
          <div className="hk-card">
            <div className="hk-card-header">
              <div className="hk-card-icon blue"><Scissors size={15} /></div>
              <span className="hk-card-title">Potong Piano</span>
            </div>

            {/* Hasil Real Time */}
            {total > 0 && (
              <div className="hk-result-banner hk-result-banner-blue">
                <span>⊙ Efisiensi: {efficiency.toFixed(1)}% area terpakai</span>
              </div>
            )}

            <div className="hk-stats-grid" style={{ marginBottom: 16 }}>
              <div className="hk-stat">
                <div className="hk-stat-label">AREA TERPAKAI</div>
                <div className="hk-stat-value">{usedArea.toLocaleString('id-ID')}</div>
                <div className="hk-stat-unit">cm²</div>
              </div>
              <div className="hk-stat">
                <div className="hk-stat-label">HASIL / PLANO</div>
                <div className="hk-stat-value">{total > 0 ? `${total} pcs` : '—'}</div>
              </div>
              <div className="hk-stat">
                <div className="hk-stat-label">GRID UTAMA</div>
                <div className="hk-stat-value">{cols > 0 && rows > 0 ? `${cols} × ${rows}` : '—'}</div>
              </div>
              <div className="hk-stat">
                <div className="hk-stat-label">WASTE</div>
                <div className={`hk-stat-value ${wasteArea > 20 ? 'text-orange' : ''}`}>{usedArea > 0 ? `${wasteArea.toFixed(0)}%` : '—'}</div>
              </div>
              <div className="hk-stat">
                <div className="hk-stat-label">AREA TERPAKAI</div>
                <div className="hk-stat-value">{usedArea > 0 ? usedArea.toLocaleString('id-ID') : '—'}</div>
                <div className="hk-stat-unit">cm²</div>
              </div>
            </div>

            <div className="hk-divider" />

            {/* Ukuran Kertas Cetak */}
            <div className="hk-form-section">
              <div className="hk-form-section-title">UKURAN KERTAS CETAK</div>
              <div className="hk-preset-pills">
                {PAPER_PRESETS.map(p => (
                  <button key={p.id} className={`hk-preset-pill ${paperPreset === p.id ? 'is-active' : ''}`} onClick={() => selectPreset(p)}>
                    <span className="hk-pill-label">{p.label}</span>
                    <span className="hk-pill-sub">{p.sub}</span>
                  </button>
                ))}
              </div>
              <div className="hk-inline-fields">
                <div className="hk-field-group">
                  <label className="hk-label">Lebar Plano (CM)</label>
                  <div className="hk-input-suffix-row">
                    <input type="number" className="hk-input" value={paperW} onChange={e => { setPaperW(Number(e.target.value)); setPaperPreset('custom'); }} />
                    <span className="hk-suffix">CM</span>
                  </div>
                </div>
                <div className="hk-field-group">
                  <label className="hk-label">Tinggi Plano (CM)</label>
                  <div className="hk-input-suffix-row">
                    <input type="number" className="hk-input" value={paperH} onChange={e => { setPaperH(Number(e.target.value)); setPaperPreset('custom'); }} />
                    <span className="hk-suffix">CM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ukuran Potongan Utama */}
            <div className="hk-form-section">
              <div className="hk-form-section-title">UKURAN POTONGAN UTAMA</div>
              <div className="hk-inline-fields">
                <div className="hk-field-group">
                  <label className="hk-label">Lebar Piano</label>
                  <div className="hk-input-suffix-row">
                    <input type="number" className="hk-input" value={planoW} onChange={e => setPlanoW(Number(e.target.value))} />
                    <span className="hk-suffix">CM</span>
                  </div>
                </div>
                <div className="hk-field-group">
                  <label className="hk-label">Tinggi Piano</label>
                  <div className="hk-input-suffix-row">
                    <input type="number" className="hk-input" value={planoH} onChange={e => setPlanoH(Number(e.target.value))} />
                    <span className="hk-suffix">CM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Riwayat */}
          <div className="hk-history-section">
            <div className="hk-history-title">Riwayat Perhitungan</div>
            <div className="hk-history-subtitle">Snapshot hasil yang tersimpan di Firestore.</div>
            {['Layout 65 x 100 labla', 'Layout 79 x 109 biablabla', 'Layout 48 x 32 labla', 'Layout 48 x 32 labla'].map((n, i) => (
              <div key={i} className="hk-history-item">
                <span className="hk-history-badge">Waktu</span>
                <div className="hk-history-info">
                  <span className="hk-history-name">{n}</span>
                  <span className="hk-history-meta">Ananda Rafii Aflarid Suprayogi · 15/8/2026, 10:05:{52 + i}</span>
                </div>
                <button className="hk-history-open">↗ Buka</button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Preview Panel */}
        <div className="hk-preview-panel">
          <div className="hk-preview-canvas-area">
            <PotongPreview paperW={paperW} paperH={paperH} planoW={planoW} planoH={planoH} />
          </div>
          <div className="hk-preview-info">
            <span>⊙ {total} potongan · {cols}×{rows} · waste {wasteArea.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
