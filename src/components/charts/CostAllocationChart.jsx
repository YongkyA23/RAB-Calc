import React, { useState, useRef } from 'react';
import { BarChart3 } from 'lucide-react';
import { COST_ALLOCATION_DATA } from '../../data/mockData';

export default function CostAllocationChart() {
  const [activeItem, setActiveItem] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // SVG Chart dimensions
  const svgWidth = 540;
  const svgHeight = 220;
  const padding = { top: 35, right: 35, bottom: 40, left: 45 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  // Y-axis grid: 0% to 50%
  const yTicks = [50, 40, 30, 20, 10, 0];
  const maxPercent = 50;

  // Points data ordered from left to right (Tambahan -> Tenaga -> Finishing -> Material)
  const chartPointsData = [...COST_ALLOCATION_DATA].reverse();

  // Calculate coordinates for the 4 points
  const points = chartPointsData.map((item, index) => {
    const x = padding.left + (index / (chartPointsData.length - 1)) * graphWidth;
    const y = padding.top + (1 - item.percentage / maxPercent) * graphHeight;
    return {
      ...item,
      x,
      y,
    };
  });

  // Create smooth Bezier spline path
  const createSmoothPath = (pts) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cx1 = p0.x + (p1.x - p0.x) / 2;
      const cy1 = p0.y;
      const cx2 = p0.x + (p1.x - p0.x) / 2;
      const cy2 = p1.y;
      d += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const linePath = createSmoothPath(points);
  const bottomY = padding.top + graphHeight;
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`;

  const handlePointHover = (item, e) => {
    setActiveItem(item);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleContainerMouseMove = (e) => {
    if (activeItem && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  return (
    <div 
      className="dashboard-card cost-allocation-card" 
      ref={containerRef}
      onMouseMove={handleContainerMouseMove}
    >
      {/* Card Header with Title & Legend */}
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

        {/* Legend */}
        <div className="allocation-legends">
          {COST_ALLOCATION_DATA.map((item) => (
            <div 
              key={item.id} 
              className={`legend-item ${activeItem?.id === item.id ? 'is-highlighted' : ''}`}
              onMouseEnter={(e) => handlePointHover(item, e)}
              onMouseLeave={() => setActiveItem(null)}
            >
              <span className="legend-dot" style={{ backgroundColor: item.color }} />
              <span className="legend-text">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Chart Container */}
      <div className="allocation-chart-wrapper">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="allocation-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Area Gradient */}
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0.28" />
              <stop offset="60%" stopColor="#A5B4FC" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#C7D2FE" stopOpacity="0.0" />
            </linearGradient>

            {/* Line Gradient */}
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#818CF8" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>

            {/* Glowing filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#6366F1" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Horizontal Grid Lines & Y-Axis Labels */}
          {yTicks.map((tick) => {
            const y = padding.top + (1 - tick / maxPercent) * graphHeight;
            return (
              <g key={tick} className="grid-group">
                <line
                  x1={padding.left}
                  y1={y}
                  x2={svgWidth - padding.right}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                  strokeDasharray={tick === 0 ? 'none' : '4 4'}
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="axis-label"
                >
                  {tick}%
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Spline Line */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3.2"
            strokeLinecap="round"
            filter="url(#glow)"
          />

          {/* Interactive Hover Vertical Guidelines & Hitboxes */}
          {points.map((pt) => {
            const isSelected = activeItem?.id === pt.id;
            return (
              <g 
                key={pt.id} 
                className="chart-interactive-node"
                onMouseEnter={(e) => handlePointHover(pt, e)}
                onMouseLeave={() => setActiveItem(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Vertical Dash Line when Hovered */}
                {isSelected && (
                  <line
                    x1={pt.x}
                    y1={padding.top}
                    x2={pt.x}
                    y2={bottomY}
                    stroke={pt.color}
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    opacity="0.8"
                  />
                )}

                {/* Invisible large hit area */}
                <rect
                  x={pt.x - 30}
                  y={padding.top}
                  width="60"
                  height={graphHeight + padding.bottom}
                  fill="transparent"
                />

                {/* Percentage Bubble above Node */}
                <g transform={`translate(${pt.x}, ${pt.y - 14})`}>
                  <rect
                    x="-18"
                    y="-12"
                    width="36"
                    height="16"
                    rx="8"
                    fill="#FFFFFF"
                    stroke="#E2E8F0"
                    strokeWidth="1"
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"
                  />
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    fill="#1E293B"
                    fontSize="9.5"
                    fontWeight="700"
                    fontFamily="inherit"
                  >
                    {pt.percentage}%
                  </text>
                </g>

                {/* Outer halo when hovered */}
                {isSelected && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="12"
                    fill={pt.color}
                    opacity="0.25"
                  />
                )}

                {/* Circle Marker */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? 6.5 : 5}
                  fill="#FFFFFF"
                  stroke={pt.color}
                  strokeWidth="3.5"
                  style={{
                    transition: 'all 0.2s ease',
                  }}
                />
              </g>
            );
          })}

          {/* X-Axis Category Labels and Values at Bottom */}
          {points.map((pt) => (
            <g key={`label-${pt.id}`} className="x-axis-label-group">
              <text
                x={pt.x}
                y={bottomY + 16}
                textAnchor="middle"
                className="category-name"
                fontWeight="600"
              >
                {pt.label}
              </text>
              <text
                x={pt.x}
                y={bottomY + 28}
                textAnchor="middle"
                className="category-subvalue"
              >
                {pt.summaryValue}
              </text>
            </g>
          ))}
        </svg>

        {/* Rich Hover Card Tooltip (Matching Image 4 Detail Card) */}
        {activeItem && (
          <div 
            className="chart-tooltip rich-allocation-tooltip"
            style={{
              left: `${Math.min(Math.max(mousePos.x - 140, 20), 300)}px`,
              top: `${Math.max(mousePos.y - 230, -10)}px`,
            }}
          >
            {/* Header: Dot + Label and Percentage */}
            <div className="tooltip-header-row">
              <div className="tooltip-title-group">
                <span 
                  className="tooltip-dot" 
                  style={{ backgroundColor: activeItem.color }}
                />
                <span 
                  className="tooltip-category-title"
                  style={{ color: activeItem.color }}
                >
                  {activeItem.label}
                </span>
              </div>
              <span className="tooltip-percentage-value">
                {activeItem.percentage}%
              </span>
            </div>

            {/* Subtitle description */}
            <p className="tooltip-desc">{activeItem.description}</p>

            {/* Exact Rupiah Value */}
            <div className="tooltip-exact-amount">
              {activeItem.exactValue}
            </div>

            {/* Bullet items list */}
            <ul className="tooltip-items-list">
              {activeItem.items.map((it, idx) => (
                <li key={idx} className="tooltip-bullet-item">
                  <span className="bullet-point">•</span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
