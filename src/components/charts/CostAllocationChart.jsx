import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { COST_ALLOCATION_DATA } from '../../data/mockData';

export default function CostAllocationChart() {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Grid ticks: 0% to 90%
  const gridTicks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];
  const maxScale = 90; // max scale 90%

  const handleMouseMove = (item, e) => {
    setHoveredItem(item);
    setTooltipPos({
      x: e.clientX,
      y: e.clientY,
    });
  };

  return (
    <div className="dashboard-card cost-allocation-card">
      {/* Header */}
      <div className="card-header allocation-header">
        <div className="card-icon-title">
          <div className="card-mini-icon">
            <BarChart3 size={16} />
          </div>
          <div>
            <h3 className="card-title">Alokasi Komponen Biaya</h3>
            <p className="card-subtitle">Distribusi biaya per kategori · hover untuk detail</p>
          </div>
        </div>

        {/* Legend on Top Right */}
        <div className="allocation-legends">
          {COST_ALLOCATION_DATA.map((item) => (
            <div 
              key={item.id} 
              className={`legend-item ${hoveredItem?.id === item.id ? 'is-highlighted' : ''}`}
              onMouseEnter={(e) => handleMouseMove(item, e)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span className="legend-dot" style={{ backgroundColor: item.color }} />
              <span className="legend-text">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Horizontal Bar Chart Container */}
      <div className="horizontal-bars-container">
        {/* Bars List */}
        <div className="bars-rows-list">
          {COST_ALLOCATION_DATA.map((item) => {
            const widthPercent = (item.percentage / maxScale) * 100;
            const isHovered = hoveredItem?.id === item.id;

            return (
              <div 
                key={item.id} 
                className={`bar-row-item ${isHovered ? 'is-hovered' : ''}`}
                onMouseEnter={(e) => handleMouseMove(item, e)}
                onMouseMove={(e) => handleMouseMove(item, e)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* Y-Axis Label */}
                <span className="bar-row-label">{item.label}</span>

                {/* Track and Fill */}
                <div className="bar-row-track-wrapper">
                  {/* Grid Lines Background */}
                  <div className="bar-track-grid-lines">
                    {gridTicks.map((tick) => (
                      <div 
                        key={tick} 
                        className="grid-vertical-line" 
                        style={{ left: `${(tick / maxScale) * 100}%` }}
                      />
                    ))}
                  </div>

                  {/* Colored Filled Bar */}
                  <div className="bar-fill-wrapper" style={{ width: `${widthPercent}%` }}>
                    <div 
                      className="bar-row-fill"
                      style={{
                        backgroundColor: item.color,
                        boxShadow: isHovered ? `0 4px 12px ${item.color}55` : 'none',
                      }}
                    />
                  </div>

                  {/* Percentage Label at the end of the bar */}
                  <span 
                    className="bar-row-percent-text"
                    style={{
                      left: `calc(${widthPercent}% + 8px)`,
                      color: isHovered ? item.color : '#64748B',
                    }}
                  >
                    {item.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* X-Axis Scale at Bottom */}
        <div className="horizontal-bars-xaxis">
          <div className="xaxis-labels-offset">
            {gridTicks.map((tick) => (
              <span 
                key={tick} 
                className="xaxis-tick-label"
                style={{ left: `${(tick / maxScale) * 100}%` }}
              >
                {tick}%
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredItem && (
        <div 
          className="chart-tooltip rich-allocation-tooltip"
          style={{
            position: 'fixed',
            left: `${tooltipPos.x + 15}px`,
            top: `${tooltipPos.y - 120}px`,
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        >
          <div className="tooltip-header-row">
            <div className="tooltip-title-group">
              <span 
                className="tooltip-dot" 
                style={{ backgroundColor: hoveredItem.color }}
              />
              <span 
                className="tooltip-category-title"
                style={{ color: hoveredItem.color }}
              >
                {hoveredItem.label}
              </span>
            </div>
            <span className="tooltip-percentage-value">
              {hoveredItem.percentage}%
            </span>
          </div>

          <p className="tooltip-desc">{hoveredItem.description}</p>
          <div className="tooltip-exact-amount">{hoveredItem.exactValue}</div>

          <ul className="tooltip-items-list">
            {hoveredItem.items.map((it, idx) => (
              <li key={idx} className="tooltip-bullet-item">
                <span className="bullet-point">•</span>
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
