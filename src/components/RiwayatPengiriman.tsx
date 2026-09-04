import React, { useState, useMemo } from 'react';
import { 
  History, 
  Download, 
  Trash2, 
  Search, 
  FileSpreadsheet, 
  Calendar, 
  FileText, 
  CheckCircle, 
  RefreshCw, 
  Filter, 
  AlertTriangle,
  FileCheck,
  UserCheck,
  ExternalLink
} from 'lucide-react';
import { LaporanPengiriman } from '../types';
import { generateDownloadFilename } from '../services/storage';

interface RiwayatPengirimanProps {
  riwayatList: LaporanPengiriman[];
  onDownloadFile: (id: string, type: 'harian' | 'bulanan', filename: string, namaGuru: string, driveUrl?: string) => Promise<void>;
  onDeleteLaporan: (id: string) => Promise<void>;
  onExportCSV: () => void;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
}

export const RiwayatPengiriman: React.FC<RiwayatPengirimanProps> = ({
  riwayatList,
  onDownloadFile,
  onDeleteLaporan,
  onExportCSV,
  onRefreshData,
  isRefreshing = false,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBulanFilter, setSelectedBulanFilter] = useState<string>('SEMUA');
  const [itemToDelete, setItemToDelete] = useState<LaporanPengiriman | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  // Filtered List
  const filteredList = useMemo(() => {
    return riwayatList.filter((item) => {
      const matchesSearch = 
        item.namaGuru.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.jabatan && item.jabatan.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.fileHarianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.fileBulananName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBulan = 
        selectedBulanFilter === 'SEMUA' || 
        item.periodeBulan.toLowerCase() === selectedBulanFilter.toLowerCase() ||
        item.tanggalFormatted.toLowerCase().includes(selectedBulanFilter.toLowerCase());

      return matchesSearch && matchesBulan;
    });
  }, [riwayatList, searchQuery, selectedBulanFilter]);

  // Statistics
  const totalPengiriman = riwayatList.length;
  const uniqueGuruCount = new Set(riwayatList.map((r) => r.nip || r.namaGuru)).size;

  const handleDownload = async (
    id: string, 
    type: 'harian' | 'bulanan', 
    filename: string, 
    namaGuru: string,
    driveUrl?: string
  ) => {
    setDownloadingKey(`${id}_${type}`);
    try {
      await onDownloadFile(id, type, filename, namaGuru, driveUrl);
    } finally {
      setTimeout(() => setDownloadingKey(null), 500);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteLaporan(itemToDelete.id);
      setItemToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Short clean date formatter helper
  const formatShortTanggal = (item: LaporanPengiriman): string => {
    if (item.tanggalUnggah) {
      try {
        const d = new Date(item.tanggalUnggah);
        if (!isNaN(d.getTime())) {
          const day = String(d.getDate()).padStart(2, '0');
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
          const month = monthNames[d.getMonth()];
          const year = d.getFullYear();
          const hours = String(d.getHours()).padStart(2, '0');
          const minutes = String(d.getMinutes()).padStart(2, '0');
          return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
        }
      } catch {
        // fallback
      }
    }
    if (item.tanggalFormatted) {
      return item.tanggalFormatted
        .replace(/Januari/g, 'Jan')
        .replace(/Februari/g, 'Feb')
        .replace(/Maret/g, 'Mar')
        .replace(/April/g, 'Apr')
        .replace(/Mei/g, 'Mei')
        .replace(/Juni/g, 'Jun')
        .replace(/Juli/g, 'Jul')
        .replace(/Agustus/g, 'Agu')
        .replace(/September/g, 'Sep')
        .replace(/Oktober/g, 'Okt')
        .replace(/November/g, 'Nov')
        .replace(/Desember/g, 'Des');
    }
    return '-';
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4.5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 backdrop-blur-xs rounded-xl border border-white/15">
              <History className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-400">
                TABEL DATABASE
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                Riwayat Pengiriman Laporan Sikawan
              </h2>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            {onRefreshData && (
              <button
                type="button"
                onClick={onRefreshData}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 transition cursor-pointer disabled:opacity-50"
                title="Segarkan data dari spreadsheet"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Segarkan</span>
              </button>
            )}

            <button
              type="button"
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition cursor-pointer"
              title="Unduh format tabel CSV untuk Spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-slate-700/60 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Total Pengiriman: <strong className="text-white">{totalPengiriman}</strong></span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Guru Melapor: <strong className="text-white">{uniqueGuruCount}</strong> Guru</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[11px] text-emerald-300 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Database Online Terhubung</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Nama Guru, berkas..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-800"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Month Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            Bulan:
          </span>
          <select
            value={selectedBulanFilter}
            onChange={(e) => setSelectedBulanFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-medium"
          >
            <option value="SEMUA">Semua Periode</option>
            <option value="September">September 2026</option>
            <option value="Agustus">Agustus 2026</option>
            <option value="Juli">Juli 2026</option>
            <option value="Juni">Juni 2026</option>
            <option value="Mei">Mei 2026</option>
            <option value="April">April 2026</option>
            <option value="Maret">Maret 2026</option>
            <option value="Februari">Februari 2026</option>
            <option value="Januari">Januari 2026</option>
          </select>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="flex-1 overflow-x-auto min-h-[350px]">
        {filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center h-full text-slate-500">
            <div className="p-4 bg-slate-100 rounded-full mb-3 text-slate-400">
              <History className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">Belum Ada Riwayat Pengiriman</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              {searchQuery || selectedBulanFilter !== 'SEMUA'
                ? 'Tidak ditemukan data dengan kata kunci tersebut. Coba reset pencarian.'
                : 'Silakan lakukan pengunggahan formulir di sisi pertama untuk mencatat data Sikawan.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3.5 whitespace-nowrap">Tanggal Unggah</th>
                <th className="py-3 px-3.5">Nama Guru</th>
                <th className="py-3 px-3.5 text-center min-w-[220px]">
                  <div className="inline-flex items-center gap-1">
                    <Download className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Unduh File</span>
                  </div>
                  <div className="text-[10px] font-medium text-slate-500 normal-case tracking-normal">
                    (Harian & Bulanan)
                  </div>
                </th>
                <th className="py-3 px-3.5 text-center w-28 whitespace-nowrap">Tombol Hapus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {filteredList.map((item) => {
                const isDownloadingHarian = downloadingKey === `${item.id}_harian`;
                const isDownloadingBulanan = downloadingKey === `${item.id}_bulanan`;

                const harianDownloadName = generateDownloadFilename(item.namaGuru, 'harian', item.fileHarianName);
                const bulananDownloadName = generateDownloadFilename(item.namaGuru, 'bulanan', item.fileBulananName);

                return (
                  <tr 
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* 1. Tanggal Unggah */}
                    <td className="py-3.5 px-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{formatShortTanggal(item)}</span>
                      </div>
                    </td>

                    {/* 2. Nama Guru */}
                    <td className="py-3.5 px-3.5">
                      <div className="font-bold text-slate-900 text-xs">
                        {item.namaGuru}
                      </div>
                      {item.jabatan && (
                        <div className="text-[11px] text-slate-500 font-normal">
                          {item.jabatan}
                        </div>
                      )}
                    </td>

                    {/* 3. Unduh File: Harian dan Bulanan */}
                    <td className="py-3.5 px-3.5 text-center">
                      <div className="inline-flex items-center gap-1.5 p-1 bg-slate-50/90 rounded-xl border border-slate-200">
                        {/* Tombol Harian */}
                        <button
                          type="button"
                          onClick={() => handleDownload(item.id, 'harian', item.fileHarianName, item.namaGuru, item.fileHarianDriveUrl)}
                          disabled={isDownloadingHarian}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-200/80 text-emerald-800 font-semibold text-[11px] transition shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-50 group/btn"
                          title={item.fileHarianDriveUrl ? `Buka Link PDF Google Drive: ${harianDownloadName}` : `Unduh Sikawan Harian: ${harianDownloadName}`}
                        >
                          {item.fileHarianDriveUrl ? (
                            <ExternalLink className="w-3.5 h-3.5 text-emerald-700 shrink-0 group-hover/btn:scale-110 transition-transform" />
                          ) : (
                            <Download className={`w-3.5 h-3.5 text-emerald-700 shrink-0 ${isDownloadingHarian ? 'animate-bounce' : 'group-hover/btn:scale-110 transition-transform'}`} />
                          )}
                          <span className="font-bold text-emerald-950">Harian</span>
                          {item.fileHarianDriveUrl ? (
                            <span className="text-[9px] text-emerald-800 font-bold bg-emerald-200/80 px-1 py-0.5 rounded">
                              Link PDF
                            </span>
                          ) : item.fileHarianSize > 0 ? (
                            <span className="text-[10px] text-emerald-700 font-mono font-normal">
                              ({formatFileSize(item.fileHarianSize)})
                            </span>
                          ) : null}
                        </button>

                        <span className="text-slate-300 font-light select-none">|</span>

                        {/* Tombol Bulanan */}
                        <button
                          type="button"
                          onClick={() => handleDownload(item.id, 'bulanan', item.fileBulananName, item.namaGuru, item.fileBulananDriveUrl)}
                          disabled={isDownloadingBulanan}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 active:bg-teal-200 border border-teal-200/80 text-teal-800 font-semibold text-[11px] transition shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-50 group/btn"
                          title={item.fileBulananDriveUrl ? `Buka Link PDF Google Drive: ${bulananDownloadName}` : `Unduh Sikawan Bulanan: ${bulananDownloadName}`}
                        >
                          {item.fileBulananDriveUrl ? (
                            <ExternalLink className="w-3.5 h-3.5 text-teal-700 shrink-0 group-hover/btn:scale-110 transition-transform" />
                          ) : (
                            <Download className={`w-3.5 h-3.5 text-teal-700 shrink-0 ${isDownloadingBulanan ? 'animate-bounce' : 'group-hover/btn:scale-110 transition-transform'}`} />
                          )}
                          <span className="font-bold text-teal-950">Bulanan</span>
                          {item.fileBulananDriveUrl ? (
                            <span className="text-[9px] text-teal-800 font-bold bg-teal-200/80 px-1 py-0.5 rounded">
                              Link PDF
                            </span>
                          ) : item.fileBulananSize > 0 ? (
                            <span className="text-[10px] text-teal-700 font-mono font-normal">
                              ({formatFileSize(item.fileBulananSize)})
                            </span>
                          ) : null}
                        </button>
                      </div>
                    </td>

                    {/* 5. Tombol Hapus */}
                    <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setItemToDelete(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200/80 font-semibold text-xs transition cursor-pointer shadow-2xs hover:shadow-xs"
                        title="Hapus riwayat pengiriman ini"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>Hapus</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>
          Menampilkan <strong>{filteredList.length}</strong> dari <strong>{riwayatList.length}</strong> pengiriman
        </span>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Database Terintegrasi Spreadsheet Real-Time</span>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-full shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Konfirmasi Hapus Laporan
                </h3>
                <p className="text-xs text-slate-500">
                  Data yang dihapus akan ditarik dari daftar riwayat dan spreadsheet.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-1.5">
              <p><strong>Nama Guru:</strong> {itemToDelete.namaGuru}</p>
              <p><strong>NIP:</strong> {itemToDelete.nip}</p>
              <p><strong>Tanggal Unggah:</strong> {itemToDelete.tanggalFormatted}</p>
              <p className="text-slate-500 truncate"><strong>File:</strong> {itemToDelete.fileHarianName} & {itemToDelete.fileBulananName}</p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Data</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
