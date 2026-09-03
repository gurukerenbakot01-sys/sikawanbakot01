import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  X, 
  Check, 
  Copy, 
  ExternalLink, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Code, 
  Table, 
  ShieldCheck 
} from 'lucide-react';
import { SpreadsheetConfig } from '../types';
import { APPS_SCRIPT_TEMPLATE, checkSpreadsheetHealth } from '../services/spreadsheetService';

interface SpreadsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SpreadsheetConfig;
  onSaveConfig: (config: SpreadsheetConfig) => void;
  onSyncNow?: () => void;
}

export const SpreadsheetModal: React.FC<SpreadsheetModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onSyncNow,
}) => {
  const [spreadsheetId, setSpreadsheetId] = useState<string>(config.spreadsheetId || '');
  const [appsScriptUrl, setAppsScriptUrl] = useState<string>(config.appsScriptUrl || '');
  const [sheetGuruName, setSheetGuruName] = useState<string>(config.sheetGuruName || 'Data_Guru');
  const [sheetRiwayatName, setSheetRiwayatName] = useState<string>(config.sheetRiwayatName || 'Riwayat_Pengiriman');
  
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'success' | 'warning' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'config' | 'format' | 'script'>('config');

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult({ status: 'idle', message: '' });

    try {
      const result = await checkSpreadsheetHealth({
        ...config,
        spreadsheetId,
        appsScriptUrl,
        sheetGuruName,
        sheetRiwayatName,
      });

      if (result.isActive) {
        setTestResult({
          status: 'success',
          message: `${result.message}. Spreadsheet aktif dan siap menerima data!`,
        });
      } else {
        setTestResult({
          status: 'warning',
          message: result.message,
        });
      }
    } catch (err: any) {
      setTestResult({
        status: 'error',
        message: 'Gagal menghubungi server Spreadsheet. Periksa kembali ID atau koneksi internet.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSaveConfig({
      ...config,
      spreadsheetId: spreadsheetId.trim(),
      appsScriptUrl: appsScriptUrl.trim(),
      sheetGuruName: sheetGuruName.trim() || 'Data_Guru',
      sheetRiwayatName: sheetRiwayatName.trim() || 'Riwayat_Pengiriman',
      isOnlineActive: true,
      lastSyncedAt: new Date().toISOString(),
    });
    onClose();
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Penempatan ID Spreadsheet & Integrasi Real-Time
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                SD Negeri Babelan Kota 01 • Akses Tanpa Perlu Login Google
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'config'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>ID Spreadsheet & Koneksi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('format')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'format'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Format Tabel Spreadsheet</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('script')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'script'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Kode Apps Script (Web App)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* TAB 1: CONFIG */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              {/* Highlight box */}
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3.5 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-emerald-900 leading-relaxed">
                  <p className="font-bold">Akses Bebas Login untuk Semua Guru</p>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Aplikasi ini dirancang agar guru dapat langsung membuka dari HP, tablet, maupun laptop di sekolah tanpa harus repot login akun Google satu per satu.
                  </p>
                </div>
              </div>

              {/* ID Spreadsheet Input */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800 text-xs flex items-center justify-between">
                  <span>ID Spreadsheet Google (Wajib)</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Ambil dari URL Google Sheet Anda
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={spreadsheetId}
                    onChange={(e) => setSpreadsheetId(e.target.value)}
                    placeholder="Contoh: 14t_sJ1jC-nQ6FzCPVw7K2xLk8X9uN2mYePqSdRgT4oE"
                    className="w-full px-3.5 py-2.5 font-mono text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 shadow-2xs"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Letak ID Spreadsheet pada tautan browser: <br/>
                  <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-emerald-800">
                    https://docs.google.com/spreadsheets/d/<strong>[ID_SPREADSHEET_DISINI]</strong>/edit
                  </code>
                </p>
              </div>

              {/* Web App URL (Optional for direct Apps Script push) */}
              <div className="space-y-1.5 pt-1">
                <label className="block font-bold text-slate-800 text-xs flex items-center justify-between">
                  <span>URL Web App Google Apps Script (Opsional / Direkomendasikan)</span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">
                    Dua Arah Real-Time
                  </span>
                </label>
                <input
                  type="text"
                  value={appsScriptUrl}
                  onChange={(e) => setAppsScriptUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  className="w-full px-3.5 py-2.5 font-mono text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 shadow-2xs"
                />
                <p className="text-[11px] text-slate-500">
                  Dapatkan URL ini dengan menempelkan kode di tab <strong>Kode Apps Script</strong>, lalu klik Penerapan Baru (Web App) dengan hak akses "Siapa saja".
                </p>
              </div>

              {/* Sheet Names */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Sheet Data Guru
                  </label>
                  <input
                    type="text"
                    value={sheetGuruName}
                    onChange={(e) => setSheetGuruName(e.target.value)}
                    placeholder="Data_Guru"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Sheet Riwayat Pengiriman
                  </label>
                  <input
                    type="text"
                    value={sheetRiwayatName}
                    onChange={(e) => setSheetRiwayatName(e.target.value)}
                    placeholder="Riwayat_Pengiriman"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              {/* Test Connection Button & Status */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || !spreadsheetId}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-300 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>Uji Status Keaktifan Spreadsheet</span>
                </button>

                {testResult.message && (
                  <div className={`mt-3 p-3 rounded-xl border flex items-start gap-2 ${
                    testResult.status === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : testResult.status === 'warning'
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}>
                    {testResult.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold">
                        {testResult.status === 'success' ? 'Spreadsheet Aktif!' : 'Informasi Status'}
                      </p>
                      <p className="text-[11px] mt-0.5">{testResult.message}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: FORMAT TABEL */}
          {activeTab === 'format' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-1">
                  Format Struktur Spreadsheet SDN Babelan Kota 01
                </h4>
                <p className="text-slate-600 text-[11px]">
                  Buat 2 lembar (sheet) di dalam file Google Spreadsheet Anda dengan susunan kolom berikut:
                </p>
              </div>

              {/* Table 1: Data Guru */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="bg-emerald-800 text-white px-3.5 py-2 font-bold flex items-center justify-between">
                  <span>Lembar 1: Nama Sheet <code>Data_Guru</code></span>
                  <span className="text-[10px] bg-emerald-700 px-2 py-0.5 rounded">Master Data</span>
                </div>
                <div className="p-3 bg-slate-50 space-y-2">
                  <p className="text-[11px] text-slate-600 font-medium">Susunan Kolom Baris 1 (Header):</p>
                  <div className="grid grid-cols-4 gap-1 text-[10px] font-mono text-center font-bold">
                    <div className="bg-white p-2 border border-slate-300 rounded">A: No</div>
                    <div className="bg-white p-2 border border-slate-300 rounded">B: Nama Guru</div>
                    <div className="bg-white p-2 border border-slate-300 rounded">C: NIP</div>
                    <div className="bg-white p-2 border border-slate-300 rounded">D: Jabatan</div>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    * Data ini akan dibaca oleh aplikasi dan muncul di pilihan dropdown sisi formulir.
                  </p>
                </div>
              </div>

              {/* Table 2: Riwayat Pengiriman */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="bg-teal-800 text-white px-3.5 py-2 font-bold flex items-center justify-between">
                  <span>Lembar 2: Nama Sheet <code>Riwayat_Pengiriman</code></span>
                  <span className="text-[10px] bg-teal-700 px-2 py-0.5 rounded">Database Log</span>
                </div>
                <div className="p-3 bg-slate-50 space-y-2">
                  <p className="text-[11px] text-slate-600 font-medium">Susunan Kolom Baris 1 (Header):</p>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 text-[10px] font-mono text-center font-bold">
                    <div className="bg-white p-1.5 border border-slate-300 rounded">A: ID Pengiriman</div>
                    <div className="bg-white p-1.5 border border-slate-300 rounded">B: Tanggal Unggah</div>
                    <div className="bg-white p-1.5 border border-slate-300 rounded">C: Nama Guru</div>
                    <div className="bg-white p-1.5 border border-slate-300 rounded">D: NIP</div>
                    <div className="bg-white p-1.5 border border-slate-300 rounded">E: Jabatan</div>
                    <div className="bg-white p-1.5 border border-slate-300 rounded">F: Periode Bulan</div>
                    <div className="bg-white p-1.5 border border-slate-300 rounded">G: Tahun</div>
                    <div className="bg-white p-1.5 border border-slate-300 rounded">H: File Harian</div>
                    <div className="bg-white p-1.5 border border-slate-300 rounded">I: File Bulanan</div>
                    <div className="bg-white p-1.5 border border-slate-300 rounded">J: Catatan</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: APPS SCRIPT CODE */}
          {activeTab === 'script' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    Kode Google Apps Script Otomatis
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Tempelkan di <strong>Ekstensi &gt; Apps Script</strong> pada Google Spreadsheet Anda.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  {copiedScript ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Kode Script</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative rounded-xl bg-slate-900 text-slate-200 p-3 font-mono text-[11px] max-h-56 overflow-y-auto border border-slate-800">
                <pre>{APPS_SCRIPT_TEMPLATE}</pre>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-[11px] text-blue-900 space-y-1">
                <p className="font-bold">Langkah Cepat 3 Menit:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-blue-800">
                  <li>Buka Spreadsheet, pilih <strong>Ekstensi &gt; Apps Script</strong>.</li>
                  <li>Tempel kode di atas lalu klik <strong>Terapkan &gt; Penerapan Baru (Web app)</strong>.</li>
                  <li>Ubah <em>"Siapa yang memiliki akses"</em> menjadi <strong>"Siapa saja" (Anyone)</strong>.</li>
                  <li>Salin URL Web App dan masukkan ke kolom di tab pertama!</li>
                </ol>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Pengaturan</span>
          </button>
        </div>

      </div>
    </div>
  );
};
