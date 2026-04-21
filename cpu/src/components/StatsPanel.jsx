import React from 'react';

const StatItem = ({ icon, label, value }) => (
  <div className="stat-card">
    <span className="stat-icon">{icon}</span>
    <div className="stat-content">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  </div>
);

const StatsPanel = ({ metrics }) => {
  return (
    <div className="stats-panel" id="stats-panel">
      <StatItem icon="⏱️" label="Avg Turnaround" value={metrics?.avgTurnaround ?? '—'} />
      <StatItem icon="⏳" label="Avg Waiting" value={metrics?.avgWaiting ?? '—'} />
      <StatItem icon="📈" label="Throughput" value={metrics ? `${metrics.throughput} p/u` : '—'} />
      <StatItem icon="🏁" label="Completion" value={metrics?.completionTime ?? '—'} />
    </div>
  );
};

export default StatsPanel;