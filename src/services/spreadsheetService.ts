import { Guru, LaporanPengiriman, SpreadsheetConfig } from '../types';

export const APPS_SCRIPT_TEMPLATE = `/**
 * GOOGLE APPS SCRIPT - SIKAWAN SD NEGERI BABELAN KOTA 01 TAHUN 2026
 * Database & Penyimpanan Berkas PDF Google Drive Terintegrasi
 * 
 * FITUR UTAMA:
 * 1. Otomatis menyimpan berkas PDF Sikawan ke folder Google Drive: 'SIKAWAN_BERKAS_SDN_BABELAN_KOTA_01'
 * 2. Membuat kolom 'File Harian' dan 'File Bulanan' menjadi LINK PDF aktif (=HYPERLINK) di Google Spreadsheet
 * 3. Sinkronisasi dua arah real-time untuk semua guru tanpa perlu login Google
 * 
 * CARA PEMASANGAN / PEMBARUAN:
 * 1. Buka Spreadsheet: https://docs.google.com/spreadsheets/d/1-0gTmSV9aYBwmpGU1JcbZscmIn8u67z_SFTe9bn-P5c/edit
 * 2. Klik menu 'Ekstensi' (Extensions) > 'Apps Script'.
 * 3. Hapus semua kode lama dan tempel (paste) seluruh kode ini.
 * 4. Klik 'Simpan' (ikon disket).
 * 5. Klik 'Terapkan' (Deploy) > 'Kelola penerapan' (Manage deployments).
 * 6. Klik ikon Pensil (Edit) di penerapan aktif.
 * 7. Pilih Versi: 'Versi baru' (New version).
 * 8. Pastikan 'Jalankan sebagai: Saya' dan 'Siapa yang memiliki akses: Siapa saja' (Anyone).
 * 9. Klik 'Terapkan' (Deploy).
 */

function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Sheet 1: Data_Guru
  var sheetGuru = ss.getSheetByName("Data_Guru") || ss.insertSheet("Data_Guru");
  if (sheetGuru.getLastRow() === 0) {
    sheetGuru.appendRow(["No", "Nama Guru", "NIP", "Jabatan"]);
    sheetGuru.getRange("A1:D1").setFontWeight("bold").setBackground("#2563EB").setFontColor("#FFFFFF");
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

// Helper: Ambil atau buat folder Google Drive untuk berkas PDF Sikawan
function getOrCreateDriveFolder() {
  var folderName = "SIKAWAN_BERKAS_SDN_BABELAN_KOTA_01";
  var folders = DriveApp.getFoldersByName(folderName);
  var folder;
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = DriveApp.createFolder(folderName);
  }
  try {
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {}
  return folder;
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
      var rFormulas = sheetRiwayat.getDataRange().getFormulas();
      var riwayatList = [];
      for (var j = 1; j < rData.length; j++) {
        if (rData[j][0]) {
          var harianRaw = String(rData[j][7] || "");
          var bulananRaw = String(rData[j][8] || "");
          var harianFormula = rFormulas[j] && rFormulas[j][7] ? String(rFormulas[j][7]) : "";
          var bulananFormula = rFormulas[j] && rFormulas[j][8] ? String(rFormulas[j][8]) : "";

          var harianUrl = "";
          var bulananUrl = "";

          // Ekstrak URL dari formula =HYPERLINK("url", "label")
          var hMatch = harianFormula.match(/HYPERLINK\\(\\s*["']([^"']+)["']/i);
          if (hMatch) {
            harianUrl = hMatch[1];
          } else if (harianRaw.indexOf("http") === 0) {
            harianUrl = harianRaw;
          }

          var bMatch = bulananFormula.match(/HYPERLINK\\(\\s*["']([^"']+)["']/i);
          if (bMatch) {
            bulananUrl = bMatch[1];
          } else if (bulananRaw.indexOf("http") === 0) {
            bulananUrl = bulananRaw;
          }

          riwayatList.push({
            id: String(rData[j][0]),
            tanggalFormatted: String(rData[j][1]),
            namaGuru: String(rData[j][2]),
            nip: String(rData[j][3]),
            jabatan: String(rData[j][4]),
            periodeBulan: String(rData[j][5] || ""),
            tahun: String(rData[j][6] || "2026"),
            fileHarianName: harianRaw,
            fileHarianDriveUrl: harianUrl,
            fileBulananName: bulananRaw,
            fileBulananDriveUrl: bulananUrl,
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
      var harianUrl = lap.fileHarianDriveUrl || "";
      var bulananUrl = lap.fileBulananDriveUrl || "";

      // Simpan berkas ke Google Drive dan dapatkan link PDF publik
      try {
        var folder = getOrCreateDriveFolder();
        var safeNama = (lap.namaGuru || "Guru").replace(/[/\\\\?%*:|"<>]/g, "").trim();

        if (body.laporan.fileHarianBase64) {
          var hFilename = safeNama + "_Laporan-kinerja-pegawai-Harian.pdf";
          var hBytes = Utilities.base64Decode(body.laporan.fileHarianBase64);
          var hBlob = Utilities.newBlob(hBytes, body.laporan.fileHarianType || "application/pdf", hFilename);
          var hFile = folder.createFile(hBlob);
          hFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          harianUrl = hFile.getUrl();
        }

        if (body.laporan.fileBulananBase64) {
          var bFilename = safeNama + "_Laporan-kinerja-pegawai-Bulanan.pdf";
          var bBytes = Utilities.base64Decode(body.laporan.fileBulananBase64);
          var bBlob = Utilities.newBlob(bBytes, body.laporan.fileBulananType || "application/pdf", bFilename);
          var bFile = folder.createFile(bBlob);
          bFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          bulananUrl = bFile.getUrl();
        }
      } catch (errDrive) {
        Logger.log("Drive Error: " + errDrive);
      }

      // Buat rumus =HYPERLINK agar menjadi tautan PDF aktif di Spreadsheet
      var harianCell = harianUrl 
        ? '=HYPERLINK("' + harianUrl + '", "' + (lap.fileHarianName || "File Harian.pdf") + '")'
        : (lap.fileHarianName || "File Harian.pdf");

      var bulananCell = bulananUrl 
        ? '=HYPERLINK("' + bulananUrl + '", "' + (lap.fileBulananName || "File Bulanan.pdf") + '")'
        : (lap.fileBulananName || "File Bulanan.pdf");

      sheetRiwayat.appendRow([
        lap.id,
        lap.tanggalFormatted,
        lap.namaGuru,
        lap.nip,
        lap.jabatan,
        lap.periodeBulan || "",
        lap.tahun || "2026",
        harianCell,
        bulananCell,
        lap.catatan || "-",
        new Date().toISOString()
      ]);

      return ContentService.createTextOutput(JSON.stringify({ 
        status: "success", 
        id: lap.id,
        fileHarianDriveUrl: harianUrl,
        fileBulananDriveUrl: bulananUrl
      })).setMimeType(ContentService.MimeType.JSON);
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
 * Helper to parse a file cell value that may be a formula =HYPERLINK("url", "label") or URL
 */
function parseFileCell(raw: string): { name: string; url?: string } {
  if (!raw) return { name: '-' };
  
  // Format formula =HYPERLINK("url", "label") atau =HYPERLINK("url"; "label")
  const match = raw.match(/HYPERLINK\(\s*["']([^"']+)["']\s*[,;]\s*["']([^"']+)["']\)/i);
  if (match) {
    return { url: match[1], name: match[2] };
  }

  // Jika berupa URL langsung
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    const parts = raw.split('/');
    const cleanName = parts[parts.length - 1] || 'Lihat Berkas PDF';
    return { url: raw, name: decodeURIComponent(cleanName) };
  }

  return { name: raw };
}

/**
 * Fetch online riwayat submissions from Google Spreadsheet
 */
export async function fetchRiwayatFromSpreadsheet(config: SpreadsheetConfig): Promise<LaporanPengiriman[] | null> {
  // 1. Prioritize Google Apps Script Web App
  if (config.appsScriptUrl && config.appsScriptUrl.trim().startsWith('http')) {
    try {
      const resp = await fetch(`${config.appsScriptUrl.trim()}?action=get_riwayat`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.status === 'success' && Array.isArray(data.riwayat)) {
          const list: LaporanPengiriman[] = data.riwayat.map((item: any, idx: number) => {
            const harianParsed = parseFileCell(item.fileHarianName || '');
            const bulananParsed = parseFileCell(item.fileBulananName || '');

            return {
              id: item.id || `LAP-ONLINE-${idx + 1}`,
              tanggalUnggah: item.tanggalUnggah || new Date().toISOString(),
              tanggalFormatted: item.tanggalFormatted || 'Waktu tidak tercatat',
              namaGuru: item.namaGuru || '',
              nip: item.nip || '',
              jabatan: item.jabatan || '',
              periodeBulan: item.periodeBulan || 'September',
              tahun: item.tahun || '2026',
              fileHarianName: item.fileHarianName && !item.fileHarianName.startsWith('=') ? item.fileHarianName : harianParsed.name,
              fileHarianSize: item.fileHarianSize || 0,
              fileHarianType: item.fileHarianType || 'application/pdf',
              fileHarianDriveUrl: item.fileHarianDriveUrl || harianParsed.url,
              fileBulananName: item.fileBulananName && !item.fileBulananName.startsWith('=') ? item.fileBulananName : bulananParsed.name,
              fileBulananSize: item.fileBulananSize || 0,
              fileBulananType: item.fileBulananType || 'application/pdf',
              fileBulananDriveUrl: item.fileBulananDriveUrl || bulananParsed.url,
              catatan: item.catatan || '',
              syncedToSpreadsheet: true,
            };
          });
          return list;
        }
      }
    } catch (err) {
      console.warn('Error fetching riwayat from Apps Script:', err);
    }
  }

  // 2. Fallback: Google Sheets gviz API
  if (config.spreadsheetId && config.spreadsheetId.trim().length > 10) {
    try {
      const sheetName = encodeURIComponent(config.sheetRiwayatName || 'Riwayat_Pengiriman');
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${config.spreadsheetId.trim()}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
      const resp = await fetch(gvizUrl);
      if (resp.ok) {
        const text = await resp.text();
        const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);/);
        if (jsonMatch && jsonMatch[1]) {
          const parsed = JSON.parse(jsonMatch[1]);
          const rows = parsed.table?.rows || [];
          if (rows.length > 0) {
            const list: LaporanPengiriman[] = [];
            rows.forEach((row: { c: Array<{ v: any; f?: string } | null> }, index: number) => {
              const cells = row.c || [];
              const id = cells[0]?.v ? String(cells[0].v) : `LAP-ONLINE-${index + 1}`;
              const tanggalFormatted = cells[1]?.v ? String(cells[1].v) : '';
              const namaGuru = cells[2]?.v ? String(cells[2].v) : '';
              const nip = cells[3]?.v ? String(cells[3].v) : (cells[3]?.f ? String(cells[3].f) : '');
              const jabatan = cells[4]?.v ? String(cells[4].v) : '';
              const periodeBulan = cells[5]?.v ? String(cells[5].v) : '';
              const tahun = cells[6]?.v ? String(cells[6].v) : (cells[6]?.f ? String(cells[6].f) : '2026');
              const fileHarianRaw = cells[7]?.v ? String(cells[7].v) : (cells[7]?.f ? String(cells[7].f) : '');
              const fileBulananRaw = cells[8]?.v ? String(cells[8].v) : (cells[8]?.f ? String(cells[8].f) : '');
              const catatan = cells[9]?.v ? String(cells[9].v) : '';
              const serverTime = cells[10]?.v ? String(cells[10].v) : '';

              if (namaGuru) {
                const harianParsed = parseFileCell(fileHarianRaw);
                const bulananParsed = parseFileCell(fileBulananRaw);

                list.push({
                  id,
                  tanggalUnggah: serverTime || new Date().toISOString(),
                  tanggalFormatted: tanggalFormatted || 'Waktu tidak tercatat',
                  namaGuru,
                  nip,
                  jabatan,
                  periodeBulan,
                  tahun,
                  fileHarianName: harianParsed.name || 'Laporan-kinerja-pegawai-Harian.pdf',
                  fileHarianSize: 0,
                  fileHarianType: 'application/pdf',
                  fileHarianDriveUrl: harianParsed.url,
                  fileBulananName: bulananParsed.name || 'Laporan-kinerja-pegawai-Bulanan.pdf',
                  fileBulananSize: 0,
                  fileBulananType: 'application/pdf',
                  fileBulananDriveUrl: bulananParsed.url,
                  catatan,
                  syncedToSpreadsheet: true,
                });
              }
            });
            if (list.length > 0) return list;
          }
        }
      }
    } catch (err) {
      console.warn('Error fetching riwayat via gviz:', err);
    }
  }

  return null;
}

/**
 * Send submission to Google Spreadsheet
 */
export async function syncLaporanToSpreadsheet(
  laporan: LaporanPengiriman,
  config: SpreadsheetConfig,
  fileHarianBase64?: string,
  fileBulananBase64?: string
): Promise<boolean> {
  if (config.appsScriptUrl && config.appsScriptUrl.trim().startsWith('http')) {
    try {
      await fetch(config.appsScriptUrl.trim(), {
        method: 'POST',
        mode: 'no-cors', // standard for Google Apps Script Web App without auth
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
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
            fileHarianBase64: fileHarianBase64 || '',
            fileHarianType: laporan.fileHarianType || 'application/pdf',
            fileHarianDriveUrl: laporan.fileHarianDriveUrl || '',
            fileBulananName: laporan.fileBulananName,
            fileBulananBase64: fileBulananBase64 || '',
            fileBulananType: laporan.fileBulananType || 'application/pdf',
            fileBulananDriveUrl: laporan.fileBulananDriveUrl || '',
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
