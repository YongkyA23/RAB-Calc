import React, { useState } from 'react';
import { 
  LayoutGrid, 
  FileText, 
  Layers, 
  Database, 
  LogOut, 
  ChevronLeft,
  ChevronRight,
  Store,
  Printer,
  BookOpen,
  Scissors,
  Clock
} from 'lucide-react';

export default function Sidebar({ activeNav = 'Dashboard', activeSubNav = 'Estimasi Harga', onNavigate, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);

  const handleNavClick = (navId) => {
    if (navId === 'Estimasi Harga') {
      onNavigate && onNavigate('Estimasi Harga', 'Estimasi Harga');
    } else if (navId === 'Hitung Kertas') {
      onNavigate && onNavigate('Hitung Kertas', 'Layout Cetak');
    } else {
      onNavigate && onNavigate(navId, null);
    }
  };

  const handleSubNavClick = (parentNav, subNavId, e) => {
    e.stopPropagation();
    onNavigate && onNavigate(parentNav, subNavId);
  };

  const HITUNG_KERTAS_SUBNAV = [
    { id: 'Layout Cetak',    icon: Printer,   label: 'Layout Cetak' },
    { id: 'Kalkulator Buku', icon: BookOpen,   label: 'Kalkulator Buku' },
    { id: 'Potong Piano',    icon: Scissors,   label: 'Potong Piano' },
    { id: 'Estimasi Waktu',  icon: Clock,      label: 'Estimasi Waktu' },
  ];

  return (
    <aside className={`prenexus-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="sidebar-top">
        {!collapsed && <div className="sidebar-section-title">APLIKASI AKTIF</div>}
        <nav className="sidebar-nav">
          {/* Dashboard */}
          <button
            className={`sidebar-nav-item ${activeNav === 'Dashboard' ? 'is-active' : ''}`}
            onClick={() => handleNavClick('Dashboard')}
            title="Dashboard"
          >
            <LayoutGrid size={18} className="nav-icon" />
            {!collapsed && <span className="nav-label">Dashboard</span>}
          </button>

          {/* Estimasi Harga (with sub-menu) */}
          <div className="sidebar-nav-group">
            <button
              className={`sidebar-nav-item ${activeNav === 'Estimasi Harga' ? 'is-active-parent' : ''}`}
              onClick={() => handleNavClick('Estimasi Harga')}
              title="Estimasi Harga"
            >
              <FileText size={18} className="nav-icon" />
              {!collapsed && <span className="nav-label">Estimasi Harga</span>}
            </button>

            {!collapsed && activeNav === 'Estimasi Harga' && (
              <div className="sidebar-submenu-tree">
                <div className="submenu-tree-line"></div>
                <div className="submenu-items-list">
                  <button
                    className={`sidebar-submenu-item ${activeSubNav === 'Estimasi Harga' ? 'is-active' : ''}`}
                    onClick={(e) => handleSubNavClick('Estimasi Harga', 'Estimasi Harga', e)}
                  >
                    <FileText size={14} className="subnav-icon" />
                    <span>Estimasi Harga</span>
                  </button>
                  <button
                    className={`sidebar-submenu-item ${activeSubNav === 'Estimasi Vendor' ? 'is-active' : ''}`}
                    onClick={(e) => handleSubNavClick('Estimasi Harga', 'Estimasi Vendor', e)}
                  >
                    <Store size={14} className="subnav-icon" />
                    <span>Estimasi Vendor</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Hitung Kertas (with sub-menu) */}
          <div className="sidebar-nav-group">
            <button
              className={`sidebar-nav-item ${activeNav === 'Hitung Kertas' ? 'is-active-parent' : ''}`}
              onClick={() => handleNavClick('Hitung Kertas')}
              title="Hitung Kertas"
            >
              <Layers size={18} className="nav-icon" />
              {!collapsed && <span className="nav-label">Hitung Kertas</span>}
            </button>

            {!collapsed && activeNav === 'Hitung Kertas' && (
              <div className="sidebar-submenu-tree">
                <div className="submenu-tree-line"></div>
                <div className="submenu-items-list">
                  {HITUNG_KERTAS_SUBNAV.map(sub => {
                    const Icon = sub.icon;
                    return (
                      <button
                        key={sub.id}
                        className={`sidebar-submenu-item ${activeSubNav === sub.id ? 'is-active' : ''}`}
                        onClick={(e) => handleSubNavClick('Hitung Kertas', sub.id, e)}
                      >
                        <Icon size={14} className="subnav-icon" />
                        <span>{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Master Data */}
          <button
            className={`sidebar-nav-item ${activeNav === 'Master Data' ? 'is-active' : ''}`}
            onClick={() => handleNavClick('Master Data')}
            title="Master Data"
          >
            <Database size={18} className="nav-icon" />
            {!collapsed && <span className="nav-label">Master Data</span>}
          </button>
        </nav>
      </div>

      <div className="sidebar-bottom">
        {/* User Card */}
        <div className="sidebar-user-card">
          <div className="user-avatar-badge small">
            <span>AR</span>
          </div>
          {!collapsed && (
            <div className="user-info">
              <div className="user-name">Ananda Rafii</div>
              <div className="user-email">anandarafii@gmail.com</div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="sidebar-actions">
          <button 
            className="sidebar-action-item" 
            onClick={onLogout}
            title="Keluar ke Pemilihan Modul"
          >
            <LogOut size={16} />
            {!collapsed && <span>Keluar</span>}
          </button>

          <button 
            className="sidebar-action-item" 
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!collapsed && <span>Ciutkan</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
