import React from 'react';

const COLORS = [
  '#3b82f6',  // blue
  '#14b8a6',  // teal
  '#a855f7',  // purple
  '#f59e0b',  // amber
  '#ef4444',  // red
  '#06b6d4',  // cyan
  '#84cc16',  // lime
  '#ec4899',  // pink
  '#6366f1',  // indigo
  '#10b981',  // emerald
];

const GanttChart = ({ gantt }) => {
  if (!gantt.length) {
    return (
      <div className="gantt-wrapper">
        <div className="gantt-empty">
          <span className="gantt-empty-icon">📊</span>
          <span>Click <strong>Run Simulation</strong> to visualize scheduling</span>
        </div>
      </div>
    );
  }

  const totalTime = Math.max(...gantt.map(seg => seg.end), 0);

  const getColor = (pid) => {
    const num = parseInt(pid.replace('P', '')) || 1;
    return COLORS[(num - 1) % COLORS.length];
  };

  return (
    <div className="gantt-wrapper" id="gantt-chart">
      <div>Timeline (units)</div>
      <div className="gantt-row">
        <div className="gantt-label">CPU</div>
        {gantt.map((seg, idx) => {
          const widthPercent = ((seg.end - seg.start) / (totalTime + 0.001)) * 100;
          const color = getColor(seg.pid);
          return (
            <div
              key={idx}
              className="gantt-block"
              style={{
                width: `max(3.5%, ${widthPercent}%)`,
                background: `linear-gradient(180deg, ${color}ee, ${color}bb)`,
              }}
              title={`${seg.pid}: ${seg.start} → ${seg.end}`}
            >
              {seg.pid}
              <span className="gantt-block-time">{seg.start}–{seg.end}</span>
            </div>
          );
        })}
      </div>
      <div className="gantt-time-scale">
        {Array.from({ length: Math.min(11, Math.floor(totalTime) + 1) }, (_, i) => {
          const tick = Math.floor((i * totalTime) / 10);
          return <span key={i}>{tick}</span>;
        })}
      </div>
    </div>
  );
};

export default GanttChart;