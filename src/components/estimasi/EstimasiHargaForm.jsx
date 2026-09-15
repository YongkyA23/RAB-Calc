import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Plus, 
  Trash2, 
  FileText, 
  Printer, 
  Sparkles, 
  Layers, 
  Package, 
  Clock, 
  Layers2
} from 'lucide-react';

export default function EstimasiHargaForm({ onBack }) {
  // Form State
  const [basicInfo, setBasicInfo] = useState({
    noJob: 'HKU_105_2026',
    sku: '',
    client: '',
    project: '',
    aeName: 'Jason Gavin wijaya',
    quantity: '10',
    unitPrice: '',
  });

  // Print Rows
  const [printRows, setPrintRows] = useState([
    {
      id: 1,
      material: 'Art Carton 210 - 260 gsm',
      quantity: 1,
      size: 'A3 (29.7×42 cm)',
      unitPrice: 25000,
    }
  ]);

  // Digital Finishing Rows
  const [digitalRows, setDigitalRows] = useState([
    {
      id: 1,
      serviceType: 'Laminasi Doff 1 Muka',
      unitPrice: 5000,
      size: 'A3',
      quantity: 1,
    }
  ]);

  // Manual Finishing Rows
  const [manualRows, setManualRows] = useState([
    {
      id: 1,
      workType: 'Pond & Lem Lipat Dus',
      quantityPcs: 1,
      cost: 15000,
    }
  ]);

  // Manpower Rows
  const [manpowerRows, setManpowerRows] = useState([
    {
      id: 1,
      costDescription: 'Packing Bubble & Dus',
      price: 10000,
      quantity: 1,
    }
  ]);

  // Biaya Tambahan Rows
  const [additionalRows, setAdditionalRows] = useState([
    {
      id: 1,
      costDescription: 'Packing Bubble & Dus',
      price: 10000,
      quantity: 1,
    }
  ]);

  // Calculations
  const printTotal = printRows.reduce((sum, r) => sum + (Number(r.quantity) || 0) * (Number(r.unitPrice) || 0), 0);
  const digitalTotal = digitalRows.reduce((sum, r) => sum + (Number(r.quantity) || 0) * (Number(r.unitPrice) || 0), 0);
  const manualTotal = manualRows.reduce((sum, r) => sum + (Number(r.quantityPcs) || 0) * (Number(r.cost) || 0), 0);
  const manpowerTotal = manpowerRows.reduce((sum, r) => sum + (Number(r.quantity) || 0) * (Number(r.price) || 0), 0);
  const additionalTotal = additionalRows.reduce((sum, r) => sum + (Number(r.quantity) || 0) * (Number(r.price) || 0), 0);

  const grandTotal = printTotal + digitalTotal + manualTotal + manpowerTotal + additionalTotal;

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
  };

  const handleSave = (status) => {
    alert(`Estimasi Harga berhasil disimpan sebagai ${status}!`);
    onBack();
  };

  return (
    <div className="rab-form-screen">
      {/* Top Header Actions Bar */}
      <div className="rab-form-header">
        <div className="rab-form-header-left">
          <button className="rab-back-btn" onClick={onBack} title="Kembali ke Daftar">
            <ArrowLeft size={18} />
          </button>
          <h2 className="rab-form-page-title">Formulir Estimasi Harga (RAB)</h2>
        </div>

        <div className="rab-form-header-actions">
          <button className="rab-btn-cancel" onClick={onBack}>
            Batal
          </button>
          <button className="rab-btn-draft" onClick={() => handleSave('Draf')}>
            <Save size={14} />
            <span>Simpan Draf</span>
          </button>
          <button className="rab-btn-primary" onClick={() => handleSave('Estimasi Final')}>
            <Send size={14} />
            <span>Buat Estimasi</span>
          </button>
        </div>
      </div>

      {/* Main Form Layout: 2 Columns on Left + Sticky Summary Card on Right */}
      <div className="rab-form-body-grid">
        
        {/* Left 2-Column Cards Grid */}
        <div className="rab-form-sections-grid">
          
          {/* Card 1: Informasi Dasar Pekerjaan */}
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
                />
              </div>

              <div className="form-group col-span-1">
                <label className="form-label">SKU</label>
                <input 
                  type="text" 
                  placeholder="Contoh: BOX-VEET-001" 
                  value={basicInfo.sku}
                  onChange={(e) => setBasicInfo({...basicInfo, sku: e.target.value})}
                  className="form-input" 
                />
              </div>

              <div className="form-group col-span-1">
                <label className="form-label">Klien</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Reckitt, Danone, Nestle" 
                  value={basicInfo.client}
                  onChange={(e) => setBasicInfo({...basicInfo, client: e.target.value})}
                  className="form-input" 
                />
              </div>

              <div className="form-group col-span-1">
                <label className="form-label">Proyek</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Veet Mockup Veet Men" 
                  value={basicInfo.project}
                  onChange={(e) => setBasicInfo({...basicInfo, project: e.target.value})}
                  className="form-input" 
                />
              </div>

              <div className="form-group col-span-1">
                <label className="form-label">Nama AE</label>
                <input 
                  type="text" 
                  value={basicInfo.aeName} 
                  onChange={(e) => setBasicInfo({...basicInfo, aeName: e.target.value})}
                  className="form-input" 
                />
              </div>

              <div className="form-group col-span-1 form-row-split">
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

          {/* Card 2: Print */}
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
                onClick={() => setPrintRows([...printRows, { id: Date.now(), material: '', quantity: 1, size: 'A3', unitPrice: 0 }])}
              >
                <Plus size={13} />
                <span>Tambah baris print</span>
              </button>
            </div>

            {printRows.map((row, idx) => (
              <div key={row.id} className="rab-item-row-box">
                <div className="row-box-top">
                  <button 
                    className="row-delete-btn" 
                    onClick={() => setPrintRows(printRows.filter(r => r.id !== row.id))}
                    title="Hapus baris"
                  >
                    <Trash2 size={13} />
                    <span>Hapus</span>
                  </button>
                </div>

                <div className="row-box-grid">
                  <div className="form-group">
                    <label className="form-label">MATERIAL</label>
                    <input 
                      type="text" 
                      value={row.material} 
                      onChange={(e) => {
                        const updated = [...printRows];
                        updated[idx].material = e.target.value;
                        setPrintRows(updated);
                      }}
                      className="form-input" 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">JUMLAH</label>
                    <input 
                      type="number" 
                      value={row.quantity} 
                      onChange={(e) => {
                        const updated = [...printRows];
                        updated[idx].quantity = Number(e.target.value) || 0;
                        setPrintRows(updated);
                      }}
                      className="form-input" 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">UKURAN</label>
                    <input 
                      type="text" 
                      value={row.size} 
                      onChange={(e) => {
                        const updated = [...printRows];
                        updated[idx].size = e.target.value;
                        setPrintRows(updated);
                      }}
                      className="form-input" 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">HARGA UNIT (RP)</label>
                    <input 
                      type="number" 
                      value={row.unitPrice} 
                      onChange={(e) => {
                        const updated = [...printRows];
                        updated[idx].unitPrice = Number(e.target.value) || 0;
                        setPrintRows(updated);
                      }}
                      className="form-input" 
                    />
                  </div>
                </div>

                <div className="row-subtotal-footer">
                  <span>Subtotal Baris: </span>
                  <span className="subtotal-bold">{formatRupiah(row.quantity * row.unitPrice)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Card 3: Digital Finishing */}
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
                onClick={() => setDigitalRows([...digitalRows, { id: Date.now(), serviceType: '', unitPrice: 0, size: 'A3', quantity: 1 }])}
              >
                <Plus size={13} />
                <span>Tambah baris digital</span>
              </button>
            </div>

            {digitalRows.map((row, idx) => (
              <div key={row.id} className="rab-item-row-box">
                <div className="row-box-top">
                  <button 
                    className="row-delete-btn" 
                    onClick={() => setDigitalRows(digitalRows.filter(r => r.id !== row.id))}
                  >
                    <Trash2 size={13} />
                    <span>Hapus</span>
                  </button>
                </div>

                <div className="row-box-grid">
                  <div className="form-group">
                    <label className="form-label">JENIS LAYANAN</label>
                    <input 
                      type="text" 
                      value={row.serviceType} 
                      onChange={(e) => {
                        const updated = [...digitalRows];
                        updated[idx].serviceType = e.target.value;
                        setDigitalRows(updated);
                      }}
                      className="form-input" 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">HARGA UNIT (RP)</label>
                    <input 
                      type="number" 
                      value={row.unitPrice} 
                      onChange={(e) => {
                        const updated = [...digitalRows];
                        updated[idx].unitPrice = Number(e.target.value) || 0;
                        setDigitalRows(updated);
                      }}
                      className="form-input" 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">UKURAN</label>
                    <input 
                      type="text" 
                      value={row.size} 
                      onChange={(e) => {
                        const updated = [...digitalRows];
                        updated[idx].size = e.target.value;
                        setDigitalRows(updated);
                      }}
                      className="form-input" 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">JUMLAH</label>
                    <input 
                      type="number" 
                      value={row.quantity} 
                      onChange={(e) => {
                        const updated = [...digitalRows];
                        updated[idx].quantity = Number(e.target.value) || 0;
                        setDigitalRows(updated);
                      }}
                      className="form-input" 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Card 4: Manual Finishing */}
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
                onClick={() => setManualRows([...manualRows, { id: Date.now(), workType: '', quantityPcs: 1, cost: 0 }])}
              >
                <Plus size={13} />
                <span>Tambah baris manual</span>
              </button>
            </div>

            {manualRows.map((row, idx) => (
              <div key={row.id} className="rab-item-row-box">
                <div className="row-box-top">
                  <button 
                    className="row-delete-btn" 
                    onClick={() => setManualRows(manualRows.filter(r => r.id !== row.id))}
                  >
                    <Trash2 size={13} />
                    <span>Hapus</span>
                  </button>
                </div>

                <div className="row-box-grid">
                  <div className="form-group col-span-2">
                    <label className="form-label">JENIS PENGERJAAN</label>
                    <input 
                      type="text" 
                      value={row.workType} 
                      onChange={(e) => {
                        const updated = [...manualRows];
                        updated[idx].workType = e.target.value;
                        setManualRows(updated);
                      }}
                      className="form-input" 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">JUMLAH PCS</label>
                    <input 
                      type="number" 
                      value={row.quantityPcs} 
                      onChange={(e) => {
                        const updated = [...manualRows];
                        updated[idx].quantityPcs = Number(e.target.value) || 0;
                        setManualRows(updated);
                      }}
                      className="form-input" 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">BIAYA (RP)</label>
                    <input 
                      type="number" 
                      value={row.cost} 
                      onChange={(e) => {
                        const updated = [...manualRows];
                        updated[idx].cost = Number(e.target.value) || 0;
                        setManualRows(updated);
                      }}
                      className="form-input" 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Card 5: Manpower */}
          <div className="rab-card manpower-card">
            <div className="rab-card-header">
              <div className="rab-card-title-group">
                <div className="rab-card-icon blue">
                  <Package size={16} />
                </div>
                <div>
                  <h3 className="rab-card-title">Manpower</h3>
                  <p className="rab-card-subtitle">Packing, ongkos kirim, dan biaya tambahan lainnya</p>
                </div>
              </div>

              <button 
                className="rab-btn-add-row"
                onClick={() => setManpowerRows([...manpowerRows, { id: Date.now(), costDescription: '', price: 0, quantity: 1 }])}
              >
                <Plus size={13} />
                <span>Tambah baris additional</span>
              </button>
            </div>

            {manpowerRows.map((row, idx) => (
              <div key={row.id} className="rab-item-row-box">
                <div className="row-box-top">
                  <button 
                    className="row-delete-btn" 
                    onClick={() => setManpowerRows(manpowerRows.filter(r => r.id !== row.id))}
                  >
                    <Trash2 size={13} />
                    <span>Hapus</span>
                  </button>
                </div>

                <div className="row-box-grid">
                  <div className="form-group col-span-2">
                    <label className="form-label">DESKRIPSI BIAYA</label>
                    <input 
                      type="text" 
                      value={row.costDescription} 
                      onChange={(e) => {
                        const updated = [...manpowerRows];
                        updated[idx].costDescription = e.target.value;
                        setManpowerRows(updated);
                      }}
                      className="form-input" 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">HARGA (RP)</label>
                    <input 
                      type="number" 
                      value={row.price} 
                      onChange={(e) => {
                        const updated = [...manpowerRows];
                        updated[idx].price = Number(e.target.value) || 0;
                        setManpowerRows(updated);
                      }}
                      className="form-input" 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">KUANTITAS</label>
                    <input 
                      type="number" 
                      value={row.quantity} 
                      onChange={(e) => {
                        const updated = [...manpowerRows];
                        updated[idx].quantity = Number(e.target.value) || 0;
                        setManpowerRows(updated);
                      }}
                      className="form-input" 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Card 6: Biaya Tambahan */}
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
                onClick={() => setAdditionalRows([...additionalRows, { id: Date.now(), costDescription: '', price: 0, quantity: 1 }])}
              >
                <Plus size={13} />
                <span>Tambah baris additional</span>
              </button>
            </div>

            {additionalRows.map((row, idx) => (
              <div key={row.id} className="rab-item-row-box">
                <div className="row-box-top">
                  <button 
                    className="row-delete-btn" 
                    onClick={() => setAdditionalRows(additionalRows.filter(r => r.id !== row.id))}
                  >
                    <Trash2 size={13} />
                    <span>Hapus</span>
                  </button>
                </div>

                <div className="row-box-grid">
                  <div className="form-group col-span-2">
                    <label className="form-label">DESKRIPSI BIAYA</label>
                    <input 
                      type="text" 
                      value={row.costDescription} 
                      onChange={(e) => {
                        const updated = [...additionalRows];
                        updated[idx].costDescription = e.target.value;
                        setAdditionalRows(updated);
                      }}
                      className="form-input" 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">HARGA (RP)</label>
                    <input 
                      type="number" 
                      value={row.price} 
                      onChange={(e) => {
                        const updated = [...additionalRows];
                        updated[idx].price = Number(e.target.value) || 0;
                        setAdditionalRows(updated);
                      }}
                      className="form-input" 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">KUANTITAS</label>
                    <input 
                      type="number" 
                      value={row.quantity} 
                      onChange={(e) => {
                        const updated = [...additionalRows];
                        updated[idx].quantity = Number(e.target.value) || 0;
                        setAdditionalRows(updated);
                      }}
                      className="form-input" 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Sticky Summary Card */}
        <div className="rab-summary-sidebar">
          <div className="rab-summary-sticky-card">
            <div className="summary-header">
              <div className="summary-icon-title">
                <Layers2 size={18} className="text-blue-500" />
                <div>
                  <span className="summary-mini-tag">TOTAL</span>
                  <h4 className="summary-title">Keseluruhan</h4>
                </div>
              </div>
            </div>

            <div className="summary-grand-amount">
              {formatRupiah(grandTotal)}
            </div>

            {/* Category breakdown rows with count */}
            <div className="summary-categories-list">
              <div className="summary-cat-item">
                <div className="cat-left">
                  <Printer size={15} className="cat-icon" />
                  <span>Print</span>
                </div>
                <span className="cat-count">{printRows.length}</span>
              </div>

              <div className="summary-cat-item">
                <div className="cat-left">
                  <Sparkles size={15} className="cat-icon" />
                  <span>Digital</span>
                </div>
                <span className="cat-count">{digitalRows.length}</span>
              </div>

              <div className="summary-cat-item">
                <div className="cat-left">
                  <Layers size={15} className="cat-icon" />
                  <span>Manual</span>
                </div>
                <span className="cat-count">{manualRows.length}</span>
              </div>

              <div className="summary-cat-item">
                <div className="cat-left">
                  <Package size={15} className="cat-icon" />
                  <span>Additional</span>
                </div>
                <span className="cat-count">{manpowerRows.length + additionalRows.length}</span>
              </div>
            </div>

            {/* Subtotal amounts */}
            <div className="summary-subtotals-section">
              <div className="subtotal-row">
                <span>Print</span>
                <span>{formatRupiah(printTotal)}</span>
              </div>
              <div className="subtotal-row">
                <span>Digital</span>
                <span>{formatRupiah(digitalTotal)}</span>
              </div>
              <div className="subtotal-row">
                <span>Manual</span>
                <span>{formatRupiah(manualTotal)}</span>
              </div>
              <div className="subtotal-row">
                <span>Additional</span>
                <span>{formatRupiah(manpowerTotal + additionalTotal)}</span>
              </div>
            </div>

            {/* Working timeline estimated */}
            <div className="summary-timeline-box">
              <Clock size={15} className="timeline-icon" />
              <span>Waktu pengerjaan ~1-2 hari kerja</span>
            </div>

            {/* Bottom Actions */}
            <div className="summary-actions-group">
              <button className="summary-btn-draft" onClick={() => handleSave('Draf')}>
                <Save size={15} />
                <span>Simpan Draf</span>
              </button>
              <button className="summary-btn-save" onClick={() => handleSave('Estimasi Final')}>
                <Send size={15} />
                <span>Simpan Estimasi</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
