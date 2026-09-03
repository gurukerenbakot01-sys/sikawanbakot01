import { LaporanPengiriman, Guru, SpreadsheetConfig } from '../types';
import { DEFAULT_GURU_LIST } from '../data/defaultGuru';

const DB_NAME = 'SikawanSDNBabelanKota01DB';
const DB_VERSION = 1;
const STORE_FILES = 'uploaded_files';

const STORAGE_KEYS = {
  LAPORAN: 'sikawan_laporan_list_2026',
  GURU: 'sikawan_guru_list_2026',
  CONFIG: 'sikawan_spreadsheet_config_2026',
};

export const DEFAULT_SPREADSHEET_CONFIG: SpreadsheetConfig = {
  spreadsheetId: '1-0gTmSV9aYBwmpGU1JcbZscmIn8u67z_SFTe9bn-P5c',
  sheetGuruName: 'Data_Guru',
  sheetRiwayatName: 'Riwayat_Pengiriman',
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycbxXFPikmMfI1z2jk_GlfDRPqwaywQB5T81GcQ_eEF3YjRkc1eESrFMrBxaT2I12sVjbHA/exec',
  isOnlineActive: true,
  lastSyncedAt: new Date().toISOString(),
};

// Open IndexedDB instance
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        db.createObjectStore(STORE_FILES);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Save file blob to IndexedDB
export async function saveFileToIndexedDB(key: string, file: Blob): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_FILES, 'readwrite');
      const store = tx.objectStore(STORE_FILES);
      const req = store.put(file, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not save file to IndexedDB:', err);
  }
}

// Retrieve file blob from IndexedDB
export async function getFileFromIndexedDB(key: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_FILES, 'readonly');
      const store = tx.objectStore(STORE_FILES);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not read file from IndexedDB:', err);
    return null;
  }
}

// Remove file from IndexedDB
export async function deleteFileFromIndexedDB(key: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_FILES, 'readwrite');
      const store = tx.objectStore(STORE_FILES);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not delete file from IndexedDB:', err);
  }
}

// Helper to format downloaded file name as: [Nama Guru]_Laporan-kinerja-pegawai-Harian/Bulanan.[ext]
export function generateDownloadFilename(
  namaGuru: string,
  type: 'harian' | 'bulanan',
  originalFilename?: string
): string {
  let ext = 'pdf';
  if (originalFilename && originalFilename.includes('.')) {
    const parts = originalFilename.split('.');
    const lastPart = parts[parts.length - 1].trim().toLowerCase();
    if (lastPart) {
      ext = lastPart;
    }
  }

  // Clean name to remove invalid filesystem characters while keeping titles
  const safeNama = (namaGuru || 'Guru').replace(/[/\\?%*:|"<>]/g, '').trim();
  const typeLabel = type === 'harian' ? 'Harian' : 'Bulanan';
  return `${safeNama}_Laporan-kinerja-pegawai-${typeLabel}.${ext}`;
}

// Helper to trigger file download in browser
export async function downloadLaporanFile(
  laporanId: string, 
  type: 'harian' | 'bulanan', 
  originalFilename: string,
  namaGuru?: string
) {
  const fileKey = `${laporanId}_${type}`;
  let blob = await getFileFromIndexedDB(fileKey);

  const finalFilename = namaGuru 
    ? generateDownloadFilename(namaGuru, type, originalFilename) 
    : (originalFilename || `Sikawan_${type}_${laporanId}.pdf`);

  if (!blob) {
    // If not found in IndexedDB (e.g. initial demo sample), generate a sample PDF/Text document
    const typeLabel = type === 'harian' ? 'Harian' : 'Bulanan';
    const content = `=====================================================
LAPORAN SIKAWAN ${typeLabel.toUpperCase()} TAHUN 2026
SD NEGERI BABELAN KOTA 01 KABUPATEN BEKASI
=====================================================
Nama Guru: ${namaGuru || '-'}
Nama Berkas: ${finalFilename}
Berkas Asli: ${originalFilename}
Kategori: Laporan Sikawan ${typeLabel}
Status: Terverifikasi & Tersinkronisasi ke Google Spreadsheet
Waktu Unduh: ${new Date().toLocaleString('id-ID')}
ID Pengiriman: ${laporanId}
=====================================================
Laporan ini adalah dokumen resmi kinerja pegawai SD Negeri Babelan Kota 01.`;
    blob = new Blob([content], { type: 'application/pdf;charset=utf-8' });
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = finalFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Initial default reports for SD NEGERI BABELAN KOTA 01
const DEFAULT_LAPORAN: LaporanPengiriman[] = [
  {
    id: 'LAP-20260901-001',
    tanggalUnggah: '2026-09-01T08:30:00.000Z',
    tanggalFormatted: '01 September 2026, 08:30 WIB',
    guruId: 'GUR-001',
    namaGuru: 'Hj. Siti Rohmah, S.Pd., M.M.',
    nip: '19680512 199303 2 004',
    jabatan: 'Kepala Sekolah',
    periodeBulan: 'September',
    tahun: '2026',
    fileHarianName: 'Sikawan_Harian_01Sep2026_SitiRohmah.pdf',
    fileHarianSize: 428000,
    fileHarianType: 'application/pdf',
    fileBulananName: 'Sikawan_Bulanan_Agustus2026_SitiRohmah.xlsx',
    fileBulananSize: 856000,
    fileBulananType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    catatan: 'Laporan manajerial dan supervisi harian serta rekap bulanan.',
    syncedToSpreadsheet: true,
  },
  {
    id: 'LAP-20260902-002',
    tanggalUnggah: '2026-09-02T09:15:00.000Z',
    tanggalFormatted: '02 September 2026, 09:15 WIB',
    guruId: 'GUR-002',
    namaGuru: 'Ahmad Fauzi, S.Pd.SD',
    nip: '19750819 199803 1 003',
    jabatan: 'Guru Kelas 6A',
    periodeBulan: 'September',
    tahun: '2026',
    fileHarianName: 'Sikawan_Harian_02Sep2026_AhmadFauzi.pdf',
    fileHarianSize: 312000,
    fileHarianType: 'application/pdf',
    fileBulananName: 'Sikawan_Bulanan_Agustus2026_AhmadFauzi.pdf',
    fileBulananSize: 645000,
    fileBulananType: 'application/pdf',
    catatan: 'Pembelajaran tematik persiapan asesmen formatif.',
    syncedToSpreadsheet: true,
  },
  {
    id: 'LAP-20260903-003',
    tanggalUnggah: '2026-09-03T07:45:00.000Z',
    tanggalFormatted: '03 September 2026, 07:45 WIB',
    guruId: 'GUR-014',
    namaGuru: 'Ustadz H. Mahfudz, S.Pd.I.',
    nip: '19790312 200501 1 006',
    jabatan: 'Guru Pendidikan Agama Islam (PAI)',
    periodeBulan: 'September',
    tahun: '2026',
    fileHarianName: 'Sikawan_Harian_03Sep2026_Mahfudz.pdf',
    fileHarianSize: 289000,
    fileHarianType: 'application/pdf',
    fileBulananName: 'Sikawan_Bulanan_Agustus2026_Mahfudz.docx',
    fileBulananSize: 512000,
    fileBulananType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    catatan: 'Praktik ibadah sholat dhuha berjamaah dan hafalan surat pendek.',
    syncedToSpreadsheet: true,
  },
];

// LocalStorage Wrappers
export function getStoredLaporanList(): LaporanPengiriman[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAPORAN);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LAPORAN, JSON.stringify(DEFAULT_LAPORAN));
      return DEFAULT_LAPORAN;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_LAPORAN;
  }
}

export function saveStoredLaporanList(list: LaporanPengiriman[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LAPORAN, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save laporan list to localStorage', err);
  }
}

export function getStoredGuruList(): Guru[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GURU);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.GURU, JSON.stringify(DEFAULT_GURU_LIST));
      return DEFAULT_GURU_LIST;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_GURU_LIST;
  }
}

export function saveStoredGuruList(list: Guru[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GURU, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save guru list to localStorage', err);
  }
}

export function getSpreadsheetConfig(): SpreadsheetConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_SPREADSHEET_CONFIG));
      return DEFAULT_SPREADSHEET_CONFIG;
    }
    const parsed = JSON.parse(raw);
    
    // Ensure the official Spreadsheet ID & Apps Script Web App URL are permanently retained
    let shouldUpdate = false;
    const updated: SpreadsheetConfig = {
      ...DEFAULT_SPREADSHEET_CONFIG,
      ...parsed,
    };

    if (!parsed.spreadsheetId || parsed.spreadsheetId === '14t_sJ1jC-nQ6FzCPVw7K2xLk8X9uN2mYePqSdRgT4oE') {
      updated.spreadsheetId = DEFAULT_SPREADSHEET_CONFIG.spreadsheetId;
      shouldUpdate = true;
    }

    if (!parsed.appsScriptUrl || parsed.appsScriptUrl === '') {
      updated.appsScriptUrl = DEFAULT_SPREADSHEET_CONFIG.appsScriptUrl;
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
    }

    return updated;
  } catch {
    return DEFAULT_SPREADSHEET_CONFIG;
  }
}

export function saveSpreadsheetConfig(config: SpreadsheetConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save spreadsheet config', err);
  }
}
