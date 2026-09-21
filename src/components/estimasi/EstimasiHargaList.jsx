import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  Copy,
  X,
  Check,
  HelpCircle
} from 'lucide-react';
import { ESTIMASI_HARGA_FOLDERS } from '../../data/mockData';

// Helper: truncate text to maxLen chars with ellipsis
function truncateText(text, maxLen = 12) {
  if (!text) return '';
  return text.length > maxLen ? text.substring(0, maxLen) + '…' : text;
}

export default function EstimasiHargaList({ onAddNew }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [expandedJobs, setExpandedJobs] = useState({});

  // Data state derived from folders (grouped by No Job)
  const [groups, setGroups] = useState(ESTIMASI_HARGA_FOLDERS);

  // Active Dropdown state (row ID)
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  // Modals state
  const [editingItem, setEditingItem] = useState(null);

  // New No Job modal state
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [newJobName, setNewJobName] = useState('');

  // Confirmation Modals
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [isConfirmingSaveEdit, setIsConfirmingSaveEdit] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdownId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle job expand/collapse
  const toggleJob = (groupId) => {
    setExpandedJobs(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Flatten all items for select-all
  const allItems = groups.flatMap(g => g.items || []);

  // Checkbox handlers
  const handleSelectItem = (id, groupId) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
    if (groupId) {
      setSelectedGroups(prev => prev.filter(gId => gId !== groupId));
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === allItems.length) {
      setSelectedItems([]);
      setSelectedGroups([]);
    } else {
      setSelectedItems(allItems.map(i => i.id));
      setSelectedGroups(groups.map(g => g.id));
    }
  };

  const handleCancelSelection = () => {
    setSelectedItems([]);
    setSelectedGroups([]);
  };

  // Trigger batch delete confirmation
  const requestDeleteSelected = () => {
    setDeleteConfirmation({
      type: 'batch',
      target: selectedItems,
      title: 'Hapus Item Terpilih?',
      message: `Apakah Anda yakin ingin menghapus ${selectedItems.length} item yang dipilih? Tindakan ini tidak dapat dibatalkan.`
    });
  };

  // Trigger single item delete confirmation
  const requestDeleteItem = (item, e) => {
    e && e.stopPropagation();
    setActiveDropdownId(null);
    setDeleteConfirmation({
      type: 'item',
      target: item,
      title: 'Hapus Estimasi Harga?',
      message: `Apakah Anda yakin ingin menghapus estimasi "${item.rabName || item.noJob}"? Tindakan ini tidak dapat dibatalkan.`
    });
  };

  // Execute confirmed deletion
  const executeDelete = () => {
    if (!deleteConfirmation) return;

    if (deleteConfirmation.type === 'item') {
      const item = deleteConfirmation.target;
      setGroups(prev => prev.map(g => ({
        ...g,
        items: (g.items || []).filter(i => i.id !== item.id),
        rabCount: (g.items || []).filter(i => i.id !== item.id).length
      })).filter(g => (g.items || []).length > 0));
    } else if (deleteConfirmation.type === 'batch') {
      setGroups(prev => prev.map(g => ({
        ...g,
        items: (g.items || []).filter(item => !selectedItems.includes(item.id)),
        rabCount: (g.items || []).filter(item => !selectedItems.includes(item.id)).length
      })).filter(g => (g.items || []).length > 0));
      setSelectedItems([]);
    }

    setDeleteConfirmation(null);
  };

  // Action Menu: Duplicate item
  const handleDuplicateItem = (item, e) => {
    e && e.stopPropagation();
    const newItem = {
      ...item,
      id: `item-${Date.now()}`,
      rabName: `${item.rabName} (Salinan)`,
      date: new Date().toLocaleDateString('id-ID'),
    };
    setGroups(prev => prev.map(g => {
      if (g.noJob === item.noJob || (g.items && g.items.some(i => i.id === item.id))) {
        return {
          ...g,
          items: [newItem, ...(g.items || [])],
          rabCount: (g.rabCount || 0) + 1
        };
      }
      return g;
    }));
    setActiveDropdownId(null);
  };

  // Action Menu: Start Editing
  const handleStartEdit = (item, e) => {
    e && e.stopPropagation();
    setEditingItem({ ...item });
    setActiveDropdownId(null);
  };

  // Trigger Edit Confirmation
  const handleSubmitEditForm = (e) => {
    e.preventDefault();
    setIsConfirmingSaveEdit(true);
  };

  // Execute Confirmed Edit Save
  const executeSaveEdit = () => {
    if (!editingItem) return;

    setGroups(prev => prev.map(g => ({
      ...g,
      items: (g.items || []).map(i => i.id === editingItem.id ? editingItem : i)
    })));
    setIsConfirmingSaveEdit(false);
    setEditingItem(null);
  };

  // Action Menu: View item
  const handleViewItem = (item, e) => {
    if (e) e.stopPropagation();
    setActiveDropdownId(null);
    if (onAddNew) {
      onAddNew(item);
    }
  };

  // Add new No Job group
  const handleAddNewJob = () => {
    if (!newJobName.trim()) return;
    const newGroup = {
      id: `folder-${Date.now()}`,
      noJob: newJobName.trim(),
      folderName: newJobName.trim(),
      rabCount: 0,
      items: []
    };
    setGroups(prev => [newGroup, ...prev]);
    setExpandedJobs(prev => ({ ...prev, [newGroup.id]: true }));
    setNewJobName('');
    setShowNewJobModal(false);
  };

  // Add new RAB under a specific No Job group
  const handleAddRabToGroup = (group) => {
    if (onAddNew) {
      onAddNew({ noJob: group.noJob, groupId: group.id });
    }
  };

  // Filter groups based on search
  const filteredGroups = groups.map(g => ({
    ...g,
    items: (g.items || []).filter(item =>
      (item.rabName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.client || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.noJob || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.project || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(g => 
    searchQuery === '' || (g.items && g.items.length > 0) ||
    (g.noJob || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAllSelected = selectedItems.length > 0 && selectedItems.length === allItems.length;

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
            {/* Batch Selection Action Bar */}
            {selectedItems.length > 0 && (
              <div className="batch-action-bar">
                <span className="batch-count-badge">{selectedItems.length} item dipilih</span>
                <button className="batch-delete-btn" onClick={requestDeleteSelected}>
                  <Trash2 size={14} />
                  <span>Hapus {selectedItems.length} item</span>
                </button>
                <button className="batch-cancel-btn" onClick={handleCancelSelection}>
                  Batal
                </button>
              </div>
            )}

            {/* Search Box */}
            <div className="estimasi-search-wrapper">
              <Search size={14} className="estimasi-search-icon" />
              <input
                type="text"
                placeholder="Cari..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="estimasi-search-input"
              />
            </div>

            {/* Filter Button */}
            <button className="estimasi-filter-btn" title="Filter Data">
              <Filter size={14} />
              <span>Filter</span>
            </button>

            {/* Tambah No Job Button */}
            <button className="estimasi-add-btn" onClick={() => setShowNewJobModal(true)} title="Tambah No Job Baru">
              <Plus size={15} />
              <span>Baru</span>
            </button>
          </div>
        </div>

        {/* Unified Table with expandable No Job groups */}
        <div className="table-responsive-wrapper">
          <table className="estimasi-data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }} className="th-checkbox">
                  <input 
                    type="checkbox" 
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="custom-checkbox"
                  />
                </th>
                <th style={{ width: '135px' }} className="th-nojob">NO JOB</th>
                <th style={{ width: '200px' }} className="th-rab">RAB</th>
                <th style={{ width: '130px' }} className="th-klien">KLIEN</th>
                <th style={{ width: '140px' }} className="th-proyek">PROYEK</th>
                <th style={{ width: '130px' }} className="th-ae">NAMA AE</th>
                <th style={{ width: '95px' }} className="th-status">STATUS</th>
                <th style={{ width: '90px' }} className="th-tanggal">TANGGAL</th>
                <th style={{ width: '110px' }} className="th-nilai">NILAI</th>
                <th style={{ width: '50px' }} className="th-aksi">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.map((group) => {
                const items = group.items || [];
                const isExpanded = expandedJobs[group.id] !== false; // default open
                const isGroupChecked = selectedGroups.includes(group.id);

                const handleToggleGroupSelect = () => {
                  const itemIds = items.map(i => i.id);
                  if (isGroupChecked) {
                    setSelectedGroups(prev => prev.filter(gId => gId !== group.id));
                    setSelectedItems(prev => prev.filter(id => !itemIds.includes(id)));
                  } else {
                    setSelectedGroups(prev => Array.from(new Set([...prev, group.id])));
                    setSelectedItems(prev => Array.from(new Set([...prev, ...itemIds])));
                  }
                };

                return (
                  <React.Fragment key={group.id}>
                    {/* Dedicated Job Header Row */}
                    <tr className={`table-data-row job-parent-row ${isGroupChecked ? 'is-row-selected' : ''}`}>
                      <td className="td-checkbox">
                        <input 
                          type="checkbox" 
                          checked={isGroupChecked}
                          onChange={handleToggleGroupSelect}
                          className="custom-checkbox"
                        />
                      </td>
                      <td className="td-nojob">
                        <div className="nojob-chevron-group">
                          <button 
                            className="nojob-expand-btn"
                            onClick={() => toggleJob(group.id)}
                            title={isExpanded ? "Ciutkan" : "Perluas"}
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                          <span 
                            className="nojob-pill-link" 
                            title={group.noJob}
                          >
                            {truncateText(group.noJob, 12)}
                          </span>
                        </div>
                      </td>
                      <td className="td-rab"></td>
                      <td className="td-klien"></td>
                      <td className="td-proyek"></td>
                      <td className="td-ae"></td>
                      <td className="td-status"></td>
                      <td className="td-tanggal"></td>
                      <td className="td-nilai"></td>
                      <td className="td-aksi">
                        <button 
                          className="add-rab-btn-inline"
                          onClick={() => handleAddRabToGroup(group)}
                          title="Tambah RAB ke No Job ini"
                        >
                          <Plus size={13} />
                        </button>
                      </td>
                    </tr>

                    {/* All RAB Sub-Rows rendered underneath */}
                    {isExpanded && items.map((item) => {
                      const isChecked = selectedItems.includes(item.id);
                      const isDropdownOpen = activeDropdownId === item.id;

                      return (
                        <tr 
                          key={item.id} 
                          className={`table-data-row sub-rab-row ${isChecked ? 'is-row-selected' : ''}`}
                          onClick={() => handleViewItem(item)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td className="td-checkbox" onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={() => handleSelectItem(item.id, group.id)}
                              className="custom-checkbox"
                            />
                          </td>
                          <td className="td-nojob">
                            {/* Empty column spacer so RAB column aligns directly under RAB header */}
                          </td>
                          <td className="td-rab" title={item.rabName}>
                            <div className="rab-title-cell">
                              <span className="rab-name-bold">{item.rabName}</span>
                              <span className="rab-code-sub">{item.rabCode}</span>
                            </div>
                          </td>
                          <td className="td-klien" title={item.client}>{item.client}</td>
                          <td className="td-proyek" title={item.project}>{item.project}</td>
                          <td className="td-ae" title={item.aeName}>{item.aeName}</td>
                          <td className="td-status">
                            <span className={`status-badge badge-${item.statusType || 'default'}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="td-tanggal">{item.date}</td>
                          <td className="td-nilai">
                            <span className="money-value-bold">{item.value}</span>
                          </td>
                          <td className="td-aksi" style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                            <button 
                              className={`action-more-btn ${isDropdownOpen ? 'is-active' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownId(isDropdownOpen ? null : item.id);
                              }}
                              title="Aksi lainnya"
                            >
                              <MoreHorizontal size={16} />
                            </button>

                            {isDropdownOpen && (
                              <div className="action-dropdown-menu" ref={dropdownRef}>
                                <button className="action-dropdown-item" onClick={(e) => handleStartEdit(item, e)}>
                                  <Edit3 size={15} color="#4B5563" />
                                  <span>Edit</span>
                                </button>
                                <button className="action-dropdown-item" onClick={(e) => handleDuplicateItem(item, e)}>
                                  <Copy size={15} color="#4B5563" />
                                  <span>Duplikat</span>
                                </button>
                                <button className="action-dropdown-item delete" onClick={(e) => requestDeleteItem(item, e)}>
                                  <Trash2 size={15} color="#EF4444" />
                                  <span>Hapus</span>
                                </button>
                              </div>
                            )}
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

      </div>

      {/* ============================================================ */}
      {/* MODAL: EDIT ITEM */}
      {/* ============================================================ */}
      {editingItem && (
        <div className="prenexus-modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="prenexus-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-badge">
                  <Edit3 size={18} color="#2563EB" />
                </div>
                <div>
                  <h3 className="modal-title">Edit Estimasi Harga</h3>
                  <p className="modal-subtitle">Perbarui rincian data estimasi harga</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setEditingItem(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitEditForm} className="modal-form-body">
              <div className="form-group-grid">
                <div className="form-field">
                  <label className="form-label">Nama RAB</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingItem.rabName || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, rabName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">No Job</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingItem.noJob || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, noJob: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Klien</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingItem.client || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, client: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Proyek</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingItem.project || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, project: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Nama AE</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingItem.aeName || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, aeName: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={editingItem.status || 'Draf'}
                    onChange={(e) => {
                      const val = e.target.value;
                      const typeMap = {
                        'Draf': 'draft',
                        'Proses': 'progress',
                        'Realisasi': 'realisation',
                        'Selesai': 'completed',
                        'Batal': 'canceled'
                      };
                      setEditingItem({ 
                        ...editingItem, 
                        status: val, 
                        statusType: typeMap[val] || 'default' 
                      });
                    }}
                  >
                    <option value="Draf">Draf</option>
                    <option value="Proses">Proses</option>
                    <option value="Realisasi">Realisasi</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Batal">Batal</option>
                  </select>
                </div>

                <div className="form-field form-field-full">
                  <label className="form-label">Nilai (Rp)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingItem.value || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                    placeholder="Contoh: Rp 200.000"
                  />
                </div>
              </div>

              <div className="modal-footer-actions">
                <button 
                  type="button" 
                  className="modal-btn-cancel" 
                  onClick={() => setEditingItem(null)}
                >
                  Batal
                </button>
                <button type="submit" className="modal-btn-save">
                  <Check size={16} />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: KONFIRMASI HAPUS (DELETE CONFIRMATION) */}
      {/* ============================================================ */}
      {deleteConfirmation && (
        <div className="prenexus-modal-overlay" onClick={() => setDeleteConfirmation(null)}>
          <div className="prenexus-modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-body">
              <div className="confirm-icon-badge danger">
                <Trash2 size={24} color="#EF4444" />
              </div>
              <h3 className="confirm-title">{deleteConfirmation.title}</h3>
              <p className="confirm-description">{deleteConfirmation.message}</p>
            </div>

            <div className="confirm-modal-footer">
              <button 
                type="button" 
                className="confirm-btn-secondary" 
                onClick={() => setDeleteConfirmation(null)}
              >
                Batal
              </button>
              <button 
                type="button" 
                className="confirm-btn-danger" 
                onClick={executeDelete}
              >
                <Trash2 size={16} />
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: KONFIRMASI SIMPAN PERUBAHAN (EDIT CONFIRMATION) */}
      {/* ============================================================ */}
      {isConfirmingSaveEdit && editingItem && (
        <div className="prenexus-modal-overlay" onClick={() => setIsConfirmingSaveEdit(false)}>
          <div className="prenexus-modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-body">
              <div className="confirm-icon-badge primary">
                <HelpCircle size={24} color="#2563EB" />
              </div>
              <h3 className="confirm-title">Simpan Perubahan?</h3>
              <p className="confirm-description">
                Apakah Anda yakin ingin menyimpan perubahan data pada estimasi <strong>"{editingItem.rabName}"</strong>?
              </p>
            </div>

            <div className="confirm-modal-footer">
              <button 
                type="button" 
                className="confirm-btn-secondary" 
                onClick={() => setIsConfirmingSaveEdit(false)}
              >
                Periksa Kembali
              </button>
              <button 
                type="button" 
                className="confirm-btn-primary" 
                onClick={executeSaveEdit}
              >
                <Check size={16} />
                <span>Ya, Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: TAMBAH NO JOB BARU */}
      {/* ============================================================ */}
      {showNewJobModal && (
        <div className="prenexus-modal-overlay" onClick={() => { setShowNewJobModal(false); setNewJobName(''); }}>
          <div className="prenexus-modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-badge">
                  <Plus size={18} color="#2563EB" />
                </div>
                <div>
                  <h3 className="modal-title">Tambah No Job Baru</h3>
                  <p className="modal-subtitle">Masukkan nama atau kode No Job baru</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => { setShowNewJobModal(false); setNewJobName(''); }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '16px 20px' }}>
              <div className="form-field">
                <label className="form-label">No Job</label>
                <input
                  type="text"
                  className="form-input"
                  value={newJobName}
                  onChange={(e) => setNewJobName(e.target.value)}
                  placeholder="Contoh: HKU_120_2026"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddNewJob(); }}
                />
              </div>
            </div>

            <div className="confirm-modal-footer">
              <button 
                type="button" 
                className="confirm-btn-secondary" 
                onClick={() => { setShowNewJobModal(false); setNewJobName(''); }}
              >
                Batal
              </button>
              <button 
                type="button" 
                className="confirm-btn-primary" 
                onClick={handleAddNewJob}
                disabled={!newJobName.trim()}
              >
                <Plus size={16} />
                <span>Tambah No Job</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
