import React, { useState } from 'react';
import { Users, X, Search, Plus, RefreshCw, Briefcase, CreditCard, UserCheck, ShieldCheck } from 'lucide-react';
import { Guru } from '../types';

interface DataGuruModalProps {
  isOpen: boolean;
  onClose: () => void;
  guruList: Guru[];
  onAddGuru: (guru: Omit<Guru, 'id'>) => void;
  onRefreshGuru?: () => void;
  isRefreshing?: boolean;
}

export const DataGuruModal: React.FC<DataGuruModalProps> = ({
  isOpen,
  onClose,
  guruList,
  onAddGuru,
  onRefreshGuru,
  isRefreshing = false,
}) => {
  const [search, setSearch] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [nama, setNama] = useState<string>('');
  const [nip, setNip] = useState<string>('');
  const [jabatan, setJabatan] = useState<string>('');

  if (!isOpen) return null;

  const filtered = guruList.filter((g) =>
    g.nama.toLowerCase().includes(search.toLowerCase()) ||
    g.nip.toLowerCase().includes(search.toLowerCase()) ||
    g.jabatan.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmitNewGuru = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !nip.trim() || !jabatan.trim()) return;
    onAddGuru({
      nama: nama.trim(),
      nip: nip.trim(),
      jabatan: jabatan.trim(),
    });
    setNama('');
    setNip('');
    setJabatan('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-800 px-6 py-4.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Users className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Database Guru SDN Babelan Kota 01
              </h2>
              <p className="text-xs text-emerald-100">
                Tersinkronisasi dengan Sheet "Data_Guru" pada Spreadsheet
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari guru, NIP, jabatan..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onRefreshGuru && (
              <button
                type="button"
                onClick={onRefreshGuru}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Tarik dari Spreadsheet</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Tutup Form' : 'Tambah Guru'}</span>
            </button>
          </div>
        </div>

        {/* Add Form Inline */}
        {showAddForm && (
          <form onSubmit={handleSubmitNewGuru} className="p-4 bg-emerald-50/70 border-b border-emerald-200 text-xs space-y-3">
            <p className="font-bold text-emerald-900">Tambah Guru Baru ke Database:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Nama Lengkap & Gelar *"
                className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800"
                required
              />
              <input
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="NIP / NIPPPK *"
                className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono"
                required
              />
              <input
                type="text"
                value={jabatan}
                onChange={(e) => setJabatan(e.target.value)}
                placeholder="Jabatan (cth: Guru Kelas 3A) *"
                className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded-lg text-slate-600 bg-white border border-slate-300"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-white font-bold bg-emerald-700 hover:bg-emerald-800 shadow-2xs"
              >
                Simpan Guru
              </button>
            </div>
          </form>
        )}

        {/* Teacher List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 text-xs">
          {filtered.length === 0 ? (
            <p className="text-center text-slate-500 py-8">Tidak ditemukan data guru.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filtered.map((g, idx) => (
                <div
                  key={g.id || idx}
                  className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition flex items-start gap-2.5"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                    {idx + 1}
                  </div>
                  <div className="truncate space-y-0.5">
                    <p className="font-bold text-slate-900 truncate" title={g.nama}>
                      {g.nama}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-slate-400" />
                      {g.nip}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 truncate">
                      <Briefcase className="w-3 h-3 text-emerald-600 shrink-0" />
                      {g.jabatan}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Total: <strong>{guruList.length}</strong> Guru Terdaftar</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-100 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
