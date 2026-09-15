import React from 'react';
import { Search, Grid } from 'lucide-react';

export default function Navbar({ currentModule, activeNav = 'Dashboard', activeSubNav, onGoHome, onNavigate }) {
  const getBreadcrumbTitle = () => {
    if (activeNav === 'Estimasi Harga') {
      if (activeSubNav === 'Estimasi Vendor') {
        return 'Estimasi Vendor';
      }
      return 'Estimasi Harga';
    }
    return activeNav;
  };

  return (
    <header className="prenexus-navbar">
      <div className="navbar-left">
        <button className="navbar-brand-btn" onClick={onGoHome} title="Kembali ke Beranda">
          <div className="brand-logo-container">
            <div className="brand-logo-icon">#</div>
            <span className="brand-name-pre">Pre</span>
            <span className="brand-name-nexus">Nexus</span>
          </div>
        </button>

        {currentModule === 'production-studio' && (
          <div className="navbar-breadcrumbs">
            <span className="breadcrumb-divider">|</span>
            <button className="breadcrumb-link active-module" onClick={() => onNavigate && onNavigate('Dashboard')}>
              Production Studio
            </button>
            <span className="breadcrumb-chevron">›</span>
            <span className="breadcrumb-current">{getBreadcrumbTitle()}</span>
          </div>
        )}
      </div>

      <div className="navbar-right">
        <div className="navbar-search-box">
          <Search className="search-icon" size={15} />
          <input
            type="text"
            placeholder="Cari..."
            aria-label="Cari"
          />
          <kbd className="search-shortcut">⌘K</kbd>
        </div>

        <button className="nav-action-btn" title="Modul Lainnya" onClick={onGoHome}>
          <Grid size={18} />
        </button>
      </div>
    </header>
  );
}
