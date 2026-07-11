'use client';

import { QRCodeSVG } from 'qrcode.react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

const steps = [
  { icon: '🍱', title: 'メニューを選ぶ',       desc: 'トップ画面で食べたいお弁当をタップして選んでください。' },
  { icon: '👤', title: '自分の名前を選ぶ',     desc: '注文確認画面でドロップダウンから自分の名前を選んでください。' },
  { icon: '✅', title: '「確定する」をタップ', desc: '内容を確認して「確定する」ボタンを押せば注文完了です。' },
  { icon: '⏰', title: '締め切りに注意',       desc: '毎日 AM 8:45 が締め切りです。時刻を過ぎると翌日分の注文になります。' },
];

const notices = [
  'スマートフォン・PCのブラウザからどこでもアクセスできます。',
  '締め切りは毎日 AM 8:45 です。時刻を過ぎると翌日分の注文になります。',
  '時刻を過ぎる場合は、直接日置 純子までご連絡ください。',
];

export default function UsageGuide() {
  return (
    <div className="flex flex-col gap-4">

      {/* 印刷ボタン（画面のみ） */}
      <div className="flex justify-end print:hidden">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-orange-600 transition-colors"
        >
          🖨️ A4印刷
        </button>
      </div>

      {/* 印刷対象 */}
      <div className="bg-white rounded-2xl shadow-md p-6 print:shadow-none print:rounded-none print:p-8">

        {/* タイトル */}
        <div className="text-center mb-5 pb-4 border-b-2 border-orange-400">
          <h1 className="text-2xl font-bold text-orange-600">🍱 お弁当注文アプリ　使い方</h1>
        </div>

        <div className="flex gap-6 items-start">

          {/* 左：QRコード */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="p-2 border-4 border-orange-400 rounded-xl">
              <QRCodeSVG value={APP_URL} size={150} fgColor="#1F2937" bgColor="#FFFFFF" level="M" />
            </div>
            <p className="text-xs font-bold text-gray-600 text-center">📱 スマホで読み取る</p>
            <p className="text-xs font-mono text-orange-600 bg-orange-50 px-2 py-1 rounded text-center break-all w-40">
              {APP_URL}
            </p>
          </div>

          {/* 右：コンテンツ */}
          <div className="flex-1 flex flex-col gap-5">

            {/* 使い方 */}
            <div>
              <h2 className="font-bold text-gray-800 text-base mb-3 border-l-4 border-orange-500 pl-2">使い方</h2>
              <div className="flex flex-col gap-2">
                {steps.map((s, i) => (
                  <div key={i} className="flex gap-3 items-start bg-amber-50 rounded-xl px-4 py-3">
                    <span className="w-6 h-6 mt-0.5 bg-orange-500 text-white rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-bold text-sm text-gray-800">{s.icon} {s.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 注意事項 */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
              <h2 className="font-bold text-orange-700 text-sm mb-2">⚠️ 注意事項</h2>
              <ul className="flex flex-col gap-1">
                {notices.map((n, i) => (
                  <li key={i} className="text-xs text-orange-700 flex gap-1.5">
                    <span className="flex-shrink-0">•</span>
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
