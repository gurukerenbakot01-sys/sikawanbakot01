import React, { useState, useRef } from 'react';
import { 
  User, 
  CreditCard, 
  Briefcase, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Send, 
  Calendar,
  Sparkles,
  FileCheck2,
  RefreshCw,
  Info
} from 'lucide-react';
import { Guru, LaporanPengiriman } from '../types';

interface FormSikawanProps {
  guruList: Guru[];
  isSubmitting: boolean;
  onSubmitLaporan: (formData: {
    namaGuru: string;
    nip: string;
    jabatan: string;
    periodeBulan: string;
    tahun: string;
    fileHarian: File;
    fileBulanan: File;
    catatan?: string;
  }) => Promise<void>;
  onRefreshGuruFromSpreadsheet?: () => void;
  isRefreshingGuru?: boolean;
}

const BULAN_OPTIONS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const FormSikawan: React.FC<FormSikawanProps> = ({
  guruList,
  isSubmitting,
  onSubmitLaporan,
  onRefreshGuruFromSpreadsheet,
  isRefreshingGuru = false,
}) => {
  // Form State
  const [selectedGuruId, setSelectedGuruId] = useState<string>('');
  const [namaGuru, setNamaGuru] = useState<string>('');
  const [nip, setNip] = useState<string>('');
  const [jabatan, setJabatan] = useState<string>('');
  const [isManualInput, setIsManualInput] = useState<boolean>(false);

  // Default to current month & 2026 as per user requirement
  const currentMonthIdx = new Date().getMonth();
  const [periodeBulan, setPeriodeBulan] = useState<string>(BULAN_OPTIONS[currentMonthIdx] || 'September');
  const [tahun, setTahun] = useState<string>('2026');

  // Files State - MUST BE UPLOADED SIMULTANEOUSLY
  const [fileHarian, setFileHarian] = useState<File | null>(null);
  const [fileBulanan, setFileBulanan] = useState<File | null>(null);

  // Drag states
  const [isDraggingHarian, setIsDraggingHarian] = useState<boolean>(false);
  const [isDraggingBulanan, setIsDraggingBulanan] = useState<boolean>(false);

  // Validation message
  const [errorMessage, setErrorMessage] = useState<string>('');

  // File input refs
  const fileHarianInputRef = useRef<HTMLInputElement>(null);
  const fileBulananInputRef = useRef<HTMLInputElement>(null);

  // Handle Teacher Selection from Spreadsheet Data
  const handleSelectGuru = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedGuruId(val);
    setErrorMessage('');

    if (val === 'MANUAL') {
      setIsManualInput(true);
      setNamaGuru('');
      setNip('');
      setJabatan('');
      return;
    }

    setIsManualInput(false);
    const found = guruList.find((g) => g.id === val);
    if (found) {
      setNamaGuru(found.nama);
      setNip(found.nip);
      setJabatan(found.jabatan);
    } else {
      setNamaGuru('');
      setNip('');
      setJabatan('');
    }
  };

  // Helper formatting for file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validations
    if (!namaGuru.trim()) {
      setErrorMessage('Silakan pilih atau masukkan Nama Guru.');
      return;
    }
    if (!nip.trim()) {
      setErrorMessage('NIP Guru wajib diisi.');
      return;
    }
    if (!jabatan.trim()) {
      setErrorMessage('Jabatan Guru wajib diisi.');
      return;
    }

    // Both files are strictly required to be uploaded together
    if (!fileHarian && !fileBulanan) {
      setErrorMessage('Harap unggah Berkas Sikawan Harian dan Berkas Sikawan Bulanan secara bersamaan.');
      return;
    }
    if (!fileHarian) {
      setErrorMessage('Berkas Sikawan Harian belum diunggah. Keduanya wajib diunggah bersamaan.');
      return;
    }
    if (!fileBulanan) {
      setErrorMessage('Berkas Sikawan Bulanan belum diunggah. Keduanya wajib diunggah bersamaan.');
      return;
    }

    try {
      await onSubmitLaporan({
        namaGuru: namaGuru.trim(),
        nip: nip.trim(),
        jabatan: jabatan.trim(),
        periodeBulan,
        tahun,
        fileHarian,
        fileBulanan,
        catatan: '',
      });

      // Clear files on success (preserve teacher selection for convenience)
      setFileHarian(null);
      setFileBulanan(null);
      if (fileHarianInputRef.current) fileHarianInputRef.current.value = '';
      if (fileBulananInputRef.current) fileBulananInputRef.current.value = '';
    } catch (err: any) {
      setErrorMessage(err?.message || 'Terjadi kesalahan saat mengunggah laporan.');
    }
  };

  const handleResetFiles = () => {
    setFileHarian(null);
    setFileBulanan(null);
    if (fileHarianInputRef.current) fileHarianInputRef.current.value = '';
    if (fileBulananInputRef.current) fileBulananInputRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 px-6 py-4.5 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 backdrop-blur-xs rounded-xl border border-white/20">
              <Upload className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-300">
                FORMULIR PENGUNGGAHAN
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                Identitas Guru & Unggah Berkas
              </h2>
            </div>
          </div>

          {onRefreshGuruFromSpreadsheet && (
            <button
              type="button"
              onClick={onRefreshGuruFromSpreadsheet}
              disabled={isRefreshingGuru}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition cursor-pointer disabled:opacity-50"
              title="Perbarui daftar guru dari Spreadsheet"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingGuru ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Tarik Data Guru</span>
            </button>
          )}
        </div>
        <p className="text-xs text-emerald-100/90 mt-1.5 leading-relaxed">
          Pilih nama guru dari database spreadsheet, lalu lampirkan file Sikawan Harian dan Bulanan secara bersamaan.
        </p>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 flex-1 flex flex-col justify-between space-y-5">
        <div className="space-y-5">
          
          {/* Section: Identitas Guru */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-700" />
                Data Guru (Sesuai Spreadsheet)
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsManualInput(!isManualInput);
                  setSelectedGuruId('');
                  setNamaGuru('');
                  setNip('');
                  setJabatan('');
                }}
                className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
              >
                {isManualInput ? '← Pilih dari Daftar Guru' : '+ Input Guru Lain'}
              </button>
            </div>

            {/* Dropdown / Selection */}
            {!isManualInput ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pilih Nama Guru <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedGuruId}
                  onChange={handleSelectGuru}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-slate-900 shadow-2xs"
                  required
                >
                  <option value="">-- Klik untuk Memilih Nama Guru --</option>
                  {guruList.map((guru) => (
                    <option key={guru.id} value={guru.id}>
                      {guru.nama} - {guru.jabatan}
                    </option>
                  ))}
                  <option value="MANUAL">+ Masukkan Nama Guru Baru (Manual)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3 text-slate-400" />
                  NIP dan Jabatan otomatis terisi saat nama guru dipilih.
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Lengkap Guru Beserta Gelar <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={namaGuru}
                    onChange={(e) => setNamaGuru(e.target.value)}
                    placeholder="Contoh: Hj. Siti Rohmah, S.Pd., M.M."
                    className="w-full pl-9.5 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 font-medium shadow-2xs"
                    required
                  />
                </div>
              </div>
            )}

            {/* NIP and Jabatan Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* NIP */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  NIP / NIPPPK / NUPTK <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="19820315 200604 2 018"
                    readOnly={!isManualInput && !!selectedGuruId}
                    className={`w-full pl-9.5 pr-3.5 py-2.5 text-sm rounded-lg border font-mono ${
                      !isManualInput && !!selectedGuruId
                        ? 'bg-slate-100 text-slate-700 border-slate-200 cursor-not-allowed'
                        : 'bg-white text-slate-900 border-slate-300 focus:ring-2 focus:ring-emerald-500'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Jabatan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Jabatan / Penugasan <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={jabatan}
                    onChange={(e) => setJabatan(e.target.value)}
                    placeholder="Contoh: Guru Kelas 6A / Guru PAI"
                    readOnly={!isManualInput && !!selectedGuruId}
                    className={`w-full pl-9.5 pr-3.5 py-2.5 text-sm rounded-lg border ${
                      !isManualInput && !!selectedGuruId
                        ? 'bg-slate-100 text-slate-700 border-slate-200 cursor-not-allowed'
                        : 'bg-white text-slate-900 border-slate-300 focus:ring-2 focus:ring-emerald-500'
                    }`}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Periode Bulan & Tahun */}
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200/60">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Periode Bulan
                </label>
                <select
                  value={periodeBulan}
                  onChange={(e) => setPeriodeBulan(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 font-medium"
                >
                  {BULAN_OPTIONS.map((bln) => (
                    <option key={bln} value={bln}>{bln}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Tahun (Pilih: 2026, 2027, 2028)
                </label>
                <select
                  value={tahun}
                  onChange={(e) => setTahun(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>
              </div>
            </div>

          </div>

          {/* Section: Upload Files Bersamaan (Sikawan Harian & Sikawan Bulanan) */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-teal-700" />
                  Unggah Berkas Sikawan
                </h3>
                <span className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-0.5">
                  • Wajib diunggah bersamaan (Harian & Bulanan)
                </span>
              </div>

              {(fileHarian || fileBulanan) && (
                <button
                  type="button"
                  onClick={handleResetFiles}
                  className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  Reset Berkas
                </button>
              )}
            </div>

            {/* Grid 2 Unggah Berkas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              
              {/* 1. SIKAWAN HARIAN */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>1. Sikawan Harian <span className="text-rose-500">*</span></span>
                  {fileHarian && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Siap
                    </span>
                  )}
                </label>

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingHarian(true); }}
                  onDragLeave={() => setIsDraggingHarian(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingHarian(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      setFileHarian(e.dataTransfer.files[0]);
                      setErrorMessage('');
                    }
                  }}
                  onClick={() => fileHarianInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[125px] ${
                    fileHarian
                      ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900'
                      : isDraggingHarian
                      ? 'border-emerald-600 bg-emerald-100/50 scale-[1.01]'
                      : 'border-slate-300 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/20'
                  }`}
                >
                  <input
                    ref={fileHarianInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.xlsx,.xls,.docx,.doc,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFileHarian(e.target.files[0]);
                        setErrorMessage('');
                      }
                    }}
                  />

                  {fileHarian ? (
                    <div className="w-full flex flex-col items-center">
                      <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 mb-1.5">
                        <FileText className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-800 truncate max-w-[200px]" title={fileHarian.name}>
                        {fileHarian.name}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                        {formatFileSize(fileHarian.size)}
                      </p>
                      <span className="text-[10px] text-emerald-700 font-semibold mt-1 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                        Klik untuk ganti file
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="p-2 rounded-full bg-slate-200/60 text-slate-600 mb-1">
                        <Upload className="w-4 h-4 text-emerald-700" />
                      </div>
                      <p className="text-xs font-semibold text-slate-800">
                        Pilih File Harian
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Tarik file atau klik (PDF, Excel, Word)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. SIKAWAN BULANAN */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>2. Sikawan Bulanan <span className="text-rose-500">*</span></span>
                  {fileBulanan && (
                    <span className="text-[10px] font-semibold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Siap
                    </span>
                  )}
                </label>

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingBulanan(true); }}
                  onDragLeave={() => setIsDraggingBulanan(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingBulanan(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      setFileBulanan(e.dataTransfer.files[0]);
                      setErrorMessage('');
                    }
                  }}
                  onClick={() => fileBulananInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[125px] ${
                    fileBulanan
                      ? 'border-teal-500 bg-teal-50/40 text-teal-900'
                      : isDraggingBulanan
                      ? 'border-teal-600 bg-teal-100/50 scale-[1.01]'
                      : 'border-slate-300 hover:border-teal-400 bg-slate-50/50 hover:bg-teal-50/20'
                  }`}
                >
                  <input
                    ref={fileBulananInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.xlsx,.xls,.docx,.doc,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFileBulanan(e.target.files[0]);
                        setErrorMessage('');
                      }
                    }}
                  />

                  {fileBulanan ? (
                    <div className="w-full flex flex-col items-center">
                      <div className="p-2 rounded-lg bg-teal-100 text-teal-800 mb-1.5">
                        <FileText className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-800 truncate max-w-[200px]" title={fileBulanan.name}>
                        {fileBulanan.name}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                        {formatFileSize(fileBulanan.size)}
                      </p>
                      <span className="text-[10px] text-teal-700 font-semibold mt-1 bg-white px-2 py-0.5 rounded-md border border-teal-200">
                        Klik untuk ganti file
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="p-2 rounded-full bg-slate-200/60 text-slate-600 mb-1">
                        <Upload className="w-4 h-4 text-teal-700" />
                      </div>
                      <p className="text-xs font-semibold text-slate-800">
                        Pilih File Bulanan
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Tarik file atau klik (PDF, Excel, Word)
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Combined Upload Status Indicator */}
            <div className="bg-slate-100 rounded-lg p-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">
                Kelengkapan Berkas:
              </span>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1 font-semibold ${fileHarian ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {fileHarian ? '✓' : '✗'} Harian
                </span>
                <span className="text-slate-300">|</span>
                <span className={`inline-flex items-center gap-1 font-semibold ${fileBulanan ? 'text-teal-700' : 'text-slate-400'}`}>
                  {fileBulanan ? '✓' : '✗'} Bulanan
                </span>
              </div>
            </div>

          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Perhatian</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 active:scale-[0.99] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Menyimpan ke Riwayat & Spreadsheet...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Kirim Laporan Sikawan (Harian & Bulanan)</span>
              </>
            )}
          </button>
          <p className="text-[11px] text-center text-slate-500 mt-2">
            Data otomatis dicatat ke Riwayat Pengiriman dan disinkronkan ke Spreadsheet.
          </p>
        </div>
      </form>
    </div>
  );
};
