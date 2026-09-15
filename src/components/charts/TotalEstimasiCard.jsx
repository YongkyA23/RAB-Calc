import React from 'react';
import { FileText } from 'lucide-react';
import { RAB_STATUS_DATA } from '../../data/mockData';

export default function TotalEstimasiCard() {
  return (
    <div className="dashboard-card total-estimasi-card">
      <div className="card-header">
        <div className="card-icon-title">
          <div className="card-mini-icon">
            <FileText size={16} />
          </div>
          <div>
            <h3 className="card-title">Total Estimasi</h3>
          </div>
        </div>
      </div>

      <div className="rab-hero-section">
        <span className="rab-big-number">{RAB_STATUS_DATA.total}</span>
        <span className="rab-badge-label">{RAB_STATUS_DATA.label}</span>
      </div>

      {/* Multi-segmented Colored Bar */}
      <div className="rab-multi-progress-bar">
        {RAB_STATUS_DATA.breakdown.map((item, idx) => (
          <div
            key={idx}
            className="rab-segment-fill"
            style={{
              width: item.percentage,
              backgroundColor: item.color,
            }}
            title={`${item.label}: ${item.count} (${item.percentage})`}
          />
        ))}
      </div>

      {/* Breakdown List */}
      <div className="rab-breakdown-list">
        {RAB_STATUS_DATA.breakdown.map((item, idx) => (
          <div key={idx} className="rab-breakdown-row">
            <div className="rab-breakdown-left">
              <span className="rab-item-dot" style={{ backgroundColor: item.color }} />
              <span className="rab-item-name">{item.label}</span>
            </div>
            <div className="rab-breakdown-right">
              <span className="rab-item-count">{item.count}</span>
              <span className="rab-item-percent">{item.percentage}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
