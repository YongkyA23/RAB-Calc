import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { RAB_STATUS_DATA } from '../../data/mockData';

export default function TotalEstimasiCard() {
  const [hoveredStatus, setHoveredStatus] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (item, e) => {
    setHoveredStatus(item);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredStatus(null);
  };

  return (
    <div className="dashboard-card total-estimasi-card" onMouseMove={handleMouseMove}>
      <div className="card-header">
        <div className="card-icon-title">
          <div className="card-mini-icon">
            <FileText size={16} />
          </div>
          <div>
            <h3 className="card-title">Total Estimasi</h3>
            <p className="card-subtitle">Hover status untuk rincian</p>
          </div>
        </div>
      </div>

      <div className="rab-hero-section">
        <span className="rab-big-number">{RAB_STATUS_DATA.total}</span>
        <span className="rab-badge-label">{RAB_STATUS_DATA.label}</span>
      </div>

      {/* Multi-segmented Colored Bar with Interactive Hover */}
      <div className="rab-multi-progress-bar">
        {RAB_STATUS_DATA.breakdown.map((item, idx) => {
          const isHovered = hoveredStatus?.id === item.id;
          return (
            <div
              key={idx}
              className="rab-segment-fill"
              style={{
                width: item.percentage,
                backgroundColor: item.color,
                opacity: hoveredStatus && !isHovered ? 0.45 : 1,
                transform: isHovered ? 'scaleY(1.3)' : 'none',
                filter: isHovered ? `drop-shadow(0 2px 6px ${item.color}88)` : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => handleMouseEnter(item, e)}
              onMouseLeave={handleMouseLeave}
            />
          );
        })}
      </div>

      {/* Status Pill Grid with Percentages & Active State */}
      <div className="rab-status-grid">
        {RAB_STATUS_DATA.breakdown.map((item, idx) => {
          const isHovered = hoveredStatus?.id === item.id;
          return (
            <div
              key={idx}
              className={`rab-status-pill ${isHovered ? 'is-hovered' : ''}`}
              style={{
                cursor: 'pointer',
                borderColor: isHovered ? item.color : undefined,
                backgroundColor: isHovered ? '#FFFFFF' : undefined,
                boxShadow: isHovered ? `0 2px 8px ${item.color}25` : undefined,
              }}
              onMouseEnter={(e) => handleMouseEnter(item, e)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="rab-status-pill-left">
                <span className="rab-item-dot" style={{ backgroundColor: item.color }} />
                <span className="rab-item-name">{item.label}</span>
              </div>
              <div className="rab-status-pill-right" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#94A3B8' }}>{item.percentage}</span>
                <span className="rab-item-count" style={{ color: item.color, fontWeight: 800 }}>{item.count}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Detailed Hover Tooltip */}
      {hoveredStatus && (
        <div
          className="chart-tooltip"
          style={{
            top: `${tooltipPos.y - 110}px`,
            left: `${tooltipPos.x - 70}px`,
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: 9999,
            minWidth: '180px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '10px 14px', background: '#0F172A', color: '#FFFFFF', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: hoveredStatus.color }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>{hoveredStatus.label}</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 800, color: hoveredStatus.color }}>{hoveredStatus.percentage}</span>
            </div>
            <div style={{ fontSize: '12px', color: '#E2E8F0', fontWeight: 600 }}>
              {hoveredStatus.count} dari {RAB_STATUS_DATA.total} RAB
            </div>
            {hoveredStatus.desc && (
              <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '2px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '4px' }}>
                {hoveredStatus.desc}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
