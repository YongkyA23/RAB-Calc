import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Printer, AlertTriangle, CheckCircle, Info } from 'lucide-react';

// Paper presets (width x height in cm)
const PAPER_PRESETS = [
  { id: 'a3plus', label: 'A3+', sub: '48×32 cm', w: 48, h: 32 },
  { id: 'a3',     label: 'A3',  sub: '42×29.7 cm', w: 42, h: 29.7 },
  { id: 'a4',     label: 'A4',  sub: '29.7×21 cm', w: 29.7, h: 21 },
  { id: 'a3plus2',label: 'A3 Plus', sub: '13.9×9.8 cm', w: 32, h: 48 },
];

// Alignment grid options
const ALIGNMENTS = [
  { id: 'tl', label: 'Atas Kiri' },
  { id: 'tc', label: 'Atas Tengah' },
  { id: 'tr', label: 'Atas Kanan' },
  { id: 'ml', label: 'Tengah Kiri' },
  { id: 'mc', label: 'Tengah' },
  { id: 'mr', label: 'Tengah Kanan' },
  { id: 'bl', label: 'Bawah Kiri' },
  { id: 'bc', label: 'Bawah Tengah' },
  { id: 'br', label: 'Bawah Kanan' },
];

function LayoutPreview({ paperW, paperH, designW, designH, bleed, qty, orientation, alignment }) {
  const canvasRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cvW = canvas.width;
    const cvH = canvas.height;

    ctx.clearRect(0, 0, cvW, cvH);

    // Canvas background
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, cvW, cvH);

    const pw = orientation === 'landscape' ? Math.max(paperW, paperH) : Math.min(paperW, paperH);
    const ph = orientation === 'landscape' ? Math.min(paperW, paperH) : Math.max(paperW, paperH);

    if (pw <= 0 || ph <= 0) return;

    // Scale calculation with padding
    const PAD = 30;
    const scaleX = (cvW - PAD * 2) / pw;
    const scaleY = (cvH - PAD * 2) / ph;
    const scale = Math.min(scaleX, scaleY);

    const drawW = pw * scale;
    const drawH = ph * scale;
    const ox = (cvW - drawW) / 2;
    const oy = (cvH - drawH) / 2;

    // 1. Draw Paper Sheet (Light blue sheet like in user images)
    ctx.fillStyle = '#EFF6FF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;
    ctx.fillRect(ox, oy, drawW, drawH);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Paper boundary border (soft blue)
    ctx.strokeStyle = '#93C5FD';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(ox, oy, drawW, drawH);

    const dw = Number(designW);
    const dh = Number(designH);
    const bleedVal = Number(bleed) || 0;

    if (dw <= 0 || dh <= 0) return;

    const w = dw * scale;
    const h = dh * scale;
    const gap = bleedVal * scale;
    const stepX = w + gap;
    const stepY = h + gap;

    // Number of columns and rows that fit inside paper boundary
    const colsFit = Math.max(1, Math.floor((drawW + gap + 0.0001) / (w + gap)));
    const rowsFit = Math.max(1, Math.floor((drawH + gap + 0.0001) / (h + gap)));
    const totalCapacity = colsFit * rowsFit;

    const qtyNum = parseInt(qty) || 0;
    const isAutoFit = qtyNum <= 0;

    let itemsToDraw = [];

    if (isAutoFit) {
      // Auto fit: draw all slots that fit inside sheet as solid blue
      for (let r = 0; r < rowsFit; r++) {
        for (let c = 0; c < colsFit; c++) {
          itemsToDraw.push({
            col: c,
            row: r,
            w: w,
            h: h,
            isNeeded: true,
            isGhost: false,
          });
        }
      }
    } else if (qtyNum <= totalCapacity) {
      // qtyNum <= totalCapacity:
      // Fill all slots that fit; first qtyNum are solid blue, remainder are transparent dashed
      let count = 0;
      for (let r = 0; r < rowsFit; r++) {
        for (let c = 0; c < colsFit; c++) {
          const needed = count < qtyNum;
          itemsToDraw.push({
            col: c,
            row: r,
            w: w,
            h: h,
            isNeeded: needed,
            isGhost: !needed,
          });
          count++;
        }
      }
    } else {
      // qtyNum > totalCapacity: draw all qtyNum objects (allow overflow)
      const cols = Math.max(colsFit, 1);
      for (let i = 0; i < qtyNum; i++) {
        const c = i % cols;
        const r = Math.floor(i / cols);
        itemsToDraw.push({
          col: c,
          row: r,
          w: w,
          h: h,
          isNeeded: true,
          isGhost: false,
        });
      }
    }

    // Grid dimension calculation for alignment
    const maxCol = itemsToDraw.length > 0 ? Math.max(...itemsToDraw.map(it => it.col)) : 0;
    const maxRow = itemsToDraw.length > 0 ? Math.max(...itemsToDraw.map(it => it.row)) : 0;
    const gridCols = maxCol + 1;
    const gridRows = maxRow + 1;
    const totalGridW = gridCols * w + (gridCols - 1) * gap;
    const totalGridH = gridRows * h + (gridRows - 1) * gap;

    let alignOffsetX = 0;
    let alignOffsetY = 0;

    if (alignment.includes('r')) {
      alignOffsetX = (drawW - totalGridW);
    } else if (alignment === 'tc' || alignment === 'mc' || alignment === 'bc' || alignment.includes('c')) {
      alignOffsetX = (drawW - totalGridW) / 2;
    }

    if (alignment.startsWith('b')) {
      alignOffsetY = (drawH - totalGridH);
    } else if (alignment.startsWith('m')) {
      alignOffsetY = (drawH - totalGridH) / 2;
    }

    // Calculate actual coordinate for each item
    itemsToDraw = itemsToDraw.map(it => ({
      ...it,
      x: ox + alignOffsetX + it.col * stepX,
      y: oy + alignOffsetY + it.row * stepY,
    }));

    // 1. Draw Ghost / Unused Slots (transparent with dashed border - Gambar 1)
    itemsToDraw.filter(it => it.isGhost).forEach(item => {
      const { x, y, w, h } = item;
      ctx.save();
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1.2;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
      ctx.restore();
    });

    // 2. Draw Needed / Active Slots
    itemsToDraw.filter(it => it.isNeeded).forEach(item => {
      const { x, y, w, h } = item;

      // Inside paper intersection
      const inX1 = Math.max(x, ox);
      const inY1 = Math.max(y, oy);
      const inX2 = Math.min(x + w, ox + drawW);
      const inY2 = Math.min(y + h, oy + drawH);
      const inW = inX2 - inX1;
      const inH = inY2 - inY1;

      // Draw inside portion (Solid Blue)
      if (inW > 0 && inH > 0) {
        ctx.fillStyle = '#3B82F6';
        ctx.fillRect(inX1, inY1, inW, inH);
        // If bleed/jarak is 0 (Gambar 2), stroke with 1px white border
        ctx.strokeStyle = bleedVal === 0 ? '#FFFFFF' : '#2563EB';
        ctx.lineWidth = 1;
        ctx.strokeRect(inX1, inY1, inW, inH);
      }

      // Draw Overflow Portions (Red transparent with dashed border)
      // Left overflow
      if (x < ox) {
        const ovW = ox - x;
        const ovH = Math.min(y + h, cvH) - Math.max(y, 0);
        if (ovW > 0 && ovH > 0) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
          ctx.fillRect(x, Math.max(y, 0), ovW, ovH);
          ctx.setLineDash([5, 4]);
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(x, Math.max(y, 0), ovW, ovH);
          ctx.setLineDash([]);
        }
      }

      // Right overflow
      if (x + w > ox + drawW) {
        const ovX = ox + drawW;
        const ovW = (x + w) - ovX;
        const ovH = Math.min(y + h, cvH) - Math.max(y, 0);
        if (ovW > 0 && ovH > 0) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
          ctx.fillRect(ovX, Math.max(y, 0), ovW, ovH);
          ctx.setLineDash([5, 4]);
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(ovX, Math.max(y, 0), ovW, ovH);
          ctx.setLineDash([]);
        }
      }

      // Top overflow
      if (y < oy) {
        const ovH = oy - y;
        const ovW = Math.min(x + w, cvW) - Math.max(x, 0);
        if (ovW > 0 && ovH > 0) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
          ctx.fillRect(Math.max(x, 0), y, ovW, ovH);
          ctx.setLineDash([5, 4]);
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(Math.max(x, 0), y, ovW, ovH);
          ctx.setLineDash([]);
        }
      }

      // Bottom overflow
      if (y + h > oy + drawH) {
        const ovY = oy + drawH;
        const ovH = (y + h) - ovY;
        const ovW = Math.min(x + w, cvW) - Math.max(x, 0);
        if (ovW > 0 && ovH > 0) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
          ctx.fillRect(Math.max(x, 0), ovY, ovW, ovH);
          ctx.setLineDash([5, 4]);
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(Math.max(x, 0), ovY, ovW, ovH);
          ctx.setLineDash([]);
        }
      }
    });

    // Re-stroke Paper boundary on top for clear visibility
    const hasOverflow = itemsToDraw.some(it => it.isNeeded && (it.x < ox || it.y < oy || it.x + it.w > ox + drawW || it.y + it.h > oy + drawH));
    ctx.strokeStyle = hasOverflow ? '#EF4444' : '#93C5FD';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.strokeRect(ox, oy, drawW, drawH);

  }, [paperW, paperH, designW, designH, bleed, qty, orientation, alignment]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={460}
      style={{ width: '100%', height: '100%', borderRadius: 10, display: 'block' }}
    />
  );
}

export default function LayoutCetak() {
  const [paperPreset, setPaperPreset] = useState('a3plus');
  const [paperW, setPaperW] = useState(48);
  const [paperH, setPaperH] = useState(32);
  const [orientation, setOrientation] = useState('landscape');
  const [designW, setDesignW] = useState(32);
  const [designH, setDesignH] = useState(22);
  const [bleed, setBleed] = useState(1);
  const [qty, setQty] = useState('');
  const [alignment, setAlignment] = useState('tl');
  const [areaCetak, setAreaCetak] = useState('');
  const [hargaLembar, setHargaLembar] = useState(1000);

  // Derived values
  const pw = orientation === 'landscape' ? Math.max(paperW, paperH) : Math.min(paperW, paperH);
  const ph = orientation === 'landscape' ? Math.min(paperW, paperH) : Math.max(paperW, paperH);
  const dw = Number(designW);
  const dh = Number(designH);
  const bleedVal = Number(bleed) || 0;
  const cols = dw > 0 ? Math.floor((pw + bleedVal) / (dw + bleedVal)) : 0;
  const rows = dh > 0 ? Math.floor((ph + bleedVal) / (dh + bleedVal)) : 0;
  const maxFit = Math.max(0, cols * rows);
  const qtyNum = parseInt(qty) || 0;
  const fcsPerSheet = maxFit;
  const sheetsNeeded = qtyNum > 0 ? Math.ceil(qtyNum / Math.max(fcsPerSheet, 1)) : null;
  const wasteArea = pw > 0 && ph > 0 ? (((pw * ph) - (cols * dw * rows * dh)) / (pw * ph) * 100) : 0;
  const designExceedsW = dw > pw;
  const designExceedsH = dh > ph;
  const isWarning = designExceedsW || designExceedsH;

  const selectPreset = (preset) => {
    setPaperPreset(preset.id);
    setPaperW(preset.w);
    setPaperH(preset.h);
  };

  const headerLabel = `Layout ${pw}×${ph}${qtyNum > 0 ? ` · ${qtyNum} pcs` : ' · tanpa qty pcs'}`;

  return (
    <div className="hk-screen">
      {/* Top Bar */}
      <div className="hk-topbar">
        <h2 className="hk-topbar-title">{headerLabel}</h2>
        <div className="hk-topbar-right">
          <span className="hk-topbar-label">{`Layout ${pw}×${ph} · ${qtyNum > 0 ? `${qtyNum} pcs` : 'tanpa qty pcs'}`}</span>
          <button className="hk-save-btn">
            <Printer size={15} />
            <span>Simpan Perhitungan</span>
          </button>
        </div>
      </div>

      <div className="hk-body">
        {/* Left Panel */}
        <div className="hk-left-panel">
          {/* Card: Layout Cetak & Optimasi Sheet */}
          <div className="hk-card">
            <div className="hk-card-header">
              <div className="hk-card-icon blue"><Printer size={15} /></div>
              <span className="hk-card-title">Layout Cetak &amp; Optimasi Sheet</span>
            </div>

            {/* Mode badge + warning */}
            <div className="hk-mode-row">
              {maxFit > 0 && !isWarning && (
                <span className="hk-badge hk-badge-green">
                  <CheckCircle size={12} /> KAPASITAS MAKSIMUM
                </span>
              )}
              {isWarning && (
                <span className="hk-badge hk-badge-red">
                  <AlertTriangle size={12} />
                  {designExceedsW ? 'Lebar desain — melebihi kertas' : 'Tinggi desain — melebihi kertas'}
                  <span className="hk-badge-sub">(Max {pw} cm)</span>
                </span>
              )}
            </div>

            {/* Alignment + Area Cetak */}
            <div className="hk-two-col-row">
              <div className="hk-field-group">
                <label className="hk-label">ALIGNMENT (2)</label>
                <div className="hk-alignment-grid">
                  {ALIGNMENTS.map((a) => (
                    <button
                      key={a.id}
                      className={`hk-align-dot ${alignment === a.id ? 'is-active' : ''}`}
                      onClick={() => setAlignment(a.id)}
                      title={a.label}
                    />
                  ))}
                </div>
                <span className="hk-muted-hint">Margin menyesuaikan</span>
              </div>
              <div className="hk-field-group" style={{ flex: 1 }}>
                <label className="hk-label">AREA CETAK</label>
                <div className="hk-input-suffix-row">
                  <input
                    type="number"
                    className="hk-input"
                    placeholder="—"
                    value={areaCetak}
                    onChange={e => setAreaCetak(e.target.value)}
                  />
                  <span className="hk-suffix">cm</span>
                </div>
              </div>
              <div className="hk-field-group">
                <label className="hk-label">ORIENTASI KERTAS</label>
                <div className="hk-orient-toggle">
                  <button
                    className={`hk-orient-btn ${orientation === 'portrait' ? 'is-active' : ''}`}
                    onClick={() => setOrientation('portrait')}
                  >Portrait</button>
                  <button
                    className={`hk-orient-btn ${orientation === 'landscape' ? 'is-active' : ''}`}
                    onClick={() => setOrientation('landscape')}
                  >Landscape</button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="hk-divider" />

            {/* Hasil Real-Time */}
            <div className="hk-section-label hk-blue-label">HASIL REAL-TIME</div>
            <div className="hk-section-title">Susunan produksi</div>
            <div className="hk-stats-grid">
              <div className="hk-stat">
                <div className="hk-stat-label">FCS / LEMBAR</div>
                <div className="hk-stat-value">{fcsPerSheet > 0 ? fcsPerSheet : '—'}</div>
              </div>
              <div className="hk-stat">
                <div className="hk-stat-label">LEMBAR DIBUTUHKAN</div>
                <div className="hk-stat-value">{sheetsNeeded !== null ? sheetsNeeded : '—'}</div>
              </div>
              <div className="hk-stat">
                <div className="hk-stat-label">GRID</div>
                <div className="hk-stat-value">{cols > 0 && rows > 0 ? `${cols} × ${rows}` : '—'}</div>
              </div>
              <div className="hk-stat">
                <div className="hk-stat-label">ORIENTASI</div>
                <div className="hk-stat-value">{orientation === 'portrait' ? 'Portrait' : 'Landscape'}</div>
              </div>
              <div className="hk-stat">
                <div className="hk-stat-label">WASTE AREA</div>
                <div className="hk-stat-value">{fcsPerSheet > 0 ? `${wasteArea.toFixed(2)}%` : '—'}</div>
              </div>
              <div className="hk-stat">
                <div className="hk-stat-label">TOTAL ORDER</div>
                <div className="hk-stat-value">{qtyNum > 0 ? `${qtyNum} pcs` : '—'}</div>
              </div>
              <div className="hk-stat">
                <div className="hk-stat-label">HARGA / LEMBAR</div>
                <div className="hk-stat-value">Rp {hargaLembar.toLocaleString('id-ID')}</div>
              </div>
              <div className="hk-stat">
                <div className="hk-stat-label">ESTIMASI BIAYA</div>
                <div className="hk-stat-value">
                  {sheetsNeeded != null ? `Rp ${(sheetsNeeded * hargaLembar).toLocaleString('id-ID')}` : '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Card: Ukuran Kertas */}
          <div className="hk-card">
            <div className="hk-two-col-inputs">
              <div>
                <div className="hk-section-title" style={{ marginBottom: 12 }}>UKURAN KERTAS CETAK</div>
                <div className="hk-preset-pills">
                  {PAPER_PRESETS.map(p => (
                    <button
                      key={p.id}
                      className={`hk-preset-pill ${paperPreset === p.id ? 'is-active' : ''}`}
                      onClick={() => selectPreset(p)}
                    >
                      <span className="hk-pill-label">{p.label}</span>
                      <span className="hk-pill-sub">{p.sub}</span>
                    </button>
                  ))}
                </div>
                <div className="hk-inline-fields">
                  <div className="hk-field-group">
                    <label className="hk-label">Lebar Kertas (CM)</label>
                    <div className="hk-input-suffix-row">
                      <input type="number" className="hk-input" value={paperW}
                        onChange={e => { setPaperW(Number(e.target.value)); setPaperPreset('custom'); }} />
                      <span className="hk-suffix">CM</span>
                    </div>
                  </div>
                  <div className="hk-field-group">
                    <label className="hk-label">Tinggi Kertas (CM)</label>
                    <div className="hk-input-suffix-row">
                      <input type="number" className="hk-input" value={paperH}
                        onChange={e => { setPaperH(Number(e.target.value)); setPaperPreset('custom'); }} />
                      <span className="hk-suffix">CM</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="hk-section-title" style={{ marginBottom: 12 }}>UKURAN PRODUK JADI (SINGLE CUT)</div>
                <div className="hk-inline-fields">
                  <div className="hk-field-group">
                    <label className="hk-label">Lebar desain</label>
                    <div className={`hk-input-suffix-row ${designExceedsW ? 'is-error' : ''}`}>
                      <input type="number" className="hk-input" value={designW}
                        onChange={e => setDesignW(Number(e.target.value))} />
                      <span className="hk-suffix">CM</span>
                    </div>
                  </div>
                  <div className="hk-field-group">
                    <label className="hk-label">Tinggi desain</label>
                    <div className={`hk-input-suffix-row ${designExceedsH ? 'is-error' : ''}`}>
                      <input type="number" className="hk-input" value={designH}
                        onChange={e => setDesignH(Number(e.target.value))} />
                      <span className="hk-suffix">CM</span>
                    </div>
                  </div>
                  <div className="hk-field-group">
                    <label className="hk-label">Bleed / jarak</label>
                    <div className="hk-input-suffix-row">
                      <input type="number" className="hk-input" value={bleed}
                        onChange={e => setBleed(Number(e.target.value))} />
                      <span className="hk-suffix">CM</span>
                    </div>
                  </div>
                  <div className="hk-field-group">
                    <label className="hk-label">Jumlah dibutuhkan</label>
                    <div className="hk-input-suffix-row">
                      <input type="number" className="hk-input" value={qty}
                        onChange={e => setQty(e.target.value)}
                        placeholder="Opsional" />
                      <span className="hk-suffix">PCS</span>
                    </div>
                  </div>
                  <div className="hk-field-group">
                    <label className="hk-label">Harga / Lembar</label>
                    <div className="hk-input-suffix-row">
                      <input type="number" className="hk-input" value={hargaLembar}
                        onChange={e => setHargaLembar(Number(e.target.value))} />
                      <span className="hk-suffix">RP</span>
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
            <div className="hk-history-item">
              <span className="hk-history-badge">Waktu</span>
              <div className="hk-history-info">
                <span className="hk-history-name">{headerLabel}</span>
                <span className="hk-history-meta">Ananda Rafii Aflarid Suprayogi · 13/8/2026, 10:03:32</span>
              </div>
              <button className="hk-history-open">↗ Buka</button>
            </div>
          </div>
        </div>

        {/* Right Preview Panel */}
        <div className="hk-preview-panel">
          <div className="hk-preview-canvas-area">
            <LayoutPreview
              paperW={paperW}
              paperH={paperH}
              designW={designW}
              designH={designH}
              bleed={bleed}
              qty={qtyNum}
              orientation={orientation}
              alignment={alignment}
            />
          </div>
          {isWarning && (
            <div className="hk-preview-warning">
              <AlertTriangle size={13} style={{ color: '#EF4444', flexShrink: 0 }} />
              <span>Area merah = bagian desain yang melebihi batas kertas</span>
            </div>
          )}
          {!isWarning && fcsPerSheet > 0 && (
            <div className="hk-preview-info">
              <Info size={13} style={{ color: '#3B82F6', flexShrink: 0 }} />
              <span>{fcsPerSheet} objek muat · grid {cols}×{rows} · waste {wasteArea.toFixed(1)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
