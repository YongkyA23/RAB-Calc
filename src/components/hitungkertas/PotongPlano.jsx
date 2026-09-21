import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Scissors } from 'lucide-react';

const PAPER_PRESETS = [
  { id: '65x100', label: '65×100', sub: '65×100 cm', w: 65, h: 100 },
  { id: '79x109', label: '79×109', sub: '79×109 cm', w: 79, h: 109 },
  { id: '61x86',  label: '61×86',  sub: '61×86 cm',  w: 61, h: 86 },
  { id: '72x102', label: '72×102', sub: '72×102 cm', w: 72, h: 102 },
];

function calculatePotongSchemes(paperW, paperH, planoW, planoH) {
  const W = Number(paperW) || 0;
  const H = Number(paperH) || 0;
  const w = Number(planoW) || 0;
  const h = Number(planoH) || 0;

  if (W <= 0 || H <= 0 || w <= 0 || h <= 0) {
    return {
      normal: { count: 0, grid: '—', pieces: [], usedArea: 0, wasteArea: 0 },
      rotasi: { count: 0, grid: '—', pieces: [], usedArea: 0, wasteArea: 0 },
      optimasi: { count: 0, grid: '—', pieces: [], usedArea: 0, wasteArea: 0 },
      bestSchema: 'normal',
    };
  }

  const paperArea = W * H;

  // 1. Normal (Portrait)
  const normCols = Math.floor(W / w);
  const normRows = Math.floor(H / h);
  const normCount = normCols * normRows;
  let normPieces = [];
  for (let r = 0; r < normRows; r++) {
    for (let c = 0; c < normCols; c++) {
      normPieces.push({ x: c * w, y: r * h, w, h, isExtra: false });
    }
  }
  const normUsed = normCount * w * h;
  const normWaste = paperArea > 0 ? ((paperArea - normUsed) / paperArea) * 100 : 0;

  // 2. Rotasi (Landscape / 90° rotated)
  const rotCols = Math.floor(W / h);
  const rotRows = Math.floor(H / w);
  const rotCount = rotCols * rotRows;
  let rotPieces = [];
  for (let r = 0; r < rotRows; r++) {
    for (let c = 0; c < rotCols; c++) {
      rotPieces.push({ x: c * h, y: r * w, w: h, h: w, isExtra: false });
    }
  }
  const rotUsed = rotCount * w * h;
  const rotWaste = paperArea > 0 ? ((paperArea - rotUsed) / paperArea) * 100 : 0;

  // 3. Optimasi Sisa (Comprehensive L-strip remainder packing)
  let optCandidates = [];

  // A1: Normal main + Rotated bottom (full width) + Rotated right (in remaining upper-right)
  if (normCols > 0 && normRows > 0) {
    const mainPieces = [...normPieces];
    const remH = H - normRows * h;
    const botRotCols = Math.floor(W / h);
    const botRotRows = Math.floor(remH / w);
    let extraPieces = [];

    // Bottom strip full width
    if (botRotCols > 0 && botRotRows > 0) {
      for (let r = 0; r < botRotRows; r++) {
        for (let c = 0; c < botRotCols; c++) {
          extraPieces.push({ x: c * h, y: normRows * h + r * w, w: h, h: w, isExtra: true });
        }
      }
    }

    // Right strip in the top right remainder (0 to normRows*h)
    const remW = W - normCols * w;
    const rightRotCols = Math.floor(remW / h);
    const rightRotRows = Math.floor((normRows * h) / w);
    if (rightRotCols > 0 && rightRotRows > 0) {
      for (let r = 0; r < rightRotRows; r++) {
        for (let c = 0; c < rightRotCols; c++) {
          extraPieces.push({ x: normCols * w + c * h, y: r * w, w: h, h: w, isExtra: true });
        }
      }
    }

    optCandidates.push({
      grid: extraPieces.length > 0 ? `${normCols} × ${normRows} + ${extraPieces.length}` : `${normCols} × ${normRows}`,
      pieces: [...mainPieces, ...extraPieces],
      count: normCount + extraPieces.length,
    });
  }

  // A2: Normal main + Rotated right (full height) + Rotated bottom (in remaining bottom-left)
  if (normCols > 0 && normRows > 0) {
    const mainPieces = [...normPieces];
    const remW = W - normCols * w;
    const rightRotCols = Math.floor(remW / h);
    const rightRotRows = Math.floor(H / w);
    let extraPieces = [];

    // Right strip full height
    if (rightRotCols > 0 && rightRotRows > 0) {
      for (let r = 0; r < rightRotRows; r++) {
        for (let c = 0; c < rightRotCols; c++) {
          extraPieces.push({ x: normCols * w + c * h, y: r * w, w: h, h: w, isExtra: true });
        }
      }
    }

    // Bottom strip in remaining bottom-left (0 to normCols*w)
    const remH = H - normRows * h;
    const botRotCols = Math.floor((normCols * w) / h);
    const botRotRows = Math.floor(remH / w);
    if (botRotCols > 0 && botRotRows > 0) {
      for (let r = 0; r < botRotRows; r++) {
        for (let c = 0; c < botRotCols; c++) {
          extraPieces.push({ x: c * h, y: normRows * h + r * w, w: h, h: w, isExtra: true });
        }
      }
    }

    optCandidates.push({
      grid: extraPieces.length > 0 ? `${normCols} × ${normRows} + ${extraPieces.length}` : `${normCols} × ${normRows}`,
      pieces: [...mainPieces, ...extraPieces],
      count: normCount + extraPieces.length,
    });
  }

  // B1: Rotated main + Normal bottom (full width) + Normal right (in remaining upper-right)
  if (rotCols > 0 && rotRows > 0) {
    const mainPieces = [...rotPieces];
    const remH = H - rotRows * w;
    const botNormCols = Math.floor(W / w);
    const botNormRows = Math.floor(remH / h);
    let extraPieces = [];

    if (botNormCols > 0 && botNormRows > 0) {
      for (let r = 0; r < botNormRows; r++) {
        for (let c = 0; c < botNormCols; c++) {
          extraPieces.push({ x: c * w, y: rotRows * w + r * h, w, h, isExtra: true });
        }
      }
    }

    const remW = W - rotCols * h;
    const rightNormCols = Math.floor(remW / w);
    const rightNormRows = Math.floor((rotRows * w) / h);
    if (rightNormCols > 0 && rightNormRows > 0) {
      for (let r = 0; r < rightNormRows; r++) {
        for (let c = 0; c < rightNormCols; c++) {
          extraPieces.push({ x: rotCols * h + c * w, y: r * h, w, h, isExtra: true });
        }
      }
    }

    optCandidates.push({
      grid: extraPieces.length > 0 ? `${rotCols} × ${rotRows} + ${extraPieces.length}` : `${rotCols} × ${rotRows}`,
      pieces: [...mainPieces, ...extraPieces],
      count: rotCount + extraPieces.length,
    });
  }

  // B2: Rotated main + Normal right (full height) + Normal bottom (in remaining bottom-left)
  if (rotCols > 0 && rotRows > 0) {
    const mainPieces = [...rotPieces];
    const remW = W - rotCols * h;
    const rightNormCols = Math.floor(remW / w);
    const rightNormRows = Math.floor(H / h);
    let extraPieces = [];

    if (rightNormCols > 0 && rightNormRows > 0) {
      for (let r = 0; r < rightNormRows; r++) {
        for (let c = 0; c < rightNormCols; c++) {
          extraPieces.push({ x: rotCols * h + c * w, y: r * h, w, h, isExtra: true });
        }
      }
    }

    const remH = H - rotRows * w;
    const botNormCols = Math.floor((rotCols * h) / w);
    const botNormRows = Math.floor(remH / h);
    if (botNormCols > 0 && botNormRows > 0) {
      for (let r = 0; r < botNormRows; r++) {
        for (let c = 0; c < botNormCols; c++) {
          extraPieces.push({ x: c * w, y: rotRows * w + r * h, w, h, isExtra: true });
        }
      }
    }

    optCandidates.push({
      grid: extraPieces.length > 0 ? `${rotCols} × ${rotRows} + ${extraPieces.length}` : `${rotCols} × ${rotRows}`,
      pieces: [...mainPieces, ...extraPieces],
      count: rotCount + extraPieces.length,
    });
  }

  let bestOpt = {
    count: Math.max(normCount, rotCount),
    grid: normCount >= rotCount ? `${normCols} × ${normRows}` : `${rotCols} × ${rotRows}`,
    pieces: normCount >= rotCount ? normPieces : rotPieces,
  };

  for (const cand of optCandidates) {
    if (cand.count > bestOpt.count) {
      bestOpt = cand;
    }
  }

  const optUsed = bestOpt.count * w * h;
  const optWaste = paperArea > 0 ? ((paperArea - optUsed) / paperArea) * 100 : 0;

  return {
    normal: {
      count: normCount,
      grid: `${normCols} × ${normRows}`,
      pieces: normPieces,
      usedArea: normUsed,
      wasteArea: normWaste,
    },
    rotasi: {
      count: rotCount,
      grid: `${rotCols} × ${rotRows}`,
      pieces: rotPieces,
      usedArea: rotUsed,
      wasteArea: rotWaste,
    },
    optimasi: {
      count: bestOpt.count,
      grid: bestOpt.grid,
      pieces: bestOpt.pieces,
      usedArea: optUsed,
      wasteArea: optWaste,
    },
    bestSchema: 'optimasi',
  };
}

function PotongPreview({ paperW, paperH, pieces = [], planoW, planoH }) {
  const canvasRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cvW = canvas.width;
    const cvH = canvas.height;
    ctx.clearRect(0, 0, cvW, cvH);

    // Canvas background
    ctx.fillStyle = '#F1F5F9';
    ctx.fillRect(0, 0, cvW, cvH);

    if (!paperW || !paperH || !planoW || !planoH) return;

    const PAD = 50;
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
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    ctx.fillRect(ox, oy, drawW, drawH);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    const exceedsW = planoW > paperW;
    const exceedsH = planoH > paperH;
    const hasOverflow = exceedsW || exceedsH;

    if (hasOverflow || pieces.length === 0) {
      // If single piece exceeds paper
      const pW = planoW * scale;
      const pH = planoH * scale;
      const inW = Math.min(pW, drawW);
      const inH = Math.min(pH, drawH);
      if (inW > 0 && inH > 0) {
        ctx.fillStyle = '#3B82F6';
        ctx.fillRect(ox, oy, inW, inH);
        ctx.strokeStyle = '#2563EB';
        ctx.lineWidth = 1;
        ctx.strokeRect(ox, oy, inW, inH);
      }

      if (pW > drawW) {
        const ovX = ox + drawW;
        const ovW = pW - drawW;
        const ovH = Math.min(pH, cvH);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
        ctx.fillRect(ovX, oy, ovW, ovH);
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(ovX, oy, ovW, ovH);
        ctx.setLineDash([]);
      }

      if (pH > drawH) {
        const ovY = oy + drawH;
        const ovH = pH - drawH;
        const ovW = Math.min(pW, cvW);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
        ctx.fillRect(ox, ovY, ovW, ovH);
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(ox, ovY, ovW, ovH);
        ctx.setLineDash([]);
      }
    } else {
      // Draw cut pieces according to selected scheme
      pieces.forEach((piece) => {
        const px = ox + piece.x * scale;
        const py = oy + piece.y * scale;
        const pw = piece.w * scale;
        const ph = piece.h * scale;

        // Extra/optimasi pieces are emerald green, main pieces are blue
        ctx.fillStyle = piece.isExtra ? '#10B981' : '#3B82F6';
        ctx.fillRect(px + 0.5, py + 0.5, pw - 1, ph - 1);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);
      });
    }

    // Paper boundary border
    ctx.strokeStyle = hasOverflow ? '#EF4444' : '#93C5FD';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.strokeRect(ox, oy, drawW, drawH);
  }, [paperW, paperH, pieces, planoW, planoH]);

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

export default function PotongPlano() {
  const [paperPreset, setPaperPreset] = useState('65x100');
  const [paperW, setPaperW] = useState(65);
  const [paperH, setPaperH] = useState(100);
  const [planoW, setPlanoW] = useState(20);
  const [planoH, setPlanoH] = useState(39);
  const [selectedSchema, setSelectedSchema] = useState('optimasi');

  const schemes = useMemo(() => {
    return calculatePotongSchemes(paperW, paperH, planoW, planoH);
  }, [paperW, paperH, planoW, planoH]);

  const activeSchemeData = schemes[selectedSchema] || schemes.optimasi;
  const total = activeSchemeData.count;
  const usedArea = activeSchemeData.usedArea;
  const wasteArea = activeSchemeData.wasteArea;
  const gridLabel = activeSchemeData.grid;

  const selectPreset = (p) => {
    setPaperPreset(p.id);
    setPaperW(p.w);
    setPaperH(p.h);
  };

  const getSchemaLabel = () => {
    if (selectedSchema === 'optimasi') return `Optimasi sisa · ${schemes.optimasi.count} potong`;
    if (selectedSchema === 'rotasi') return `Rotasi · ${schemes.rotasi.count} potong`;
    return `Normal · ${schemes.normal.count} potong`;
  };

  return (
    <div className="hk-screen">
      {/* Top Bar */}
      <div className="hk-topbar">
        <h2 className="hk-topbar-title">Potong Plano</h2>
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
              <div className="hk-card-icon" style={{ background: 'transparent', color: '#1E293B', padding: 0 }}>
                <Scissors size={18} />
              </div>
              <span className="hk-card-title">Potong Plano</span>
            </div>

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
                <div className="hk-stat-value">{gridLabel}</div>
              </div>
              <div className="hk-stat">
                <div className="hk-stat-label">WASTE</div>
                <div className={`hk-stat-value ${wasteArea > 20 ? 'text-orange' : ''}`}>
                  {usedArea > 0 ? `${wasteArea.toFixed(2)}%` : '—'}
                </div>
                <div className="hk-stat-unit">{usedArea > 0 ? `${Math.round(paperW * paperH - usedArea).toLocaleString('id-ID')} cm²` : ''}</div>
              </div>
            </div>

            <div className="hk-divider" />

            {/* Ukuran Kertas Plano */}
            <div className="hk-form-section">
              <div className="hk-form-section-title">UKURAN KERTAS CETAK (PLANO)</div>
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
                  <label className="hk-label">Lebar Potongan</label>
                  <div className="hk-input-suffix-row">
                    <input type="number" className="hk-input" value={planoW} onChange={e => setPlanoW(Number(e.target.value))} />
                    <span className="hk-suffix">CM</span>
                  </div>
                </div>
                <div className="hk-field-group">
                  <label className="hk-label">Tinggi Potongan</label>
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
          {/* POLA POTONG PREVIEW */}
          <div className="hk-pola-box">
            <div className="hk-pola-header">
              <span className="hk-pola-title">POLA POTONG</span>
              <span className="hk-pola-badge">{getSchemaLabel()}</span>
            </div>
            <div className="hk-preview-canvas-area" style={{ height: 420 }}>
              <PotongPreview
                paperW={paperW}
                paperH={paperH}
                pieces={activeSchemeData.pieces}
                planoW={planoW}
                planoH={planoH}
              />
            </div>
            <div className="hk-preview-info">
              <span>⊙ {total} potongan · {gridLabel} · waste {wasteArea.toFixed(2)}%</span>
            </div>
          </div>

          {/* PILIH SKEMA (Di bawah preview gambar) */}
          <div className="hk-schema-card">
            <div className="hk-schema-header">PILIH SKEMA</div>
            <div className="hk-schema-options">
              <button
                type="button"
                className={`hk-schema-btn ${selectedSchema === 'normal' ? 'is-active' : ''}`}
                onClick={() => setSelectedSchema('normal')}
              >
                <span className="hk-schema-btn-title">Normal</span>
                <span className="hk-schema-btn-count">{schemes.normal.count} potong ({schemes.normal.wasteArea.toFixed(2)}% waste)</span>
              </button>
              <button
                type="button"
                className={`hk-schema-btn ${selectedSchema === 'rotasi' ? 'is-active' : ''}`}
                onClick={() => setSelectedSchema('rotasi')}
              >
                <span className="hk-schema-btn-title">Rotasi</span>
                <span className="hk-schema-btn-count">{schemes.rotasi.count} potong ({schemes.rotasi.wasteArea.toFixed(2)}% waste)</span>
              </button>
              <button
                type="button"
                className={`hk-schema-btn ${selectedSchema === 'optimasi' ? 'is-active' : ''}`}
                onClick={() => setSelectedSchema('optimasi')}
              >
                <span className="hk-schema-btn-title">Optimasi sisa · terbaik</span>
                <span className="hk-schema-btn-count">{schemes.optimasi.count} potong ({schemes.optimasi.wasteArea.toFixed(2)}% waste)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
