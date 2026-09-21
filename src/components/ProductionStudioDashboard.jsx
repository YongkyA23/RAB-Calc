import React, { useState } from 'react';
import Sidebar from './Sidebar';
import CostDonutChart from './charts/CostDonutChart';
import CostAllocationChart from './charts/CostAllocationChart';
import TotalEstimasiCard from './charts/TotalEstimasiCard';
import RealisasiComparisonCard from './charts/RealisasiComparisonCard';
import ActivityTable from './ActivityTable';
import EstimasiHargaList from './estimasi/EstimasiHargaList';
import EstimasiHargaForm from './estimasi/EstimasiHargaForm';
import EstimasiHargaDetail from './estimasi/EstimasiHargaDetail';
import EstimasiVendorList from './vendor/EstimasiVendorList';
import EstimasiVendorForm from './vendor/EstimasiVendorForm';
import LayoutCetak from './hitungkertas/LayoutCetak';
import KalkulatorBuku from './hitungkertas/KalkulatorBuku';
import PotongPlano from './hitungkertas/PotongPlano';
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
  const [isViewingRAB, setIsViewingRAB] = useState(false);
  const [isAddingNewVendor, setIsAddingNewVendor] = useState(false);
  const [selectedRABData, setSelectedRABData] = useState(null);
  const [selectedVendorData, setSelectedVendorData] = useState(null);

  const handleNavigate = (nav, subNav) => {
    setActiveNav(nav);
    setActiveSubNav(subNav || (nav === 'Estimasi Harga' ? 'Estimasi Harga' : nav === 'Hitung Kertas' ? 'Layout Cetak' : ''));
    setIsAddingNewRAB(false);
    setIsViewingRAB(false);
    setSelectedRABData(null);
    setIsAddingNewVendor(false);
    setSelectedVendorData(null);
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
              <EstimasiHargaForm
                initialData={selectedRABData}
                onBack={() => {
                  if (isViewingRAB) {
                    // came from detail view — go back to detail
                    setIsAddingNewRAB(false);
                  } else {
                    setIsAddingNewRAB(false);
                    setSelectedRABData(null);
                  }
                }}
              />
            ) : isViewingRAB ? (
              <EstimasiHargaDetail
                data={selectedRABData}
                onBack={() => {
                  setIsViewingRAB(false);
                  setSelectedRABData(null);
                }}
                onEdit={() => {
                  setIsAddingNewRAB(true);
                }}
              />
            ) : (
              <EstimasiHargaList
                onAddNew={(itemData) => {
                  setSelectedRABData(itemData || null);
                  if (itemData && itemData.id) {
                    // existing item → detail view
                    setIsViewingRAB(true);
                  } else {
                    // new item (+ button) → form directly
                    setIsViewingRAB(false);
                    setIsAddingNewRAB(true);
                  }
                }}
              />
            )}
          </>
        )}

        {/* VIEW: ESTIMASI VENDOR */}
        {activeNav === 'Estimasi Harga' && activeSubNav === 'Estimasi Vendor' && (
          <>
            {isAddingNewVendor ? (
              <EstimasiVendorForm 
                initialData={selectedVendorData}
                onBack={() => {
                  setIsAddingNewVendor(false);
                  setSelectedVendorData(null);
                }} 
              />
            ) : (
              <EstimasiVendorList 
                onAddNew={(itemData) => {
                  setSelectedVendorData(itemData || null);
                  setIsAddingNewVendor(true);
                }} 
              />
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

        {/* VIEW: HITUNG KERTAS - Potong Plano */}
        {activeNav === 'Hitung Kertas' && activeSubNav === 'Potong Plano' && (
          <PotongPlano />
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
