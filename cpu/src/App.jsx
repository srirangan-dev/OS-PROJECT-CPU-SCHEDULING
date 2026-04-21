import React, { useState, useCallback, useRef } from 'react';
import ProcessTable from './components/ProcessTable';
import ControlPanel from './components/ControlPanel';
import GanttChart from './components/GanttChart';
import StepLog from './components/StepLog';
import StatsPanel from './components/StatsPanel';
import { runCPUSimulation } from './utils/scheduler';
import './App.css';

const DEFAULT_PROCESSES = [
  { id: 'p1', pid: 'P1', arrival: 0, burst: 6, priority: 2 },
  { id: 'p2', pid: 'P2', arrival: 2, burst: 4, priority: 1 },
  { id: 'p3', pid: 'P3', arrival: 4, burst: 2, priority: 3 },
];

function App() {
  const [processes, setProcesses] = useState(DEFAULT_PROCESSES);
  const [algorithm, setAlgorithm] = useState('fcfs');
  const [quantum, setQuantum] = useState(3);
  const [simulationResult, setSimulationResult] = useState(null);
  const nextIdRef = useRef(4);

  const handleAddProcess = () => {
    const newId = `p${nextIdRef.current}`;
    const newPid = `P${nextIdRef.current}`;
    nextIdRef.current += 1;
    setProcesses(prev => [...prev, {
      id: newId,
      pid: newPid,
      arrival: 0,
      burst: 3,
      priority: 2,
    }]);
  };

  const handleRemoveLast = () => {
    setProcesses(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
  };

  const handleResetDefault = () => {
    setProcesses(DEFAULT_PROCESSES);
    nextIdRef.current = 4;
  };

  const handleProcessChange = (updatedProcess) => {
    setProcesses(prev => prev.map(p => p.id === updatedProcess.id ? updatedProcess : p));
  };

  const handleDeleteProcess = (id) => {
    setProcesses(prev => prev.length > 1 ? prev.filter(p => p.id !== id) : prev);
  };

  const handleSimulate = () => {
    const result = runCPUSimulation(processes, algorithm, quantum);
    setSimulationResult(result);
  };

  return (
    <div className="app-container">
      <div className="container">
        <h1 className="title">⚙️ CPU Scheduling Visualizer</h1>
        <div className="sub">
          Step-by-step execution | FCFS, SJF (non-preemptive), Priority (preemptive & non-preemptive), Round Robin
        </div>

        <div className="flex-panel">
          <div className="input-card">
            <ProcessTable
              processes={processes}
              onAdd={handleAddProcess}
              onRemoveLast={handleRemoveLast}
              onResetDefault={handleResetDefault}
              onProcessChange={handleProcessChange}
              onDeleteProcess={handleDeleteProcess}
            />
          </div>
          <div className="sim-card">
            <ControlPanel
              algorithm={algorithm}
              onAlgorithmChange={setAlgorithm}
              quantum={quantum}
              onQuantumChange={setQuantum}
              onSimulate={handleSimulate}
            />
            <GanttChart gantt={simulationResult?.gantt || []} />
            <StepLog steps={simulationResult?.steps || []} />
            <StatsPanel metrics={simulationResult?.metrics || null} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;