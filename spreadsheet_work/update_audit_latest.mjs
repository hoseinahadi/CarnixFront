import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "C:/Users/hosein/Downloads/CARNIX_UI_AUDIT_PROGRESS_UPDATED.xlsx";
const outputDir = "D:/Project/Front/Next/New folder/outputs/audit-progress-latest";
const outputPath = `${outputDir}/CARNIX_UI_AUDIT_PROGRESS_UPDATED.xlsx`;
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(inputPath));

const scores = {
  "ایرادات فنی و منطقی": [0, 70, 100, 90, 0, 100, 100, 100, 100, 100, 0, 0, 20, 40, 80, 60, 100, 0, 100, 30, 0, 70, 70, 0, 100, 0, 0, 100, 80, 100, 40, 60, 100, 100, 70, 0],
  "ظاهر و ریسپانسیو": [70, 80, 70, 90, 100, 70, 60, 70, 50, 100, 80, 80, 100, 100, 90, 70, 70, 100, 80, 80, 70, 50, 80, 90, 50, 80, 50, 60, 80, 100, 50, 50, 80, 70, 80],
  "قابلیت‌های لازم": [100, 100, 100, 70, 0, 0, 100, 100, 60, 100, 40, 100, 0, 100, 70, 80, 0, 80, 0, 100, 80, 100, 100, 100, 50, 100, 80, 80, 30, 80],
  "پوشش صفحات": [75, 75, 80, 85, 90, 85, 70, 70, 60, 80, 70, 80, 80, 80, 70, 70, 70, 80, 70, 70, 100, 80, 100, 0, 100, 100, 100, 100, 100, 100],
  "نقشه راه": [70, 60, 100, 100, 70, 100, 80, 90, 90, 80, 85, 75, 70, 85, 80, 85, 100, 0, 100, 70, 100, 70, 100, 100, 100, 30, 20, 30],
};

const columnsBySheet = {
  "ایرادات فنی و منطقی": ["J", "K", "L"],
  "ظاهر و ریسپانسیو": ["K", "L", "M"],
  "قابلیت‌های لازم": ["H", "I", "J"],
  "پوشش صفحات": ["H", "I", "J"],
  "نقشه راه": ["H", "I", "J"],
};

const statusFor = (score) => {
  if (score === 100) return "کامل شده";
  if (score === 0) return "انجام نشده";
  return "در حال تکمیل";
};

const evidenceFor = (sheetName, score) => {
  if (score === 100) return sheetName === "نقشه راه" ? "بررسی کد و اسکریپت‌های کنترل پروژه؛ معیار این ردیف پوشش داده شده است." : "در کد فعلی پیاده‌سازی قابل مشاهده است؛ اسکریپت‌های verify مرتبط نیز موفق هستند.";
  if (score === 0) return "در بررسی کد فعلی شواهد کافی از پیاده‌سازی این مورد پیدا نشد.";
  return "بخشی از مسیر یا UI در کد فعلی وجود دارد، اما تکمیل یا تست پذیرش آن باقی مانده است.";
};

const fillColumns = (sheetName) => {
  const sheet = wb.worksheets.getItem(sheetName);
  const rows = sheet.getUsedRange(true).values;
  const [percentCol, statusCol, evidenceCol] = columnsBySheet[sheetName];
  sheet.getRange(`${percentCol}1:${evidenceCol}1`).values = [["درصد پیشرفت", "ارزیابی فعلی", "شواهد بررسی جاری"]];
  const values = scores[sheetName].map((score) => [score / 100, statusFor(score), evidenceFor(sheetName, score)]);
  if (values.length !== rows.length - 1) throw new Error(`${sheetName}: score count ${values.length} != ${rows.length - 1}`);
  sheet.getRange(`${percentCol}2:${evidenceCol}${rows.length}`).values = values;
  sheet.getRange(`${percentCol}2:${percentCol}${rows.length}`).format.numberFormat = "0%";
  sheet.getRange(`${percentCol}1:${evidenceCol}1`).format = {
    fill: "#173F78",
    font: { bold: true, color: "#FFFFFF", name: "Arial", size: 10 },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
  };
  sheet.getRange(`${percentCol}2:${percentCol}${rows.length}`).format.horizontalAlignment = "center";
  sheet.getRange(`${percentCol}:${percentCol}`).format.columnWidth = 14;
  sheet.getRange(`${statusCol}:${statusCol}`).format.columnWidth = 18;
  sheet.getRange(`${evidenceCol}:${evidenceCol}`).format.columnWidth = 44;
  sheet.getRange(`${percentCol}1:${evidenceCol}${rows.length}`).format.verticalAlignment = "center";
};

for (const sheetName of Object.keys(scores)) fillColumns(sheetName);

const summary = wb.worksheets.getItem("خلاصه");
summary.getRange("B3").values = [["2026-09-12"]];
summary.getRange("D30:F30").values = [["بخش", "تعداد ردیف", "میانگین پیشرفت"]];
summary.getRange("D31:D35").values = [["ایرادات فنی و منطقی"], ["ظاهر و ریسپانسیو"], ["قابلیت‌های لازم"], ["پوشش صفحات"], ["نقشه راه"]];
summary.getRange("E31:E35").values = [[36], [35], [30], [30], [28]];
summary.getRange("F31").formulas = [["=AVERAGE('ایرادات فنی و منطقی'!J2:J37)"]];
summary.getRange("F32").formulas = [["=AVERAGE('ظاهر و ریسپانسیو'!K2:K36)"]];
summary.getRange("F33").formulas = [["=AVERAGE('قابلیت‌های لازم'!H2:H31)"]];
summary.getRange("F34").formulas = [["=AVERAGE('پوشش صفحات'!H2:H31)"]];
summary.getRange("F35").formulas = [["=AVERAGE('نقشه راه'!H2:H29)"]];
summary.getRange("D37:E37").values = [["درصد کلی کار", null]];
summary.getRange("E37").formulas = [["=(E31*F31+E32*F32+E33*F33+E34*F34+E35*F35)/SUM(E31:E35)"]];
summary.getRange("D39:F42").values = [
  ["روش محاسبه", "هر ردیف با شواهد کد جاری و check:p0 تا check:p4 امتیازدهی شده است.", null],
  ["معنی درصد", "۱۰۰٪ کامل، ۱ تا ۹۹٪ در حال تکمیل، ۰٪ بدون شواهد پیاده‌سازی.", null],
  ["محدودیت", "درصدها وضعیت کد فعلی را نشان می‌دهند؛ تست زنده و تأیید محصول باید جداگانه تکرار شود.", null],
  ["تاریخ به‌روزرسانی", "2026-09-12", null],
];
summary.getRange("D30:F30").format = { fill: "#173F78", font: { bold: true, color: "#FFFFFF", name: "Arial", size: 10 }, horizontalAlignment: "center", verticalAlignment: "center", wrapText: true };
summary.getRange("D31:F35").format.verticalAlignment = "center";
summary.getRange("F31:F35").format.numberFormat = "0%";
summary.getRange("D37:E37").format = { fill: "#DCE9FA", font: { bold: true, color: "#173F78", name: "Arial", size: 11 }, verticalAlignment: "center" };
summary.getRange("E37").format.numberFormat = "0%";
summary.getRange("D39:F42").format.wrapText = true;
summary.getRange("D39:D42").format.font = { bold: true, color: "#173F78", name: "Arial", size: 10 };
summary.getRange("D:D").format.columnWidth = 25;
summary.getRange("E:E").format.columnWidth = 30;
summary.getRange("F:F").format.columnWidth = 18;
summary.getRange("D39:F42").format.rowHeight = 28;

wb.recalculate();
const overall = summary.getRange("E37").values[0][0];
console.log(`OVERALL=${overall}`);
for (const row of summary.getRange("D31:F35").values) console.log(`${row[0]}\t${row[1]}\t${row[2]}`);

const check = await wb.inspect({ kind: "table", range: "خلاصه!D30:F42", include: "values,formulas", tableMaxRows: 20, tableMaxCols: 6, maxChars: 5000 });
console.log(check.ndjson);
const errors = await wb.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!", options: { useRegex: true, maxResults: 300 }, summary: "final formula error scan" });
console.log(errors.ndjson);

await fs.mkdir(outputDir, { recursive: true });
const out = await SpreadsheetFile.exportXlsx(wb);
await out.save(outputPath);
console.log(`SAVED=${outputPath}`);


