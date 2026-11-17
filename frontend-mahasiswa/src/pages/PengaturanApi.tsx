import React, { useState } from 'react';
import {
  Settings,
  Server,
  Database,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { getHealth, API_BASE_URL } from '../services/api';

export default function PengaturanApi() {
  const [statusKoneksi, setStatusKoneksi] = useState<string>('Belum diperiksa');
  const [detailKoneksi, setDetailKoneksi] = useState<string>('-');
  const [terhubung, setTerhubung] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const cekKoneksiBackend = async () => {
    setIsChecking(true);
    try {
      const response = await getHealth();
      const info = response.data;
      setStatusKoneksi('Berhasil terhubung ke Backend & Database (Port 3000)');
      setDetailKoneksi(
        `Database: ${info.nama_database || '-'} • Waktu server: ${
          info.waktu_server ? new Date(info.waktu_server).toLocaleString('id-ID') : '-'
        }`
      );
      setTerhubung(true);
    } catch (error: any) {
      setStatusKoneksi(
        error?.response?.data?.message ||
          'Gagal terhubung ke backend. Pastikan server port 3000 menyala.'
      );
      setDetailKoneksi('Tidak ada respons dari /api/health');
      setTerhubung(false);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Settings className="w-7 h-7 text-blue-600" />
          Pengaturan API & Sistem Backend
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Informasi konfigurasi endpoint backend Express.js dan database PostgreSQL
          Universitas SA.
        </p>
      </div>

      {/* Status Kartu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Backend */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600" /> Status Server Backend
            </h3>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${
                terhubung === false
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              {terhubung === false ? (
                <AlertCircle className="w-3.5 h-3.5" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              {terhubung === false
                ? 'Gagal'
                : terhubung === true
                  ? 'Aktif'
                  : 'Siap'}
            </span>
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            <p>
              <strong>Base URL:</strong>{' '}
              <code className="bg-slate-100 px-2 py-1 rounded text-blue-600">
                {API_BASE_URL}
              </code>
            </p>
            <p>
              <strong>Endpoint Data:</strong>{' '}
              <code className="bg-slate-100 px-2 py-1 rounded text-blue-600">
                {API_BASE_URL}/mahasiswa
              </code>
            </p>
            <p>
              <strong>Framework:</strong> Node.js / Express.js
            </p>
            <p>
              <strong>Status Respon:</strong>{' '}
              <span className="font-medium text-slate-800">{statusKoneksi}</span>
            </p>
            <p className="text-xs text-slate-400">{detailKoneksi}</p>
          </div>
          <button
            onClick={cekKoneksiBackend}
            disabled={isChecking}
            className="mt-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Memeriksa...' : 'Test Koneksi API'}
          </button>
        </div>

        {/* Status Database */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" /> Database PostgreSQL
            </h3>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
              DBeaver
            </span>
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            <p>
              <strong>Host:</strong> localhost (Port 5432)
            </p>
            <p>
              <strong>Database:</strong>{' '}
              <code className="bg-slate-100 px-2 py-1 rounded text-slate-700">
                mahasiswa_unsa
              </code>
            </p>
            <p>
              <strong>Tabel Utama:</strong>{' '}
              <code className="bg-slate-100 px-2 py-1 rounded text-slate-700">
                mahasiswa
              </code>
            </p>
            <p>
              <strong>Kolom:</strong> nim, nama, jenis_kelamin, ttl, prodi, kelas,
              semester, alamat, nama_ibu, no_hp, keterangan
            </p>
            <p className="text-xs text-slate-400">
              Kredensial database hanya disimpan di backend (.env), tidak di frontend.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
