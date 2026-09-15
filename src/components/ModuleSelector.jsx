import React from 'react';
import { MODULES_DATA } from '../data/mockData';

// Custom SVG Icons that match the 3D aesthetic in Image 1
function ModuleIcon({ type }) {
  if (type === 'form') {
    return (
      <div className="module-3d-icon icon-form">
        <svg viewBox="0 0 64 64" width="60" height="60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="formGrad" x1="10" y1="6" x2="54" y2="58" gradientUnits="userSpaceOnUse">
              <stop stopColor="#60A5FA" />
              <stop offset="0.6" stopColor="#3B82F6" />
              <stop offset="1" stopColor="#1D4ED8" />
            </linearGradient>
            <filter id="formShadow" x="0" y="0" width="64" height="64" filterUnits="userSpaceOnUse">
              <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#2563EB" floodOpacity="0.3" />
            </filter>
          </defs>
          <rect x="12" y="8" width="40" height="48" rx="8" fill="url(#formGrad)" filter="url(#formShadow)" />
          {/* Paper lines */}
          <rect x="20" y="18" width="24" height="4" rx="2" fill="#DBEAFE" />
          <rect x="20" y="26" width="20" height="4" rx="2" fill="#DBEAFE" />
          <rect x="20" y="34" width="16" height="4" rx="2" fill="#DBEAFE" />
          {/* Checkmark circle badge */}
          <circle cx="44" cy="44" r="10" fill="#FFFFFF" />
          <circle cx="44" cy="44" r="8.5" fill="#3B82F6" />
          <path d="M40 44L43 47L48 41" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  if (type === 'files') {
    return (
      <div className="module-3d-icon icon-files">
        <svg viewBox="0 0 64 64" width="60" height="60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="folderBack" x1="8" y1="12" x2="56" y2="52" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0284C7" />
              <stop offset="1" stopColor="#0369A1" />
            </linearGradient>
            <linearGradient id="folderFront" x1="8" y1="22" x2="56" y2="54" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38BDF8" />
              <stop offset="1" stopColor="#0284C7" />
            </linearGradient>
            <filter id="filesShadow" x="0" y="0" width="64" height="64" filterUnits="userSpaceOnUse">
              <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#0284C7" floodOpacity="0.3" />
            </filter>
          </defs>
          {/* Folder tabs */}
          <path d="M10 20C10 16.6863 12.6863 14 16 14H26L31 19H50C53.3137 19 56 21.6863 56 25V46C56 49.3137 53.3137 52 50 52H16C12.6863 52 10 49.3137 10 46V20Z" fill="url(#folderBack)" filter="url(#filesShadow)" />
          {/* Colored file sheets inside */}
          <rect x="18" y="16" width="14" height="12" rx="2" fill="#EAB308" />
          <rect x="28" y="14" width="14" height="14" rx="2" fill="#10B981" />
          <rect x="36" y="12" width="14" height="16" rx="2" fill="#EC4899" />
          {/* Folder Front flap */}
          <path d="M8 25C8 22.7909 9.79086 21 12 21H52C54.2091 21 56 22.7909 56 25L54 48C54 51.3137 51.3137 54 48 54H16C12.6863 54 10 51.3137 10 48L8 25Z" fill="url(#folderFront)" />
        </svg>
      </div>
    );
  }

  if (type === 'resources') {
    return (
      <div className="module-3d-icon icon-resources">
        <svg viewBox="0 0 64 64" width="60" height="60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="resRing" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="#06B6D4" />
              <stop offset="0.5" stopColor="#3B82F6" />
              <stop offset="1" stopColor="#8B5CF6" />
            </linearGradient>
            <filter id="resShadow" x="0" y="0" width="64" height="64" filterUnits="userSpaceOnUse">
              <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#3B82F6" floodOpacity="0.3" />
            </filter>
          </defs>
          {/* Outer C-shaped ring */}
          <circle cx="32" cy="32" r="22" stroke="url(#resRing)" strokeWidth="6" strokeDasharray="110 30" filter="url(#resShadow)" />
          {/* Database server cylinder stack */}
          <rect x="24" y="22" width="16" height="6" rx="3" fill="#38BDF8" />
          <rect x="24" y="29" width="16" height="6" rx="3" fill="#60A5FA" />
          <rect x="24" y="36" width="16" height="6" rx="3" fill="#3B82F6" />
          {/* Connection nodes on right */}
          <line x1="42" y1="24" x2="52" y2="20" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="52" cy="20" r="3" fill="#F59E0B" />
          <line x1="42" y1="32" x2="55" y2="32" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="55" cy="32" r="3" fill="#10B981" />
          <line x1="42" y1="40" x2="50" y2="44" stroke="#EC4899" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="50" cy="44" r="3" fill="#EC4899" />
        </svg>
      </div>
    );
  }

  // Production Studio
  return (
    <div className="module-3d-icon icon-studio">
      <svg viewBox="0 0 64 64" width="60" height="60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="calcGrad" x1="10" y1="8" x2="54" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="0.5" stopColor="#2563EB" />
            <stop offset="1" stopColor="#1E40AF" />
          </linearGradient>
          <filter id="calcShadow" x="0" y="0" width="64" height="64" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#2563EB" floodOpacity="0.35" />
          </filter>
        </defs>
        <rect x="12" y="10" width="40" height="46" rx="10" fill="url(#calcGrad)" filter="url(#calcShadow)" />
        {/* Screen with Rp */}
        <rect x="17" y="15" width="30" height="11" rx="4" fill="#0284C7" />
        <text x="21" y="24" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="system-ui">Rp</text>
        {/* Buttons grid */}
        <circle cx="22" cy="33" r="3.5" fill="#60A5FA" />
        <text x="20.5" y="35.5" fill="#FFFFFF" fontSize="8" fontWeight="bold">+</text>

        <circle cx="32" cy="33" r="3.5" fill="#60A5FA" />
        <text x="30.5" y="35.5" fill="#FFFFFF" fontSize="8" fontWeight="bold">-</text>

        <circle cx="42" cy="33" r="3.5" fill="#F59E0B" />
        <text x="40" y="35.5" fill="#FFFFFF" fontSize="8" fontWeight="bold">×</text>

        <circle cx="22" cy="45" r="3.5" fill="#60A5FA" />
        <text x="20" y="47.5" fill="#FFFFFF" fontSize="8" fontWeight="bold">÷</text>

        <circle cx="32" cy="45" r="3.5" fill="#60A5FA" />
        <text x="30" y="47.5" fill="#FFFFFF" fontSize="8" fontWeight="bold">%</text>

        <circle cx="42" cy="45" r="3.5" fill="#10B981" />
        <text x="40.5" y="47.5" fill="#FFFFFF" fontSize="8" fontWeight="bold">=</text>
      </svg>
    </div>
  );
}

export default function ModuleSelector({ onSelectModule }) {
  return (
    <main className="module-selector-screen">
      <div className="module-selector-center">
        <div className="welcome-tag">SELAMAT DATANG</div>

        <div className="brand-hero">
          <div className="brand-hero-logo">
            <span className="brand-hntm">HNTM</span>
            <span className="brand-prenexus">
              <span className="text-pre">Pre</span>
              <span className="text-nexus">Nexus</span>
            </span>
          </div>
          <div className="brand-tagline">
            CONNECT <span className="tag-dot cyan">•</span> COLLABORATE <span className="tag-dot magenta">•</span> CREATE
          </div>
        </div>

        <p className="module-instructions">Pilih modul untuk memulai</p>

        <div className="modules-grid">
          {MODULES_DATA.map((mod) => (
            <button
              key={mod.id}
              className={`module-card ${mod.id === 'production-studio' ? 'is-recommended' : ''}`}
              onClick={() => onSelectModule(mod.id)}
              title={`Buka Modul ${mod.title}`}
            >
              <div className="module-icon-wrapper">
                <ModuleIcon type={mod.iconType} />
              </div>
              <span className="module-title">{mod.title}</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
