import React from 'react';
import { TrendingUp, Building2 } from 'lucide-react';

export default function ProgressSummaryCards() {
  return (
    <div className="summary-cards-grid">
      {/* Total Nilai Estimasi Progress Card */}
      <div className="dashboard-card mini-summary-card">
        <div className="mini-card-top">
          <div className="mini-icon-title">
            <TrendingUp size={16} className="text-slate-500" />
            <span className="mini-card-title">Total Nilai Estimasi</span>
          </div>
        </div>

        <div className="mini-card-value">Rp 2.132.324</div>

        <div className="mini-progress-section">
          <div className="progress-labels">
            <span className="progress-desc">Progres vs Estimasi Internal</span>
            <span className="progress-percent">43.6%</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill-emerald" style={{ width: '43.6%' }} />
          </div>
          <div className="progress-footer">
            dari Rp 4.888.560 estimasi internal
          </div>
        </div>
      </div>

      {/* Estimasi Vendor Card */}
      <div className="dashboard-card mini-summary-card">
        <div className="mini-card-top">
          <div className="mini-icon-title">
            <Building2 size={16} className="text-slate-500" />
            <span className="mini-card-title">Estimasi Vendor</span>
          </div>
        </div>

        <div className="vendor-summary-value-row">
          <span className="vendor-count-number">1</span>
          <span className="vendor-count-unit">Quote Tersimpan</span>
        </div>

        <div className="vendor-card-footer">
          <span className="vendor-footer-label">Total Penawaran:</span>
          <span className="vendor-footer-amount">Rp 13.500.000</span>
        </div>
      </div>
    </div>
  );
}
