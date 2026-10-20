import React, { useState } from 'react';
import {
  X,
  Search,
  Star,
  Trash2,
  RotateCcw,
  Download,
  Clock,
  CheckCircle,
} from 'lucide-react';

export default function HistoryDrawer({
  isOpen,
  onClose,
  history,
  onSelectCalculation,
  onToggleFavorite,
  onDeleteCalculation,
  onClearHistory,
  dbStatus,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'favorites'

  if (!isOpen) return null;

  // Filter calculations based on search and tab
  const filteredList = history.filter((item) => {
    const matchesTab = activeTab === 'all' || (activeTab === 'favorites' && item.isFavorite);
    if (!matchesTab) return false;

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (item.expression && item.expression.toLowerCase().includes(term)) ||
      (item.result && item.result.toLowerCase().includes(term))
    );
  });

  const favoritesCount = history.filter((i) => i.isFavorite).length;

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `omni-calc-history-${Date.now()}.json`);
    dlAnchorElem.click();
  };

  const formatTimestamp = (ts) => {
    if (!ts) return '';
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + d.toLocaleDateString();
    } catch {
      return '';
    }
  };

  return (
    <div className="history-drawer-overlay" onClick={onClose}>
      <aside
        className="history-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Calculation History"
      >
        {/* Header */}
        <div className="history-header">
          <div className="history-title">
            <Clock size={20} color="#818cf8" />
            <span>Calculation History</span>
          </div>
          <button
            id="close-history-btn"
            className="control-icon-btn"
            onClick={onClose}
            aria-label="Close History"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="history-search-bar">
          <Search size={16} color="#64748b" />
          <input
            id="history-search-input"
            type="text"
            className="history-search-input"
            placeholder="Search calculations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{ color: '#64748b', fontSize: '0.8rem' }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="history-filter-tabs">
          <button
            id="tab-history-all"
            className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All ({history.length})
          </button>
          <button
            id="tab-history-fav"
            className={`filter-tab ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            ★ Starred ({favoritesCount})
          </button>
        </div>

        {/* History List */}
        <div className="history-list" id="history-items-container">
          {filteredList.length === 0 ? (
            <div className="history-empty">
              <Clock size={36} opacity={0.3} />
              <p>No calculations found</p>
              <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                {activeTab === 'favorites'
                  ? 'Star your favorite calculations to see them here'
                  : 'Your calculations will be saved to MongoDB automatically'}
              </span>
            </div>
          ) : (
            filteredList.map((item) => {
              const itemId = item._id || item.id;
              return (
                <div
                  key={itemId}
                  className="history-item"
                  onClick={() => onSelectCalculation(item)}
                  title="Click to load into calculator"
                >
                  <div className="history-item-top">
                    <span className="history-expr">{item.expression}</span>
                    <div className="history-actions" onClick={(e) => e.stopPropagation()}>
                      {/* Star Button */}
                      <button
                        className={`item-action-btn star ${item.isFavorite ? 'starred' : ''}`}
                        onClick={() => onToggleFavorite(itemId)}
                        title={item.isFavorite ? 'Remove star' : 'Add star'}
                        aria-label="Star calculation"
                      >
                        <Star
                          size={14}
                          fill={item.isFavorite ? '#f59e0b' : 'none'}
                          stroke={item.isFavorite ? '#f59e0b' : 'currentColor'}
                        />
                      </button>

                      {/* Delete item */}
                      <button
                        className="item-action-btn delete"
                        onClick={() => onDeleteCalculation(itemId)}
                        title="Delete calculation"
                        aria-label="Delete calculation"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="history-result">= {item.result}</div>

                  <div className="history-meta">
                    <span>{item.type ? item.type.toUpperCase() : 'STANDARD'}</span>
                    <span>{formatTimestamp(item.createdAt || item.timestamp)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="history-footer">
          <button
            id="btn-export-history"
            className="history-footer-btn"
            onClick={handleExportJSON}
            disabled={history.length === 0}
            title="Download history as JSON"
          >
            <Download size={14} />
            <span>Export</span>
          </button>

          <button
            id="btn-clear-history"
            className="history-footer-btn danger"
            onClick={onClearHistory}
            disabled={history.length === 0}
            title="Delete all history from MongoDB"
          >
            <Trash2 size={14} />
            <span>Clear All</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
