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
            <h3 className="card-title">Total Nilai Realisasi</h3>
          </div>
        </div>
      </div>

      {/* Main Split Body: Left Bar Chart + Right Vertical Legend */}
      <div className="realisasi-body-split">
        {/* Left: Bar Chart */}
        <div className="realisasi-chart-col">
          <div className="realisasi-chart-wrapper">
            {/* Grid Lines */}
            <div className="realisasi-grid-bg">
              <div className="realisasi-grid-line">
                <span className="grid-tick-text">20jt</span>
              </div>
              <div className="realisasi-grid-line">
                <span className="grid-tick-text">10jt</span>
              </div>
              <div className="realisasi-grid-line">
                <span className="grid-tick-text">0</span>
              </div>
            </div>

            {/* Bars */}
            <div className="realisasi-bars-group">
              {/* Estimasi Bar */}
              <div 
                className={`realisasi-bar-col ${hoveredBar === 'estimasi' ? 'is-hovered' : ''}`}
                onMouseEnter={() => setHoveredBar('estimasi')}
                onMouseLeave={() => setHoveredBar(null)}
              >
                <div className="realisasi-bar-value-top">
                  <span className="bar-val-prefix">Rp</span>
                  <span className="bar-val-main">18.4jt</span>
                </div>

                <div className="realisasi-bar-track">
                  <div 
                    className="realisasi-bar-fill"
                    style={{
                      height: '92%',
                      backgroundColor: estimasi.color,
                      boxShadow: hoveredBar === 'estimasi' ? `0 6px 18px ${estimasi.color}66` : `0 2px 8px ${estimasi.color}33`,
                    }}
                  />
                </div>

                <span className="realisasi-bar-label">{estimasi.label}</span>
              </div>

              {/* Realisasi Bar */}
              <div 
                className={`realisasi-bar-col ${hoveredBar === 'realisasi' ? 'is-hovered' : ''}`}
                onMouseEnter={() => setHoveredBar('realisasi')}
                onMouseLeave={() => setHoveredBar(null)}
              >
                <div className="realisasi-bar-value-top">
                  <span className="bar-val-prefix">Rp</span>
                  <span className="bar-val-main">2.1jt</span>
                </div>

                <div className="realisasi-bar-track">
                  <div 
                    className="realisasi-bar-fill"
                    style={{
                      height: '24%',
                      backgroundColor: realisasi.color,
                      boxShadow: hoveredBar === 'realisasi' ? `0 6px 18px ${realisasi.color}66` : `0 2px 8px ${realisasi.color}33`,
                    }}
                  />
                </div>

                <span className="realisasi-bar-label">{realisasi.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Vertical Legend (Atas Estimasi, Bawah Realisasi) */}
        <div className="realisasi-vertical-legend">
          <div className="realisasi-legend-row">
            <span className="legend-dot" style={{ backgroundColor: estimasi.color }} />
            <span className="legend-row-text">{estimasi.subLabel || estimasi.label}</span>
          </div>
          <div className="realisasi-legend-row">
            <span className="legend-dot" style={{ backgroundColor: realisasi.color }} />
            <span className="legend-row-text">{realisasi.subLabel || realisasi.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
