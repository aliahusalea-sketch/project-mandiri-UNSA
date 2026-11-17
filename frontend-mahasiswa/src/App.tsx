import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { DashboardMahasiswa } from './pages/DashboardMahasiswa';
import RombelKelas from './pages/RombelKelas';
import PengaturanApi from './pages/PengaturanApi';
import Login from './pages/Login';
import { getMahasiswa } from './services/api';
import type { Mahasiswa } from './types/mahasiswa';
import { LogOut } from 'lucide-react';

const extractRows = (payload: unknown): Mahasiswa[] => {
  if (Array.isArray(payload)) return payload as Mahasiswa[];
  if (
    payload &&
    typeof payload === 'object' &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: Mahasiswa[] }).data;
  }
  return [];
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState<string>('dashboard');
  const [dataMahasiswa, setDataMahasiswa] = useState<Mahasiswa[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user_unsa');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('user_unsa');
      }
    }
  }, []);

  // Data ini dipakai halaman Program Studi (RombelKelas).
  // Dashboard juga mengirim data terbaru lewat onDataChange setelah fetch/simpan/hapus.
  // Fetch ulang setiap berpindah menu agar perubahan dari DBeaver ikut terbaca.
  useEffect(() => {
    if (!user) return;
    getMahasiswa()
      .then((res) => setDataMahasiswa(extractRows(res.data)))
      .catch((err) => console.error('Gagal memuat data mahasiswa:', err));
  }, [user, activeMenu]);

  const handleLogout = () => {
    localStorage.removeItem('user_unsa');
    setUser(null);
  };

  if (!user) {
    return <Login onLoginSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar Navigasi Kiri */}
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      {/* Konten Utama di Kanan */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header dengan Informasi User & Tombol Logout */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
          <div className="text-sm font-medium text-slate-600">
            Selamat datang,{' '}
            <span className="font-bold text-slate-800">{user.nama_mahasiswa}</span> (
            {user.email})
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </header>

        {/* Konten Halaman */}
        <main className="flex-1 overflow-y-auto">
          {activeMenu === 'dashboard' && (
            <DashboardMahasiswa onDataChange={setDataMahasiswa} />
          )}
          {activeMenu === 'mahasiswa' && (
            <DashboardMahasiswa onDataChange={setDataMahasiswa} />
          )}
          {activeMenu === 'rombel' && <RombelKelas dataMahasiswa={dataMahasiswa} />}
          {activeMenu === 'pengaturan' && <PengaturanApi />}
        </main>
      </div>
    </div>
  );
}
