import React, { useState } from 'react';
import { 
  Search, 
  Folder, 
  LayoutList, 
  Filter, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  FileText 
} from 'lucide-react';
import { ESTIMASI_HARGA_FOLDERS, ESTIMASI_HARGA_FLAT_LIST } from '../../data/mockData';

export default function EstimasiHargaList({ onAddNew }) {
  const [viewMode, setViewMode] = useState('Daftar'); // 'Daftar' (Image 1) or 'Folder' (Image 2 & 4)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]); // List of selected item/folder IDs
  const [expandedFolders, setExpandedFolders] = useState({ 'folder-2': true }); // folder-2 (HKU_104_2026) default expanded to showcase Image 4

  // Toggle folder expand/collapse
  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  // Checkbox handlers
  const handleSelectItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (viewMode === 'Daftar') {
      if (selectedItems.length === ESTIMASI_HARGA_FLAT_LIST.length) {
        setSelectedItems([]);
      } else {
        setSelectedItems(ESTIMASI_HARGA_FLAT_LIST.map(i => i.id));
      }
    } else {
      if (selectedItems.length === ESTIMASI_HARGA_FOLDERS.length) {
        setSelectedItems([]);
      } else {
        setSelectedItems(ESTIMASI_HARGA_FOLDERS.map(f => f.id));
      }
    }
  };

  const handleCancelSelection = () => {
    setSelectedItems([]);
  };

  const handleDeleteSelected = () => {
    alert(`Menghapus ${selectedItems.length} item.`);
    setSelectedItems([]);
  };

  const isAllSelected = viewMode === 'Daftar' 
    ? selectedItems.length > 0 && selectedItems.length === ESTIMASI_HARGA_FLAT_LIST.length
    : selectedItems.length > 0 && selectedItems.length === ESTIMASI_HARGA_FOLDERS.length;

  return (
    <div className="estimasi-harga-container">
      <div className="dashboard-card estimasi-harga-card">
        
        {/* Header & Controls */}
        <div className="estimasi-header-controls">
          <div className="estimasi-title-group">
            <h2 className="estimasi-page-title">Estimasi Harga</h2>
            <p className="estimasi-page-subtitle">Setiap No Job dapat menampung beberapa RAB.</p>
          </div>

          <div className="estimasi-actions-group">
            {/* Batch Selection Action Bar (Shown when items are selected - Image 3) */}
            {selectedItems.length > 0 ? (
              <div className="batch-action-bar">
                <span className="batch-count-badge">{selectedItems.length} item dipilih</span>
                <button className="batch-delete-btn" onClick={handleDeleteSelected}>
                  <Trash2 size={14} />
                  <span>Hapus {selectedItems.length} item</span>
                </button>
                <button className="batch-cancel-btn" onClick={handleCancelSelection}>
                  Batal
                </button>
              </div>
            ) : null}

            {/* Search Box */}
            <div className="estimasi-search-wrapper">
              <Search size={14} className="estimasi-search-icon" />
              <input
                type="text"
                placeholder="Search here"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="estimasi-search-input"
              />
            </div>

            {/* Switcher View Mode: Folder vs Daftar */}
            <div className="estimasi-view-switcher">
              <button
                className={`view-mode-btn ${viewMode === 'Folder' ? 'is-active' : ''}`}
                onClick={() => setViewMode('Folder')}
                title="Tampilan Folder"
              >
                <Folder size={14} />
                <span>Folder</span>
              </button>
              <button
                className={`view-mode-btn ${viewMode === 'Daftar' ? 'is-active' : ''}`}
                onClick={() => setViewMode('Daftar')}
                title="Tampilan Daftar"
              >
                <LayoutList size={14} />
                <span>Daftar</span>
              </button>
            </div>

            {/* Filter Button */}
            <button className="estimasi-filter-btn" title="Filter Data">
              <Filter size={14} />
              <span>Filter</span>
            </button>

            {/* Tambah Button -> Navigates to Add Form (Gambar 5) */}
            <button className="estimasi-add-btn" onClick={onAddNew} title="Tambah Estimasi Harga Baru">
              <Plus size={15} />
              <span>Tambah</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MODE DAFTAR (GAMBAR 1) */}
        {/* ============================================================ */}
        {viewMode === 'Daftar' && (
          <div className="table-responsive-wrapper">
            <table className="estimasi-data-table">
              <thead>
                <tr>
                  <th className="th-checkbox">
                    <input 
                      type="checkbox" 
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className="custom-checkbox"
                    />
                  </th>
                  <th className="th-nojob">NO JOB</th>
                  <th className="th-rab">RAB</th>
                  <th className="th-klien">KLIEN</th>
                  <th className="th-proyek">PROYEK</th>
                  <th className="th-ae">NAMA AE</th>
                  <th className="th-status">STATUS</th>
                  <th className="th-tanggal">TANGGAL</th>
                  <th className="th-nilai">NILAI</th>
                  <th className="th-aksi">AKSI</th>
                </tr>
              </thead>
              <tbody>
                {ESTIMASI_HARGA_FLAT_LIST.map((row) => {
                  const isChecked = selectedItems.includes(row.id);
                  return (
                    <tr key={row.id} className={`table-data-row ${isChecked ? 'is-row-selected' : ''}`}>
                      <td className="td-checkbox">
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => handleSelectItem(row.id)}
                          className="custom-checkbox"
                        />
                      </td>
                      <td className="td-nojob">
                        <span className="nojob-pill-link" onClick={onAddNew} title="Buka Detail Estimasi">
                          {row.noJob}
                        </span>
                      </td>
                      <td className="td-rab">
                        <div className="rab-title-cell">
                          <span className="rab-name-bold">{row.rabName}</span>
                          <span className="rab-code-sub">{row.rabCode}</span>
                        </div>
                      </td>
                      <td className="td-klien">{row.client}</td>
                      <td className="td-proyek">{row.project}</td>
                      <td className="td-ae">{row.aeName}</td>
                      <td className="td-status">
                        <span className={`status-badge badge-${row.statusType}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="td-tanggal">{row.date}</td>
                      <td className="td-nilai">
                        <span className="money-value-bold">{row.value}</span>
                      </td>
                      <td className="td-aksi">
                        <button className="action-more-btn" title="Aksi lainnya">
                          <MoreHorizontal size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODE FOLDER (GAMBAR 2, 3, 4) */}
        {/* ============================================================ */}
        {viewMode === 'Folder' && (
          <div className="table-responsive-wrapper">
            <table className="estimasi-data-table folder-table-view">
              <thead>
                <tr>
                  <th className="th-checkbox">
                    <input 
                      type="checkbox" 
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className="custom-checkbox"
                    />
                  </th>
                  <th className="th-rab">RAB</th>
                  <th className="th-klien">KLIEN</th>
                  <th className="th-proyek">PROYEK</th>
                  <th className="th-ae">NAMA AE</th>
                  <th className="th-status">STATUS</th>
                  <th className="th-tanggal">TANGGAL</th>
                  <th className="th-nilai">NILAI</th>
                  <th className="th-aksi">AKSI</th>
                </tr>
              </thead>
              <tbody>
                {ESTIMASI_HARGA_FOLDERS.map((folder) => {
                  const isFolderChecked = selectedItems.includes(folder.id);
                  const isExpanded = !!expandedFolders[folder.id];

                  return (
                    <React.Fragment key={folder.id}>
                      {/* Folder Parent Row */}
                      <tr className={`folder-parent-row ${isFolderChecked ? 'is-row-selected' : ''}`}>
                        <td className="td-checkbox">
                          <input 
                            type="checkbox" 
                            checked={isFolderChecked}
                            onChange={() => handleSelectItem(folder.id)}
                            className="custom-checkbox"
                          />
                        </td>
                        <td className="td-rab" colSpan={7}>
                          <div className="folder-summary-group">
                            <button 
                              className="folder-expand-btn"
                              onClick={() => toggleFolder(folder.id)}
                              title={isExpanded ? "Ciutkan Folder" : "Perluas Folder"}
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            
                            <div className="folder-icon-circle">
                              <FileText size={15} color="#FFFFFF" />
                            </div>

                            <span className="folder-name-text">{folder.folderName}</span>

                            <span className="rab-count-badge">{folder.rabCount} RAB</span>

                            <span className="folder-plan-amount">{folder.planAmountFormatted}</span>

                            <span className="folder-final-status">{folder.finalStatus}</span>
                          </div>
                        </td>
                        <td className="td-aksi">
                          <div className="folder-action-buttons">
                            <button className="folder-act-btn add" onClick={onAddNew} title="Tambah RAB ke Folder">
                              <Plus size={14} />
                            </button>
                            <button className="folder-act-btn edit" title="Edit Folder">
                              <Edit3 size={14} />
                            </button>
                            <button className="folder-act-btn delete" title="Hapus Folder">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Folder Children Rows (Image 4) */}
                      {isExpanded && folder.items.map((item) => {
                        const isChildChecked = selectedItems.includes(item.id);
                        return (
                          <tr key={item.id} className={`folder-child-row ${isChildChecked ? 'is-row-selected' : ''}`}>
                            <td className="td-checkbox">
                              <input 
                                type="checkbox" 
                                checked={isChildChecked}
                                onChange={() => handleSelectItem(item.id)}
                                className="custom-checkbox"
                              />
                            </td>
                            <td className="td-rab td-child-indent">
                              <div className="rab-title-cell">
                                <span className="rab-name-bold">{item.rabName}</span>
                                <span className="rab-code-sub">{item.rabCode}</span>
                              </div>
                            </td>
                            <td className="td-klien">{item.client}</td>
                            <td className="td-proyek">{item.project}</td>
                            <td className="td-ae">{item.aeName}</td>
                            <td className="td-status">
                              <span className={`status-badge badge-${item.statusType}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="td-tanggal">{item.date}</td>
                            <td className="td-nilai">
                              <span className="money-value-bold">{item.value}</span>
                            </td>
                            <td className="td-aksi">
                              <button className="action-more-btn" title="Aksi lainnya">
                                <MoreHorizontal size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
