import React from 'react';
import { Database, FileSpreadsheet, Users, HelpCircle, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { SpreadsheetConfig } from '../types';

interface HeaderProps {
  config: SpreadsheetConfig;
  onOpenSpreadsheetModal: () => void;
  onOpenGuruModal: () => void;
  onOpenGuideModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onOpenSpreadsheetModal,
  onOpenGuruModal,
  onOpenGuideModal,
}) => {
  const logoUrl = 'https://i.ibb.co.com/chW3GkWh/logo-bakot-01.png';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-3.5 gap-4">
          
          {/* Logo and School Identity */}
          <div className="flex items-center gap-3.5 w-full md:w-auto">
            <div className="relative shrink-0 flex items-center justify-center p-1 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <img
                src={logoUrl}
                alt="Logo SDN Babelan Kota 01"
                className="w-13 h-13 object-contain drop-shadow-xs"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback graceful display if external image host has network hiccup
                  (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Logo_Tut_Wuri_Handayani.png';
                }}
              />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  Resmi • Tahun 2026
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Kec. Babelan, Kab. Bekasi
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight mt-0.5">
                SD NEGERI BABELAN KOTA 01
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-600">
                Laporan Sikawan Harian & Bulanan Guru
              </p>
            </div>
          </div>

          {/* Spreadsheet Status & Actions */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            
            {/* Spreadsheet ID Placement Badge */}
            <button
              onClick={onOpenSpreadsheetModal}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200/80 hover:bg-emerald-100/70 transition cursor-pointer"
              title="Klik untuk melihat atau mengatur ID Spreadsheet"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold leading-none">
                  Spreadsheet Aktif
                </span>
                <span className="font-mono text-[11px] text-emerald-900 max-w-[130px] truncate leading-tight">
                  ID: {config.spreadsheetId ? `${config.spreadsheetId.slice(0, 10)}...` : 'Belum diisi'}
                </span>
              </div>
            </button>

            {/* Quick Data Guru Button */}
            <button
              onClick={onOpenGuruModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200/70 transition cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-slate-600" />
              <span>Data Guru</span>
            </button>

            {/* Panduan & Pengaturan Spreadsheet Button */}
            <button
              onClick={onOpenGuideModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100/70 transition cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Format & Panduan</span>
            </button>

          </div>

        </div>
      </div>

      {/* Realtime Status Sub-bar */}
      <div className="bg-slate-900 text-slate-200 text-[11px] px-4 py-1">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Database Spreadsheet Real-Time: <strong>Terhubung</strong></span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-300 hidden sm:inline">Akses Publik Tanpa Perlu Login Akun Google</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <span className="hidden md:inline">Tahun 2026</span>
            <button 
              onClick={onOpenSpreadsheetModal}
              className="text-emerald-400 hover:text-emerald-300 underline font-medium cursor-pointer"
            >
              Atur ID Spreadsheet
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
