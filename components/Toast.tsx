'use client';

import { useApp } from '@/context/AppContext';

export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;

  const colors = {
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    info: 'bg-orange-500',
  };

  return (
    <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-white shadow-lg font-medium animate-fade-in ${colors[toast.type]}`}>
      {toast.message}
    </div>
  );
}
