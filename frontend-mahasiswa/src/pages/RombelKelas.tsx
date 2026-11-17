import React from 'react';
import { BookOpen, Users, Layers, Building2 } from 'lucide-react';
import type { Mahasiswa } from '../types/mahasiswa';

interface RombelKelasProps {
  dataMahasiswa: Mahasiswa[];
}

export default function RombelKelas({ dataMahasiswa = [] }: RombelKelasProps) {
  // Mengelompokkan data berdasarkan Program Studi (kolom `prodi`) dari database.
  const mapRombel: {
    [key: string]: { namaProdi: string; daftarKelas: Set<string>; jumlah: number };
  } = {};

  dataMahasiswa.forEach((mhs) => {
    const namaProdi = mhs.prodi || 'Belum ditentukan';
    if (!mapRombel[namaProdi]) {
      mapRombel[namaProdi] = {
        namaProdi,
        daftarKelas: new Set<string>(),
        jumlah: 0,
      };
    }
    mapRombel[namaProdi].jumlah += 1;
    if (mhs.kelas) {
      mapRombel[namaProdi].daftarKelas.add(mhs.kelas);
    }
  });

  const daftarRombel = Object.values(mapRombel);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-blue-600" />
            Manajemen Program Studi & Kelas (Otomatis)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
           Terhubung Dengan <code className="text-blue-600">prodi</code> dan <code className="text-blue-600">kelas</code> pada tabel <code className="text-blue-600">mahasiswa</code> PostgreSQL.
          </p>
        </div>
      </div>

      {/* Grid Daftar Rombel */}
      {daftarRombel.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl text-center border border-slate-100 text-slate-400">
          Belum ada data mahasiswa atau program studi yang terdaftar. Silakan tambah data melalui menu{' '}
          <strong className="text-slate-600">Data Mahasiswa</strong>.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {daftarRombel.map((item) => (
            <div key={item.namaProdi} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                    Program Studi
                  </span>
                  <span className="flex items-center text-xs text-slate-500 gap-1">
                    <Users className="w-4 h-4 text-blue-500" /> {item.jumlah} Mahasiswa
                  </span>
                </div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1 mb-1">
                  <Building2 className="w-3.5 h-3.5" /> Universitas SA
                </span>
                <h3 className="text-lg font-bold text-slate-800">{item.namaProdi}</h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="text-xs text-slate-500 w-full flex items-center gap-1 mb-1">
                    <Layers className="w-4 h-4 text-slate-400" /> Rombel Kelas Aktif:
                  </span>
                  {Array.from(item.daftarKelas).map((cls) => (
                    <span key={cls} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                      {cls}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                <span className="text-xs text-slate-400">Status: Sinkron</span>
                <span className="text-xs text-blue-600 font-semibold">
                  Terhubung ke Database &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}