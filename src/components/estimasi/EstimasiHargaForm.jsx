import React, { useState } from 'react';
import { 
  Save, 
  Send, 
  Plus, 
  Trash2, 
  FileText, 
  Printer, 
  Sparkles, 
  Layers, 
  Users,
  Package, 
  Clock, 
  Layers2,
  DollarSign
} from 'lucide-react';

// Master Data Catalog Definitions
const PRINT_MATERIALS_CATALOG = [
  { id: 'flatbed', name: 'FlatBed UV', prices: { A3: { p1: 1, p2: 1 }, B2: { p1: 1, p2: 1 } } },
  { id: 'fancy', name: 'Kertas Fancy', prices: { A3: { p1: 30000, p2: 40000 }, B2: { p1: 40000, p2: 50000 } } },
  { id: 'art-carton', name: 'Art Carton 210–260 gsm', prices: { A3: { p1: 25000, p2: 20000 }, B2: { p1: 35000, p2: 30000 } } },
  { id: 'art-paper', name: 'Art Paper / Matte 120–150 gsm', prices: { A3: { p1: 25000, p2: 20000 }, B2: { p1: 35000, p2: 30000 } } },
  { id: 'duplex', name: 'Duplex 270–350 gsm', prices: { A3: { p1: 30000, p2: 25000 }, B2: { p1: 40000, p2: 35000 } } },
  { id: 'hvs', name: 'HVS 80–100 gsm', prices: { A3: { p1: 20000, p2: 20000 }, B2: { p1: 30000, p2: 30000 } } },
  { id: 'stiker-meta', name: 'Stiker Metalized + White Ink', prices: { A3: { p1: 40000, p2: 40000 }, B2: { p1: 50000, p2: 50000 } } },
  { id: 'stiker-trans', name: 'Stiker Transparant + White Ink', prices: { A3: { p1: 35000, p2: 35000 }, B2: { p1: 45000, p2: 45000 } } },
  { id: 'stiker-vinyl', name: 'Stiker Vinyl', prices: { A3: { p1: 25000, p2: 22500 }, B2: { p1: 35000, p2: 32500 } } },
];

const DIGITAL_FINISHING_CATALOG = [
  { id: 'df-cut', name: 'Cutting Otomatis (Zund, Graphtec)', prices: { A3: { p1: 15000, p2: 15000 }, B2: { p1: 40000, p2: 40000 } } },
  { id: 'df-emboss', name: 'Emboss Digital', prices: { A3: { p1: 20000, p2: 20000 }, B2: { p1: 40000, p2: 40000 } } },
  { id: 'df-foil-rain', name: 'Foil Hot Stamp Effect Rainbow', prices: { A3: { p1: 30000, p2: 30000 }, B2: { p1: 50000, p2: 50000 } } },
  { id: 'df-foil-std', name: 'Foil Hot Stamp (standard color)', prices: { A3: { p1: 20000, p2: 20000 }, B2: { p1: 40000, p2: 40000 } } },
  { id: 'df-lam', name: 'Laminating Glossy/Matte', prices: { A3: { p1: 10000, p2: 10000 }, B2: { p1: 15000, p2: 15000 } } },
  { id: 'df-spot', name: 'Spot UV Digital', prices: { A3: { p1: 20000, p2: 20000 }, B2: { p1: 35000, p2: 35000 } } },
];

const MANUAL_FINISHING_CATALOG = [
  { id: 'mf-wb', name: 'WB Varnish', laborRate: 0.75, toolRate: 0, minCharge: 600000 },
  { id: 'mf-die', name: 'Die Cut Manual', laborRate: 15, toolRate: 3500, minCharge: 250000 },
  { id: 'mf-emb', name: 'Emboss', laborRate: 25, toolRate: 2500, minCharge: 250000 },
  { id: 'mf-spot', name: 'Spot UV', laborRate: 0.75, toolRate: 0, minCharge: 650000 },
  { id: 'mf-uvg', name: 'UV Varnish Glossy', laborRate: 0.75, toolRate: 0, minCharge: 600000 },
  { id: 'mf-uvm', name: 'UV Varnish Matte', laborRate: 0.75, toolRate: 0, minCharge: 0 },
  { id: 'mf-uve', name: 'Spot UV / Varnish Effect', laborRate: 0.75, toolRate: 0, minCharge: 0 },
];

const ADDITIONAL_COSTS_CATALOG = [
  { id: 'op-pack', name: 'Packing', defaultPrice: 10000 },
  { id: 'op-inhouse', name: 'In-house Finishing', defaultPrice: 15000 },
  { id: 'op-metalize', name: 'Metalize Material', defaultPrice: 10000 },
  { id: 'op-mockup', name: 'Mockup Operations', defaultPrice: 25000 },
  { id: 'op-opfee', name: 'Operator Fee', defaultPrice: 50000 },
  { id: 'op-overtime', name: 'Over Time', defaultPrice: 35000 },
  { id: 'op-paper', name: 'Paper Purchase', defaultPrice: 5000 },
  { id: 'op-product', name: 'Product Purchase', defaultPrice: 20000 },
  { id: 'op-rush', name: 'Rush Job', defaultPrice: 50000 },
];

export default function EstimasiHargaForm({ onBack, initialData }) {
  // Form State - start empty on new addition
  const [basicInfo, setBasicInfo] = useState({
    noJob: initialData?.noJob || '',
    sku: initialData?.sku || initialData?.rabCode || '',
    client: initialData?.client || '',
    project: initialData?.project || initialData?.rabName || '',
    aeName: initialData?.aeName || '',
    quantity: initialData?.quantity || '',
    unitPrice: initialData?.unitPrice || '',
  });

  // Print Rows - dimulai kosong sampai user klik '+ Tambah baris'
  const [printRows, setPrintRows] = useState(initialData?.printRows || []);

  // Digital Finishing Rows - dimulai kosong sampai user klik '+ Tambah baris'
  const [digitalRows, setDigitalRows] = useState(initialData?.digitalRows || []);

  // Manual Finishing Rows - dimulai kosong sampai user klik '+ Tambah baris'
  const [manualRows, setManualRows] = useState(initialData?.manualRows || []);

  // Manpower Rows - dimulai kosong sampai user klik '+ Tambah baris'
  const [manpowerRows, setManpowerRows] = useState(initialData?.manpowerRows || []);

  // Biaya Tambahan Rows - dimulai kosong sampai user klik '+ Tambah baris'
  const [additionalRows, setAdditionalRows] = useState(initialData?.additionalRows || []);

  // Helper calculation functions
  const getPrintRowCalc = (row) => {
    const item = PRINT_MATERIALS_CATALOG.find(m => m.name === row.material) || PRINT_MATERIALS_CATALOG[0];
    const sizePrices = item.prices[row.size] || item.prices.A3 || { p1: 0, p2: 0 };
    const qty = Number(row.quantity) || 0;
    const unitPrice = qty > 10 ? (sizePrices.p2 || sizePrices.p1) : sizePrices.p1;
    const subtotal = qty * unitPrice;
    return { unitPrice, subtotal };
  };

  const getDigitalRowCalc = (row) => {
    const item = DIGITAL_FINISHING_CATALOG.find(d => d.name === row.finishing) || DIGITAL_FINISHING_CATALOG[0];
    const sizePrices = item.prices[row.size] || item.prices.A3 || { p1: 0, p2: 0 };
    const qty = Number(row.quantity) || 0;
    const unitPrice = qty > 10 ? (sizePrices.p2 || sizePrices.p1) : sizePrices.p1;
    const subtotal = qty * unitPrice;
    return { unitPrice, subtotal };
  };

  const getManualRowCalc = (row) => {
    const item = MANUAL_FINISHING_CATALOG.find(m => m.name === row.finishing) || MANUAL_FINISHING_CATALOG[0];
    const length = Number(row.length) || 0;
    const width = Number(row.width) || 0;
    const qty = Number(row.quantity) || 0;
    const toolCount = Number(row.toolCount) || 1;

    const area = length * width;
    const toolingCost = area * item.toolRate * toolCount;
    const rawLabor = area * item.laborRate * qty;
    const laborCost = item.minCharge > 0 ? Math.max(rawLabor, item.minCharge) : rawLabor;
    const subtotal = Math.round(toolingCost + laborCost);

    return { area, toolingCost, laborCost, subtotal, minCharge: item.minCharge };
  };

  // Fixed daily rate from master data
  const MANPOWER_DAILY_RATE = 275000;

  const getManpowerRowCalc = (row) => {
    const people = Number(row.people) || 0;
    const days = Number(row.days) || 0;
    const subtotal = people * days * MANPOWER_DAILY_RATE;
    return { people, days, dailyRate: MANPOWER_DAILY_RATE, subtotal };
  };

  const getAdditionalRowCalc = (row) => {
    const nominal = Number(row.nominal) || 0;
    const qty = Number(row.quantity) || 0;
    const subtotal = nominal * qty;
    return { nominal, qty, subtotal };
  };

  // Grand Totals
  const printTotal = printRows.reduce((sum, r) => sum + getPrintRowCalc(r).subtotal, 0);
  const digitalTotal = digitalRows.reduce((sum, r) => sum + getDigitalRowCalc(r).subtotal, 0);
  const manualTotal = manualRows.reduce((sum, r) => sum + getManualRowCalc(r).subtotal, 0);
  const manpowerTotal = manpowerRows.reduce((sum, r) => sum + getManpowerRowCalc(r).subtotal, 0);
  const additionalTotal = additionalRows.reduce((sum, r) => sum + getAdditionalRowCalc(r).subtotal, 0);

  const grandTotal = printTotal + digitalTotal + manualTotal + manpowerTotal + additionalTotal;

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);
  };

  const formatNumber = (val) => {
    return new Intl.NumberFormat('id-ID').format(val || 0);
  };

  const handleSave = (status) => {
    alert(`Estimasi Harga berhasil disimpan sebagai ${status}!`);
    onBack();
  };

  return (
    <div className="rab-form-screen">
      {/* Main Layout: Stacked Sequence + Sticky Summary Right */}
      <div className="rab-form-body-grid">
        
        {/* Left Stacked Form Sections */}
        <div className="rab-form-sections-grid">
          
          {/* Top Card: Informasi Dasar Pekerjaan */}
          <div className="rab-card info-dasar-card">
            <div className="rab-card-header">
              <div className="rab-card-title-group">
                <div className="rab-card-icon blue">
                  <FileText size={16} />
                </div>
                <div>
                  <h3 className="rab-card-title">Informasi Dasar Pekerjaan</h3>
                </div>
              </div>
            </div>

            <div className="rab-card-form-grid">
              <div className="form-group col-span-1">
                <label className="form-label">No Job</label>
                <input 
                  type="text" 
                  value={basicInfo.noJob} 
                  onChange={(e) => setBasicInfo({...basicInfo, noJob: e.target.value})}
                  className="form-input" 
                  placeholder="mis. HKU_105_2026"
                />
              </div>

              <div className="form-group col-span-1">
                <label className="form-label">SKU</label>
                <input 
                  type="text" 
                  value={basicInfo.sku} 
                  onChange={(e) => setBasicInfo({...basicInfo, sku: e.target.value})}
                  className="form-input" 
                  placeholder="Contoh: BOX-VEET-001"
                />
              </div>

              <div className="form-group col-span-1">
                <label className="form-label">Klien</label>
                <input 
                  type="text" 
                  value={basicInfo.client} 
                  onChange={(e) => setBasicInfo({...basicInfo, client: e.target.value})}
                  className="form-input" 
                  placeholder="Contoh: Reckitt, Danone, Nestle"
                />
              </div>

              <div className="form-group col-span-1">
                <label className="form-label">Proyek</label>
                <input 
                  type="text" 
                  value={basicInfo.project} 
                  onChange={(e) => setBasicInfo({...basicInfo, project: e.target.value})}
                  className="form-input" 
                  placeholder="Contoh: Veet Mockup Veet Men"
                />
              </div>

              <div className="form-group col-span-1">
                <label className="form-label">Nama AE</label>
                <input 
                  type="text" 
                  value={basicInfo.aeName} 
                  onChange={(e) => setBasicInfo({...basicInfo, aeName: e.target.value})}
                  className="form-input" 
                  placeholder="Nama Account Executive"
                />
              </div>

              <div className="form-group col-span-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label className="form-label">Kuantiti</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: 10" 
                    value={basicInfo.quantity}
                    onChange={(e) => setBasicInfo({...basicInfo, quantity: e.target.value})}
                    className="form-input" 
                  />
                </div>
                <div>
                  <label className="form-label">Harga Satuan</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Rp 10.000" 
                    value={basicInfo.unitPrice}
                    onChange={(e) => setBasicInfo({...basicInfo, unitPrice: e.target.value})}
                    className="form-input" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Print (Gambar 1 & 2) */}
          <div className="rab-card print-card">
            <div className="rab-card-header">
              <div className="rab-card-title-group">
                <div className="rab-card-icon blue">
                  <Printer size={16} />
                </div>
                <div>
                  <h3 className="rab-card-title">Print</h3>
                  <p className="rab-card-subtitle">Material cetak dan ukuran lembar kerja</p>
                </div>
              </div>

              <button 
                className="rab-btn-add-row" 
                onClick={() => setPrintRows([...printRows, { id: Date.now(), material: 'FlatBed UV', size: 'A3', quantity: 1 }])}
              >
                <Plus size={13} />
                <span>Tambah baris print</span>
              </button>
            </div>

            {printRows.map((row, idx) => {
              const { unitPrice, subtotal } = getPrintRowCalc(row);

              return (
                <div key={row.id} className="rab-item-row-box">
                  <div className="row-inline-grid">
                    <div className="form-group flex-grow-2">
                      <label className="form-label">MATERIAL</label>
                      <select 
                        value={row.material} 
                        onChange={(e) => {
                          const updated = [...printRows];
                          updated[idx].material = e.target.value;
                          setPrintRows(updated);
                        }}
                        className="form-input"
                      >
                        {PRINT_MATERIALS_CATALOG.map((m) => (
                          <option key={m.id} value={m.name}>{m.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">UKURAN</label>
                      <select 
                        value={row.size} 
                        onChange={(e) => {
                          const updated = [...printRows];
                          updated[idx].size = e.target.value;
                          setPrintRows(updated);
                        }}
                        className="form-input"
                      >
                        <option value="A3">A3</option>
                        <option value="B2">B2</option>
                        <option value="Large Format">Large Format</option>
                      </select>
                    </div>

                    <div className="form-group flex-sm">
                      <label className="form-label">KUANTITI</label>
                      <input 
                        type="number" 
                        min="1"
                        value={row.quantity} 
                        onChange={(e) => {
                          const updated = [...printRows];
                          updated[idx].quantity = Number(e.target.value) || 0;
                          setPrintRows(updated);
                        }}
                        className="form-input" 
                      />
                    </div>

                    <div className="form-group-action">
                      <button 
                        className="row-delete-btn-inline" 
                        onClick={() => setPrintRows(printRows.filter(r => r.id !== row.id))}
                        title="Hapus baris"
                      >
                        <Trash2 size={13} />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>

                  <div className="row-calc-preview">
                    <span>Rp {formatNumber(unitPrice)} × {row.quantity || 0} = <strong>{formatRupiah(subtotal)}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Section 2: Digital Finishing (Gambar 3) */}
          <div className="rab-card digital-card">
            <div className="rab-card-header">
              <div className="rab-card-title-group">
                <div className="rab-card-icon purple">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="rab-card-title">Digital Finishing</h3>
                  <p className="rab-card-subtitle">Laminasi, Spot UV, Foil, dll.</p>
                </div>
              </div>

              <button 
                className="rab-btn-add-row" 
                onClick={() => setDigitalRows([...digitalRows, { id: Date.now(), finishing: 'Cutting Otomatis (Zund, Graphtec)', size: 'A3', quantity: 1 }])}
              >
                <Plus size={13} />
                <span>Tambah baris digital</span>
              </button>
            </div>

            {digitalRows.map((row, idx) => {
              const { unitPrice, subtotal } = getDigitalRowCalc(row);

              return (
                <div key={row.id} className="rab-item-row-box">
                  <div className="row-inline-grid">
                    <div className="form-group flex-grow-2">
                      <label className="form-label">FINISHING</label>
                      <select 
                        value={row.finishing} 
                        onChange={(e) => {
                          const updated = [...digitalRows];
                          updated[idx].finishing = e.target.value;
                          setDigitalRows(updated);
                        }}
                        className="form-input"
                      >
                        {DIGITAL_FINISHING_CATALOG.map((df) => (
                          <option key={df.id} value={df.name}>{df.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">UKURAN</label>
                      <select 
                        value={row.size} 
                        onChange={(e) => {
                          const updated = [...digitalRows];
                          updated[idx].size = e.target.value;
                          setDigitalRows(updated);
                        }}
                        className="form-input"
                      >
                        <option value="A3">A3</option>
                        <option value="B2">B2</option>
                        <option value="Large Format">Large Format</option>
                      </select>
                    </div>

                    <div className="form-group flex-sm">
                      <label className="form-label">KUANTITI</label>
                      <input 
                        type="number" 
                        min="1"
                        value={row.quantity} 
                        onChange={(e) => {
                          const updated = [...digitalRows];
                          updated[idx].quantity = Number(e.target.value) || 0;
                          setDigitalRows(updated);
                        }}
                        className="form-input" 
                      />
                    </div>

                    <div className="form-group-action">
                      <button 
                        className="row-delete-btn-inline" 
                        onClick={() => setDigitalRows(digitalRows.filter(r => r.id !== row.id))}
                        title="Hapus baris"
                      >
                        <Trash2 size={13} />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>

                  <div className="row-calc-preview">
                    <span>Rp {formatNumber(unitPrice)} × {row.quantity || 0} = <strong>{formatRupiah(subtotal)}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Section 3: Manual Finishing (Gambar 4) */}
          <div className="rab-card manual-card">
            <div className="rab-card-header">
              <div className="rab-card-title-group">
                <div className="rab-card-icon blue">
                  <Layers size={16} />
                </div>
                <div>
                  <h3 className="rab-card-title">Manual Finishing</h3>
                  <p className="rab-card-subtitle">Pond, lem lipat, jilid kawat / lem panas</p>
                </div>
              </div>

              <button 
                className="rab-btn-add-row" 
                onClick={() => setManualRows([...manualRows, { id: Date.now(), finishing: 'WB Varnish', length: 1, width: 1, quantity: 1, toolCount: 1 }])}
              >
                <Plus size={13} />
                <span>Tambah baris manual</span>
              </button>
            </div>

            {manualRows.map((row, idx) => {
              const { area, toolingCost, laborCost, subtotal } = getManualRowCalc(row);

              return (
                <div key={row.id} className="rab-item-row-box">
                  <div className="row-inline-grid">
                    <div className="form-group flex-grow-2">
                      <label className="form-label">FINISHING</label>
                      <select 
                        value={row.finishing} 
                        onChange={(e) => {
                          const updated = [...manualRows];
                          updated[idx].finishing = e.target.value;
                          setManualRows(updated);
                        }}
                        className="form-input"
                      >
                        {MANUAL_FINISHING_CATALOG.map((mf) => (
                          <option key={mf.id} value={mf.name}>{mf.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group flex-sm">
                      <label className="form-label">PANJANG (CM)</label>
                      <input 
                        type="number" 
                        min="0"
                        value={row.length} 
                        onChange={(e) => {
                          const updated = [...manualRows];
                          updated[idx].length = Number(e.target.value) || 0;
                          setManualRows(updated);
                        }}
                        className="form-input" 
                      />
                    </div>

                    <div className="form-group flex-sm">
                      <label className="form-label">LEBAR (CM)</label>
                      <input 
                        type="number" 
                        min="0"
                        value={row.width} 
                        onChange={(e) => {
                          const updated = [...manualRows];
                          updated[idx].width = Number(e.target.value) || 0;
                          setManualRows(updated);
                        }}
                        className="form-input" 
                      />
                    </div>

                    <div className="form-group flex-sm">
                      <label className="form-label">KUANTITI</label>
                      <input 
                        type="number" 
                        min="1"
                        value={row.quantity} 
                        onChange={(e) => {
                          const updated = [...manualRows];
                          updated[idx].quantity = Number(e.target.value) || 0;
                          setManualRows(updated);
                        }}
                        className="form-input" 
                      />
                    </div>

                    <div className="form-group flex-sm">
                      <label className="form-label">JUMLAH ALAT</label>
                      <input 
                        type="number" 
                        min="1"
                        value={row.toolCount} 
                        onChange={(e) => {
                          const updated = [...manualRows];
                          updated[idx].toolCount = Number(e.target.value) || 1;
                          setManualRows(updated);
                        }}
                        className="form-input" 
                      />
                    </div>

                    <div className="form-group-action">
                      <button 
                        className="row-delete-btn-inline" 
                        onClick={() => setManualRows(manualRows.filter(r => r.id !== row.id))}
                        title="Hapus baris"
                      >
                        <Trash2 size={13} />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>

                  <div className="row-calc-preview">
                    <span>
                      Luas: {area} cm² · Tenaga: Rp {formatNumber(laborCost)} {toolingCost > 0 ? `· Alat: Rp ${formatNumber(toolingCost)}` : ''} = <strong>{formatRupiah(subtotal)}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Section 4: Manpower (User Request 2: input orang & hari) */}
          <div className="rab-card manpower-card">
            <div className="rab-card-header">
              <div className="rab-card-title-group">
                <div className="rab-card-icon blue">
                  <Users size={16} />
                </div>
                <div>
                  <h3 className="rab-card-title">Manpower</h3>
                  <p className="rab-card-subtitle">Tenaga kerja dan durasi pengerjaan</p>
                </div>
              </div>

              <button 
                className="rab-btn-add-row" 
                onClick={() => setManpowerRows([...manpowerRows, { id: Date.now(), description: '', people: 1, days: 1 }])}
              >
                <Plus size={13} />
                <span>Tambah baris manpower</span>
              </button>
            </div>

            {manpowerRows.map((row, idx) => {
              const { people, days, dailyRate, subtotal } = getManpowerRowCalc(row);

              return (
                <div key={row.id} className="rab-item-row-box">
                  <div className="row-inline-grid">
                    <div className="form-group flex-grow-2">
                      <label className="form-label">DESKRIPSI / POSISI</label>
                      <input 
                        type="text" 
                        value={row.description} 
                        placeholder="mis. Default Manpower / Operator"
                        onChange={(e) => {
                          const updated = [...manpowerRows];
                          updated[idx].description = e.target.value;
                          setManpowerRows(updated);
                        }}
                        className="form-input" 
                      />
                    </div>

                    <div className="form-group flex-sm">
                      <label className="form-label">ORANG</label>
                      <input 
                        type="number" 
                        min="1"
                        placeholder="mis. 5"
                        value={row.people} 
                        onChange={(e) => {
                          const updated = [...manpowerRows];
                          updated[idx].people = Number(e.target.value) || 0;
                          setManpowerRows(updated);
                        }}
                        className="form-input" 
                      />
                    </div>

                    <div className="form-group flex-sm">
                      <label className="form-label">HARI</label>
                      <input 
                        type="number" 
                        min="1"
                        placeholder="mis. 1"
                        value={row.days} 
                        onChange={(e) => {
                          const updated = [...manpowerRows];
                          updated[idx].days = Number(e.target.value) || 0;
                          setManpowerRows(updated);
                        }}
                        className="form-input" 
                      />
                    </div>

                    <div className="form-group-action">
                      <button 
                        className="row-delete-btn-inline" 
                        onClick={() => setManpowerRows(manpowerRows.filter(r => r.id !== row.id))}
                        title="Hapus baris"
                      >
                        <Trash2 size={13} />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>

                  <div className="row-calc-preview">
                    <span>{people} orang × {days} hari × Rp {formatNumber(dailyRate)} = <strong>{formatRupiah(subtotal)}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Section 5: Biaya Tambahan (Gambar 5) */}
          <div className="rab-card additional-card">
            <div className="rab-card-header">
              <div className="rab-card-title-group">
                <div className="rab-card-icon blue">
                  <Package size={16} />
                </div>
                <div>
                  <h3 className="rab-card-title">Biaya Tambahan</h3>
                  <p className="rab-card-subtitle">Packing, ongkos kirim, dan biaya tambahan lainnya</p>
                </div>
              </div>

              <button 
                className="rab-btn-add-row" 
                onClick={() => setAdditionalRows([...additionalRows, { id: Date.now(), description: 'Packing', nominal: 10000, quantity: 1, notes: '' }])}
              >
                <Plus size={13} />
                <span>Tambah baris tambahan</span>
              </button>
            </div>

            {additionalRows.map((row, idx) => {
              const { nominal, qty, subtotal } = getAdditionalRowCalc(row);

              return (
                <div key={row.id} className="rab-item-row-box">
                  <div className="row-inline-grid">
                    <div className="form-group flex-grow-2">
                      <label className="form-label">DESKRIPSI BIAYA</label>
                      <select 
                        value={row.description} 
                        onChange={(e) => {
                          const item = ADDITIONAL_COSTS_CATALOG.find(a => a.name === e.target.value);
                          const updated = [...additionalRows];
                          updated[idx].description = e.target.value;
                          if (item && item.defaultPrice) {
                            updated[idx].nominal = item.defaultPrice;
                          }
                          setAdditionalRows(updated);
                        }}
                        className="form-input"
                      >
                        {ADDITIONAL_COSTS_CATALOG.map((a) => (
                          <option key={a.id} value={a.name}>{a.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">NOMINAL (RP)</label>
                      <input 
                        type="number" 
                        value={row.nominal} 
                        onChange={(e) => {
                          const updated = [...additionalRows];
                          updated[idx].nominal = Number(e.target.value) || 0;
                          setAdditionalRows(updated);
                        }}
                        className="form-input" 
                      />
                    </div>

                    <div className="form-group flex-sm">
                      <label className="form-label">KUANTITI</label>
                      <input 
                        type="number" 
                        min="1"
                        value={row.quantity} 
                        onChange={(e) => {
                          const updated = [...additionalRows];
                          updated[idx].quantity = Number(e.target.value) || 0;
                          setAdditionalRows(updated);
                        }}
                        className="form-input" 
                      />
                    </div>

                    <div className="form-group-action">
                      <button 
                        className="row-delete-btn-inline" 
                        onClick={() => setAdditionalRows(additionalRows.filter(r => r.id !== row.id))}
                        title="Hapus baris"
                      >
                        <Trash2 size={13} />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '6px' }}>
                    <label className="form-label">CATATAN</label>
                    <input 
                      type="text" 
                      value={row.notes || ''} 
                      placeholder="Catatan tambahan (opsional)"
                      onChange={(e) => {
                        const updated = [...additionalRows];
                        updated[idx].notes = e.target.value;
                        setAdditionalRows(updated);
                      }}
                      className="form-input" 
                    />
                  </div>

                  <div className="row-calc-preview">
                    <span>Rp {formatNumber(nominal)} × {qty || 0} = <strong>{formatRupiah(subtotal)}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Sticky Summary Sidebar */}
        <div className="rab-summary-sidebar">
          <div className="rab-summary-sticky-card">
            <div className="summary-header">
              <div className="summary-icon-title">
                <Layers2 size={16} color="#3B82F6" />
                <span className="summary-mini-tag">TOTAL</span>
              </div>
              <h4 className="summary-title">Keseluruhan</h4>
            </div>

            <div className="summary-big-price">
              {formatRupiah(grandTotal)}
            </div>

            <div className="summary-breakdown-list">
              <div className="breakdown-item">
                <div className="breakdown-item-label">
                  <Printer size={13} color="#64748B" />
                  <span>Print</span>
                </div>
                <span className="breakdown-item-count">{printRows.length}</span>
              </div>

              <div className="breakdown-item">
                <div className="breakdown-item-label">
                  <Sparkles size={13} color="#64748B" />
                  <span>Digital Finishing</span>
                </div>
                <span className="breakdown-item-count">{digitalRows.length}</span>
              </div>

              <div className="breakdown-item">
                <div className="breakdown-item-label">
                  <Layers size={13} color="#64748B" />
                  <span>Manual Finishing</span>
                </div>
                <span className="breakdown-item-count">{manualRows.length}</span>
              </div>

              <div className="breakdown-item">
                <div className="breakdown-item-label">
                  <Users size={13} color="#64748B" />
                  <span>Manpower</span>
                </div>
                <span className="breakdown-item-count">{manpowerRows.length}</span>
              </div>

              <div className="breakdown-item">
                <div className="breakdown-item-label">
                  <Package size={13} color="#64748B" />
                  <span>Biaya Tambahan</span>
                </div>
                <span className="breakdown-item-count">{additionalRows.length}</span>
              </div>
            </div>

            <div className="summary-subtotals-section">
              <div className="subtotal-line">
                <span>Print</span>
                <span>{formatRupiah(printTotal)}</span>
              </div>
              <div className="subtotal-line">
                <span>Digital</span>
                <span>{formatRupiah(digitalTotal)}</span>
              </div>
              <div className="subtotal-line">
                <span>Manual</span>
                <span>{formatRupiah(manualTotal)}</span>
              </div>
              <div className="subtotal-line">
                <span>Manpower</span>
                <span>{formatRupiah(manpowerTotal)}</span>
              </div>
              <div className="subtotal-line">
                <span>Additional</span>
                <span>{formatRupiah(additionalTotal)}</span>
              </div>
            </div>

            <div className="summary-time-estimate">
              <Clock size={13} />
              <span>Waktu pengerjaan ~1-2 hari kerja</span>
            </div>

            <div className="summary-action-buttons">
              <button className="summary-btn-draft" onClick={() => handleSave('Draf')}>
                <Save size={14} />
                <span>Simpan Draf</span>
              </button>
              <button className="summary-btn-submit" onClick={() => handleSave('Estimasi Final')}>
                <Send size={14} />
                <span>Simpan Estimasi</span>
              </button>
              <button className="summary-btn-cancel" onClick={onBack}>
                Batal
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
