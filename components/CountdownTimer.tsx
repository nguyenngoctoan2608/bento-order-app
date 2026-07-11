'use client';

import { useState, useEffect } from 'react';

const DEADLINE_HOUR = 8;
const DEADLINE_MIN = 45;

function getSecondsUntilDeadline(): number {
  const now = new Date();
  const deadline = new Date(now);
  deadline.setHours(DEADLINE_HOUR, DEADLINE_MIN, 0, 0);
  if (now >= deadline) return 0;
  return Math.floor((deadline.getTime() - now.getTime()) / 1000);
}

interface CountdownTimerProps {
  onExpired: () => void;
}

export default function CountdownTimer({ onExpired }: CountdownTimerProps) {
  const [seconds, setSeconds] = useState(getSecondsUntilDeadline);

  useEffect(() => {
    if (seconds <= 0) { onExpired(); return; }
    const id = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) { clearInterval(id); onExpired(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  const isUrgent = seconds > 0 && seconds <= 600;

  return (
    <div className={`rounded-2xl px-5 py-3 text-center transition-colors ${isUrgent ? 'bg-amber-100 border border-amber-300' : 'bg-white border border-gray-100 shadow-sm'}`}>
      <p className={`text-xs mb-1 font-medium ${isUrgent ? 'text-amber-600' : 'text-gray-400'}`}>
        注文締切まで
      </p>
      <p className={`text-3xl font-bold tracking-widest font-mono ${isUrgent ? 'text-amber-600' : 'text-gray-700'}`}>
        {pad(h)}:{pad(m)}:{pad(s)}
      </p>
      <p className={`text-xs mt-1 ${isUrgent ? 'text-amber-500 font-medium' : 'text-gray-400'}`}>
        締切 {DEADLINE_HOUR}:{pad(DEADLINE_MIN)}
      </p>
    </div>
  );
}
