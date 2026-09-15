import React, { useState } from 'react';
import Sidebar from './Sidebar';
import CostDonutChart from './charts/CostDonutChart';
import CostAllocationChart from './charts/CostAllocationChart';
import TotalEstimasiCard from './charts/TotalEstimasiCard';
import RealisasiComparisonCard from './charts/RealisasiComparisonCard';
import ActivityTable from './ActivityTable';
import EstimasiHargaList from './estimasi/EstimasiHargaList';
import EstimasiHargaForm from './estimasi/EstimasiHargaForm';
import EstimasiVendorList from './vendor/EstimasiVendorList';
import EstimasiVendorForm from './vendor/EstimasiVendorForm';
import LayoutCetak from './hitungkertas/LayoutCetak';
import KalkulatorBuku from './hitungkertas/KalkulatorBuku';
import PotongPiano from './hitungkertas/PotongPiano';
import EstimasiWaktu from './hitungkertas/EstimasiWaktu';
import MasterData from './masterdata/MasterData';

export default function ProductionStudioDashboard({ 
  activeNav, 
  setActiveNav, 
  activeSubNav, 
  setActiveSubNav, 
  onLogout 
}) {
  const [tableActiveTab, setTableActiveTab] = useState('Estimasi');
  const [isAddingNewRAB, setIsAddingNewRAB] = useState(false);
  const [isAddingNewVendor, setIsAddingNewVendor] = useState(false);

  const handleNavigate = (nav, subNav) => {
    setActiveNav(nav);
    setActiveSubNav(subNav || (nav === 'Estimasi Harga' ? 'Estimasi Harga' : nav === 'Hitung Kertas' ? 'Layout Cetak' : ''));
    setIsAddingNewRAB(false);
    setIsAddingNewVendor(false);
  };

  return (
    <div className="studio-layout">
      {/* Left Sidebar */}
      <Sidebar 
        activeNav={activeNav} 
        activeSubNav={activeSubNav} 
        onNavigate={handleNavigate}
        onLogout={onLogout} 
      />

      {/* Main Content Area */}
      <div className="studio-main-content">
        
        {/* VIEW: DASHBOARD */}
        {activeNav === 'Dashboard' && (
          <div className="dashboard-content-container">
            <div className="dashboard-top-section">
              <div className="dashboard-left-col">
                <CostDonutChart />
              </div>
              <div className="dashboard-right-col">
                <CostAllocationChart />
                <div className="dashboard-right-bottom-row">
                  <RealisasiComparisonCard />
                  <TotalEstimasiCard />
                </div>
              </div>
            </div>
            <ActivityTable 
              activeTab={tableActiveTab} 
              setActiveTab={setTableActiveTab} 
            />
          </div>
        )}

        {/* VIEW: ESTIMASI HARGA */}
        {activeNav === 'Estimasi Harga' && activeSubNav === 'Estimasi Harga' && (
          <>
            {isAddingNewRAB ? (
              <EstimasiHargaForm onBack={() => setIsAddingNewRAB(false)} />
            ) : (
              <EstimasiHargaList onAddNew={() => setIsAddingNewRAB(true)} />
            )}
          </>
        )}

        {/* VIEW: ESTIMASI VENDOR */}
        {activeNav === 'Estimasi Harga' && activeSubNav === 'Estimasi Vendor' && (
          <>
            {isAddingNewVendor ? (
              <EstimasiVendorForm onBack={() => setIsAddingNewVendor(false)} />
            ) : (
              <EstimasiVendorList onAddNew={() => setIsAddingNewVendor(true)} />
            )}
          </>
        )}

        {/* VIEW: HITUNG KERTAS - Layout Cetak */}
        {activeNav === 'Hitung Kertas' && activeSubNav === 'Layout Cetak' && (
          <LayoutCetak />
        )}

        {/* VIEW: HITUNG KERTAS - Kalkulator Buku */}
        {activeNav === 'Hitung Kertas' && activeSubNav === 'Kalkulator Buku' && (
          <KalkulatorBuku />
        )}

        {/* VIEW: HITUNG KERTAS - Potong Piano */}
        {activeNav === 'Hitung Kertas' && activeSubNav === 'Potong Piano' && (
          <PotongPiano />
        )}

        {/* VIEW: HITUNG KERTAS - Estimasi Waktu */}
        {activeNav === 'Hitung Kertas' && activeSubNav === 'Estimasi Waktu' && (
          <EstimasiWaktu />
        )}

        {/* VIEW: MASTER DATA */}
        {activeNav === 'Master Data' && (
          <MasterData />
        )}

      </div>
    </div>
  );
}
