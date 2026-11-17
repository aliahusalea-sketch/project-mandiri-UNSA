import React from 'react';
import { LayoutDashboard, Users, Database, BookOpen } from 'lucide-react';

interface SidebarProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
}

export default function Sidebar({ activeMenu, setActiveMenu }: SidebarProps) {
  const menus = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'mahasiswa', label: 'Data Mahasiswa', icon: Users },
    { id: 'rombel', label: 'Program Studi', icon: BookOpen },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
      <div className="h-16 flex items-center px-6 bg-gradient-to-r from-blue-700 to-blue-900 text-white font-bold text-lg shadow-md">
        <Database className="w-6 h-6 mr-2 text-blue-300" />
        <span>MADAHESA</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 text-sm">
        {menus.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'hover:bg-slate-800 hover:text-white text-slate-300'
              }`}
            >
              <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-blue-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        Sistem Informasi Akademik v1.0
      </div>
    </aside>
  );
}