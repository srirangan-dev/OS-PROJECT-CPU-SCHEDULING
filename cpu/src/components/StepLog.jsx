import React from 'react';

const StepLog = ({ steps }) => {
  return (
    <>
      <div className="section-header" style={{ marginTop: 20 }}>🔍 Step-by-Step Execution Log</div>
      <div className="step-log" id="step-log">
        {steps.length === 0 ? (
          <div className="step-empty">No simulation yet — add processes &amp; run.</div>
        ) : (
          steps.map((step, idx) => (
            <div key={idx} className="step-entry">
              <span className="step-index">{String(idx + 1).padStart(2, '0')}</span>
              {step}
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default StepLog;