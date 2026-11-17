
import React, { useCallback, useEffect, useState } from 'react';
import type { Mahasiswa } from '../types/mahasiswa';
import {
  getMahasiswa,
  createMahasiswa,
  updateMahasiswa,
  deleteMahasiswa,
} from '../services/api';
import { StatCard } from '../components/StatCard';
import { ModalMahasiswa } from '../components/ModalMahasiswa';
import {
  RefreshCw,
  AlertCircle,
  Database,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface DashboardMahasiswaProps {
  onDataChange?: (data: Mahasiswa[]) => void;
}

// Mengambil data mahasiswa dari berbagai bentuk respons API.
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

const getErrorMessage = (error: any): string =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  'Terjadi kesalahan yang tidak diketahui.';

export const DashboardMahasiswa: React.FC<DashboardMahasiswaProps> = ({
  onDataChange,
}) => {
  // ==================== STATE DATA ====================

  const [data, setData] = useState<Mahasiswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Mahasiswa | null>(null);

  // ==================== STATE PAGINATION ====================

  const [currentPage, setCurrentPage] = useState(1);

  // Maksimal data yang ditampilkan setiap halaman.
  const itemsPerPage = 5;

  // Menghitung jumlah halaman berdasarkan total data.
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Mencegah jumlah halaman menjadi 0.
  const safeTotalPages = Math.max(totalPages, 1);

  // Menghitung posisi awal data.
  const startIndex = (currentPage - 1) * itemsPerPage;

  // Mengambil hanya 5 data sesuai halaman aktif.
  const currentMahasiswa = data.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Menghasilkan nomor halaman.
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  // Mengamankan halaman aktif ketika jumlah data berkurang.
  useEffect(() => {
    if (currentPage > safeTotalPages) {
      setCurrentPage(safeTotalPages);
    }
  }, [currentPage, safeTotalPages]);

  // ==================== FETCH DATA ====================

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getMahasiswa();
      const rows = extractRows(res.data);

      setData(rows);
      onDataChange?.(rows);
    } catch (err) {
      console.error('Gagal mengambil data mahasiswa:', err);

      setData([]);
      onDataChange?.([]);

      setError(
        `Gagal memuat data dari ${getErrorMessage(err)}. Pastikan backend berjalan di http://localhost:3000 dan database PostgreSQL aktif.`
      );
    } finally {
      setLoading(false);
    }
  }, [onDataChange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ==================== SIMPAN DATA ====================

  const handleSave = async (formData: Mahasiswa) => {
    try {
      setError(null);

      if (editingItem?.id) {
        await updateMahasiswa(editingItem.id, formData);
      } else {
        await createMahasiswa(formData);
      }

      setIsModalOpen(false);
      setEditingItem(null);

      await fetchData();
    } catch (err) {
      setError(`Gagal menyimpan data: ${getErrorMessage(err)}`);
    }
  };

  // ==================== HAPUS DATA ====================

  const handleDelete = async (id?: number) => {
    if (!id || !confirm('Yakin ingin menghapus data mahasiswa ini?')) {
      return;
    }

    try {
      setError(null);

      await deleteMahasiswa(id);
      await fetchData();
    } catch (err) {
      setError(`Gagal menghapus data: ${getErrorMessage(err)}`);
    }
  };

  // ==================== STATISTIK ====================

  // Statistik tetap menggunakan seluruh data, bukan hanya 5 data.
  const totalKelas = new Set(
    data.map((m) => m.kelas).filter(Boolean)
  ).size;

  const totalProdi = new Set(
    data.map((m) => m.prodi).filter(Boolean)
  ).size;

  const totalAktif = data.filter(
    (m) => (m.keterangan || 'Aktif').toLowerCase() === 'aktif'
  ).length;

  // ==================== NAVIGASI PAGINATION ====================

  const goToPage = (page: number) => {
    if (page >= 1 && page <= safeTotalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-6 w-full space-y-6">

      {/* ==================== HEADER ==================== */}

      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            MADAHESA
          </h1>

          <p className="text-sm text-slate-500 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-emerald-600" />
            Manajement Data Mahasiswa Universitas Seraphine Astrid
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
            />
            Muat Ulang
          </button>

          <button
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition cursor-pointer"
          >
            + Tambah Mahasiswa
          </button>
        </div>
      </div>

      {/* ==================== ERROR MESSAGE ==================== */}

      {error && (
        <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />

          <div className="flex-1">
            <p className="font-semibold">Koneksi data gagal</p>
            <p className="mt-0.5">{error}</p>
          </div>

          <button
            onClick={fetchData}
            className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* ==================== STATISTIK ==================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

        <StatCard
          title="TOTAL MAHASISWA"
          value={data.length}
          subtitle="Mahasiswa terdaftar"
        />

        <StatCard
          title="MAHASISWA AKTIF"
          value={totalAktif}
          subtitle="Status aktif"
        />

        <StatCard
          title="TOTAL KELAS / ROMBEL"
          value={totalKelas}
          subtitle="Kelas terdaftar"
        />

        <StatCard
          title="TOTAL PROGRAM STUDI"
          value={totalProdi}
          subtitle="Prodi terdaftar"
        />

      </div>

      {/* ==================== TABEL MAHASISWA ==================== */}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-left border-collapse text-sm">

            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">

                <th className="py-3 px-4 font-semibold">NIM</th>
                <th className="py-3 px-4 font-semibold">NAMA LENGKAP</th>
                <th className="py-3 px-4 font-semibold">L/P</th>
                <th className="py-3 px-4 font-semibold">TTL</th>
                <th className="py-3 px-4 font-semibold">PRODI</th>
                <th className="py-3 px-4 font-semibold">KELAS</th>
                <th className="py-3 px-4 font-semibold">SEMESTER</th>
                <th className="py-3 px-4 font-semibold">ALAMAT</th>
                <th className="py-3 px-4 font-semibold">NAMA IBU</th>
                <th className="py-3 px-4 font-semibold">NO. HP</th>
                <th className="py-3 px-4 font-semibold">STATUS</th>
                <th className="px-4 py-2">Dibuat Oleh</th>
                <th className="px-4 py-2">Terakhir Diubah</th>
                <th className="px-4 py-2 text-center">AKSI</th>

              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">

              {loading ? (

                <tr>
                  <td
                    colSpan={14}
                    className="py-8 text-center text-slate-500"
                  >
                    Memuat data dari database...
                  </td>
                </tr>

              ) : error ? (

                <tr>
                  <td
                    colSpan={14}
                    className="py-8 text-center text-rose-600"
                  >
                    Data gagal dimuat. Periksa koneksi backend/database lalu klik "Coba Lagi".
                  </td>
                </tr>

              ) : data.length === 0 ? (

                <tr>
                  <td
                    colSpan={14}
                    className="py-8 text-center text-slate-500"
                  >
                    Belum ada data mahasiswa. Klik "+ Tambah Mahasiswa" atau masukkan data via DBeaver.
                  </td>
                </tr>

              ) : (

                currentMahasiswa.map((mhs) => (

                  <tr
                    key={mhs.id ?? mhs.nim}
                    className="hover:bg-slate-50"
                  >

                    <td className="py-3 px-3 font-medium text-blue-600">
                      {mhs.nim}
                    </td>

                    <td className="py-3 px-3 font-medium text-slate-800">
                      {mhs.nama}
                    </td>

                    <td className="py-3 px-3 text-slate-600">
                      {mhs.jenis_kelamin || '-'}
                    </td>

                    <td className="py-3 px-3 text-slate-600 max-w-[150px] truncate">
                      {mhs.ttl || '-'}
                    </td>

                    <td className="py-3 px-3 text-slate-600">
                      {mhs.prodi || '-'}
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-medium text-xs">
                        {mhs.kelas || '-'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-600">
                      {mhs.semester ?? '-'}
                    </td>

                    <td className="py-3 px-3 text-slate-600 max-w-[180px] truncate">
                      {mhs.alamat || '-'}
                    </td>

                    <td className="py-3 px-3 text-slate-600">
                      {mhs.nama_ibu || '-'}
                    </td>

                    <td className="py-3 px-3 text-slate-600">
                      {mhs.no_hp || '-'}
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs font-semibold">
                        {mhs.keterangan || 'Aktif'}
                      </span>
                    </td>

                    {/* Dibuat Oleh */}

                    <td className="py-3 px-3 text-xs text-slate-500">
                      <div>{mhs.created_by || '-'}</div>

                      <div className="text-[10px] text-slate-400">
                        {mhs.created_at
                          ? new Date(mhs.created_at).toLocaleString()
                          : ''}
                      </div>
                    </td>

                    {/* Terakhir Diubah */}

                    <td className="py-3 px-3 text-xs text-slate-500">
                      <div>{mhs.updated_by || 'Belum diubah'}</div>

                      <div className="text-[10px] text-slate-400">
                        {mhs.updated_at
                          ? new Date(mhs.updated_at).toLocaleString()
                          : ''}
                      </div>
                    </td>

                    {/* AKSI */}

                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-2">

                        <button
                          onClick={() => {
                            setEditingItem(mhs);
                            setIsModalOpen(true);
                          }}
                          title="Edit Data"
                          className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(mhs.id)}
                          title="Hapus Data"
                          className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>

                  </tr>

                ))
              )}

            </tbody>

          </table>

        </div>

        {/* ==================== PAGINATION ==================== */}

        {!loading && !error && data.length > 0 && (

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-slate-200 bg-white">

            {/* INFORMASI DATA */}

            <div className="text-sm text-slate-500">
              Menampilkan{' '}
              <span className="font-semibold text-slate-700">
                {startIndex + 1}
              </span>
              {' - '}
              <span className="font-semibold text-slate-700">
                {Math.min(startIndex + itemsPerPage, data.length)}
              </span>
              {' dari '}
              <span className="font-semibold text-slate-700">
                {data.length}
              </span>
              {' mahasiswa'}
            </div>

            {/* TOMBOL PAGINATION */}

            <div className="flex items-center gap-1">

              {/* PREVIOUS */}

              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {/* NOMOR HALAMAN */}

              {pageNumbers.map((page) => (

                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`min-w-9 h-9 px-3 rounded-lg text-sm font-semibold transition ${
                    currentPage === page
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>

              ))}

              {/* NEXT */}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === safeTotalPages}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>

            </div>

          </div>

        )}

      </div>

      {/* ==================== MODAL MAHASISWA ==================== */}

      <ModalMahasiswa
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleSave}
        initialData={editingItem}
      />

    </div>
  );
};
