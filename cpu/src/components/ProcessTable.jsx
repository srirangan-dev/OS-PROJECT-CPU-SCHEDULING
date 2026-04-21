import React from 'react';

const ProcessTable = ({ processes, onAdd, onRemoveLast, onResetDefault, onProcessChange, onDeleteProcess }) => {
  const handleChange = (id, field, value) => {
    const process = processes.find(p => p.id === id);
    if (process) {
      const updated = { ...process, [field]: parseInt(value) || 0 };
      if (field === 'burst' && updated.burst < 1) updated.burst = 1;
      onProcessChange(updated);
    }
  };

  return (
    <>
      <div className="section-header">📋 Process Table</div>
      <div className="table-responsive">
        <table className="process-table">
          <thead>
            <tr>
              <th>PID</th>
              <th>Arrival</th>
              <th>Burst</th>
              <th>Priority</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {processes.map(proc => (
              <tr key={proc.id}>
                <td>{proc.pid}</td>
                <td>
                  <input
                    type="number"
                    id={`arrival-${proc.id}`}
                    value={proc.arrival}
                    min="0"
                    onChange={(e) => handleChange(proc.id, 'arrival', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    id={`burst-${proc.id}`}
                    value={proc.burst}
                    min="1"
                    onChange={(e) => handleChange(proc.id, 'burst', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    id={`priority-${proc.id}`}
                    value={proc.priority}
                    min="1"
                    onChange={(e) => handleChange(proc.id, 'priority', e.target.value)}
                  />
                </td>
                <td>
                  <button className="del-btn" id={`delete-${proc.id}`} onClick={() => onDeleteProcess(proc.id)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="button-group">
        <button className="btn" id="add-process-btn" onClick={onAdd}>＋ Add Process</button>
        <button className="btn btn-secondary" id="remove-last-btn" onClick={onRemoveLast}>－ Remove Last</button>
        <button className="btn btn-secondary" id="reset-btn" onClick={onResetDefault}>↻ Reset Default</button>
      </div>
    </>
  );
};

export default ProcessTable;