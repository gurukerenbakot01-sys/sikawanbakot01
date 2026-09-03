export interface Guru {
  id: string;
  nama: string;
  nip: string;
  jabatan: string;
}

export interface LaporanPengiriman {
  id: string;
  tanggalUnggah: string; // ISO format or formatted date
  tanggalFormatted: string; // e.g., "03 September 2026, 10:15 WIB"
  guruId?: string;
  namaGuru: string;
  nip: string;
  jabatan: string;
  periodeBulan: string;
  tahun: string;
  // Sikawan Harian
  fileHarianName: string;
  fileHarianSize: number;
  fileHarianType: string;
  fileHarianDataUrl?: string; // base64 or blob url for direct download
  fileHarianDriveUrl?: string; // google drive link if synced
  // Sikawan Bulanan
  fileBulananName: string;
  fileBulananSize: number;
  fileBulananType: string;
  fileBulananDataUrl?: string; // base64 or blob url for direct download
  fileBulananDriveUrl?: string; // google drive link if synced
  catatan?: string;
  syncedToSpreadsheet: boolean;
}

export interface SpreadsheetConfig {
  spreadsheetId: string;
  sheetGuruName: string;
  sheetRiwayatName: string;
  appsScriptUrl: string;
  isOnlineActive: boolean;
  lastSyncedAt?: string;
}

export interface UploadFormData {
  guruId: string;
  namaGuru: string;
  nip: string;
  jabatan: string;
  periodeBulan: string;
  tahun: string;
  fileHarian: File | null;
  fileBulanan: File | null;
  catatan: string;
}
