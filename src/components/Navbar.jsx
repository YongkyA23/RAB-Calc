import React from 'react';

export default function Navbar({ currentModule, activeNav = 'Dashboard', activeSubNav, onGoHome, onNavigate }) {
  const getBreadcrumbTitle = () => {
    if (activeNav === 'Estimasi Harga') {
      if (activeSubNav === 'Estimasi Vendor') {
        return 'Estimasi Vendor';
      }
      return 'Estimasi Harga';
    }
    if (activeNav === 'Hitung Kertas') {
      if (activeSubNav) return activeSubNav;
      return 'Hitung Kertas';
    }
    return activeNav;
  };

  return (
    <header className="prenexus-navbar">
      <div className="navbar-left">
        <button className="navbar-brand-btn" onClick={onGoHome} title="Kembali ke Beranda">
          <div className="brand-logo-badge">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <line x1="4.5" y1="1.5" x2="4.5" y2="10.5" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="7.5" y1="1.5" x2="7.5" y2="10.5" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="brand-name-group">
            <span className="brand-name-pre">Pre</span>
            <span className="brand-name-nexus">Nexus</span>
          </div>
        </button>

        <div className="navbar-module-tag">
          {currentModule === 'production-studio' ? (
            <div className="navbar-breadcrumbs">
              <span className="navbar-module-title" onClick={() => onNavigate && onNavigate('Dashboard')}>
                Production Studio
              </span>
              {activeNav && activeNav !== 'Dashboard' && (
                <>
                  <span className="breadcrumb-slash">/</span>
                  <span className="breadcrumb-sub">{getBreadcrumbTitle()}</span>
                </>
              )}
            </div>
          ) : (
            <span className="navbar-module-title">Files</span>
          )}
        </div>
      </div>

      <div className="navbar-right">
        <div className="navbar-search-box">
          <svg className="search-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="5" cy="5" r="3.5" stroke="#71717B" strokeWidth="1" />
            <line x1="7.5" y1="7.5" x2="10.5" y2="10.5" stroke="#71717B" strokeWidth="1" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Cari..."
            aria-label="Cari"
          />
          <span className="search-shortcut">⌘K</span>
        </div>

        <button className="nav-grid-btn" title="Modul Lainnya" onClick={onGoHome}>
          <div className="grid-icon-9dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </button>
      </div>
    </header>
  );
}
