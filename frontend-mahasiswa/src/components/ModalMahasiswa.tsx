import React, { useState, useEffect } from 'react';
import type { Mahasiswa } from '../types/mahasiswa';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Mahasiswa) => void;
  initialData?: Mahasiswa | null;
}

// Nama properti harus sama dengan kolom tabel `mahasiswa` di PostgreSQL.
const emptyForm: Mahasiswa = {
  nim: '',
  nama: '',
  jenis_kelamin: 'L',
  ttl: '',
  prodi: '',
  kelas: '',
  semester: 1,
  alamat: '',
  nama_ibu: '',
  no_hp: '',
  keterangan: 'Aktif',
};

export const ModalMahasiswa: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<Mahasiswa>(emptyForm);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...emptyForm, ...initialData });
    } else {
      setFormData(emptyForm);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClass =
    'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          {initialData ? 'Edit Data Mahasiswa' : <center>Tambah Mahasiswa Baru</center>}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>NIM</label>
              <input
                type="text"
                required
                value={formData.nim}
                onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Nama Lengkap</label>
              <input
                type="text"
                required
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Jenis Kelamin</label>
              <select
                value={formData.jenis_kelamin || 'L'}
                onChange={(e) =>
                  setFormData({ ...formData, jenis_kelamin: e.target.value })
                }
                className={inputClass}
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Tempat, Tanggal Lahir</label>
              <input
                type="text"
                value={formData.ttl || ''}
                onChange={(e) => setFormData({ ...formData, ttl: e.target.value })}
                placeholder="Contoh: Surakarta, 17 Agustus 2005"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className={labelClass}>Program Studi</label>
              <input
                type="text"
                value={formData.prodi || ''}
                onChange={(e) => setFormData({ ...formData, prodi: e.target.value })}
                placeholder="Contoh: Teknik Informatika"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Kelas / Rombel</label>
              <input
                type="text"
                value={formData.kelas || ''}
                onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                placeholder="Contoh: TI-1A"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Semester</label>
              <input
                type="number"
                min={1}
                max={14}
                value={formData.semester ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    semester:
                      e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Alamat</label>
            <input
              type="text"
              value={formData.alamat || ''}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nama Ibu</label>
              <input
                type="text"
                value={formData.nama_ibu || ''}
                onChange={(e) => setFormData({ ...formData, nama_ibu: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>No. HP</label>
              <input
                type="text"
                value={formData.no_hp || ''}
                onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Keterangan / Status</label>
            <select
              value={formData.keterangan || 'Aktif'}
              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              className={inputClass}
            >
              <option value="Aktif">Aktif</option>
              <option value="Cuti">Cuti</option>
              <option value="Lulus">Lulus</option>
              <option value="Keluar">Keluar</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
