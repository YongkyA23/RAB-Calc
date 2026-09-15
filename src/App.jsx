import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ModuleSelector from './components/ModuleSelector';
import ProductionStudioDashboard from './components/ProductionStudioDashboard';

export default function App() {
  const [currentModule, setCurrentModule] = useState('production-studio'); // default to production studio for fast workflow
  const [activeNav, setActiveNav] = useState('Dashboard'); // default to Dashboard
  const [activeSubNav, setActiveSubNav] = useState('');

  const handleSelectModule = (moduleId) => {
    if (moduleId === 'production-studio') {
      setCurrentModule('production-studio');
    } else {
      alert(`Modul "${moduleId.toUpperCase()}" sedang dalam pengembangan. Membuka modul Production Studio.`);
      setCurrentModule('production-studio');
    }
  };

  const handleGoHome = () => {
    setCurrentModule('portal');
  };

  const handleNavigate = (nav, subNav) => {
    setActiveNav(nav);
    setActiveSubNav(subNav || (nav === 'Estimasi Harga' ? 'Estimasi Harga' : ''));
  };

  return (
    <div className="prenexus-root">
      {/* Top Navbar */}
      <Navbar 
        currentModule={currentModule}
        activeNav={activeNav}
        activeSubNav={activeSubNav}
        onSelectModule={handleSelectModule}
        onGoHome={handleGoHome}
        onNavigate={handleNavigate}
      />

      {/* Dynamic View Rendering */}
      {currentModule === 'portal' ? (
        <ModuleSelector onSelectModule={handleSelectModule} />
      ) : (
        <ProductionStudioDashboard 
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          activeSubNav={activeSubNav}
          setActiveSubNav={setActiveSubNav}
          onLogout={handleGoHome} 
        />
      )}
    </div>
  );
}
