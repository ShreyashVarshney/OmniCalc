import React from 'react';
import {
  Calculator,
  History,
  Volume2,
  VolumeX,
  Palette,
  Database,
  Layers,
  Binary,
  ArrowRightLeft,
  Sparkles,
} from 'lucide-react';

export default function Header({
  activeMode,
  setActiveMode,
  dbStatus,
  onOpenStatusModal,
  onOpenHistory,
  historyCount,
  isMuted,
  onToggleMute,
  theme,
  onCycleTheme,
}) {
  const modes = [
    { id: 'standard', label: 'Basic', icon: Calculator },
    { id: 'scientific', label: 'Scientific', icon: Sparkles },
    { id: 'converter', label: 'Converter', icon: ArrowRightLeft },
    { id: 'programmer', label: 'Programmer', icon: Binary },
  ];

  return (
    <header className="calc-header">
      <div className="header-top">
        {/* Brand */}
        <div className="brand-wrapper">
          <div className="brand-logo-icon" title="OmniCalc MERN Edition">
            <Calculator size={20} />
          </div>
          <div>
            <h1 className="brand-title">
              OmniCalc <span className="mern-pill">MERN</span>
            </h1>
          </div>
        </div>

        {/* Controls */}
        <div className="header-controls">
          {/* MongoDB Status Badge */}
          <button
            id="db-status-btn"
            className={`db-status-badge ${dbStatus?.usingFallback ? 'fallback' : ''}`}
            onClick={onOpenStatusModal}
            title={dbStatus?.isConnected ? 'Connected to MongoDB' : 'Running in fallback in-memory mode'}
          >
            <span className="status-dot"></span>
            <span>{dbStatus?.isConnected ? 'MongoDB' : 'Local DB'}</span>
          </button>

          {/* Theme Cycler */}
          <button
            id="theme-toggle-btn"
            className="control-icon-btn"
            onClick={onCycleTheme}
            title={`Switch Theme (Current: ${theme})`}
            aria-label="Toggle visual theme"
          >
            <Palette size={17} />
          </button>

          {/* Sound Mute/Unmute */}
          <button
            id="sound-toggle-btn"
            className={`control-icon-btn ${isMuted ? '' : 'active'}`}
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Audio Feedback' : 'Mute Audio Feedback'}
            aria-label="Toggle sound feedback"
          >
            {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>

          {/* History Drawer Toggle */}
          <button
            id="history-toggle-btn"
            className="control-icon-btn"
            onClick={onOpenHistory}
            title="Open Calculation History"
            aria-label="Open calculation history"
          >
            <History size={17} />
            {historyCount > 0 && (
              <span className="history-badge-count">
                {historyCount > 99 ? '99+' : historyCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <nav className="mode-tabs" aria-label="Calculator Modes">
        {modes.map((mode) => {
          const IconComponent = mode.icon;
          const isActive = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              id={`mode-tab-${mode.id}`}
              className={`mode-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveMode(mode.id)}
            >
              <IconComponent size={14} />
              <span>{mode.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
