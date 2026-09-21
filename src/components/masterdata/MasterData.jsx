import React, { useState } from 'react';
import { Layers, Edit3, Trash2, Clock } from 'lucide-react';

const INITIAL_MASTER_CATEGORIES = [
  { id: 'operational', name: 'Operational Costs', count: 9 },
  { id: 'digital-finishing', name: 'Digital Finishing', count: 6 },
  { id: 'manpower', name: 'Manpower', count: 1 },
  { id: 'manual-finishing', name: 'Manual Finishing', count: 7 },
  { id: 'print-materials', name: 'Print Materials', count: 8 },
];

const INITIAL_MASTER_ITEMS = {
  operational: [
    { id: 'op-1', name: 'Packing', tariff: 'Nominal saat estimasi', days: '0 hari', active: true },
    { id: 'op-2', name: 'In-house Finishing', tariff: 'Nominal saat estimasi', days: '0 hari', active: true },
    { id: 'op-3', name: 'Metalize Material', tariff: 'Rp 10/cm', days: '0 hari', active: true },
    { id: 'op-4', name: 'Mockup Operations', tariff: 'Nominal saat estimasi', days: '0 hari', active: true },
    { id: 'op-5', name: 'Operator Fee', tariff: 'Nominal saat estimasi', days: '0 hari', active: true },
    { id: 'op-6', name: 'Over Time', tariff: 'Nominal saat estimasi', days: '0 hari', active: true },
    { id: 'op-7', name: 'Paper Purchase', tariff: 'Rp 5.000/sheet', days: '0 hari', active: true },
    { id: 'op-8', name: 'Product Purchase', tariff: 'Nominal saat estimasi', days: '0 hari', active: true },
    { id: 'op-9', name: 'Rush Job', tariff: 'Nominal saat estimasi', days: '0 hari', active: true },
  ],
  'digital-finishing': [
    { id: 'df-1', name: 'Cutting Otomatis (Zund, Graphtec)', tariff: 'A3: 1–10 Rp 15.000, >10 Rp 15.000 · B2: 1–10 Rp 40.000, >10 Rp 40.000', days: '2 hari', active: true },
    { id: 'df-2', name: 'Emboss Digital', tariff: 'A3: 1–10 Rp 20.000, >10 Rp 20.000 · B2: 1–10 Rp 40.000, >10 Rp 40.000', days: '2 hari', active: true },
    { id: 'df-3', name: 'Foil Hot Stamp Effect Rainbow', tariff: 'A3: 1–10 Rp 30.000, >10 Rp 30.000', days: '2 hari', active: true },
    { id: 'df-4', name: 'Foil Hot Stamp (standard color)', tariff: 'A3: 1–10 Rp 20.000, >10 Rp 20.000', days: '2 hari', active: true },
    { id: 'df-5', name: 'Laminating Glossy/Matte', tariff: 'A3: 1–10 Rp 10.000, >10 Rp 10.000 · B2: 1–10 Rp 15.000, >10 Rp 15.000', days: '1 hari', active: true },
    { id: 'df-6', name: 'Spot UV Digital', tariff: 'A3: 1–10 Rp 20.000, >10 Rp 20.000', days: '2 hari', active: true },
  ],
  manpower: [
    { id: 'mp-1', name: 'Default Manpower', tariff: 'Rp 275.000/hari', days: '0 hari', active: true },
  ],
  'manual-finishing': [
    { id: 'mf-1', name: 'WB Varnish', tariff: 'Tenaga Rp 0,75/cm² · Min. Rp 600.000', days: '2 hari', active: true },
    { id: 'mf-2', name: 'Die Cut Manual', tariff: 'Alat Rp 3.500/cm² · Tenaga Rp 15/cm² · Min. Rp 250.000', days: '3 hari', active: true },
    { id: 'mf-3', name: 'Emboss', tariff: 'Alat Rp 2.500/cm² · Tenaga Rp 25/cm² · Min. Rp 250.000', days: '3 hari', active: true },
    { id: 'mf-4', name: 'Spot UV', tariff: 'Tenaga Rp 0,75/cm² · Min. Rp 650.000', days: '2 hari', active: true },
    { id: 'mf-5', name: 'UV Varnish Glossy', tariff: 'Tenaga Rp 0,75/cm² · Min. Rp 600.000', days: '2 hari', active: true },
    { id: 'mf-6', name: 'UV Varnish Matte', tariff: 'Tenaga Rp 0,75/cm²', days: '2 hari', active: true },
    { id: 'mf-7', name: 'Spot UV / Varnish Effect', tariff: 'Tenaga Rp 0,75/cm²', days: '2 hari', active: true },
  ],
  'print-materials': [
    { id: 'pm-1', name: 'Kertas Fancy', tariff: 'A3: 1–10 Rp 30.000, >10 Rp 40.000 · B2: 1–10 Rp 40.000, >10 Rp 50.000', days: '1 hari', active: true },
    { id: 'pm-2', name: 'Art Carton 210–260 gsm', tariff: 'A3: 1–10 Rp 25.000, >10 Rp 20.000 · B2: 1–10 Rp 35.000, >10 Rp 30.000', days: '1 hari', active: true },
    { id: 'pm-3', name: 'Art Paper / Matte 120–150 gsm', tariff: 'A3: 1–10 Rp 25.000, >10 Rp 20.000 · B2: 1–10 Rp 35.000, >10 Rp 30.000', days: '1 hari', active: true },
    { id: 'pm-4', name: 'Duplex 270–350 gsm', tariff: 'A3: 1–10 Rp 30.000, >10 Rp 25.000 · B2: 1–10 Rp 40.000, >10 Rp 35.000', days: '1 hari', active: true },
    { id: 'pm-5', name: 'HVS 80–100 gsm', tariff: 'A3: 1–10 Rp 20.000, >10 Rp 20.000 · B2: 1–10 Rp 30.000, >10 Rp 30.000', days: '1 hari', active: true },
    { id: 'pm-6', name: 'Stiker Metalized + White Ink', tariff: 'A3: 1–10 Rp 40.000, >10 Rp 40.000', days: '2 hari', active: true },
    { id: 'pm-7', name: 'Stiker Transparant + White Ink', tariff: 'A3: 1–10 Rp 35.000, >10 Rp 35.000', days: '2 hari', active: true },
    { id: 'pm-8', name: 'Stiker Vinyl', tariff: 'A3: 1–10 Rp 25.000, >10 Rp 22.500', days: '2 hari', active: true },
  ],
};

const INITIAL_AUDITS = [
  { 
    id: 1, 
    type: 'UPDATE', 
    target: 'print-74ac', 
    user: 'anandarafilfari...', 
    time: '2 menit lalu',
    fields: 'id, categoryId, name, prices, toolingRate, laborRate, minimumCharge, dailyRate'
  },
  { 
    id: 2, 
    type: 'CREATE', 
    target: 'print-74ac', 
    user: 'anandarafilfari...', 
    time: '5 menit lalu',
    fields: 'id, categoryId, additionalMode, unitLabel, rate, active, updatedAt, lastEditedBy'
  },
  { 
    id: 3, 
    type: 'UPDATE', 
    target: 'digital-cutting', 
    user: 'hendrom.lif...', 
    time: '12 menit lalu',
    fields: 'id, categoryId, name, prices, toolingRate, laborRate, minimumCharge, dailyRate, turnaroundDays, a3Only, additionalMode, unitLabel, rate, active, updatedAt, lastEditedBy'
  },
  { 
    id: 4, 
    type: 'UPDATE', 
    target: 'digital-emboss', 
    user: 'hendrom.l...', 
    time: '18 menit lalu',
    fields: 'id, categoryId, name, prices, toolingRate, laborRate, additionalMode, unitLabel, rate, active, updatedAt, lastEditedBy'
  },
  { 
    id: 5, 
    type: 'CREATE', 
    target: 'additional-4889542', 
    user: 'hend...', 
    time: '25 menit lalu',
    fields: 'turnaroundDays, a3Only, additionalMode, unitLabel, rate, active, updatedAt, lastEditedBy'
  },
  { 
    id: 6, 
    type: 'UPDATE', 
    target: 'print-a269462b', 
    user: 'noobsnoob...', 
    time: '1 jam lalu',
    fields: 'id, categoryId, name, prices, toolingRate, laborRate, minimumCharge, dailyRate, turnaroundDays, a3Only, additionalMode'
  },
  { 
    id: 7, 
    type: 'CREATE', 
    target: 'print-a269462b', 
    user: 'noobsnoob...', 
    time: '1 jam lalu',
    fields: 'id, a3Only, additionalMode, unitLabel, rate, active, updatedAt, lastEditedBy'
  },
  { 
    id: 8, 
    type: 'UPDATE', 
    target: 'digital-f3275ad9', 
    user: 'hendrom.lif...', 
    time: '2 jam lalu',
    fields: 'id, categoryId, name, prices, toolingRate, laborRate, minimumCharge, dailyRate'
  },
  { 
    id: 9, 
    type: 'CREATE', 
    target: 'digital-f3275ad9', 
    user: 'hendrom.lif...', 
    time: '2 jam lalu',
    fields: 'id, categoryId, additionalMode, unitLabel, rate, active, updatedAt, lastEditedBy'
  },
];

// Helper to format currency input string with dots and commas
const formatCurrencyValue = (val) => {
  if (!val && val !== 0) return '';
  const clean = String(val).replace(/[^0-9,.]/g, '');
  // If user entered decimal comma
  if (clean.includes(',')) {
    const parts = clean.split(',');
    const integerPart = parts[0].replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return integerPart ? `${integerPart},${parts.slice(1).join('').substring(0, 2)}` : `0,${parts.slice(1).join('').substring(0, 2)}`;
  }
  // Otherwise regular thousand dots
  const integerVal = clean.replace(/\D/g, '');
  if (!integerVal) return '';
  return integerVal.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export default function MasterData() {
  const [activeTab, setActiveTab] = useState('operational');
  const [itemsData, setItemsData] = useState(INITIAL_MASTER_ITEMS);
  const [audits, setAudits] = useState(INITIAL_AUDITS);

  // Form State
  const [itemName, setItemName] = useState('');
  const [calcMode, setCalcMode] = useState('Nominal manual');
  const [opRate, setOpRate] = useState('');
  const [days, setDays] = useState(0);

  // Price tier state for Digital Finishing & Print Materials
  const [priceTiers, setPriceTiers] = useState({
    A3: { p1: '15.000', p2: '15.000' },
    B2: { p1: '40.000', p2: '40.000' },
  });
  
  // Custom Format State
  const [customFormat, setCustomFormat] = useState({
    enabled: true,
    length: '100',
    width: '100',
    unit: 'per m²', // 'per m²' or 'per cm²'
    p1: '25.000',
    p2: '20.000',
  });

  const [onlyA3, setOnlyA3] = useState(false);

  // Manpower specific
  const [dailyRate, setDailyRate] = useState('275.000');
  const [people, setPeople] = useState(1);

  // Manual Finishing specific
  const [toolTariff, setToolTariff] = useState('');
  const [laborTariff, setLaborTariff] = useState('');
  const [minRule, setMinRule] = useState('Gunakan biaya minimum');
  const [minLaborCost, setMinLaborCost] = useState('');

  const currentCategory = INITIAL_MASTER_CATEGORIES.find((c) => c.id === activeTab);
  const currentItems = itemsData[activeTab] || [];

  const handlePriceTierChange = (size, field, val) => {
    const formatted = formatCurrencyValue(val);
    setPriceTiers((prev) => ({
      ...prev,
      [size]: {
        ...prev[size],
        [field]: formatted,
      },
    }));
  };

  const handleCustomFormatChange = (field, val) => {
    const isPrice = field === 'p1' || field === 'p2';
    setCustomFormat((prev) => ({
      ...prev,
      [field]: isPrice ? formatCurrencyValue(val) : val,
    }));
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!itemName.trim()) {
      alert('Mohon masukkan nama item');
      return;
    }

    let formattedTariff = 'Nominal saat estimasi';
    if (activeTab === 'operational') {
      if (calcMode === 'Nominal manual') {
        formattedTariff = 'Nominal saat estimasi';
      } else if (calcMode === 'Jumlah × tarif') {
        formattedTariff = opRate ? `Rp ${opRate}/unit` : 'Jumlah × tarif';
      } else if (calcMode === 'Panjang × lebar × tarif') {
        formattedTariff = opRate ? `Rp ${opRate}/cm²` : 'Panjang × lebar × tarif';
      } else if (calcMode === 'Persentase biaya produksi') {
        formattedTariff = opRate ? `${opRate}% dari total` : 'Persentase biaya produksi';
      } else {
        formattedTariff = calcMode;
      }
    } else if (activeTab === 'manpower') {
      const pCount = Number(people) || 1;
      formattedTariff = dailyRate 
        ? `Rp ${dailyRate}/hari · ${pCount} orang` 
        : `Rp 275.000/hari · ${pCount} orang`;
    } else if (activeTab === 'manual-finishing') {
      let parts = [];
      if (toolTariff) parts.push(`Alat Rp ${toolTariff}/cm²`);
      if (laborTariff) parts.push(`Tenaga Rp ${laborTariff}/cm²`);
      if (minLaborCost) parts.push(`Min. Rp ${minLaborCost}`);
      formattedTariff = parts.length > 0 ? parts.join(' · ') : 'Tenaga Rp 0,75/cm²';
    } else if (activeTab === 'digital-finishing' || activeTab === 'print-materials') {
      let parts = [];
      if (priceTiers.A3.p1 && priceTiers.A3.p1 !== '0') {
        parts.push(`A3: 1–10 Rp ${priceTiers.A3.p1}, >10 Rp ${priceTiers.A3.p2 || priceTiers.A3.p1}`);
      }
      if (!onlyA3 && priceTiers.B2.p1 && priceTiers.B2.p1 !== '0') {
        parts.push(`B2: 1–10 Rp ${priceTiers.B2.p1}, >10 Rp ${priceTiers.B2.p2 || priceTiers.B2.p1}`);
      }
      if (!onlyA3 && customFormat.enabled && (customFormat.p1 || customFormat.p2)) {
        const dimStr = customFormat.length && customFormat.width ? `${customFormat.length}×${customFormat.width} cm` : '';
        const unitStr = customFormat.unit;
        const p1Str = customFormat.p1 ? `1–10 Rp ${customFormat.p1}` : '';
        const p2Str = customFormat.p2 ? `>10 Rp ${customFormat.p2}` : '';
        const priceStr = [p1Str, p2Str].filter(Boolean).join(', ');
        parts.push(`Custom (${[dimStr, unitStr].filter(Boolean).join(' · ')}): ${priceStr}`);
      }
      formattedTariff = parts.length > 0 ? parts.join(' · ') : 'A3: 1–10 Rp 20.000, >10 Rp 20.000';
    }

    const newItem = {
      id: `${activeTab}-${Date.now()}`,
      name: itemName,
      tariff: formattedTariff,
      days: `${days || 0} hari`,
      active: true,
    };

    setItemsData((prev) => ({
      ...prev,
      [activeTab]: [...prev[activeTab], newItem],
    }));

    // Add audit entry
    const newAudit = {
      id: Date.now(),
      type: 'CREATE',
      target: `${activeTab.substring(0, 5)}-${Math.random().toString(36).substring(2, 6)}`,
      user: 'anandarafilfari...',
      time: 'Baru saja',
    };
    setAudits((prev) => [newAudit, ...prev]);

    // Reset Form
    setItemName('');
    setCalcMode('Nominal manual');
    setOpRate('');
    setDays(0);
    setDailyRate('275.000');
    setPeople(1);
    setToolTariff('');
    setLaborTariff('');
    setMinLaborCost('');
    setPriceTiers({
      A3: { p1: '15.000', p2: '15.000' },
      B2: { p1: '40.000', p2: '40.000' },
    });
    setCustomFormat({
      enabled: true,
      length: '100',
      width: '100',
      unit: 'per m²',
      p1: '25.000',
      p2: '20.000',
    });
    setOnlyA3(false);
  };

  const handleToggleActive = (id) => {
    setItemsData((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].map((item) =>
        item.id === id ? { ...item, active: !item.active } : item
      ),
    }));

    const newAudit = {
      id: Date.now(),
      type: 'UPDATE',
      target: id.substring(0, 12),
      user: 'anandarafilfari...',
      time: 'Baru saja',
    };
    setAudits((prev) => [newAudit, ...prev]);
  };

  const getSubtitleForCategory = () => {
    switch (activeTab) {
      case 'operational':
        return 'Field menyesuaikan Additional / Operational Costs.';
      case 'digital-finishing':
        return 'Field menyesuaikan Digital Finishing.';
      case 'manpower':
        return 'Field menyesuaikan Manpower Rates.';
      case 'manual-finishing':
        return 'Field menyesuaikan Manual Finishing.';
      case 'print-materials':
        return 'Field menyesuaikan Print Materials.';
      default:
        return 'Field menyesuaikan kategori.';
    }
  };

  return (
    <div className="master-data-page-container">
      {/* Left Area: Category Tabs & Table */}
      <div className="master-data-left-column">
        {/* Category Pills Header */}
        <div className="master-category-tabs-wrapper">
          {INITIAL_MASTER_CATEGORIES.map((cat) => {
            const count = itemsData[cat.id]?.length || cat.count;
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                className={`master-category-pill-btn ${isActive ? 'is-active' : ''}`}
                onClick={() => setActiveTab(cat.id)}
              >
                <Layers size={14} className="category-pill-icon" />
                <span className="category-pill-name">{cat.name}</span>
                <span className={`category-pill-badge ${isActive ? 'badge-active' : ''}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Data Table Card */}
        <div className="dashboard-card master-table-card">
          <div className="table-responsive-wrapper">
            <table className="prenexus-data-table master-data-table">
              <thead>
                <tr>
                  <th className="th-item">Item</th>
                  <th className="th-tariff">Tarif</th>
                  <th className="th-time">Waktu</th>
                  <th className="th-action-master">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => (
                  <tr key={item.id} className={`master-table-row ${!item.active ? 'is-disabled' : ''}`}>
                    <td className="td-item-name">
                      <span className="master-item-title">{item.name}</span>
                    </td>
                    <td className="td-tariff-text">
                      <span className="tariff-desc">{item.tariff}</span>
                    </td>
                    <td className="td-time-text">
                      <span className="time-desc">{item.days}</span>
                    </td>
                    <td className="td-actions-cell">
                      <div className="master-action-btn-group">
                        <button className="master-btn-edit" title="Edit Item">
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          className={`master-btn-toggle ${item.active ? 'btn-deactivate' : 'btn-activate'}`}
                          onClick={() => handleToggleActive(item.id)}
                          title={item.active ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          <Trash2 size={13} />
                          <span>{item.active ? 'Nonaktifkan' : 'Aktifkan'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Area: Form Tambah Item & Audit Logs */}
      <div className="master-data-right-column">
        {/* Card 1: Form Tambah Item */}
        <div className="dashboard-card master-form-card">
          <div className="master-form-header">
            <h3 className="master-form-title">Tambah item</h3>
            <p className="master-form-subtitle">{getSubtitleForCategory()}</p>
          </div>

          <form onSubmit={handleAddItem} className="master-dynamic-form">
            {/* Field: Nama item */}
            <div className="master-form-group">
              <label className="master-field-label">Nama item</label>
              <input
                type="text"
                className="master-input-text"
                placeholder="mis. UV Varnish Matte"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
            </div>

            {/* Category: Operational Costs */}
            {activeTab === 'operational' && (
              <>
                <div className="master-form-group">
                  <label className="master-field-label">Mode perhitungan</label>
                  <select
                    className="master-input-select"
                    value={calcMode}
                    onChange={(e) => {
                      setCalcMode(e.target.value);
                      setOpRate('');
                    }}
                  >
                    <option value="Nominal manual">Nominal manual</option>
                    <option value="Jumlah × tarif">Jumlah × tarif</option>
                    <option value="Panjang × lebar × tarif">Panjang × lebar × tarif</option>
                    <option value="Persentase biaya produksi">Persentase biaya produksi</option>
                  </select>
                </div>

                {calcMode === 'Jumlah × tarif' && (
                  <div className="master-form-group">
                    <label className="master-field-label">Tarif per unit</label>
                    <div className="input-with-prefix">
                      <span className="input-prefix">Rp</span>
                      <input
                        type="text"
                        placeholder="5.000"
                        value={opRate}
                        onChange={(e) => setOpRate(formatCurrencyValue(e.target.value))}
                      />
                    </div>
                  </div>
                )}

                {calcMode === 'Panjang × lebar × tarif' && (
                  <div className="master-form-group">
                    <label className="master-field-label">Tarif per cm²</label>
                    <div className="input-with-prefix">
                      <span className="input-prefix">Rp</span>
                      <input
                        type="text"
                        placeholder="10"
                        value={opRate}
                        onChange={(e) => setOpRate(formatCurrencyValue(e.target.value))}
                      />
                    </div>
                  </div>
                )}

                {calcMode === 'Persentase biaya produksi' && (
                  <div className="master-form-group">
                    <label className="master-field-label">Persentase dari total biaya</label>
                    <div className="input-with-suffix">
                      <input
                        type="text"
                        placeholder="10"
                        value={opRate}
                        onChange={(e) => setOpRate(e.target.value.replace(/[^0-9,.]/g, ''))}
                      />
                      <span className="input-suffix">%</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Category: Manpower */}
            {activeTab === 'manpower' && (
              <>
                <div className="master-form-group">
                  <label className="master-field-label">Tarif harian</label>
                  <div className="input-with-prefix">
                    <span className="input-prefix">Rp</span>
                    <input
                      type="text"
                      placeholder="275.000"
                      value={dailyRate}
                      onChange={(e) => setDailyRate(formatCurrencyValue(e.target.value))}
                    />
                  </div>
                </div>

                <div className="master-form-group">
                  <label className="master-field-label">Jumlah orang</label>
                  <input
                    type="number"
                    className="master-input-text"
                    min="1"
                    placeholder="1"
                    value={people}
                    onChange={(e) => setPeople(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Category: Manual Finishing */}
            {activeTab === 'manual-finishing' && (
              <>
                <div className="master-form-group">
                  <label className="master-field-label">Tarif alat per cm² (opsional)</label>
                  <div className="input-with-prefix">
                    <span className="input-prefix">Rp</span>
                    <input
                      type="text"
                      placeholder="2.500"
                      value={toolTariff}
                      onChange={(e) => setToolTariff(formatCurrencyValue(e.target.value))}
                    />
                  </div>
                </div>

                <div className="master-form-group">
                  <label className="master-field-label">Tarif tenaga kerja per cm²</label>
                  <div className="input-with-prefix">
                    <span className="input-prefix">Rp</span>
                    <input
                      type="text"
                      placeholder="0,75"
                      value={laborTariff}
                      onChange={(e) => setLaborTariff(e.target.value.replace(/[^0-9,.]/g, ''))}
                    />
                  </div>
                </div>

                <div className="master-form-group">
                  <label className="master-field-label">Aturan biaya minimum</label>
                  <input
                    type="text"
                    className="master-input-text"
                    value={minRule}
                    onChange={(e) => setMinRule(e.target.value)}
                  />
                </div>

                <div className="master-form-group">
                  <label className="master-field-label">Biaya minimum tenaga kerja</label>
                  <div className="input-with-prefix">
                    <span className="input-prefix">Rp</span>
                    <input
                      type="text"
                      placeholder="250.000"
                      value={minLaborCost}
                      onChange={(e) => setMinLaborCost(formatCurrencyValue(e.target.value))}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Category: Digital Finishing OR Print Materials */}
            {(activeTab === 'digital-finishing' || activeTab === 'print-materials') && (
              <div className="master-pricing-matrix-section">
                <div className="matrix-table-header">
                  <span className="matrix-col-size">UKURAN</span>
                  <span className="matrix-col-price">HARGA 1–10</span>
                  <span className="matrix-col-price">HARGA &gt; 10</span>
                </div>

                {/* Size: A3 */}
                <div className="matrix-row">
                  <span className="matrix-row-label">A3</span>
                  <div className="input-with-prefix">
                    <span className="input-prefix">Rp</span>
                    <input
                      type="text"
                      value={priceTiers.A3.p1}
                      onChange={(e) => handlePriceTierChange('A3', 'p1', e.target.value)}
                    />
                  </div>
                  <div className="input-with-prefix">
                    <span className="input-prefix">Rp</span>
                    <input
                      type="text"
                      value={priceTiers.A3.p2}
                      onChange={(e) => handlePriceTierChange('A3', 'p2', e.target.value)}
                    />
                  </div>
                </div>

                {/* Size: B2 */}
                {!onlyA3 && (
                  <div className="matrix-row">
                    <span className="matrix-row-label">B2</span>
                    <div className="input-with-prefix">
                      <span className="input-prefix">Rp</span>
                      <input
                        type="text"
                        value={priceTiers.B2.p1}
                        onChange={(e) => handlePriceTierChange('B2', 'p1', e.target.value)}
                      />
                    </div>
                    <div className="input-with-prefix">
                      <span className="input-prefix">Rp</span>
                      <input
                        type="text"
                        value={priceTiers.B2.p2}
                        onChange={(e) => handlePriceTierChange('B2', 'p2', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Size: Custom Format (Replaced Large Format) */}
                {!onlyA3 && (
                  <div className="custom-format-box">
                    <div className="custom-format-title">
                      <span>Custom Format</span>
                      <label className="matrix-checkbox-row" style={{ margin: 0 }}>
                        <input
                          type="checkbox"
                          checked={customFormat.enabled}
                          onChange={(e) => setCustomFormat((p) => ({ ...p, enabled: e.target.checked }))}
                        />
                        <span style={{ fontSize: '10px' }}>Aktifkan</span>
                      </label>
                    </div>

                    {customFormat.enabled && (
                      <>
                        <div className="custom-format-dim-grid">
                          <div className="custom-dim-group">
                            <label>Panjang (cm)</label>
                            <input
                              type="number"
                              placeholder="100"
                              value={customFormat.length}
                              onChange={(e) => handleCustomFormatChange('length', e.target.value)}
                            />
                          </div>
                          <div className="custom-dim-group">
                            <label>Lebar (cm)</label>
                            <input
                              type="number"
                              placeholder="100"
                              value={customFormat.width}
                              onChange={(e) => handleCustomFormatChange('width', e.target.value)}
                            />
                          </div>
                          <div className="custom-dim-group">
                            <label>Satuan Harga</label>
                            <select
                              value={customFormat.unit}
                              onChange={(e) => handleCustomFormatChange('unit', e.target.value)}
                            >
                              <option value="per m²">per m²</option>
                              <option value="per cm²">per cm²</option>
                              <option value="per pcs">per pcs</option>
                            </select>
                          </div>
                        </div>

                        <div className="custom-price-grid">
                          <div className="custom-dim-group">
                            <label>Harga 1–10 ({customFormat.unit})</label>
                            <div className="input-with-prefix">
                              <span className="input-prefix">Rp</span>
                              <input
                                type="text"
                                placeholder="25.000"
                                value={customFormat.p1}
                                onChange={(e) => handleCustomFormatChange('p1', e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="custom-dim-group">
                            <label>Harga &gt; 10 ({customFormat.unit})</label>
                            <div className="input-with-prefix">
                              <span className="input-prefix">Rp</span>
                              <input
                                type="text"
                                placeholder="20.000"
                                value={customFormat.p2}
                                onChange={(e) => handleCustomFormatChange('p2', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <p className="matrix-helper-text">
                  Harga lama digunakan untuk jumlah 1–10. Jika harga &gt; 10 dikosongkan, estimasi memakai harga 1–10.
                </p>

                <label className="matrix-checkbox-row">
                  <input
                    type="checkbox"
                    checked={onlyA3}
                    onChange={(e) => setOnlyA3(e.target.checked)}
                  />
                  <span>Item hanya tersedia untuk ukuran A3</span>
                </label>
              </div>
            )}

            {/* Field: Waktu pengerjaan (hari) */}
            <div className="master-form-group">
              <label className="master-field-label">Waktu pengerjaan (hari)</label>
              <input
                type="number"
                className="master-input-text"
                min="0"
                value={days}
                onChange={(e) => setDays(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <button type="submit" className="master-submit-btn">
              <Layers size={14} />
              <span>Tambah item</span>
            </button>
          </form>
        </div>

        {/* Card 2: Audit Terbaru */}
        <div className="dashboard-card master-audit-card">
          <div className="audit-card-header">
            <Clock size={15} className="audit-header-icon" />
            <h4 className="audit-card-title">Audit terbaru</h4>
          </div>

          <div className="audit-list">
            {audits.map((audit) => (
              <div key={audit.id} className="audit-item-row">
                <span className={`audit-badge ${audit.type === 'CREATE' ? 'badge-create' : 'badge-update'}`}>
                  {audit.type}
                </span>
                <span className="audit-target-name">{audit.target}</span>
                <span className="audit-user-name">{audit.user}</span>
                <span className="audit-time-ago">{audit.time}</span>

                {/* Hover Tooltip (Background+Shadow displaying Fields) */}
                <div className="audit-hover-tooltip">
                  <span className="audit-tooltip-fields-label">Fields: </span>
                  <span className="audit-tooltip-fields-text">
                    {audit.fields || 'id, categoryId, name, rate, active, updatedAt, lastEditedBy'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
