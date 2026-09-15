import React, { useState } from 'react';
import { DollarSign } from 'lucide-react';
import { DONUT_DATA } from '../../data/mockData';

export default function CostDonutChart() {
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // SVG Donut calculation
  // Radius = 65, Center = (100, 100), StrokeWidth = 24
  const radius = 65;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  // Calculate segment stroke dashes
  let accumulatedPercent = 0;
  const segmentsWithDash = DONUT_DATA.map((item) => {
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -(accumulatedPercent / 100) * circumference;
    accumulatedPercent += item.percentage;
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const handleMouseEnter = (item, e) => {
    setHoveredSegment(item);
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseMove = (e) => {
    setTooltipPos({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseLeave = () => {
    setHoveredSegment(null);
  };

  return (
    <div className="dashboard-card donut-card">
      <div className="card-header">
        <div className="card-icon-title">
          <div className="card-mini-icon">
            <DollarSign size={16} />
          </div>
          <div>
            <h3 className="card-title">Total Nilai Estimasi</h3>
            <p className="card-subtitle">Termasuk vendor · hover untuk detail</p>
          </div>
        </div>
      </div>

      <div className="donut-chart-container" onMouseMove={handleMouseMove}>
        {/* SVG Donut */}
        <div className="donut-svg-wrapper">
          <svg viewBox="0 0 200 200" className="donut-svg">
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth={strokeWidth}
            />
            {segmentsWithDash.map((seg) => {
              const isHovered = hoveredSegment?.id === seg.id;
              return (
                <circle
                  key={seg.id}
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                  className="donut-segment"
                  onMouseEnter={(e) => handleMouseEnter(seg, e)}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    filter: isHovered ? `drop-shadow(0 4px 12px ${seg.color}66)` : 'none',
                    opacity: hoveredSegment && !isHovered ? 0.6 : 1,
                  }}
                />
              );
            })}
          </svg>

          {/* Donut Center Label */}
          <div className="donut-center-label">
            <span className="center-subtext">Total</span>
            <span className="center-primary">20.5jt</span>
            <span className="center-amount">Rp 20.520.884</span>
          </div>

          {/* Tooltip on Hover (Matching Image 4 Left) */}
          {hoveredSegment && (
            <div 
              className="chart-tooltip donut-tooltip"
              style={{
                top: `${tooltipPos.y - 120}px`,
                left: `${tooltipPos.x - 40}px`,
                position: 'fixed',
                pointerEvents: 'none',
                zIndex: 9999,
              }}
            >
              <div className="donut-tooltip-content">
                <span 
                  className="donut-tooltip-label"
                  style={{ color: hoveredSegment.color }}
                >
                  {hoveredSegment.label}
                </span>
                <div className="donut-tooltip-values">
                  <span className="donut-tooltip-amount">
                    {hoveredSegment.valueFormatted}
                  </span>
                  <span className="donut-tooltip-percent">
                    {hoveredSegment.exactPercentage}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend / Breakdown List with Progress Bars */}
        <div className="donut-breakdown-list">
          {DONUT_DATA.map((item) => {
            const isHovered = hoveredSegment?.id === item.id;
            return (
              <div
                key={item.id}
                className={`breakdown-item ${isHovered ? 'is-active' : ''}`}
                onMouseEnter={(e) => handleMouseEnter(item, e)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="breakdown-header">
                  <div className="breakdown-name-wrapper">
                    <span 
                      className="breakdown-dot" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="breakdown-name">{item.label}</span>
                  </div>
                  <span className="breakdown-percent" style={{ color: item.color }}>{item.percentage}%</span>
                </div>

                <div className="breakdown-amount">{item.valueFormatted}</div>

                <div className="breakdown-bar-track">
                  <div
                    className="breakdown-bar-fill"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card-divider" />

      {/* Grand Total Footer */}
      <div className="donut-footer">
        <span className="grand-total-label">Grand Total</span>
        <span className="grand-total-value">Rp 20.520.884</span>
      </div>
    </div>
  );
}
