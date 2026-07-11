'use client';

import { useState, useEffect, CSSProperties } from 'react';
import { Order } from '@/types';

const MIN_ROWS = 15;

const olive     = '#3a3a18';
const oliveMid  = '#6b6b30';
const oliveLt   = '#a8a870';
const border    = '#7a7a38';
const cream     = '#f4efe6';
const rowAlt    = '#faf7f0';
const textDark  = '#2a2a10';
const textLight = '#999966';
const green     = '#2d6a2d';

function rowNameStyle(strike: boolean): CSSProperties {
  return {
    display: 'flex', alignItems: 'center', padding: '7px 10px',
    fontSize: '13px', fontWeight: '600',
    color: strike ? '#bbb' : textDark,
    textDecoration: strike ? 'line-through' : 'none',
    borderRight: `1px solid ${oliveLt}`,
  };
}

export default function BulletinBoard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    fetch(`/api/orders?deliveryDate=${todayStr}`)
      .then(r => r.json())
      .then((todayOrders: Order[]) => {
        setOrders(todayOrders);
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  const now = new Date();
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日（${weekdays[now.getDay()]}）`;

  const activeOrders = orders.filter(o => o.status !== 'キャンセル済');
  const aOrders = activeOrders.filter(o => o.menuName.startsWith('通常弁当'));
  const bOrders = activeOrders.filter(o => o.menuName.startsWith('レディース'));

  const totalA = aOrders.length;
  const totalB = bOrders.length;

  const rowCount = Math.max(MIN_ROWS, aOrders.length, bOrders.length);
  const rows = Array.from({ length: rowCount }, (_, i) => ({
    a: aOrders[i] ?? null,
    b: bOrders[i] ?? null,
  }));

  const isSumi = (order: Order | null) => order?.status === '完了';

  if (loading) {
    return <div className="text-center py-16 text-gray-400">読み込み中...</div>;
  }

  return (
    <div className="flex flex-col gap-3">

      {/* 操作ボタン（印刷時非表示） */}
      <div className="flex justify-center gap-2 print:hidden">
        <button onClick={load} style={{ border: `1.5px solid ${border}`, color: olive, backgroundColor: 'transparent', padding: '5px 18px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
          更新
        </button>
        <button onClick={() => window.print()} style={{ backgroundColor: olive, color: cream, border: 'none', padding: '5px 18px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
          🖨️ A4印刷
        </button>
      </div>

      {/* メインボード */}
      <div style={{ backgroundColor: cream, border: `2px solid ${border}`, borderRadius: '12px', overflow: 'hidden', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' } as CSSProperties}>

        {/* タイトルヘッダー */}
        <div style={{ backgroundColor: cream, textAlign: 'center', padding: '18px 16px 8px' }}>
          <div style={{ fontSize: '26px', fontWeight: '900', color: olive, letterSpacing: '0.15em', lineHeight: 1 }}>
            お弁当注文リスト
          </div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: oliveMid, marginTop: '6px', letterSpacing: '0.08em' }}>
            {dateStr}
          </div>
        </div>
        {/* 飾り線 */}
        <div style={{ height: '3px', backgroundColor: olive, margin: '8px 16px 3px' }} />
        <div style={{ height: '1px', backgroundColor: oliveLt, margin: '3px 16px 10px' }} />

        {/* 注意文 */}
        <div style={{ textAlign: 'center', fontSize: '10px', color: oliveMid, fontWeight: '600', padding: '4px 16px 14px', letterSpacing: '0.04em' }}>
          締め切り AM 8:45　／　時刻を過ぎる場合は 日置 純子 までご連絡ください
        </div>

        {/* 合計カード */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '0 16px 16px' }}>
          {/* A */}
          <div style={{ backgroundColor: '#fff8dc', border: `1.5px solid ${border}`, borderRadius: '8px', padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: oliveMid, marginBottom: '4px' }}>通常弁当（A）</div>
            <div style={{ fontSize: '40px', fontWeight: '900', color: olive, lineHeight: 1 }}>{totalA}</div>
            <div style={{ fontSize: '11px', color: oliveMid, marginTop: '2px' }}>名</div>
          </div>
          {/* B */}
          <div style={{ backgroundColor: '#f0f4e0', border: `1.5px solid ${border}`, borderRadius: '8px', padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: oliveMid, marginBottom: '4px' }}>レディース弁当（B）</div>
            <div style={{ fontSize: '40px', fontWeight: '900', color: olive, lineHeight: 1 }}>{totalB}</div>
            <div style={{ fontSize: '11px', color: oliveMid, marginTop: '2px' }}>名</div>
          </div>
        </div>

        {/* テーブル */}
        <div style={{ margin: '0 16px 16px', border: `1.5px solid ${border}`, borderRadius: '8px', overflow: 'hidden' }}>

          {/* 列ヘッダー */}
          <div style={{ display: 'grid', gridTemplateColumns: '2rem 1fr 2.2rem 1fr 2.2rem', backgroundColor: olive }}>
            {['#', '通常弁当（A）', '済', 'レディース弁当（B）', '済'].map((label, i) => (
              <div key={i} style={{ padding: '7px 6px', textAlign: 'center', fontSize: '10px', fontWeight: '700', color: cream, letterSpacing: '0.04em', borderRight: i < 4 ? `1px solid ${oliveMid}` : 'none' }}>
                {label}
              </div>
            ))}
          </div>

          {/* データ行 */}
          {rows.map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2rem 1fr 2.2rem 1fr 2.2rem', backgroundColor: i % 2 === 0 ? '#ffffff' : rowAlt, borderTop: `1px solid ${oliveLt}` }}>

              {/* 行番号 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '7px 2px', fontSize: '10px', color: textLight, fontFamily: 'monospace', borderRight: `1px solid ${oliveLt}` }}>
                {i + 1}
              </div>

              {/* 通常A 名前 */}
              <div style={rowNameStyle(isSumi(row.a))}>
                {row.a && (
                  <>
                    {row.a.ordererName}
                    {row.a.menuName.includes('ご飯大') && (
                      <span style={{ fontSize: '10px', color: textLight, marginLeft: '4px' }}>（大）</span>
                    )}
                  </>
                )}
              </div>

              {/* 通常A 済 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${oliveLt}` }}>
                {isSumi(row.a) && <span style={{ color: green, fontWeight: '900', fontSize: '16px' }}>✓</span>}
              </div>

              {/* レディースB 名前 */}
              <div style={{ ...rowNameStyle(isSumi(row.b)) }}>
                {row.b ? row.b.ordererName : null}
              </div>

              {/* レディースB 済 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isSumi(row.b) && <span style={{ color: green, fontWeight: '900', fontSize: '16px' }}>✓</span>}
              </div>

            </div>
          ))}
        </div>

        {/* フッター */}
        <div style={{ backgroundColor: olive, color: oliveLt, textAlign: 'center', fontSize: '9px', padding: '5px 12px', letterSpacing: '0.1em' }}>
          お弁当注文システム
        </div>

      </div>
    </div>
  );
}
