import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Plus, 
  Trash2, 
  FileText, 
  UploadCloud, 
  Package, 
  Save 
} from 'lucide-react';

export default function EstimasiVendorForm({ onBack }) {
  // Vendor Info State
  const [vendorData, setVendorData] = useState({
    jobName: '',
    vendorName: '',
    noJob: '',
    aeName: '',
    quantity: 0,
    unitPrice: 0,
    fileName: '',
  });

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
  const baseVendorTotal = (Number(vendorData.quantity) || 0) * (Number(vendorData.unitPrice) || 0);
  const manpowerTotal = manpowerRows.reduce((sum, r) => sum + (Number(r.quantity) || 0) * (Number(r.price) || 0), 0);
  const additionalTotal = additionalRows.reduce((sum, r) => sum + (Number(r.quantity) || 0) * (Number(r.price) || 0), 0);
  const grandTotal = baseVendorTotal + manpowerTotal + additionalTotal;

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVendorData({ ...vendorData, fileName: file.name });
    }
  };

  const handleSave = () => {
    alert(`Estimasi Vendor berhasil disimpan!`);
    onBack();
  };

  return (
    <div className="rab-form-screen vendor-form-screen">
      {/* Top Header Actions Bar */}
      <div className="rab-form-header">
        <div className="rab-form-header-left">
          <button className="rab-back-btn" onClick={onBack} title="Kembali ke Daftar">
            <ArrowLeft size={18} />
          </button>
          <h2 className="rab-form-page-title">Tambah Estimasi Vendor</h2>
        </div>

        <div className="rab-form-header-actions">
          <button className="rab-btn-cancel" onClick={onBack}>
            Batal
          </button>
          <button className="rab-btn-primary" onClick={handleSave}>
            <Send size={14} />
            <span>Simpan Estimasi</span>
          </button>
        </div>
      </div>

      {/* Main Vendor Form Content */}
      <div className="vendor-form-content-wrapper">
        
        {/* Card 1: Create Vendor Estimate */}
        <div className="rab-card create-vendor-card">
          <div className="rab-card-header">
            <div className="rab-card-title-group">
              <div className="rab-card-icon blue">
                <FileText size={16} />
              </div>
              <div>
                <h3 className="rab-card-title">Create Vendor Estimate</h3>
              </div>
            </div>
          </div>

          <div className="vendor-main-form-grid">
            <div className="form-group">
              <label className="form-label">Nama Job</label>
              <input 
                type="text" 
                placeholder="Contoh: Decolgen Family"
                value={vendorData.jobName}
                onChange={(e) => setVendorData({...vendorData, jobName: e.target.value})}
                className="form-input" 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nama Vendor</label>
              <input 
                type="text" 
                placeholder="Contoh: DCM"
                value={vendorData.vendorName}
                onChange={(e) => setVendorData({...vendorData, vendorName: e.target.value})}
                className="form-input" 
              />
            </div>

            <div className="form-group">
              <label className="form-label">No Job</label>
              <input 
                type="text" 
                placeholder="Contoh: HKU_104_2026"
                value={vendorData.noJob}
                onChange={(e) => setVendorData({...vendorData, noJob: e.target.value})}
                className="form-input" 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nama AE</label>
              <input 
                type="text" 
                placeholder="Contoh: Jason Gavin"
                value={vendorData.aeName}
                onChange={(e) => setVendorData({...vendorData, aeName: e.target.value})}
                className="form-input" 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Kuantiti</label>
              <input 
                type="number" 
                value={vendorData.quantity}
                onChange={(e) => setVendorData({...vendorData, quantity: Number(e.target.value) || 0})}
                className="form-input" 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Harga Satuan (Rp)</label>
              <input 
                type="number" 
                value={vendorData.unitPrice}
                onChange={(e) => setVendorData({...vendorData, unitPrice: Number(e.target.value) || 0})}
                className="form-input" 
              />
            </div>

            {/* Total Harga */}
            <div className="form-group col-span-2">
              <label className="form-label">Total Harga</label>
              <div className="vendor-calculated-total-box">
                <span className="calculated-amount-text">
                  {formatRupiah(grandTotal)}
                </span>
              </div>
            </div>

            {/* Lampiran */}
            <div className="form-group col-span-2">
              <label className="form-label">Lampiran (PDF atau gambar)</label>
              <div className="vendor-upload-dropzone">
                <input 
                  type="file" 
                  id="vendor-file-input"
                  onChange={handleFileUpload}
                  className="hidden-file-input" 
                  accept=".pdf,image/*"
                />
                <label htmlFor="vendor-file-input" className="vendor-file-upload-btn">
                  <UploadCloud size={16} />
                  <span>{vendorData.fileName ? `File: ${vendorData.fileName}` : 'Pilih file'}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Lower Row: Manpower & Biaya Tambahan */}
        <div className="vendor-lower-sections-grid">
          
          {/* Card 2: Manpower */}
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

          {/* Card 3: Biaya Tambahan */}
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

        {/* Bottom Actions Bar */}
        <div className="vendor-form-bottom-actions">
          <button className="rab-btn-primary" onClick={handleSave}>
            <Save size={15} />
            <span>Simpan Estimasi Vendor</span>
          </button>
          <button className="rab-btn-cancel" onClick={onBack}>
            Batal
          </button>
        </div>

      </div>
    </div>
  );
}
