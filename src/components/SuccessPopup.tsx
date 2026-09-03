import React from 'react';
import { CheckCircle2, FileText, Calendar, User, Briefcase, FileSpreadsheet, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { LaporanPengiriman } from '../types';

interface SuccessPopupProps {
  laporan: LaporanPengiriman | null;
  onClose: () => void;
  onViewHistory?: () => void;
}

export const SuccessPopup: React.FC<SuccessPopupProps> = ({
  laporan,
  onClose,
  onViewHistory,
}) => {
  if (!laporan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-emerald-100 relative overflow-hidden transform transition-all animate-scale-up">
        
        {/* Top decorative badge */}
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

        {/* Close icon button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
          title="Tutup Notifikasi"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Content */}
        <div className="flex flex-col items-center text-center mt-1">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner mb-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold tracking-wide uppercase mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            SDN BABELAN KOTA 01 • TAHUN 2026
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
            Laporan Sikawan Berhasil Diunggah!
          </h3>
          <p className="text-xs text-slate-600 mt-1 max-w-sm">
            Berkas Harian & Bulanan telah tersimpan aman dan dicatat ke dalam database spreadsheet secara real-time.
          </p>
        </div>

        {/* Receipt / Details Card */}
        <div className="mt-5 bg-slate-50/90 rounded-2xl p-4 border border-slate-200/90 text-xs space-y-3">
          
          {/* Guru info */}
          <div className="flex items-start justify-between pb-3 border-b border-slate-200">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Identitas Guru</span>
              <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                {laporan.namaGuru}
              </p>
              <p className="text-slate-600 font-mono text-[11px]">NIP: {laporan.nip}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Jabatan</span>
              <p className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px] mt-0.5">
                {laporan.jabatan}
              </p>
            </div>
          </div>

          {/* Files Uploaded */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Berkas Terlampir</span>
            
            {/* File Harian */}
            <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-emerald-200 shadow-2xs">
              <div className="flex items-center gap-2 truncate">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="font-bold text-slate-800 text-xs truncate max-w-[240px]">
                    {laporan.fileHarianName}
                  </p>
                  <p className="text-[10px] text-emerald-700 font-medium">Sikawan Harian</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Terunggah ✓
              </span>
            </div>

            {/* File Bulanan */}
            <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-teal-200 shadow-2xs">
              <div className="flex items-center gap-2 truncate">
                <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="font-bold text-slate-800 text-xs truncate max-w-[240px]">
                    {laporan.fileBulananName}
                  </p>
                  <p className="text-[10px] text-teal-700 font-medium">Sikawan Bulanan</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                Terunggah ✓
              </span>
            </div>
          </div>

          {/* Meta & Sync status */}
          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{laporan.tanggalFormatted}</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-700 font-semibold">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Tersimpan di Spreadsheet</span>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onViewHistory) onViewHistory();
            }}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl text-white font-bold text-xs bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Lihat di Tabel Riwayat</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-5 rounded-xl text-slate-700 font-semibold text-xs bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
          >
            Tutup & Unggah Baru
          </button>
        </div>

      </div>
    </div>
  );
};
