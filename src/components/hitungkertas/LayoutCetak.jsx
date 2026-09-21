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

function LayoutPreview({ paperW, paperH, designW, designH, bleed, qty, orientation, alignment, areaCetak }) {
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

    const pw = orientation === 'landscape' ? Math.max(paperW, paperH) : Math.min(paperW, paperH);
    const ph = orientation === 'landscape' ? Math.min(paperW, paperH) : Math.max(paperW, paperH);

    if (pw <= 0 || ph <= 0) return;

    // Scale calculation with padding (scaled down to leave room around sheet)
    const PAD = 55;
    const scaleX = (cvW - PAD * 2) / pw;
    const scaleY = (cvH - PAD * 2) / ph;
    const scale = Math.min(scaleX, scaleY);

    const drawW = pw * scale;
    const drawH = ph * scale;
    const ox = (cvW - drawW) / 2;
    const oy = (cvH - drawH) / 2;

    // 1. Draw Paper Sheet (Light blue sheet)
    ctx.fillStyle = '#EFF6FF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;
    ctx.fillRect(ox, oy, drawW, drawH);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Paper boundary border (soft blue)
    ctx.strokeStyle = '#93C5FD';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(ox, oy, drawW, drawH);

    // Margin from Area Cetak (clamped to non-negative)
    const marginVal = Math.max(0, Number(areaCetak) || 0);
    const marginPx = marginVal * scale;
    const printX = ox + marginPx;
    const printY = oy + marginPx;
    const printW = Math.max(0, drawW - 2 * marginPx);
    const printH = Math.max(0, drawH - 2 * marginPx);

    // If margin is present, draw shaded margin bands around sheet
    if (marginVal > 0 && marginPx > 0) {
      ctx.fillStyle = 'rgba(241, 245, 249, 0.65)';
      // Top margin
      ctx.fillRect(ox, oy, drawW, Math.min(marginPx, drawH));
      // Bottom margin
      if (drawH - marginPx > 0) {
        ctx.fillRect(ox, oy + drawH - marginPx, drawW, marginPx);
      }
      // Left margin
      ctx.fillRect(ox, oy, Math.min(marginPx, drawW), drawH);
      // Right margin
      if (drawW - marginPx > 0) {
        ctx.fillRect(ox + drawW - marginPx, oy, marginPx, drawH);
      }

      // Dashed printable area outline
      if (printW > 0 && printH > 0) {
        ctx.save();
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = '#60A5FA';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(printX, printY, printW, printH);
        ctx.restore();
      }
    }

    const dw = Math.max(0, Number(designW) || 0);
    const dh = Math.max(0, Number(designH) || 0);
    const bleedVal = Math.max(0, Number(bleed) || 0);

    if (dw <= 0 || dh <= 0) return;

    const w = dw * scale;
    const h = dh * scale;
    const gap = bleedVal * scale;
    const stepX = w + gap;
    const stepY = h + gap;

    // Number of columns and rows that physically fit inside printable area
    const colsFit = (printW > 0 && w > 0) ? Math.floor((printW + gap + 0.0001) / (w + gap)) : 0;
    const rowsFit = (printH > 0 && h > 0) ? Math.floor((printH + gap + 0.0001) / (h + gap)) : 0;
    const totalCapacity = colsFit * rowsFit;

    const qtyNum = parseInt(qty) || 0;
    const isAutoFit = qtyNum <= 0;

    let itemsToDraw = [];

    // Helper to draw an item with blue inside printable area & red overflow outside printable area
    const renderItem = (item) => {
      const { x, y, w: iw, h: ih, isGhost } = item;

      if (isGhost) {
        ctx.save();
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1.2;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(x, y, iw, ih);
        ctx.strokeRect(x, y, iw, ih);
        ctx.restore();
        return;
      }

      // Valid printable area intersection
      const inX1 = Math.max(x, printX);
      const inY1 = Math.max(y, printY);
      const inX2 = Math.min(x + iw, printX + printW);
      const inY2 = Math.min(y + ih, printY + printH);
      const inW = Math.max(0, inX2 - inX1);
      const inH = Math.max(0, inY2 - inY1);

      // Draw inside portion (Solid Blue)
      if (inW > 0 && inH > 0) {
        ctx.fillStyle = '#3B82F6';
        ctx.fillRect(inX1, inY1, inW, inH);
        ctx.strokeStyle = bleedVal === 0 ? '#FFFFFF' : '#2563EB';
        ctx.lineWidth = 1;
        ctx.strokeRect(inX1, inY1, inW, inH);
      }

      // Draw Overflow Portions (Red transparent with dashed red border)
      // Left overflow beyond printable area
      if (x < printX) {
        const ovX = x;
        const ovW = printX - x;
        const ovY = y;
        const ovH = ih;
        if (ovW > 0 && ovH > 0) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
          ctx.fillRect(ovX, ovY, ovW, ovH);
          ctx.save();
          ctx.setLineDash([5, 4]);
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(ovX, ovY, ovW, ovH);
          ctx.restore();
        }
      }

      // Right overflow beyond printable area
      if (x + iw > printX + printW) {
        const ovX = Math.max(x, printX + printW);
        const ovW = (x + iw) - ovX;
        const ovY = y;
        const ovH = ih;
        if (ovW > 0 && ovH > 0) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
          ctx.fillRect(ovX, ovY, ovW, ovH);
          ctx.save();
          ctx.setLineDash([5, 4]);
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(ovX, ovY, ovW, ovH);
          ctx.restore();
        }
      }

      // Top overflow beyond printable area
      if (y < printY) {
        const ovX = Math.max(x, printX);
        const ovW = Math.min(x + iw, printX + printW) - ovX;
        const ovY = y;
        const ovH = printY - y;
        if (ovW > 0 && ovH > 0) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
          ctx.fillRect(ovX, ovY, ovW, ovH);
          ctx.save();
          ctx.setLineDash([5, 4]);
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(ovX, ovY, ovW, ovH);
          ctx.restore();
        }
      }

      // Bottom overflow beyond printable area
      if (y + ih > printY + printH) {
        const ovX = Math.max(x, printX);
        const ovW = Math.min(x + iw, printX + printW) - ovX;
        const ovY = Math.max(y, printY + printH);
        const ovH = (y + ih) - ovY;
        if (ovW > 0 && ovH > 0) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
          ctx.fillRect(ovX, ovY, ovW, ovH);
          ctx.save();
          ctx.setLineDash([5, 4]);
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(ovX, ovY, ovW, ovH);
          ctx.restore();
        }
      }
    };

    if (colsFit === 0 || rowsFit === 0) {
      // Design does NOT fit in printable area (0 items fit)
      // Show 1 sample item aligned according to alignment option so user clearly sees the overflow in RED
      let itemX = printX;
      let itemY = printY;

      if (alignment.includes('r')) {
        itemX = printX + (printW - w);
      } else if (alignment === 'tc' || alignment === 'mc' || alignment === 'bc' || alignment.includes('c')) {
        itemX = printX + (printW - w) / 2;
      }

      if (alignment.startsWith('b')) {
        itemY = printY + (printH - h);
      } else if (alignment.startsWith('m')) {
        itemY = printY + (printH - h) / 2;
      }

      renderItem({
        x: itemX,
        y: itemY,
        w: w,
        h: h,
        isGhost: false,
        isNeeded: true,
      });

      // Paper boundary stroke
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);
      ctx.strokeRect(ox, oy, drawW, drawH);
      return;
    }

    if (isAutoFit) {
      // Auto fit: draw all slots that fit inside printable area as solid blue
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
      // Target center/position based on alignment
      let targetR = 0;
      let targetC = 0;

      if (alignment.startsWith('t')) targetR = 0;
      else if (alignment.startsWith('m')) targetR = (rowsFit - 1) / 2;
      else if (alignment.startsWith('b')) targetR = rowsFit - 1;

      if (alignment.endsWith('l')) targetC = 0;
      else if (alignment.endsWith('c')) targetC = (colsFit - 1) / 2;
      else if (alignment.endsWith('r')) targetC = colsFit - 1;

      // Calculate distance score for all cells
      let allCells = [];
      for (let r = 0; r < rowsFit; r++) {
        for (let c = 0; c < colsFit; c++) {
          const distR = Math.abs(r - targetR);
          const distC = Math.abs(c - targetC);
          const distSq = distR * distR + distC * distC;
          allCells.push({ r, c, distSq, distR, distC });
        }
      }

      // Sort by proximity to target alignment
      allCells.sort((a, b) => {
        if (a.distSq !== b.distSq) return a.distSq - b.distSq;
        if (a.distR !== b.distR) return a.distR - b.distR;
        return a.distC - b.distC;
      });

      const neededSet = new Set(
        allCells.slice(0, qtyNum).map(item => `${item.r}-${item.c}`)
      );

      for (let r = 0; r < rowsFit; r++) {
        for (let c = 0; c < colsFit; c++) {
          const needed = neededSet.has(`${r}-${c}`);
          itemsToDraw.push({
            col: c,
            row: r,
            w: w,
            h: h,
            isNeeded: needed,
            isGhost: !needed,
          });
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

    // Grid dimension calculation for alignment within printable area
    const maxCol = itemsToDraw.length > 0 ? Math.max(...itemsToDraw.map(it => it.col)) : 0;
    const maxRow = itemsToDraw.length > 0 ? Math.max(...itemsToDraw.map(it => it.row)) : 0;
    const gridCols = maxCol + 1;
    const gridRows = maxRow + 1;
    const totalGridW = gridCols * w + (gridCols - 1) * gap;
    const totalGridH = gridRows * h + (gridRows - 1) * gap;

    let alignOffsetX = 0;
    let alignOffsetY = 0;

    if (alignment.includes('r')) {
      alignOffsetX = (printW - totalGridW);
    } else if (alignment === 'tc' || alignment === 'mc' || alignment === 'bc' || alignment.includes('c')) {
      alignOffsetX = (printW - totalGridW) / 2;
    }

    if (alignment.startsWith('b')) {
      alignOffsetY = (printH - totalGridH);
    } else if (alignment.startsWith('m')) {
      alignOffsetY = (printH - totalGridH) / 2;
    }

    // Calculate actual coordinate for each item starting from printable area (printX, printY)
    itemsToDraw = itemsToDraw.map(it => ({
      ...it,
      x: printX + alignOffsetX + it.col * stepX,
      y: printY + alignOffsetY + it.row * stepY,
    }));

    // Draw all items
    itemsToDraw.forEach(item => renderItem(item));

    // Stroke Paper boundary
    const hasAnyOverflow = itemsToDraw.some(it => it.isNeeded && (
      it.x < printX || it.y < printY || it.x + it.w > printX + printW || it.y + it.h > printY + printH
    ));
    ctx.strokeStyle = hasAnyOverflow ? '#EF4444' : '#93C5FD';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.strokeRect(ox, oy, drawW, drawH);

  }, [paperW, paperH, designW, designH, bleed, qty, orientation, alignment, areaCetak]);

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
  const [hargaPerRim, setHargaPerRim] = useState(500000);
  const [isiPerRim, setIsiPerRim] = useState(500);
  const [wasteProduksi, setWasteProduksi] = useState('');

  // Derived values including areaCetak (margin on all 4 sides)
  const pw = orientation === 'landscape' ? Math.max(paperW, paperH) : Math.min(paperW, paperH);
  const ph = orientation === 'landscape' ? Math.min(paperW, paperH) : Math.max(paperW, paperH);
  const marginVal = Math.max(0, Number(areaCetak) || 0);
  const marginTooBig = marginVal * 2 >= pw || marginVal * 2 >= ph;
  const printW = Math.max(0, pw - 2 * marginVal);
  const printH = Math.max(0, ph - 2 * marginVal);
  const dw = Math.max(0, Number(designW) || 0);
  const dh = Math.max(0, Number(designH) || 0);
  const bleedVal = Math.max(0, Number(bleed) || 0);
  const cols = (dw > 0 && printW > 0) ? Math.floor((printW + bleedVal + 0.0001) / (dw + bleedVal)) : 0;
  const rows = (dh > 0 && printH > 0) ? Math.floor((printH + bleedVal + 0.0001) / (dh + bleedVal)) : 0;
  const maxFit = Math.max(0, cols * rows);
  const qtyNum = parseInt(qty) || 0;
  const fcsPerSheet = maxFit;
  const isiPerRimNum = Math.max(1, Number(isiPerRim) || 500);
  const hargaPerRimNum = Math.max(0, Number(hargaPerRim) || 0);
  const hargaLembarCalc = isiPerRimNum > 0 ? Math.round(hargaPerRimNum / isiPerRimNum) : 0;
  const wastePercentNum = Math.max(0, Number(wasteProduksi) || 0);
  const sheetsNeededRaw = (qtyNum > 0 && fcsPerSheet > 0) ? Math.ceil(qtyNum / fcsPerSheet) : null;
  const totalOrderSheets = sheetsNeededRaw !== null ? Math.ceil(sheetsNeededRaw * (1 + wastePercentNum / 100)) : null;
  const estimasiBiaya = totalOrderSheets !== null ? totalOrderSheets * hargaLembarCalc : null;
  const wasteArea = (pw > 0 && ph > 0 && maxFit > 0) ? Math.max(0, Math.min(100, (((pw * ph) - (cols * dw * rows * dh)) / (pw * ph)) * 100)) : 0;
  const designExceedsW = dw > printW;
  const designExceedsH = dh > printH;
  const isWarning = dw <= 0 || dh <= 0 || designExceedsW || designExceedsH || marginTooBig;

  const getWarningInfo = () => {
    if (marginTooBig) {
      return {
        title: 'Area cetak (margin) — melebihi kertas',
        sub: `(Maks margin ${(Math.min(pw, ph) / 2).toFixed(1)} cm)`
      };
    }
    if (designExceedsW && designExceedsH) {
      return {
        title: `Ukuran desain — melebihi ${marginVal > 0 ? 'area cetak' : 'kertas'}`,
        sub: `(Maks ${printW.toFixed(1)} × ${printH.toFixed(1)} cm)`
      };
    }
    if (designExceedsW) {
      return {
        title: `Lebar desain — melebihi ${marginVal > 0 ? 'area cetak' : 'kertas'}`,
        sub: `(Maks ${printW.toFixed(1)} cm)`
      };
    }
    if (designExceedsH) {
      return {
        title: `Tinggi desain — melebihi ${marginVal > 0 ? 'area cetak' : 'kertas'}`,
        sub: `(Maks ${printH.toFixed(1)} cm)`
      };
    }
    return {
      title: 'Ukuran tidak valid',
      sub: ''
    };
  };

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
                  {getWarningInfo().title}
                  <span className="hk-badge-sub">{getWarningInfo().sub}</span>
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
                    min="0"
                    className="hk-input"
                    placeholder="—"
                    value={areaCetak}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '') {
                        setAreaCetak('');
                      } else {
                        const num = Number(val);
                        setAreaCetak(num < 0 ? '0' : val);
                      }
                    }}
                  />
                  <span className="hk-suffix">cm</span>
                </div>
                <span className="hk-muted-hint">Margin semua sisi</span>
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

            <div className="hk-stats-grid">
              <div className="hk-stat">
                <div className="hk-stat-label">PCS / LEMBAR</div>
                <div className="hk-stat-value">{fcsPerSheet > 0 ? fcsPerSheet : '—'}</div>
              </div>
              <div className="hk-stat">
                <div className="hk-stat-label">LEMBAR DIBUTUHKAN</div>
                <div className="hk-stat-value">{sheetsNeededRaw !== null ? sheetsNeededRaw : '—'}</div>
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
                <div className="hk-stat-value">{totalOrderSheets !== null ? `${totalOrderSheets} lembar` : (qtyNum > 0 ? `${qtyNum} pcs` : '—')}</div>
              </div>
              <div className="hk-stat">
                <div className="hk-stat-label">HARGA / LEMBAR</div>
                <div className="hk-stat-value">Rp {hargaLembarCalc.toLocaleString('id-ID')}</div>
              </div>
              <div className="hk-stat">
                <div className="hk-stat-label">ESTIMASI BIAYA</div>
                <div className="hk-stat-value">
                  {estimasiBiaya !== null ? `Rp ${estimasiBiaya.toLocaleString('id-ID')}` : '—'}
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
                      <input type="number" min="1" className="hk-input" value={paperW}
                        onChange={e => { setPaperW(Math.max(0, Number(e.target.value))); setPaperPreset('custom'); }} />
                      <span className="hk-suffix">CM</span>
                    </div>
                  </div>
                  <div className="hk-field-group">
                    <label className="hk-label">Tinggi Kertas (CM)</label>
                    <div className="hk-input-suffix-row">
                      <input type="number" min="1" className="hk-input" value={paperH}
                        onChange={e => { setPaperH(Math.max(0, Number(e.target.value))); setPaperPreset('custom'); }} />
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
                      <input type="number" min="1" className="hk-input" value={designW}
                        onChange={e => setDesignW(Math.max(0, Number(e.target.value)))} />
                      <span className="hk-suffix">CM</span>
                    </div>
                  </div>
                  <div className="hk-field-group">
                    <label className="hk-label">Tinggi desain</label>
                    <div className={`hk-input-suffix-row ${designExceedsH ? 'is-error' : ''}`}>
                      <input type="number" min="1" className="hk-input" value={designH}
                        onChange={e => setDesignH(Math.max(0, Number(e.target.value)))} />
                      <span className="hk-suffix">CM</span>
                    </div>
                  </div>
                  <div className="hk-field-group">
                    <label className="hk-label">Bleed / jarak</label>
                    <div className="hk-input-suffix-row">
                      <input type="number" min="0" className="hk-input" value={bleed}
                        onChange={e => setBleed(Math.max(0, Number(e.target.value)))} />
                      <span className="hk-suffix">CM</span>
                    </div>
                  </div>
                  <div className="hk-field-group">
                    <label className="hk-label">Jumlah dibutuhkan</label>
                    <div className="hk-input-suffix-row">
                      <input type="number" min="0" className="hk-input" value={qty}
                        onChange={e => setQty(e.target.value)}
                        placeholder="Opsional" />
                      <span className="hk-suffix">PCS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Estimasi harga kertas */}
            <div className="hk-paper-pricing-section" style={{ marginTop: '22px', borderTop: '1px solid #F1F5F9', paddingTop: '18px' }}>
              <div className="hk-section-title" style={{ marginBottom: 12, fontWeight: 800, color: '#0F172A', fontSize: '13px' }}>Estimasi harga kertas</div>
              <div className="hk-three-col-inputs" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                <div className="hk-field-group">
                  <label className="hk-label">Harga per rim</label>
                  <div className="hk-input-suffix-row">
                    <input 
                      type="number" 
                      min="0" 
                      className="hk-input" 
                      placeholder="500000"
                      value={hargaPerRim}
                      onChange={e => setHargaPerRim(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))} 
                    />
                    <span className="hk-suffix">RP</span>
                  </div>
                </div>
                <div className="hk-field-group">
                  <label className="hk-label">Isi per rim</label>
                  <div className="hk-input-suffix-row">
                    <input 
                      type="number" 
                      min="1" 
                      className="hk-input" 
                      placeholder="500"
                      value={isiPerRim}
                      onChange={e => setIsiPerRim(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)))} 
                    />
                    <span className="hk-suffix">LEMBAR</span>
                  </div>
                </div>
                <div className="hk-field-group">
                  <label className="hk-label">Waste produksi</label>
                  <div className="hk-input-suffix-row">
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      className="hk-input" 
                      placeholder="0"
                      value={wasteProduksi}
                      onChange={e => setWasteProduksi(e.target.value)} 
                    />
                    <span className="hk-suffix">%</span>
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
              areaCetak={areaCetak}
            />
          </div>
          {isWarning && (
            <div className="hk-preview-warning">
              <AlertTriangle size={13} style={{ color: '#EF4444', flexShrink: 0 }} />
              <span>Area merah = bagian desain yang melebihi batas {marginVal > 0 ? 'area cetak' : 'kertas'}</span>
            </div>
          )}
          {!isWarning && fcsPerSheet > 0 && (
            <div className="hk-preview-info">
              <Info size={13} style={{ color: '#3B82F6', flexShrink: 0 }} />
              <span>{fcsPerSheet} objek muat · grid {cols}×{rows} · waste {wasteArea.toFixed(2)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
