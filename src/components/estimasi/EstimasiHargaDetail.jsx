import React from 'react';
import { ArrowLeft, Edit3, FileDown, Printer, Sparkles, Layers, Users, Package, FileText, Layers2, Clock } from 'lucide-react';

// ── Catalogs (mirrors EstimasiHargaForm) ──────────────────────────────────────
const PRINT_CAT = [
  { name: 'FlatBed UV',                        prices: { A3: { p1: 1,     p2: 1     }, B2: { p1: 1,     p2: 1     } } },
  { name: 'Kertas Fancy',                       prices: { A3: { p1: 30000, p2: 40000 }, B2: { p1: 40000, p2: 50000 } } },
  { name: 'Art Carton 210–260 gsm',             prices: { A3: { p1: 25000, p2: 20000 }, B2: { p1: 35000, p2: 30000 } } },
  { name: 'Art Paper / Matte 120–150 gsm',      prices: { A3: { p1: 25000, p2: 20000 }, B2: { p1: 35000, p2: 30000 } } },
  { name: 'Duplex 270–350 gsm',                 prices: { A3: { p1: 30000, p2: 25000 }, B2: { p1: 40000, p2: 35000 } } },
  { name: 'HVS 80–100 gsm',                     prices: { A3: { p1: 20000, p2: 20000 }, B2: { p1: 30000, p2: 30000 } } },
  { name: 'Stiker Metalized + White Ink',        prices: { A3: { p1: 40000, p2: 40000 }, B2: { p1: 50000, p2: 50000 } } },
  { name: 'Stiker Transparant + White Ink',      prices: { A3: { p1: 35000, p2: 35000 }, B2: { p1: 45000, p2: 45000 } } },
  { name: 'Stiker Vinyl',                        prices: { A3: { p1: 25000, p2: 22500 }, B2: { p1: 35000, p2: 32500 } } },
];
const DIG_CAT = [
  { name: 'Cutting Otomatis (Zund, Graphtec)', prices: { A3: { p1: 15000, p2: 15000 }, B2: { p1: 40000, p2: 40000 } } },
  { name: 'Emboss Digital',                    prices: { A3: { p1: 20000, p2: 20000 }, B2: { p1: 40000, p2: 40000 } } },
  { name: 'Foil Hot Stamp Effect Rainbow',     prices: { A3: { p1: 30000, p2: 30000 }, B2: { p1: 50000, p2: 50000 } } },
  { name: 'Foil Hot Stamp (standard color)',   prices: { A3: { p1: 20000, p2: 20000 }, B2: { p1: 40000, p2: 40000 } } },
  { name: 'Laminating Glossy/Matte',           prices: { A3: { p1: 10000, p2: 10000 }, B2: { p1: 15000, p2: 15000 } } },
  { name: 'Spot UV Digital',                   prices: { A3: { p1: 20000, p2: 20000 }, B2: { p1: 35000, p2: 35000 } } },
];
const MAN_CAT = [
  { name: 'WB Varnish',           laborRate: 0.75, toolRate: 0,    minCharge: 600000 },
  { name: 'Die Cut Manual',       laborRate: 15,   toolRate: 3500, minCharge: 250000 },
  { name: 'Emboss',               laborRate: 25,   toolRate: 2500, minCharge: 250000 },
  { name: 'Spot UV',              laborRate: 0.75, toolRate: 0,    minCharge: 650000 },
  { name: 'UV Varnish Glossy',    laborRate: 0.75, toolRate: 0,    minCharge: 600000 },
  { name: 'UV Varnish Matte',     laborRate: 0.75, toolRate: 0,    minCharge: 0 },
  { name: 'Spot UV / Varnish Effect', laborRate: 0.75, toolRate: 0, minCharge: 0 },
];
const MP_RATE = 275000;

// ── Calc helpers ──────────────────────────────────────────────────────────────
const calcPrint = (r) => {
  const it = PRINT_CAT.find(m => m.name === r.material) || PRINT_CAT[0];
  const sp = it.prices[r.size] || it.prices.A3 || { p1: 0, p2: 0 };
  const qty = Number(r.quantity) || 0;
  const up = qty > 10 ? (sp.p2 || sp.p1) : sp.p1;
  return { unitPrice: up, subtotal: qty * up };
};
const calcDigital = (r) => {
  const it = DIG_CAT.find(d => d.name === r.finishing) || DIG_CAT[0];
  const sp = it.prices[r.size] || it.prices.A3 || { p1: 0, p2: 0 };
  const qty = Number(r.quantity) || 0;
  const up = qty > 10 ? (sp.p2 || sp.p1) : sp.p1;
  return { unitPrice: up, subtotal: qty * up };
};
const calcManual = (r) => {
  const it = MAN_CAT.find(m => m.name === r.finishing) || MAN_CAT[0];
  const area = (Number(r.length) || 0) * (Number(r.width) || 0);
  const qty = Number(r.quantity) || 0;
  const toolCost = area * it.toolRate * (Number(r.toolCount) || 1);
  const rawLabor = area * it.laborRate * qty;
  const labor = it.minCharge > 0 ? Math.max(rawLabor, it.minCharge) : rawLabor;
  return { area, toolCost, labor, subtotal: Math.round(toolCost + labor) };
};
const calcManpower = (r) => {
  const p = Number(r.people) || 0, d = Number(r.days) || 0;
  return { people: p, days: d, subtotal: p * d * MP_RATE };
};
const calcAdditional = (r) => {
  const n = Number(r.nominal) || 0, q = Number(r.quantity) || 0;
  return { nominal: n, qty: q, subtotal: n * q };
};

const fmtRp  = v => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v || 0);
const fmtNum = v => new Intl.NumberFormat('id-ID').format(v || 0);

// ── HTML PDF Builder (Opens in about:blank / new tab) ────────────────────────
function buildPrintHTML({ basicInfo, printRows, digitalRows, manualRows, manpowerRows, additionalRows }) {
  const pT  = (printRows      || []).reduce((s, r) => s + calcPrint(r).subtotal, 0);
  const dT  = (digitalRows    || []).reduce((s, r) => s + calcDigital(r).subtotal, 0);
  const mT  = (manualRows     || []).reduce((s, r) => s + calcManual(r).subtotal, 0);
  const mpT = (manpowerRows   || []).reduce((s, r) => s + calcManpower(r).subtotal, 0);
  const aT  = (additionalRows || []).reduce((s, r) => s + calcAdditional(r).subtotal, 0);
  const gT  = pT + dT + mT + mpT + aT;

  const allItems = [];

  (printRows || []).forEach((r) => {
    const { unitPrice: up, subtotal } = calcPrint(r);
    allItems.push({
      title: r.material,
      layer: 'PRINT',
      subtotal,
      tags: [
        r.size ? `Size: ${r.size}` : null,
        r.quantity ? `Quantity: ${r.quantity}` : null,
      ].filter(Boolean),
      formula: `Rp ${fmtNum(up)} × ${r.quantity || 0} = ${fmtRp(subtotal)}`,
    });
  });

  (digitalRows || []).forEach((r) => {
    const { unitPrice: up, subtotal } = calcDigital(r);
    allItems.push({
      title: r.finishing,
      layer: 'DIGITAL',
      subtotal,
      tags: [
        r.size ? `Size: ${r.size}` : null,
        r.quantity ? `Quantity: ${r.quantity}` : null,
      ].filter(Boolean),
      formula: `Rp ${fmtNum(up)} × ${r.quantity || 0} = ${fmtRp(subtotal)}`,
    });
  });

  (manualRows || []).forEach((r) => {
    const { area, toolCost, labor, subtotal } = calcManual(r);
    allItems.push({
      title: r.finishing,
      layer: 'MANUAL',
      subtotal,
      tags: [
        r.quantity ? `Quantity: ${r.quantity}` : null,
        r.length ? `Length: ${r.length} cm` : null,
        r.width ? `Width: ${r.width} cm` : null,
        labor > 0 ? `Amount: ${fmtRp(labor)}` : null,
        r.toolCount ? `Tool count: ${r.toolCount}` : null,
      ].filter(Boolean),
      formula: `${area} cm² · Labor ${fmtRp(labor)}${toolCost > 0 ? ` · Tool ${fmtRp(toolCost)}` : ''} = ${fmtRp(subtotal)}`,
    });
  });

  (manpowerRows || []).forEach((r) => {
    const { people, days, subtotal } = calcManpower(r);
    allItems.push({
      title: r.description || 'Manpower',
      layer: 'MANPOWER',
      subtotal,
      tags: [
        people ? `Quantity: ${people} orang` : null,
        days ? `Days: ${days} hari` : null,
      ].filter(Boolean),
      formula: `${people} × ${days} × Rp ${fmtNum(MP_RATE)} = ${fmtRp(subtotal)}`,
    });
  });

  (additionalRows || []).forEach((r) => {
    const { nominal, qty, subtotal } = calcAdditional(r);
    allItems.push({
      title: r.description || 'Biaya Tambahan',
      layer: 'ADDITIONAL',
      subtotal,
      tags: [
        qty ? `Quantity: ${qty}` : null,
        'Length: 1 cm',
        'Width: 1 cm',
        nominal ? `Amount: ${fmtRp(nominal)}` : null,
        r.notes ? `Notes: ${r.notes}` : null,
      ].filter(Boolean),
      formula: `Rp ${fmtNum(nominal)} × ${qty} = ${fmtRp(subtotal)}`,
    });
  });

  const turnaroundText = basicInfo.turnaround || (basicInfo.turnaroundDays ? `${basicInfo.turnaroundDays} days` : '2 days');

  let itemsHtml = '';
  allItems.forEach((item, idx) => {
    const tagsHtml = item.tags.map(t => `<span class="chip">${t}</span>`).join('');
    itemsHtml += `
      <section class="line-item">
        <div class="line-header">
          <div class="line-heading">
            <span class="line-index">${idx + 1}</span>
            <div>
              <p class="line-title">${item.title}</p>
              <p class="line-layer">${item.layer}</p>
            </div>
          </div>
          <strong class="line-total">${fmtRp(item.subtotal)}</strong>
        </div>
        ${tagsHtml ? `<div class="chips">${tagsHtml}</div>` : ''}
        <p class="formula">${item.formula}</p>
      </section>
    `;
  });

  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>${basicInfo.noJob || 'RAB'} - ${basicInfo.project || 'Internal Estimate Detail'}</title>
  <style>
    * { box-sizing: border-box; }
    :root { --brand: #2563eb; --ink: #0f172a; --muted: #64748b; --line: #e2e8f0; --soft: #f8fafc; }
    html, body { margin: 0; padding: 0; background: #fff; }
    body { color: var(--ink); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; line-height: 1.5; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    
    .screen-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 24px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .screen-toolbar-title { font-size: 13px; font-weight: 700; color: #1e293b; }
    .screen-toolbar-actions { display: flex; gap: 10px; }
    .btn-print { background: #2563eb; color: #fff; border: none; padding: 8px 18px; border-radius: 8px; font-weight: 700; font-size: 12.5px; cursor: pointer; transition: background 0.15s; }
    .btn-print:hover { background: #1d4ed8; }
    .btn-close { background: #fff; color: #475569; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 12.5px; cursor: pointer; }
    .btn-close:hover { background: #f1f5f9; }

    .page { margin: 0 auto; max-width: 760px; padding: 32px 24px; }
    h1, h2, h3, p { margin: 0; }

    .hero { background: linear-gradient(135deg, #1e40af 0%, #2563eb 60%, #3b82f6 100%) !important; border-radius: 16px; color: #fff !important; display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; padding: 24px 28px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .hero-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; opacity: 0.85; }
    .hero-title { font-size: 22px; font-weight: 800; letter-spacing: -0.01em; margin-top: 4px; color: #fff; line-height: 1.25; }
    .hero-sub { font-size: 12px; opacity: 0.85; margin-top: 4px; }
    .hero-total-label { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.85; text-align: right; }
    .hero-total { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; text-align: right; white-space: nowrap; color: #fff; }

    .section-title { color: var(--muted); font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin: 28px 0 12px; }

    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .info-card { background: var(--soft); border: 1px solid var(--line); border-radius: 10px; padding: 11px 14px; }
    .info-label { color: var(--muted); font-size: 9px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
    .info-value { font-size: 13.5px; font-weight: 700; margin-top: 3px; color: var(--ink); word-break: break-word; }

    .totals { border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
    .total-row { display: flex; justify-content: space-between; padding: 10px 16px; border-bottom: 1px solid #f1f5f9; font-size: 12.5px; }
    .total-row:nth-child(even) { background: var(--soft); -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .total-row:last-child { border-bottom: none; }
    .total-row span:first-child { color: var(--muted); font-weight: 500; }
    .total-amount { font-weight: 700; color: var(--ink); }
    .total-row-grand { background: var(--brand) !important; color: #fff !important; font-size: 14px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .total-row-grand span:first-child { color: rgba(255,255,255,0.95); font-weight: 800; }
    .total-row-grand .total-amount { font-weight: 800; color: #fff; }

    .line-item { border: 1px solid var(--line); border-radius: 12px; margin-bottom: 12px; padding: 14px 16px; page-break-inside: avoid; break-inside: avoid; background: #fff; }
    .line-header { align-items: flex-start; display: flex; gap: 14px; justify-content: space-between; }
    .line-heading { align-items: flex-start; display: flex; gap: 10px; }
    .line-index { align-items: center; background: #eff6ff !important; border-radius: 50%; color: var(--brand); display: inline-flex; font-size: 12px; font-weight: 800; height: 26px; justify-content: center; width: 26px; flex-shrink: 0; margin-top: 1px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .line-title { font-size: 14px; font-weight: 700; color: var(--ink); line-height: 1.3; }
    .line-layer { color: var(--muted); font-size: 9px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 2px; }
    .line-total { font-size: 14.5px; font-weight: 800; white-space: nowrap; color: var(--ink); }
    .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
    .chip { background: var(--soft) !important; border: 1px solid var(--line); border-radius: 999px; color: #334155; font-size: 11px; font-weight: 500; padding: 3px 11px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .formula { background: #eff6ff !important; border-radius: 8px; color: #1d4ed8; font-size: 11.5px; font-weight: 700; margin-top: 10px; padding: 8px 12px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

    .empty { color: var(--muted); }
    .signature-wrap { display: flex; justify-content: flex-end; margin-top: 40px; margin-bottom: 20px; page-break-inside: avoid; break-inside: avoid; }
    .signature { min-width: 200px; text-align: center; }
    .signature-label { color: var(--muted); font-size: 9.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
    .signature-space { height: 48px; }
    .signature-name { border-top: 1.5px solid var(--ink); font-size: 13px; font-weight: 700; padding-top: 6px; color: var(--ink); }
    footer { border-top: 1px solid var(--line); color: var(--muted); font-size: 10px; margin-top: 24px; padding-top: 12px; text-align: center; page-break-inside: avoid; break-inside: avoid; }

    @media print {
      .screen-toolbar { display: none !important; }
      .page { max-width: none; padding: 0; }
      @page { size: A4 portrait; margin: 12mm 16mm; }
    }
  </style>
</head>
<body>
  <div class="screen-toolbar">
    <div class="screen-toolbar-title">📄 ${basicInfo.noJob || '—'} · ${basicInfo.project || '—'} · Internal Estimate</div>
    <div class="screen-toolbar-actions">
      <button class="btn-print" onclick="window.print()">🖨 Cetak / Simpan PDF</button>
      <button class="btn-close" onclick="window.close()">Tutup</button>
    </div>
  </div>

  <div class="page">
    <header class="hero">
      <div>
        <p class="hero-eyebrow">Internal Estimate</p>
        <h1 class="hero-title">${basicInfo.noJob || '—'} ${basicInfo.project || ''}</h1>
        <p class="hero-sub">${basicInfo.project || basicInfo.sku || 'Mockup Leaflet'}</p>
      </div>
      <div>
        <p class="hero-total-label">Grand Total</p>
        <p class="hero-total">${fmtRp(gT)}</p>
      </div>
    </header>

    <p class="section-title">Summary</p>
    <div class="info-grid">
      <div class="info-card"><p class="info-label">No Job</p><p class="info-value">${basicInfo.noJob || '—'}</p></div>
      <div class="info-card"><p class="info-label">SKU</p><p class="info-value">${basicInfo.sku || '—'}</p></div>
      <div class="info-card"><p class="info-label">Client</p><p class="info-value">${basicInfo.client || '—'}</p></div>
      <div class="info-card"><p class="info-label">Project</p><p class="info-value">${basicInfo.project || '—'}</p></div>
      <div class="info-card"><p class="info-label">Turnaround</p><p class="info-value">${turnaroundText}</p></div>
      <div class="info-card"><p class="info-label">Line Items</p><p class="info-value">${allItems.length}</p></div>
    </div>

    <p class="section-title">Layer Totals</p>
    <div class="totals">
      <div class="total-row"><span>Print</span><span class="total-amount">${fmtRp(pT)}</span></div>
      <div class="total-row"><span>Finishing Digital</span><span class="total-amount">${fmtRp(dT)}</span></div>
      <div class="total-row"><span>Finishing Manual</span><span class="total-amount">${fmtRp(mT)}</span></div>
      <div class="total-row"><span>Manpower</span><span class="total-amount">${fmtRp(mpT)}</span></div>
      <div class="total-row"><span>Additional</span><span class="total-amount">${fmtRp(aT)}</span></div>
      <div class="total-row total-row-grand"><span>Grand Total</span><span class="total-amount">${fmtRp(gT)}</span></div>
    </div>

    <p class="section-title">Line Items</p>
    ${itemsHtml || '<p class="empty">Tidak ada item.</p>'}

    <div class="signature-wrap">
      <div class="signature">
        <p class="signature-label">Account Executive</p>
        <div class="signature-space"></div>
        <p class="signature-name">${basicInfo.aeName || 'Anita'}</p>
      </div>
    </div>

    <footer>Generated by RAB Calculator</footer>
  </div>
</body>
</html>`;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function InfoField({ label, value }) {
  return (
    <div className="detail-info-field">
      <span className="detail-info-label">{label}</span>
      <span className="detail-info-value">{value || <span style={{ color: '#94a3b8' }}>—</span>}</span>
    </div>
  );
}

function DetailSection({ icon, color, title, subtitle, rows, renderRow, emptyText }) {
  return (
    <div className="rab-card">
      <div className="rab-card-header">
        <div className="rab-card-title-group">
          <div className={`rab-card-icon ${color}`}>{icon}</div>
          <div>
            <h3 className="rab-card-title">{title}</h3>
            {subtitle && <p className="rab-card-subtitle">{subtitle}</p>}
          </div>
        </div>
        <span className="detail-row-count">{rows.length} item</span>
      </div>
      {rows.length === 0
        ? <p className="detail-empty-text">{emptyText || 'Tidak ada data.'}</p>
        : rows.map((row, i) => <div key={row.id || i} className="detail-item-row">{renderRow(row, i)}</div>)
      }
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function EstimasiHargaDetail({ data, onBack, onEdit }) {
  const { basicInfo = {}, printRows = [], digitalRows = [], manualRows = [], manpowerRows = [], additionalRows = [] } = data || {};

  const pT  = printRows.reduce((s, r) => s + calcPrint(r).subtotal, 0);
  const dT  = digitalRows.reduce((s, r) => s + calcDigital(r).subtotal, 0);
  const mT  = manualRows.reduce((s, r) => s + calcManual(r).subtotal, 0);
  const mpT = manpowerRows.reduce((s, r) => s + calcManpower(r).subtotal, 0);
  const aT  = additionalRows.reduce((s, r) => s + calcAdditional(r).subtotal, 0);
  const gT  = pT + dT + mT + mpT + aT;

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(buildPrintHTML({ basicInfo, printRows, digitalRows, manualRows, manpowerRows, additionalRows }));
      w.document.close();
      w.focus();
    }
  };

  return (
    <div className="rab-form-screen">
      {/* Top bar */}
      <div className="detail-topbar">
        <button className="rab-back-btn" onClick={onBack} title="Kembali"><ArrowLeft size={18} /></button>
        <div className="detail-topbar-info">
          <span className="detail-topbar-nojob">{basicInfo.noJob || '—'}</span>
          <span className="detail-topbar-sep">·</span>
          <span className="detail-topbar-project">{basicInfo.project || '—'}</span>
        </div>
        <div className="detail-topbar-actions">
          <button className="detail-btn-pdf" onClick={handlePrint} title="Ekspor PDF">
            <FileDown size={15} /><span>PDF</span>
          </button>
          <button className="detail-btn-edit" onClick={onEdit} title="Edit">
            <Edit3 size={15} /><span>Edit</span>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="rab-form-body-grid">
        <div className="rab-form-sections-grid">

          {/* Basic Info */}
          <div className="rab-card info-dasar-card">
            <div className="rab-card-header">
              <div className="rab-card-title-group">
                <div className="rab-card-icon blue"><FileText size={16} /></div>
                <div><h3 className="rab-card-title">Informasi Dasar Pekerjaan</h3></div>
              </div>
            </div>
            <div className="detail-info-grid">
              <InfoField label="No Job"       value={basicInfo.noJob} />
              <InfoField label="SKU"          value={basicInfo.sku} />
              <InfoField label="Klien"        value={basicInfo.client} />
              <InfoField label="Proyek"       value={basicInfo.project} />
              <InfoField label="Nama AE"      value={basicInfo.aeName} />
              <InfoField label="Kuantiti"     value={basicInfo.quantity} />
              <InfoField label="Harga Satuan" value={basicInfo.unitPrice} />
            </div>
          </div>

          {/* Print */}
          <DetailSection icon={<Printer size={16}/>} color="blue" title="Print" subtitle="Material cetak dan ukuran lembar kerja"
            rows={printRows} emptyText="Tidak ada baris print."
            renderRow={(r) => { const { unitPrice: up, subtotal } = calcPrint(r); return (
              <div className="detail-row-inner">
                <div className="detail-row-left">
                  <span className="detail-row-name">{r.material}</span>
                  <span className="detail-row-tags">
                    <span className="detail-tag">Ukuran: {r.size}</span>
                    <span className="detail-tag">Qty: {r.quantity}</span>
                  </span>
                </div>
                <div className="detail-row-right">
                  <span className="detail-row-calc">Rp {fmtNum(up)} × {r.quantity}</span>
                  <span className="detail-row-total">{fmtRp(subtotal)}</span>
                </div>
              </div>
            );}}
          />

          {/* Digital Finishing */}
          <DetailSection icon={<Sparkles size={16}/>} color="purple" title="Digital Finishing" subtitle="Laminasi, Spot UV, Foil, dll."
            rows={digitalRows} emptyText="Tidak ada baris digital finishing."
            renderRow={(r) => { const { unitPrice: up, subtotal } = calcDigital(r); return (
              <div className="detail-row-inner">
                <div className="detail-row-left">
                  <span className="detail-row-name">{r.finishing}</span>
                  <span className="detail-row-tags">
                    <span className="detail-tag">Ukuran: {r.size}</span>
                    <span className="detail-tag">Qty: {r.quantity}</span>
                  </span>
                </div>
                <div className="detail-row-right">
                  <span className="detail-row-calc">Rp {fmtNum(up)} × {r.quantity}</span>
                  <span className="detail-row-total">{fmtRp(subtotal)}</span>
                </div>
              </div>
            );}}
          />

          {/* Manual Finishing */}
          <DetailSection icon={<Layers size={16}/>} color="blue" title="Manual Finishing" subtitle="Pon, lem lipat, jilid kawat / lem panas"
            rows={manualRows} emptyText="Tidak ada baris manual finishing."
            renderRow={(r) => { const { area, toolCost, labor, subtotal } = calcManual(r); return (
              <div className="detail-row-inner">
                <div className="detail-row-left">
                  <span className="detail-row-name">{r.finishing}</span>
                  <span className="detail-row-tags">
                    <span className="detail-tag">P: {r.length} cm</span>
                    <span className="detail-tag">L: {r.width} cm</span>
                    <span className="detail-tag">Qty: {r.quantity}</span>
                    <span className="detail-tag">Alat: {r.toolCount}</span>
                  </span>
                </div>
                <div className="detail-row-right">
                  <span className="detail-row-calc">{area} cm² · Labor {fmtRp(labor)}</span>
                  <span className="detail-row-total">{fmtRp(subtotal)}</span>
                </div>
              </div>
            );}}
          />

          {/* Manpower */}
          <DetailSection icon={<Users size={16}/>} color="blue" title="Manpower" subtitle="Tenaga kerja dan durasi pengerjaan"
            rows={manpowerRows} emptyText="Tidak ada baris manpower."
            renderRow={(r) => { const { people, days, subtotal } = calcManpower(r); return (
              <div className="detail-row-inner">
                <div className="detail-row-left">
                  <span className="detail-row-name">{r.description || 'Manpower'}</span>
                  <span className="detail-row-tags">
                    <span className="detail-tag">{people} orang</span>
                    <span className="detail-tag">{days} hari</span>
                  </span>
                </div>
                <div className="detail-row-right">
                  <span className="detail-row-calc">{people} × {days} × Rp {fmtNum(MP_RATE)}</span>
                  <span className="detail-row-total">{fmtRp(subtotal)}</span>
                </div>
              </div>
            );}}
          />

          {/* Biaya Tambahan */}
          <DetailSection icon={<Package size={16}/>} color="blue" title="Biaya Tambahan" subtitle="Packing, ongkos kirim, dan lainnya"
            rows={additionalRows} emptyText="Tidak ada biaya tambahan."
            renderRow={(r) => { const { nominal, qty, subtotal } = calcAdditional(r); return (
              <div className="detail-row-inner">
                <div className="detail-row-left">
                  <span className="detail-row-name">{r.description}</span>
                  <span className="detail-row-tags">
                    <span className="detail-tag">Qty: {qty}</span>
                    {r.notes && <span className="detail-tag">{r.notes}</span>}
                  </span>
                </div>
                <div className="detail-row-right">
                  <span className="detail-row-calc">Rp {fmtNum(nominal)} × {qty}</span>
                  <span className="detail-row-total">{fmtRp(subtotal)}</span>
                </div>
              </div>
            );}}
          />
        </div>

        {/* Sidebar */}
        <div className="rab-summary-sidebar">
          <div className="rab-summary-sticky-card">
            <div className="summary-header">
              <div className="summary-icon-title"><Layers2 size={16} color="#3B82F6" /><span className="summary-mini-tag">TOTAL</span></div>
              <h4 className="summary-title">Keseluruhan</h4>
            </div>
            <div className="summary-big-price">{fmtRp(gT)}</div>
            <div className="summary-subtotals-section">
              {[['Print', pT], ['Digital Finishing', dT], ['Manual Finishing', mT], ['Manpower', mpT], ['Biaya Tambahan', aT]].map(([lbl, val]) => (
                <div className="subtotal-line" key={lbl}>
                  <span>{lbl}</span>
                  <span style={{ color: val === 0 ? '#cbd5e1' : undefined }}>{fmtRp(val)}</span>
                </div>
              ))}
            </div>
            <div className="summary-time-estimate"><Clock size={13} /><span>Mode: Lihat Saja</span></div>
            <div className="summary-action-buttons">
              <button className="detail-btn-pdf detail-btn-pdf--full" onClick={handlePrint}>
                <FileDown size={14} /><span>Ekspor PDF</span>
              </button>
              <button className="summary-btn-submit" onClick={onEdit}>
                <Edit3 size={14} /><span>Edit Estimasi</span>
              </button>
              <button className="summary-btn-cancel" onClick={onBack}>Kembali</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}