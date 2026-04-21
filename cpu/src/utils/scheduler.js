export const runCPUSimulation = (processes, algorithm, quantum = 3) => {
  // Deep copy processes with remaining burst
  let procList = processes.map(p => ({
    ...p,
    remaining: p.burst,
    originalBurst: p.burst,
  }));

  let currentTime = 0;
  const gantt = [];
  const steps = [];
  const completion = {};

  const addStep = (msg) => steps.push(`[T=${currentTime}] ${msg}`);

  // Helper: get ready processes (arrived and remaining > 0)
  const getReadyQueue = () => procList.filter(p => p.arrival <= currentTime && p.remaining > 0);

  if (algorithm === 'fcfs') {
    const sorted = [...procList].sort((a, b) => a.arrival - b.arrival);
    for (const p of sorted) {
      if (p.remaining <= 0) continue;
      if (currentTime < p.arrival) {
        addStep(`CPU idle until arrival of ${p.pid} at time ${p.arrival}`);
        currentTime = p.arrival;
      }
      const start = currentTime;
      addStep(`${p.pid} starts execution (burst left ${p.remaining})`);
      currentTime += p.remaining;
      p.remaining = 0;
      gantt.push({ pid: p.pid, start, end: currentTime });
      completion[p.pid] = currentTime;
      addStep(`${p.pid} completes at time ${currentTime}`);
    }
  } 
  else if (algorithm === 'sjf') {
    let completed = 0;
    while (completed < procList.length) {
      let ready = getReadyQueue();
      if (ready.length === 0) {
        const nextArrival = Math.min(...procList.filter(p => p.remaining > 0).map(p => p.arrival));
        addStep(`CPU idle until next arrival at ${nextArrival}`);
        currentTime = nextArrival;
        continue;
      }
      ready.sort((a, b) => a.remaining - b.remaining);
      const p = ready[0];
      const start = currentTime;
      addStep(`${p.pid} (burst ${p.remaining}) selected by SJF, starts now.`);
      currentTime += p.remaining;
      p.remaining = 0;
      gantt.push({ pid: p.pid, start, end: currentTime });
      completion[p.pid] = currentTime;
      addStep(`${p.pid} finishes at ${currentTime}`);
      completed++;
    }
  }
  else if (algorithm === 'priorityNP') {
    let completed = 0;
    while (completed < procList.length) {
      let ready = getReadyQueue();
      if (ready.length === 0) {
        const nextArrival = Math.min(...procList.filter(p => p.remaining > 0).map(p => p.arrival));
        addStep(`Idle till next arrival at ${nextArrival}`);
        currentTime = nextArrival;
        continue;
      }
      ready.sort((a, b) => a.priority - b.priority);
      const p = ready[0];
      const start = currentTime;
      addStep(`Non-preemptive: Highest priority (${p.priority}) => ${p.pid} runs for ${p.remaining} units.`);
      currentTime += p.remaining;
      p.remaining = 0;
      gantt.push({ pid: p.pid, start, end: currentTime });
      completion[p.pid] = currentTime;
      addStep(`${p.pid} completed at ${currentTime}`);
      completed++;
    }
  }
  else if (algorithm === 'priorityP') {
    let lastPid = null;
    let segmentStart = currentTime;
    while (true) {
      if (procList.every(p => p.remaining === 0)) break;
      let ready = getReadyQueue();
      if (ready.length === 0) {
        const nextArrival = Math.min(...procList.filter(p => p.remaining > 0).map(p => p.arrival));
        if (lastPid !== null) {
          gantt.push({ pid: lastPid, start: segmentStart, end: currentTime });
          lastPid = null;
        }
        addStep(`Idle until arrival at ${nextArrival}`);
        currentTime = nextArrival;
        continue;
      }
      ready.sort((a, b) => a.priority - b.priority);
      const currentProc = ready[0];
      if (lastPid !== currentProc.pid) {
        if (lastPid !== null) {
          gantt.push({ pid: lastPid, start: segmentStart, end: currentTime });
        }
        lastPid = currentProc.pid;
        segmentStart = currentTime;
        addStep(`Preemptive: ${currentProc.pid} (prio ${currentProc.priority}) gains CPU at time ${currentTime}`);
      }
      // Next event: next arrival or completion
      let nextArrivalTime = Infinity;
      for (const p of procList) {
        if (p.remaining > 0 && p.arrival > currentTime) {
          nextArrivalTime = Math.min(nextArrivalTime, p.arrival);
        }
      }
      const timeToFinish = currentProc.remaining;
      const nextEvent = Math.min(nextArrivalTime, currentTime + timeToFinish);
      let duration = nextEvent - currentTime;
      if (duration <= 0) duration = 1;
      currentTime += duration;
      currentProc.remaining -= duration;
      if (currentProc.remaining === 0) {
        gantt.push({ pid: currentProc.pid, start: segmentStart, end: currentTime });
        completion[currentProc.pid] = currentTime;
        addStep(`${currentProc.pid} finishes at ${currentTime}`);
        lastPid = null;
      } else {
        addStep(`${currentProc.pid} runs ${duration} units, remaining ${currentProc.remaining}.`);
      }
    }
    if (lastPid !== null) {
      gantt.push({ pid: lastPid, start: segmentStart, end: currentTime });
    }
  }
  else if (algorithm === 'rr') {
    const queue = [];
    const remainingMap = new Map(procList.map(p => [p.pid, p.remaining]));
    const processMap = new Map(procList.map(p => [p.pid, p]));
    let time = currentTime;
    let completedCount = 0;
    const ganttSegments = [];
    let lastPid = null;
    let segmentStart = time;
    const sortedByArrival = [...procList].sort((a, b) => a.arrival - b.arrival);
    let idx = 0;

    const flushSegment = (pid, endT) => {
      if (pid !== null && segmentStart < endT) {
        ganttSegments.push({ pid, start: segmentStart, end: endT });
      }
    };

    while (completedCount < procList.length) {
      while (idx < sortedByArrival.length && sortedByArrival[idx].arrival <= time) {
        const p = sortedByArrival[idx];
        if (remainingMap.get(p.pid) > 0) queue.push(p.pid);
        idx++;
      }
      if (queue.length === 0 && idx < sortedByArrival.length) {
        const nextArr = sortedByArrival[idx].arrival;
        flushSegment(lastPid, time);
        lastPid = null;
        addStep(`Idle from ${time} to ${nextArr}`);
        time = nextArr;
        segmentStart = time;
        continue;
      }
      if (queue.length === 0) break;
      const currentPid = queue.shift();
      if (lastPid !== currentPid) {
        flushSegment(lastPid, time);
        lastPid = currentPid;
        segmentStart = time;
      }
      const rem = remainingMap.get(currentPid);
      const exec = Math.min(quantum, rem);
      addStep(`${currentPid} runs for ${exec} unit(s) (quantum=${quantum}, remaining before=${rem})`);
      time += exec;
      const newRem = rem - exec;
      remainingMap.set(currentPid, newRem);
      if (newRem === 0) {
        completion[currentPid] = time;
        addStep(`${currentPid} completes at ${time}`);
        completedCount++;
        flushSegment(currentPid, time);
        lastPid = null;
        segmentStart = time;
      } else {
        queue.push(currentPid);
      }
      while (idx < sortedByArrival.length && sortedByArrival[idx].arrival <= time) {
        const p = sortedByArrival[idx];
        if (remainingMap.get(p.pid) > 0) queue.push(p.pid);
        idx++;
      }
    }
    flushSegment(lastPid, time);
    gantt.push(...ganttSegments);
    currentTime = time;
    // Ensure all completions are set
    for (const p of procList) {
      if (!completion[p.pid]) completion[p.pid] = currentTime;
    }
  }

  // Compute metrics
  let totalTurn = 0, totalWait = 0;
  for (const p of procList) {
    const ct = completion[p.pid] || 0;
    const tat = ct - p.arrival;
    const wt = tat - p.originalBurst;
    totalTurn += tat;
    totalWait += wt;
  }
  const n = procList.length;
  const avgTurn = (totalTurn / n).toFixed(2);
  const avgWait = (totalWait / n).toFixed(2);
  const throughput = (n / currentTime).toFixed(3);
  const metrics = {
    avgTurnaround: avgTurn,
    avgWaiting: avgWait,
    throughput,
    completionTime: currentTime,
  };

  return { gantt, steps, metrics };
};