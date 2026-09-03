import { Guru, LaporanPengiriman, SpreadsheetConfig } from '../types';

export const APPS_SCRIPT_TEMPLATE = `/**
 * GOOGLE APPS SCRIPT - SIKAWAN SD NEGERI BABELAN KOTA 01 TAHUN 2026
 * Database Integrasi Real-Time (Tanpa Login Google untuk Pengguna)
 * 
 * CARA PEMASANGAN:
 * 1. Buka Google Spreadsheet baru / yang sudah ada.
 * 2. Klik menu 'Ekstensi' (Extensions) > 'Apps Script'.
 * 3. Hapus semua kode default dan tempel (paste) kode ini.
 * 4. Klik 'Simpan' (ikon disket), lalu jalankan fungsi 'setupSheet()' sekali untuk membuat sheet & header otomatis.
 * 5. Klik 'Terapkan' (Deploy) > 'Penerapan baru' (New deployment).
 * 6. Pilih jenis: 'Aplikasi web' (Web app).
 * 7. Isi Keterangan: 'Sikawan SDN Babelan Kota 01 API'.
 * 8. Jalankan sebagai: 'Saya' (Me / akun Google Anda).
 * 9. Siapa yang memiliki akses: 'Siapa saja' (Anyone / Public). -> Ini kunci agar guru tidak perlu login Google!
 * 10. Klik 'Terapkan', salin URL Aplikasi Web, dan tempelkan ke kolom URL Web App di aplikasi Sikawan!
 */

function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Sheet 1: Data_Guru
  var sheetGuru = ss.getSheetByName("Data_Guru") || ss.insertSheet("Data_Guru");
  if (sheetGuru.getLastRow() === 0) {
    sheetGuru.appendRow(["No", "Nama Guru", "NIP", "Jabatan"]);
    sheetGuru.getRange("A1:D1").setFontWeight("bold").setBackground("#2563EB").setFontColor("#FFFFFF");
    
    // Sample Initial Teachers
    sheetGuru.appendRow([1, "Hj. Siti Rohmah, S.Pd., M.M.", "19680512 199303 2 004", "Kepala Sekolah"]);
    sheetGuru.appendRow([2, "Ahmad Fauzi, S.Pd.SD", "19750819 199803 1 003", "Guru Kelas 6A"]);
    sheetGuru.appendRow([3, "Nurul Hidayati, S.Pd.", "19820315 200604 2 018", "Guru Kelas 6B"]);
    sheetGuru.appendRow([4, "Drs. Supriyadi", "19691124 199412 1 002", "Guru Kelas 5A"]);
    sheetGuru.appendRow([5, "Endang Lestari, S.Pd.", "19840210 200902 2 007", "Guru Kelas 5B"]);
    sheetGuru.appendRow([6, "Bambang Irawan, S.Pd.", "19800705 200801 1 012", "Guru Kelas 4A"]);
    sheetGuru.appendRow([7, "Dewi Kartika, S.Pd.SD", "19870914 201101 2 015", "Guru Kelas 4B"]);
    sheetGuru.appendRow([8, "M. Ridwan Syah, S.Pd.", "19900422 201903 1 008", "Guru Kelas 3A"]);
    sheetGuru.appendRow([9, "Siti Maryam, S.Pd.I.", "19851201 201001 2 021", "Guru Kelas 3B"]);
    sheetGuru.appendRow([10, "Rina Kusumawati, S.Pd.", "19920618 202012 2 014", "Guru Kelas 2A"]);
    sheetGuru.appendRow([11, "Yusuf Maulana, S.Pd.", "19940103 202221 1 004", "Guru Kelas 2B"]);
    sheetGuru.appendRow([12, "Tri Wahyuni, S.Pd.SD", "19860417 201403 2 003", "Guru Kelas 1A"]);
    sheetGuru.appendRow([13, "Fitri Handayani, S.Pd.", "19950720 202421 2 009", "Guru Kelas 1B"]);
    sheetGuru.appendRow([14, "Ustadz H. Mahfudz, S.Pd.I.", "19790312 200501 1 006", "Guru Pendidikan Agama Islam (PAI)"]);
    sheetGuru.appendRow([15, "Wahyu Hidayat, S.Pd.Or.", "19910808 201902 1 005", "Guru PJOK / Olahraga"]);
    sheetGuru.appendRow([16, "Rizki Pratama, S.Kom.", "19961129 202321 1 002", "Operator Sekolah & Administrasi"]);
  }
  
  // Sheet 2: Riwayat_Pengiriman
  var sheetRiwayat = ss.getSheetByName("Riwayat_Pengiriman") || ss.insertSheet("Riwayat_Pengiriman");
  if (sheetRiwayat.getLastRow() === 0) {
    sheetRiwayat.appendRow([
      "ID Pengiriman",
      "Tanggal Unggah",
      "Nama Guru",
      "NIP",
      "Jabatan",
      "Periode Bulan",
      "Tahun",
      "File Harian",
      "File Bulanan",
      "Catatan",
      "Waktu Server"
    ]);
    sheetRiwayat.getRange("A1:K1").setFontWeight("bold").setBackground("#059669").setFontColor("#FFFFFF");
  }
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || "get_all";
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var result = { status: "success", timestamp: new Date().toISOString() };
  
  if (action === "get_guru" || action === "get_all") {
    var sheetGuru = ss.getSheetByName("Data_Guru");
    if (sheetGuru) {
      var data = sheetGuru.getDataRange().getValues();
      var guruList = [];
      for (var i = 1; i < data.length; i++) {
        if (data[i][1]) {
          guruList.push({
            id: "GUR-" + (data[i][0] || i),
            nama: data[i][1],
            nip: String(data[i][2] || ""),
            jabatan: data[i][3] || ""
          });
        }
      }
      result.dataGuru = guruList;
    }
  }
  
  if (action === "get_riwayat" || action === "get_all") {
    var sheetRiwayat = ss.getSheetByName("Riwayat_Pengiriman");
    if (sheetRiwayat) {
      var rData = sheetRiwayat.getDataRange().getValues();
      var riwayatList = [];
      for (var j = 1; j < rData.length; j++) {
        if (rData[j][0]) {
          riwayatList.push({
            id: String(rData[j][0]),
            tanggalFormatted: String(rData[j][1]),
            namaGuru: String(rData[j][2]),
            nip: String(rData[j][3]),
            jabatan: String(rData[j][4]),
            periodeBulan: String(rData[j][5] || ""),
            tahun: String(rData[j][6] || "2026"),
            fileHarianName: String(rData[j][7]),
            fileBulananName: String(rData[j][8]),
            catatan: String(rData[j][9] || ""),
            syncedToSpreadsheet: true
          });
        }
      }
      result.riwayat = riwayatList;
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetRiwayat = ss.getSheetByName("Riwayat_Pengiriman") || ss.insertSheet("Riwayat_Pengiriman");
    
    if (body.action === "add_laporan") {
      var lap = body.laporan;
      sheetRiwayat.appendRow([
        lap.id,
        lap.tanggalFormatted,
        lap.namaGuru,
        lap.nip,
        lap.jabatan,
        lap.periodeBulan || "",
        lap.tahun || "2026",
        lap.fileHarianName,
        lap.fileBulananName,
        lap.catatan || "-",
        new Date().toISOString()
      ]);
      return ContentService.createTextOutput(JSON.stringify({ status: "success", id: lap.id }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (body.action === "delete_laporan") {
      var targetId = body.id;
      var data = sheetRiwayat.getDataRange().getValues();
      for (var r = 1; r < data.length; r++) {
        if (String(data[r][0]) === String(targetId)) {
          sheetRiwayat.deleteRow(r + 1);
          return ContentService.createTextOutput(JSON.stringify({ status: "success", deletedId: targetId }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "not_found" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "invalid_action" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;

/**
 * Check if the Google Spreadsheet is reachable via gviz endpoint or Apps Script URL
 */
export async function checkSpreadsheetHealth(config: SpreadsheetConfig): Promise<{
  isActive: boolean;
  message: string;
  source: 'apps_script' | 'gviz' | 'local';
}> {
  if (config.appsScriptUrl && config.appsScriptUrl.trim().startsWith('http')) {
    try {
      const resp = await fetch(`${config.appsScriptUrl.trim()}?action=get_all`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (resp.ok) {
        const json = await resp.json();
        if (json.status === 'success') {
          return {
            isActive: true,
            message: 'Terhubung langsung ke Google Apps Script Web App (Dua Arah Aktif)',
            source: 'apps_script',
          };
        }
      }
    } catch {
      // Continue to fallback
    }
  }

  if (config.spreadsheetId && config.spreadsheetId.trim().length > 10) {
    try {
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${config.spreadsheetId.trim()}/gviz/tq?tqx=out:json&tq=select%20*&headers=1`;
      const resp = await fetch(gvizUrl);
      if (resp.ok) {
        const text = await resp.text();
        if (text.includes('google.visualization.Query.setResponse')) {
          return {
            isActive: true,
            message: 'Spreadsheet Google aktif & dapat diakses publik secara real-time',
            source: 'gviz',
          };
        }
      }
    } catch {
      // Offline / blocked CORS fallback
    }
  }

  return {
    isActive: true,
    message: 'Database Aktif (Penyimpanan Lokal & Siap Sinkronisasi ke Spreadsheet)',
    source: 'local',
  };
}

/**
 * Fetch teachers list from Google Spreadsheet
 */
export async function fetchGuruFromSpreadsheet(config: SpreadsheetConfig): Promise<Guru[] | null> {
  // If Apps Script URL is provided
  if (config.appsScriptUrl && config.appsScriptUrl.trim().startsWith('http')) {
    try {
      const resp = await fetch(`${config.appsScriptUrl.trim()}?action=get_guru`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.status === 'success' && Array.isArray(data.dataGuru) && data.dataGuru.length > 0) {
          return data.dataGuru;
        }
      }
    } catch (err) {
      console.warn('Error fetching guru from Apps Script:', err);
    }
  }

  // Fallback: try reading Google Sheets gviz API
  if (config.spreadsheetId && config.spreadsheetId.trim().length > 10) {
    try {
      const sheetName = encodeURIComponent(config.sheetGuruName || 'Data_Guru');
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${config.spreadsheetId.trim()}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
      const resp = await fetch(gvizUrl);
      if (resp.ok) {
        const text = await resp.text();
        const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);/);
        if (jsonMatch && jsonMatch[1]) {
          const parsed = JSON.parse(jsonMatch[1]);
          const rows = parsed.table?.rows || [];
          if (rows.length > 0) {
            const list: Guru[] = [];
            rows.forEach((row: { c: Array<{ v: any; f?: string } | null> }, index: number) => {
              const cells = row.c || [];
              const nama = cells[1]?.v ? String(cells[1].v) : '';
              const nip = cells[2]?.v ? String(cells[2].v) : (cells[2]?.f ? String(cells[2].f) : '');
              const jabatan = cells[3]?.v ? String(cells[3].v) : '';
              if (nama) {
                list.push({
                  id: `GUR-${index + 1}`,
                  nama,
                  nip,
                  jabatan,
                });
              }
            });
            if (list.length > 0) return list;
          }
        }
      }
    } catch (err) {
      console.warn('Error fetching guru via gviz:', err);
    }
  }

  return null;
}

/**
 * Send submission to Google Spreadsheet
 */
export async function syncLaporanToSpreadsheet(
  laporan: LaporanPengiriman,
  config: SpreadsheetConfig
): Promise<boolean> {
  if (config.appsScriptUrl && config.appsScriptUrl.trim().startsWith('http')) {
    try {
      await fetch(config.appsScriptUrl.trim(), {
        method: 'POST',
        mode: 'no-cors', // standard for Google Apps Script Web App without auth
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add_laporan',
          spreadsheetId: config.spreadsheetId,
          laporan: {
            id: laporan.id,
            tanggalFormatted: laporan.tanggalFormatted,
            namaGuru: laporan.namaGuru,
            nip: laporan.nip,
            jabatan: laporan.jabatan,
            periodeBulan: laporan.periodeBulan,
            tahun: laporan.tahun,
            fileHarianName: laporan.fileHarianName,
            fileBulananName: laporan.fileBulananName,
            catatan: laporan.catatan || '',
          },
        }),
      });
      return true;
    } catch (err) {
      console.warn('Failed to sync to Apps Script:', err);
      return false;
    }
  }

  return true; // Marked as saved locally/ready
}

/**
 * Delete submission from Google Spreadsheet
 */
export async function deleteLaporanFromSpreadsheet(
  id: string,
  config: SpreadsheetConfig
): Promise<boolean> {
  if (config.appsScriptUrl && config.appsScriptUrl.trim().startsWith('http')) {
    try {
      await fetch(config.appsScriptUrl.trim(), {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete_laporan',
          id: id,
          spreadsheetId: config.spreadsheetId,
        }),
      });
      return true;
    } catch (err) {
      console.warn('Failed to delete in Apps Script:', err);
      return false;
    }
  }
  return true;
}

/**
 * Export table data to CSV format that can be directly imported to Google Spreadsheet
 */
export function exportRiwayatToCSV(list: LaporanPengiriman[]): void {
  const headers = [
    'No',
    'ID Pengiriman',
    'Tanggal Unggah',
    'Nama Guru',
    'NIP',
    'Jabatan',
    'Periode Bulan',
    'Tahun',
    'File Sikawan Harian',
    'File Sikawan Bulanan',
    'Catatan',
  ];

  const rows = list.map((item, idx) => [
    idx + 1,
    `"${item.id}"`,
    `"${item.tanggalFormatted}"`,
    `"${item.namaGuru.replace(/"/g, '""')}"`,
    `"'${item.nip}"`, // single quote to preserve leading zero or long number in excel/sheets
    `"${item.jabatan.replace(/"/g, '""')}"`,
    `"${item.periodeBulan}"`,
    `"${item.tahun}"`,
    `"${item.fileHarianName.replace(/"/g, '""')}"`,
    `"${item.fileBulananName.replace(/"/g, '""')}"`,
    `"${(item.catatan || '-').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Riwayat_Sikawan_SDN_Babelan_Kota_01_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
