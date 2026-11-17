import React from 'react';
import { Bell, Search, UserCircle } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Navbar({ searchQuery, setSearchQuery }: NavbarProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
      <div className="flex items-center bg-slate-100 px-3 py-2 rounded-lg w-96 border border-slate-200 focus-within:border-blue-500 transition">
        <Search className="w-4 h-4 text-slate-400 mr-2" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari NIM atau Nama Mahasiswa..." 
          className="bg-transparent text-sm outline-none w-full text-slate-700"
        />
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 text-slate-600 hover:bg-blue-50 rounded-full relative transition cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
        </button>
        <div className="flex items-center space-x-3 border-l pl-4 border-slate-200">
          <UserCircle className="w-8 h-8 text-blue-600" />
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-800">Admin Akademik</p>
            <p className="text-xs text-slate-500">Universitas SA</p>
          </div>
        </div>
      </div>
    </header>
  );
}