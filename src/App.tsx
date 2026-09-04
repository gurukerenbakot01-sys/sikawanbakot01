import React, { useState, useEffect } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  FormSikawan 
} from './components/FormSikawan';
import { 
  RiwayatPengiriman 
} from './components/RiwayatPengiriman';
import { 
  SuccessPopup 
} from './components/SuccessPopup';
import { 
  SpreadsheetModal 
} from './components/SpreadsheetModal';
import { 
  DataGuruModal 
} from './components/DataGuruModal';
import { 
  Guru, 
  LaporanPengiriman, 
  SpreadsheetConfig 
} from './types';
import { 
  getStoredGuruList, 
  saveStoredGuruList, 
  getStoredLaporanList, 
  saveStoredLaporanList, 
  getSpreadsheetConfig, 
  saveSpreadsheetConfig, 
  saveFileToIndexedDB, 
  deleteFileFromIndexedDB, 
  downloadLaporanFile,
  fileToBase64
} from './services/storage';
import { 
  fetchGuruFromSpreadsheet, 
  fetchRiwayatFromSpreadsheet,
  syncLaporanToSpreadsheet, 
  deleteLaporanFromSpreadsheet, 
  exportRiwayatToCSV 
} from './services/spreadsheetService';
import { 
  FileSpreadsheet, 
  Sparkles, 
  CheckCircle, 
  Layers, 
  FileText, 
  History as HistoryIcon,
  ShieldCheck,
  Calendar
} from 'lucide-react';

export default function App() {
  // Main Data States
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [riwayatList, setRiwayatList] = useState<LaporanPengiriman[]>([]);
  const [config, setConfig] = useState<SpreadsheetConfig>(getSpreadsheetConfig());

  // UI Flow States
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isRefreshingGuru, setIsRefreshingGuru] = useState<boolean>(false);
  const [isRefreshingRiwayat, setIsRefreshingRiwayat] = useState<boolean>(false);
  
  // Modals & Popups
  const [successLaporan, setSuccessLaporan] = useState<LaporanPengiriman | null>(null);
  const [isSpreadsheetModalOpen, setIsSpreadsheetModalOpen] = useState<boolean>(false);
  const [isGuruModalOpen, setIsGuruModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active View on Mobile / Tablet (Allows toggling between Side 1 and Side 2, or both on desktop)
  const [mobileView, setMobileView] = useState<'both' | 'form' | 'history'>('both');

  // Load initial data and sync with online spreadsheet
  useEffect(() => {
    const loadedGuru = getStoredGuruList();
    const loadedLaporan = getStoredLaporanList();
    const loadedConfig = getSpreadsheetConfig();
    setGuruList(loadedGuru);
    setRiwayatList(loadedLaporan);
    setConfig(loadedConfig);

    const syncOnlineDatabase = async (cfg: SpreadsheetConfig) => {
      // 1. Fetch Teachers from Spreadsheet
      try {
        const fromSheet = await fetchGuruFromSpreadsheet(cfg);
        if (fromSheet && fromSheet.length > 0) {
          setGuruList(fromSheet);
          saveStoredGuruList(fromSheet);
        }
      } catch {
        // fallback
      }

      // 2. Fetch Riwayat Submissions from Spreadsheet (shows all teachers online)
      try {
        const fromRiwayat = await fetchRiwayatFromSpreadsheet(cfg);
        // Penting: jika data di spreadsheet dihapus atau kosong, fromRiwayat berupa array kosong []
        // State riwayatList dan localStorage di semua pengguna akan otomatis ikut terhapus
        if (fromRiwayat !== null && Array.isArray(fromRiwayat)) {
          setRiwayatList((prev) => {
            const prevIds = prev.map((p) => p.id).join(',');
            const newIds = fromRiwayat.map((p) => p.id).join(',');
            if (prevIds !== newIds || prev.length !== fromRiwayat.length) {
              saveStoredLaporanList(fromRiwayat);
              return fromRiwayat;
            }
            return prev;
          });
        }
      } catch {
        // fallback
      }
    };

    if (loadedConfig.appsScriptUrl || loadedConfig.spreadsheetId) {
      // Sinkronisasi langsung saat aplikasi dimuat
      syncOnlineDatabase(loadedConfig);

      // Sinkronisasi otomatis setiap 8 detik agar perubahan/penghapusan spreadsheet real-time di semua pengguna
      const intervalId = setInterval(() => {
        syncOnlineDatabase(loadedConfig);
      }, 8000);

      // Sinkronisasi langsung saat tab browser kembali dibuka / difokuskan
      const handleTabActive = () => {
        if (!document.hidden) {
          syncOnlineDatabase(loadedConfig);
        }
      };
      document.addEventListener('visibilitychange', handleTabActive);
      window.addEventListener('focus', handleTabActive);

      return () => {
        clearInterval(intervalId);
        document.removeEventListener('visibilitychange', handleTabActive);
        window.removeEventListener('focus', handleTabActive);
      };
    }
  }, [config.appsScriptUrl, config.spreadsheetId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Pull latest teachers from spreadsheet if configured
  const handleRefreshGuru = async () => {
    setIsRefreshingGuru(true);
    try {
      const fromSheet = await fetchGuruFromSpreadsheet(config);
      if (fromSheet && fromSheet.length > 0) {
        setGuruList(fromSheet);
        saveStoredGuruList(fromSheet);
        showToast(`Berhasil memperbarui ${fromSheet.length} data guru dari Spreadsheet.`);
      } else {
        showToast('Data guru tetap menggunakan database lokal sekolah.');
      }
    } catch {
      showToast('Gagal menarik data guru dari spreadsheet. Memakai data lokal.');
    } finally {
      setIsRefreshingGuru(false);
    }
  };

  // Pull latest submissions from spreadsheet (all teachers)
  const handleRefreshRiwayat = async (showNotification = false) => {
    setIsRefreshingRiwayat(true);
    try {
      const fromSheet = await fetchRiwayatFromSpreadsheet(config);
      if (fromSheet !== null && Array.isArray(fromSheet)) {
        setRiwayatList(fromSheet);
        saveStoredLaporanList(fromSheet);
        if (showNotification) {
          if (fromSheet.length === 0) {
            showToast('Database spreadsheet kosong/telah dihapus. Riwayat direset secara otomatis.');
          } else {
            showToast(`Berhasil menyinkronkan ${fromSheet.length} riwayat laporan online.`);
          }
        }
      } else if (showNotification) {
        showToast('Riwayat laporan sudah mutakhir dengan spreadsheet.');
      }
    } catch {
      if (showNotification) {
        showToast('Gagal menyinkronkan data riwayat online.');
      }
    } finally {
      setIsRefreshingRiwayat(false);
    }
  };

  // Handle Form Submission: Both files uploaded simultaneously
  const handleSubmitLaporan = async (formData: {
    namaGuru: string;
    nip: string;
    jabatan: string;
    periodeBulan: string;
    tahun: string;
    fileHarian: File;
    fileBulanan: File;
    catatan?: string;
  }) => {
    setIsSubmitting(true);
    try {
      const now = new Date();
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const dateCode = now.toISOString().slice(0, 10).replace(/-/g, '');
      const newId = `LAP-${dateCode}-${randomSuffix}`;

      // Formatted date Indonesia: e.g. "03 September 2026, 10:15 WIB"
      const dateOptions: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
      const formattedDate = `${now.toLocaleDateString('id-ID', dateOptions)} WIB`;

      // Save files to IndexedDB binary store
      await saveFileToIndexedDB(`${newId}_harian`, formData.fileHarian);
      await saveFileToIndexedDB(`${newId}_bulanan`, formData.fileBulanan);

      // Convert files to base64 for direct Google Drive PDF upload
      let fileHarianBase64 = '';
      let fileBulananBase64 = '';
      try {
        fileHarianBase64 = await fileToBase64(formData.fileHarian);
        fileBulananBase64 = await fileToBase64(formData.fileBulanan);
      } catch (errB64) {
        console.warn('Base64 encoding fallback:', errB64);
      }

      const newLaporan: LaporanPengiriman = {
        id: newId,
        tanggalUnggah: now.toISOString(),
        tanggalFormatted: formattedDate,
        namaGuru: formData.namaGuru,
        nip: formData.nip,
        jabatan: formData.jabatan,
        periodeBulan: formData.periodeBulan,
        tahun: formData.tahun,
        fileHarianName: formData.fileHarian.name,
        fileHarianSize: formData.fileHarian.size,
        fileHarianType: formData.fileHarian.type,
        fileBulananName: formData.fileBulanan.name,
        fileBulananSize: formData.fileBulanan.size,
        fileBulananType: formData.fileBulanan.type,
        catatan: formData.catatan || '',
        syncedToSpreadsheet: true,
      };

      // Push to Google Spreadsheet & Google Drive with PDF Link generation
      syncLaporanToSpreadsheet(newLaporan, config, fileHarianBase64, fileBulananBase64);

      // Update state and persistence immediately
      const updatedList = [newLaporan, ...riwayatList];
      setRiwayatList(updatedList);
      saveStoredLaporanList(updatedList);

      // Trigger automatic background refresh to obtain generated Drive URL link
      setTimeout(() => {
        handleRefreshRiwayat(false);
      }, 3000);

      // Show the requested Success Popup notification
      setSuccessLaporan(newLaporan);
      showToast('Laporan Sikawan berhasil disimpan dan dicatat ke Spreadsheet!');
    } catch (err: any) {
      console.error(err);
      throw new Error('Gagal menyimpan laporan: ' + (err?.message || 'Error internal'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Download File handler with custom naming [Nama Guru]_Laporan-kinerja-pegawai-Harian/Bulanan
  const handleDownloadFile = async (
    id: string, 
    type: 'harian' | 'bulanan', 
    filename: string, 
    namaGuru?: string,
    driveUrl?: string
  ) => {
    try {
      await downloadLaporanFile(id, type, filename, namaGuru, driveUrl);
    } catch (err) {
      console.error('Failed to download file:', err);
      showToast('Gagal mengunduh file.');
    }
  };

  // Delete submission
  const handleDeleteLaporan = async (id: string) => {
    try {
      // Remove from IndexedDB
      await deleteFileFromIndexedDB(`${id}_harian`);
      await deleteFileFromIndexedDB(`${id}_bulanan`);

      // Remove from Spreadsheet if configured
      deleteLaporanFromSpreadsheet(id, config);

      // Update local state
      const updatedList = riwayatList.filter((item) => item.id !== id);
      setRiwayatList(updatedList);
      saveStoredLaporanList(updatedList);

      showToast('Laporan berhasil dihapus dari riwayat.');
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Terjadi kesalahan saat menghapus laporan.');
    }
  };

  // Export to CSV matching Spreadsheet format
  const handleExportCSV = () => {
    exportRiwayatToCSV(riwayatList);
    showToast('Berkas CSV Riwayat Pengiriman berhasil diekspor.');
  };

  // Save Spreadsheet Config
  const handleSaveConfig = (newConfig: SpreadsheetConfig) => {
    setConfig(newConfig);
    saveSpreadsheetConfig(newConfig);
    showToast('Pengaturan ID Spreadsheet berhasil diperbarui.');
  };

  // Add new teacher to list
  const handleAddGuru = (newGuruData: Omit<Guru, 'id'>) => {
    const newGuru: Guru = {
      id: `GUR-${Date.now().toString().slice(-4)}`,
      ...newGuruData,
    };
    const updated = [...guruList, newGuru];
    setGuruList(updated);
    saveStoredGuruList(updated);
    showToast(`Guru ${newGuru.nama} berhasil ditambahkan ke database.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-800 selection:bg-emerald-200">
      
      {/* Header with School Logo & Spreadsheet Status */}
      <Header
        config={config}
        onOpenSpreadsheetModal={() => setIsSpreadsheetModalOpen(true)}
        onOpenGuruModal={() => setIsGuruModalOpen(true)}
        onOpenGuideModal={() => setIsSpreadsheetModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        
        {/* Banner Penempatan ID Spreadsheet & Informasi Real-Time */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs mb-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3 w-full md:w-auto">
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-700 border border-emerald-200/60 shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  Integrasi Google Spreadsheet Real-Time
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Aktif & Siap Digunakan
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                <span>Penempatan ID Spreadsheet:</span>
                <code className="font-mono bg-slate-100 text-emerald-900 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                  {config.spreadsheetId || '1-0gTmSV9aYBwmpGU1JcbZscmIn8u67z_SFTe9bn-P5c'}
                </code>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <button
              onClick={() => setIsSpreadsheetModalOpen(true)}
              className="px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <span>Ubah ID Spreadsheet</span>
            </button>
            <button
              onClick={() => setIsGuruModalOpen(true)}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <span>Daftar Guru ({guruList.length})</span>
            </button>
          </div>
        </div>

        {/* Mobile View Toggle (Visible on smaller screens for instant focus) */}
        <div className="lg:hidden flex items-center justify-center p-1 bg-white rounded-xl border border-slate-200 shadow-2xs mb-4">
          <button
            type="button"
            onClick={() => setMobileView('both')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              mobileView === 'both' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tampilkan Keduanya
          </button>
          <button
            type="button"
            onClick={() => setMobileView('form')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              mobileView === 'form' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Formulir Pengunggahan
          </button>
          <button
            type="button"
            onClick={() => setMobileView('history')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              mobileView === 'history' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tabel Database ({riwayatList.length})
          </button>
        </div>

        {/* THE TWO SIDES LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* SISI PERTAMA: FORMULIR IDENTITAS GURU & UNGGAH BERKAS HARIAN + BULANAN */}
          <div className={`lg:col-span-5 ${mobileView === 'history' ? 'hidden lg:block' : 'block'}`}>
            <FormSikawan
              guruList={guruList}
              isSubmitting={isSubmitting}
              onSubmitLaporan={handleSubmitLaporan}
              onRefreshGuruFromSpreadsheet={handleRefreshGuru}
              isRefreshingGuru={isRefreshingGuru}
            />
          </div>

          {/* SISI KEDUA: RIWAYAT PENGIRIMAN TABEL DATA & AKSI UNDUH / HAPUS */}
          <div className={`lg:col-span-7 ${mobileView === 'form' ? 'hidden lg:block' : 'block'}`}>
            <RiwayatPengiriman
              riwayatList={riwayatList}
              onDownloadFile={handleDownloadFile}
              onDeleteLaporan={handleDeleteLaporan}
              onExportCSV={handleExportCSV}
              onRefreshData={() => handleRefreshRiwayat(true)}
              isRefreshing={isRefreshingRiwayat}
            />
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-10 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img
              src="https://i.ibb.co.com/chW3GkWh/logo-bakot-01.png"
              alt="Logo SDN Babelan Kota 01"
              className="w-6 h-6 object-contain"
              referrerPolicy="no-referrer"
            />
            <span className="font-bold text-slate-700">
              SD NEGERI BABELAN KOTA 01 • TAHUN 2026
            </span>
          </div>

          <p className="text-center sm:text-right text-[11px] text-slate-500">
            Aplikasi Laporan Sikawan Harian & Bulanan Terintegrasi Google Spreadsheet Real-Time
          </p>
        </div>
      </footer>

      {/* Pop-up Notifikasi Sukses Saat Berhasil Unggah */}
      <SuccessPopup
        laporan={successLaporan}
        onClose={() => setSuccessLaporan(null)}
        onViewHistory={() => {
          setSuccessLaporan(null);
          setMobileView('history');
        }}
      />

      {/* Modal Penempatan ID Spreadsheet & Pengaturan */}
      <SpreadsheetModal
        isOpen={isSpreadsheetModalOpen}
        onClose={() => setIsSpreadsheetModalOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />

      {/* Modal Database Guru */}
      <DataGuruModal
        isOpen={isGuruModalOpen}
        onClose={() => setIsGuruModalOpen(false)}
        guruList={guruList}
        onAddGuru={handleAddGuru}
        onRefreshGuru={handleRefreshGuru}
        isRefreshing={isRefreshingGuru}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3 text-xs animate-bounce-short">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white text-xs ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

    </div>
  );
}
