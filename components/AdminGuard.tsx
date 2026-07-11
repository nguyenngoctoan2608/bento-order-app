'use client';

import { useState, useEffect, ReactNode } from 'react';

const SESSION_KEY = 'admin_auth';

export default function AdminGuard({ children }: { children: ReactNode }) {
  const [authed, setAuthed]   = useState(false);
  const [pw, setPw]           = useState('');
  const [error, setError] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === '1') setAuthed(true);
  }, []);

  const handleLogin = () => {
    setError(false);
    const correct = pw.trim() === 'sakaikoukan5131';
    if (correct) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setAuthed(true);
    } else {
      setError(true);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
    setPw('');
  };

  if (authed) {
    return (
      <div>
        <div className="flex justify-end mb-3">
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 border border-gray-200 px-3 py-1 rounded-full hover:bg-gray-50 transition-colors"
          >
            🔓 ログアウト
          </button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm flex flex-col gap-5">
        <div className="text-center">
          <div className="text-4xl mb-2">🔐</div>
          <h2 className="text-lg font-bold text-gray-800">管理者ログイン</h2>
          <p className="text-xs text-gray-400 mt-1">管理者パスワードを入力してください</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-600">パスワード</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={pw}
              onChange={e => { setPw(e.target.value); setError(false); }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="パスワードを入力"
              className={`w-full border rounded-xl px-4 py-3 pr-10 text-gray-800 focus:outline-none transition-colors
                ${error ? 'border-amber-400 bg-amber-50' : 'border-gray-200 focus:border-orange-400'}`}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
            >
              {showPw ? '🙈' : '👁️'}
            </button>
          </div>
          {error && (
            <p className="text-amber-600 text-xs font-medium">パスワードが違います</p>
          )}
        </div>

        <button
          onClick={handleLogin}
          disabled={!pw.trim()}
          className="w-full bg-orange-500 text-white rounded-xl py-3 font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          ログイン
        </button>
      </div>
    </div>
  );
}
