import React, { useState } from 'react';
import { X, Database, CheckCircle, AlertTriangle, RefreshCw, Server, Cpu } from 'lucide-react';

export default function StatusModal({ isOpen, onClose, dbStatus, onRefreshStatus }) {
  const [pinging, setPinging] = useState(false);
  const [pingLatency, setPingLatency] = useState(null);

  if (!isOpen) return null;

  const handleTestPing = async () => {
    setPinging(true);
    const start = performance.now();
    try {
      await onRefreshStatus();
      const duration = Math.round(performance.now() - start);
      setPingLatency(`${duration} ms`);
    } catch {
      setPingLatency('Failed');
    } finally {
      setPinging(false);
    }
  };

  const isConnected = dbStatus?.isConnected;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="status-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="System & Database Status"
      >
        <div className="modal-header">
          <div className="modal-title">
            <Database size={20} color={isConnected ? '#10b981' : '#f59e0b'} />
            <span>MERN Stack Status</span>
          </div>
          <button
            id="close-status-modal-btn"
            className="control-icon-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Connection Status Highlight */}
          <div
            style={{
              padding: '0.9rem',
              borderRadius: '12px',
              background: isConnected
                ? 'rgba(16, 185, 129, 0.12)'
                : 'rgba(245, 158, 11, 0.12)',
              border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            {isConnected ? (
              <CheckCircle size={24} color="#10b981" />
            ) : (
              <AlertTriangle size={24} color="#f59e0b" />
            )}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: isConnected ? '#34d399' : '#fbbf24' }}>
                {isConnected ? 'MongoDB Connected' : 'In-Memory Safe Fallback'}
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {isConnected
                  ? 'Calculations are securely saved to your active MongoDB database.'
                  : 'Operating in high-speed fallback mode. Calculations are saved to server/data/calculations.json.'}
              </p>
            </div>
          </div>

          {/* Details Table */}
          <div className="status-info-box">
            <div className="info-row">
              <span className="info-label">Database Type</span>
              <span className="info-val">{dbStatus?.database?.type || (isConnected ? 'MongoDB' : 'In-Memory / File')}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Database Name</span>
              <span className="info-val">{dbStatus?.dbName || dbStatus?.database?.dbName || 'calculator'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">API Latency</span>
              <span className="info-val" style={{ color: '#38bdf8' }}>
                {pingLatency || '< 15 ms'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Server Target</span>
              <span className="info-val">http://localhost:5000</span>
            </div>
            <div className="info-row">
              <span className="info-label">Backend Service</span>
              <span className="info-val">Express.js &bull; Node {dbStatus?.nodeVersion || 'v24.x'}</span>
            </div>
          </div>

          {/* Atlas Connection Hint */}
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <p style={{ marginBottom: '0.4rem', fontWeight: 600 }}>
              Connecting to MongoDB Atlas (Cloud) or Custom URI:
            </p>
            <div className="code-block">
              # In server/.env<br />
              MONGODB_URI=mongodb+srv://&lt;user&gt;:&lt;password&gt;@cluster0.mongodb.net/calculator
            </div>
          </div>

          {/* Ping Refresh Button */}
          <button
            id="btn-ping-api"
            className="save-conversion-btn"
            onClick={handleTestPing}
            disabled={pinging}
            style={{ width: '100%' }}
          >
            <RefreshCw size={15} className={pinging ? 'spin' : ''} />
            <span>{pinging ? 'Checking API...' : 'Test API & Database Health'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
