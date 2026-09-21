import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { REALISASI_COMPARISON_DATA } from '../../data/mockData';

export default function RealisasiComparisonCard() {
  const [hoveredBar, setHoveredBar] = useState(null);
  const { estimasi, realisasi } = REALISASI_COMPARISON_DATA;

  return (
    <div className="dashboard-card realisasi-comparison-card">
      {/* Header */}
      <div className="card-header realisasi-header">
        <div className="card-icon-title">
          <div className="card-mini-icon">
            <TrendingUp size={16} />
          </div>
          <div>
            <h3 className="card-title">Estimasi vs Realisasi</h3>
          </div>
        </div>
      </div>

      {/* Main Body: Left Legend + Right Bar Chart */}
      <div className="realisasi-body-split">
        {/* Left: Legend */}
        <div className="realisasi-vertical-legend">
          <div className="realisasi-legend-row">
            <span className="legend-square" style={{ backgroundColor: estimasi.color }} />
            <div className="legend-row-text">
              <span>Estimasi</span>
              <span className="legend-subtext">(Internal + Vendor)</span>
            </div>
          </div>
          <div className="realisasi-legend-row">
            <span className="legend-square" style={{ backgroundColor: realisasi.color }} />
            <div className="legend-row-text">
              <span>Realisasi</span>
            </div>
          </div>
        </div>

        {/* Right: Bar Chart */}
        <div className="realisasi-chart-col">
          <div className="realisasi-chart-wrapper">
            {/* Top subtle dashed line */}
            <div className="realisasi-dashed-guide"></div>

            {/* Bars */}
            <div className="realisasi-bars-group">
              {/* Estimasi Bar */}
              <div 
                className={`realisasi-bar-col ${hoveredBar === 'estimasi' ? 'is-hovered' : ''}`}
                onMouseEnter={() => setHoveredBar('estimasi')}
                onMouseLeave={() => setHoveredBar(null)}
              >
                <div className="realisasi-bar-value-top">
                  {estimasi.amountFormatted || 'Rp 18.4jt'}
                </div>

                <div className="realisasi-bar-track">
                  <div 
                    className="realisasi-bar-fill"
                    style={{
                      height: '80px',
                      backgroundColor: estimasi.color,
                      boxShadow: hoveredBar === 'estimasi' ? `0 4px 12px ${estimasi.color}55` : 'none',
                    }}
                  />
                </div>

                <span className="realisasi-bar-label">{estimasi.label || 'Estimasi'}</span>
              </div>

              {/* Realisasi Bar */}
              <div 
                className={`realisasi-bar-col ${hoveredBar === 'realisasi' ? 'is-hovered' : ''}`}
                onMouseEnter={() => setHoveredBar('realisasi')}
                onMouseLeave={() => setHoveredBar(null)}
              >
                <div className="realisasi-bar-value-top">
                  {realisasi.amountFormatted || 'Rp 2.1jt'}
                </div>

                <div className="realisasi-bar-track">
                  <div 
                    className="realisasi-bar-fill"
                    style={{
                      height: '18px',
                      backgroundColor: realisasi.color,
                      boxShadow: hoveredBar === 'realisasi' ? `0 4px 12px ${realisasi.color}55` : 'none',
                    }}
                  />
                </div>

                <span className="realisasi-bar-label">{realisasi.label || 'Realisasi'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
