'use client';

import { MenuItem } from '@/types';
import { useApp } from '@/context/AppContext';

interface MenuSelectorProps {
  menus: MenuItem[];
  disabled: boolean;
}

const menuEmojis: Record<string, string> = {
  'Aセット': '🍱',
  'Bセット': '🥗',
  'ごはん大': '🍚',
};

export default function MenuSelector({ menus, disabled }: MenuSelectorProps) {
  const { selectedMenu, setSelectedMenu } = useApp();

  return (
    <div className="flex flex-col gap-3">
      {menus.map(menu => {
        const isSelected = selectedMenu?.id === menu.id;
        return (
          <button
            key={menu.id}
            onClick={() => !disabled && setSelectedMenu(isSelected ? null : menu)}
            disabled={disabled}
            className={`w-full rounded-2xl p-4 flex items-center gap-4 border-2 transition-all text-left
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-0.5'}
              ${isSelected
                ? 'border-orange-500 bg-orange-50 shadow-md'
                : 'border-gray-100 bg-white shadow-sm hover:border-orange-200'
              }`}
          >
            <span className="text-4xl">{menuEmojis[menu.name] ?? '🍱'}</span>
            <div className="flex-1">
              <p className={`text-lg font-bold ${isSelected ? 'text-orange-600' : 'text-gray-800'}`}>
                {menu.name}
              </p>
              <p className="text-sm text-gray-400">¥{menu.price.toLocaleString()}</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
              ${isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
              {isSelected && <span className="text-white text-xs font-bold">✓</span>}
            </div>
          </button>
        );
      })}
    </div>
  );
}
