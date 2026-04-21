import React from 'react';

const ControlPanel = ({ algorithm, onAlgorithmChange, quantum, onQuantumChange, onSimulate }) => {
  return (
    <>
      <div className="section-header">🎛️ Algorithm Selection</div>
      <select id="algorithm-select" value={algorithm} onChange={(e) => onAlgorithmChange(e.target.value)}>
        <option value="fcfs">FCFS (First Come First Serve)</option>
        <option value="sjf">SJF (Non-preemptive Shortest Job First)</option>
        <option value="priorityNP">Priority (Non-preemptive, lower = higher)</option>
        <option value="priorityP">Priority (Preemptive, lower = higher)</option>
        <option value="rr">Round Robin (Time Quantum)</option>
      </select>

      {algorithm === 'rr' && (
        <div className="control-group">
          <label htmlFor="quantum-input">⏱️ Time Quantum:</label>
          <input
            type="number"
            id="quantum-input"
            value={quantum}
            min="1"
            max="20"
            onChange={(e) => onQuantumChange(parseInt(e.target.value) || 1)}
          />
        </div>
      )}

      <button className="btn simulate-btn" id="simulate-btn" onClick={onSimulate}>
        🚀 Run Simulation
      </button>
    </>
  );
};

export default ControlPanel;