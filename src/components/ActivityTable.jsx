import React, { useState } from 'react';
import { BookOpen, Search, FileText, Store, Filter, ChevronDown } from 'lucide-react';
import { ESTIMASI_ACTIVITIES, VENDOR_ACTIVITIES } from '../data/mockData';

export default function ActivityTable({ activeTab = 'Estimasi', setActiveTab }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const rawData = activeTab === 'Estimasi' ? ESTIMASI_ACTIVITIES : VENDOR_ACTIVITIES;

  const filteredData = rawData.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.date.includes(searchQuery);
    const matchesStatus = statusFilter === 'All' || item.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (statusType) => {
    switch (statusType) {
      case 'draft':
        return 'badge-draft';
      case 'completed':
        return 'badge-completed';
      case 'realisation':
        return 'badge-realisation';
      case 'progress':
        return 'badge-progress';
      case 'canceled':
        return 'badge-canceled';
      default:
        return 'badge-default';
    }
  };

  return (
    <div className="dashboard-card activity-table-card">
      {/* Table Top Controls Header */}
      <div className="table-header-controls">
        <div className="table-title-group">
          <div className="card-mini-icon">
            <BookOpen size={16} />
          </div>
          <div>
            <h3 className="card-title">Aktivitas Terbaru</h3>
            <p className="card-subtitle">Estimasi dan quote vendor yang terakhir diperbarui.</p>
          </div>
        </div>

        <div className="table-actions-group">
          {/* Search box */}
          <div className="table-search-input-wrapper">
            <Search size={14} className="table-search-icon" />
            <input
              type="text"
              placeholder="Cari estimasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="table-search-input"
            />
          </div>

          {/* Tab Switcher: Estimasi vs Vendor */}
          <div className="table-tab-switcher">
            <button
              className={`table-tab-btn ${activeTab === 'Estimasi' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('Estimasi')}
            >
              <FileText size={14} />
              <span>Estimasi</span>
            </button>
            <button
              className={`table-tab-btn ${activeTab === 'Vendor' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('Vendor')}
            >
              <Store size={14} />
              <span>Vendor</span>
            </button>
          </div>

          {/* Filter button with dropdown */}
          <div className="filter-button-container">
            <button 
              className={`table-filter-btn ${statusFilter !== 'All' ? 'is-filtered' : ''}`}
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <Filter size={14} />
              <span>{statusFilter === 'All' ? 'Filter' : statusFilter}</span>
              <ChevronDown size={13} />
            </button>

            {showFilterDropdown && (
              <div className="filter-dropdown-menu">
                {['All', 'Draf', 'Proses', 'Realisasi', 'Selesai', 'Batal'].map((status) => (
                  <button
                    key={status}
                    className={`filter-dropdown-item ${statusFilter === status ? 'is-selected' : ''}`}
                    onClick={() => {
                      setStatusFilter(status);
                      setShowFilterDropdown(false);
                    }}
                  >
                    {status === 'All' ? 'Semua Status' : status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Data */}
      <div className="table-responsive-wrapper">
        <table className="prenexus-data-table">
          <thead>
            <tr>
              <th className="th-type">TIPE</th>
              <th className="th-name">NAMA ESTIMASI</th>
              <th className="th-value">NILAI</th>
              <th className="th-date">TANGGAL</th>
              <th className="th-status">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row) => (
                <tr key={row.id} className="table-data-row">
                  <td className="td-type">
                    <span className="type-pill">{row.type}</span>
                  </td>
                  <td className="td-name">
                    <span className="estimate-name-text">{row.name}</span>
                  </td>
                  <td className="td-value">
                    <span className={row.value === '—' ? 'dash-value' : 'money-value'}>
                      {row.value}
                    </span>
                  </td>
                  <td className="td-date">
                    <span className="date-text">{row.date}</span>
                  </td>
                  <td className="td-status">
                    <span className={`status-badge ${getStatusBadgeClass(row.statusType)}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-table-state">
                  Tidak ada data estimasi yang sesuai.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
