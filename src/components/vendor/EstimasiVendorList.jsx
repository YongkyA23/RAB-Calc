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
  Paperclip,
  Eye,
  Copy,
  X,
  Check,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import { ESTIMASI_VENDOR_FOLDERS } from '../../data/mockData';

// Helper: truncate text to maxLen chars with ellipsis
function truncateText(text, maxLen = 12) {
  if (!text) return '';
  return text.length > maxLen ? text.substring(0, maxLen) + '…' : text;
}

export default function EstimasiVendorList({ onAddNew }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [expandedJobs, setExpandedJobs] = useState({});

  // Data state derived from folders (grouped by No Job)
  const [groups, setGroups] = useState(ESTIMASI_VENDOR_FOLDERS);

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
      message: `Apakah Anda yakin ingin menghapus ${selectedItems.length} item vendor yang dipilih? Tindakan ini tidak dapat dibatalkan.`
    });
  };

  // Trigger single item delete confirmation
  const requestDeleteItem = (item, e) => {
    e && e.stopPropagation();
    setActiveDropdownId(null);
    setDeleteConfirmation({
      type: 'item',
      target: item,
      title: 'Hapus Estimasi Vendor?',
      message: `Apakah Anda yakin ingin menghapus quote dari "${item.vendor || item.project}"? Tindakan ini tidak dapat dibatalkan.`
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
        vendorCount: (g.items || []).filter(i => i.id !== item.id).length
      })).filter(g => (g.items || []).length > 0));
    } else if (deleteConfirmation.type === 'batch') {
      setGroups(prev => prev.map(g => ({
        ...g,
        items: (g.items || []).filter(item => !selectedItems.includes(item.id)),
        vendorCount: (g.items || []).filter(item => !selectedItems.includes(item.id)).length
      })).filter(g => (g.items || []).length > 0));
      setSelectedItems([]);
    }

    setDeleteConfirmation(null);
  };

  // Action Menu: View item
  const handleViewItem = (item, e) => {
    e && e.stopPropagation();
    setActiveDropdownId(null);
    if (onAddNew) {
      onAddNew(item);
    }
  };

  // Action Menu: Duplicate item
  const handleDuplicateItem = (item, e) => {
    e && e.stopPropagation();
    const newItem = {
      ...item,
      id: `ven-item-${Date.now()}`,
      vendor: `${item.vendor} (Salinan)`,
      date: new Date().toLocaleDateString('id-ID'),
    };
    setGroups(prev => prev.map(g => {
      if (g.folderName === item.noJob || (g.items && g.items.some(i => i.id === item.id))) {
        return {
          ...g,
          items: [newItem, ...(g.items || [])],
          vendorCount: (g.vendorCount || 0) + 1
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

  // Add new No Job group
  const handleAddNewJob = () => {
    if (!newJobName.trim()) return;
    const newGroup = {
      id: `folder-${Date.now()}`,
      noJob: newJobName.trim(),
      folderName: newJobName.trim(),
      items: []
    };
    setGroups(prev => [newGroup, ...prev]);
    setExpandedJobs(prev => ({ ...prev, [newGroup.id]: true }));
    setNewJobName('');
    setShowNewJobModal(false);
  };

  // Add new Vendor Estimate under a specific No Job group
  const handleAddVendorToGroup = (group) => {
    if (onAddNew) {
      onAddNew({ noJob: group.folderName || group.noJob, groupId: group.id });
    }
  };

  const isAllSelected = selectedItems.length > 0 && selectedItems.length === allItems.length;

  // Filter groups based on search
  const filteredGroups = groups.map(g => ({
    ...g,
    items: (g.items || []).filter(item =>
      (item.noJob || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.project || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.vendor || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.aeName || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(g => 
    searchQuery === '' || (g.items && g.items.length > 0) ||
    (g.folderName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render action dropdown for a vendor item
  const renderActionDropdown = (item) => {
    const isDropdownOpen = activeDropdownId === item.id;
    return (
      <td className="td-aksi" style={{ position: 'relative' }}>
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
            <button className="action-dropdown-item" onClick={(e) => handleViewItem(item, e)}>
              <Eye size={15} color="#4B5563" />
              <span>Lihat</span>
            </button>
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
    );
  };

  return (
    <div className="estimasi-harga-container">
      <div className="dashboard-card estimasi-harga-card">

        {/* Header & Controls */}
        <div className="estimasi-header-controls">
          <div className="estimasi-title-group">
            <h2 className="estimasi-page-title">Estimasi Vendor</h2>
            <p className="estimasi-page-subtitle">Simpan harga vendor beserta lampiran quote.</p>
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

            {/* Tambah No Job Baru Button */}
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
                <th style={{ width: '220px' }} className="th-proyek">PROYEK</th>
                <th style={{ width: '140px' }} className="th-vendor">VENDOR</th>
                <th style={{ width: '140px' }} className="th-ae">NAMA AE</th>
                <th style={{ width: '120px' }} className="th-nilai">NILAI</th>
                <th style={{ width: '140px' }} className="th-lampiran">LAMPIRAN</th>
                <th style={{ width: '95px' }} className="th-tanggal">TANGGAL</th>
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
                            title={group.folderName}
                          >
                            {truncateText(group.folderName, 12)}
                          </span>
                        </div>
                      </td>
                      <td className="td-proyek"></td>
                      <td className="td-vendor"></td>
                      <td className="td-ae"></td>
                      <td className="td-nilai"></td>
                      <td className="td-lampiran"></td>
                      <td className="td-tanggal"></td>
                      <td className="td-aksi">
                        <button 
                          className="add-rab-btn-inline"
                          onClick={() => handleAddVendorToGroup(group)}
                          title="Tambah Estimasi Vendor ke No Job ini"
                        >
                          <Plus size={13} />
                        </button>
                      </td>
                    </tr>

                    {/* All Vendor Estimate Sub-Rows rendered underneath */}
                    {isExpanded && items.map((item) => {
                      const isChecked = selectedItems.includes(item.id);

                      return (
                        <tr key={item.id} className={`table-data-row sub-rab-row ${isChecked ? 'is-row-selected' : ''}`}>
                          <td className="td-checkbox">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleSelectItem(item.id, group.id)}
                              className="custom-checkbox"
                            />
                          </td>
                          <td className="td-nojob">
                            {/* Empty column spacer so Proyek aligns directly under Proyek header */}
                          </td>
                          <td className="td-proyek" title={item.project}>
                            <span className="font-semibold text-slate-800">{item.project}</span>
                          </td>
                          <td className="td-vendor" title={item.vendor}>
                            <span className="vendor-badge-text">{item.vendor}</span>
                          </td>
                          <td className="td-ae" title={item.aeName}>{item.aeName}</td>
                          <td className="td-nilai">
                            <span className="money-value-bold">{item.value}</span>
                          </td>
                          <td className="td-lampiran">
                            <button
                              className="attachment-link-badge"
                              onClick={() => alert(`Membuka lampiran: ${item.attachment}`)}
                              title="Buka lampiran quote"
                            >
                              <Paperclip size={12} />
                              <span>{item.attachment}</span>
                            </button>
                          </td>
                          <td className="td-tanggal">{item.date}</td>
                          {renderActionDropdown(item)}
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
      {/* MODAL: EDIT ITEM VENDOR */}
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
                  <h3 className="modal-title">Edit Estimasi Vendor</h3>
                  <p className="modal-subtitle">Perbarui data penawaran vendor</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setEditingItem(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitEditForm} className="modal-form-body">
              <div className="form-group-grid">
                <div className="form-field">
                  <label className="form-label">Vendor</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingItem.vendor || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, vendor: e.target.value })}
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
                  <label className="form-label">Nilai (Rp)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingItem.value || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                    placeholder="Contoh: Rp 75.000"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Nama Lampiran</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingItem.attachment || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, attachment: e.target.value })}
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
      {/* MODAL: KONFIRMASI HAPUS */}
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
      {/* MODAL: KONFIRMASI SIMPAN PERUBAHAN */}
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
                Apakah Anda yakin ingin menyimpan perubahan data pada quote vendor <strong>"{editingItem.vendor || editingItem.project}"</strong>?
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
        <div className="prenexus-modal-overlay" onClick={() => setShowNewJobModal(false)}>
          <div className="prenexus-modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Tambah No Job Baru</h3>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={() => setShowNewJobModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleAddNewJob(); }}>
              <div className="modal-body-form" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="modal-form-group">
                  <label className="modal-label">NAMA NO JOB / FOLDER</label>
                  <input 
                    type="text" 
                    value={newJobName}
                    onChange={(e) => setNewJobName(e.target.value)}
                    placeholder="Contoh: HKU_125_2026 atau Proyek Baru"
                    className="modal-input"
                    autoFocus
                    required
                  />
                  <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', display: 'block' }}>
                    No Job baru akan ditambahkan ke daftar tabel. Anda dapat menambahkan estimasi vendor di bawah No Job tersebut.
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="modal-btn-cancel" 
                  onClick={() => setShowNewJobModal(false)}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="modal-btn-save"
                  disabled={!newJobName.trim()}
                >
                  <Plus size={15} />
                  <span>Buat No Job</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
