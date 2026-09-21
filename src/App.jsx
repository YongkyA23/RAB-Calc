import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ProductionStudioDashboard from './components/ProductionStudioDashboard';

export default function App() {
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [activeSubNav, setActiveSubNav] = useState('');

  const handleGoHome = () => {
    setActiveNav('Dashboard');
    setActiveSubNav('');
  };

  const handleNavigate = (nav, subNav) => {
    setActiveNav(nav);
    setActiveSubNav(subNav || (nav === 'Estimasi Harga' ? 'Estimasi Harga' : ''));
  };

  return (
    <div className="prenexus-root">
      {/* Top Navbar */}
      <Navbar 
        currentModule="production-studio"
        activeNav={activeNav}
        activeSubNav={activeSubNav}
        onGoHome={handleGoHome}
        onNavigate={handleNavigate}
      />

      {/* Direct Production Studio Dashboard View */}
      <ProductionStudioDashboard 
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        activeSubNav={activeSubNav}
        setActiveSubNav={setActiveSubNav}
        onLogout={handleGoHome} 
      />
    </div>
  );
}
