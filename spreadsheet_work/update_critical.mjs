import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const inputPath = 'C:/Users/hosein/Downloads/CARNIX_UI_AUDIT_PROGRESS_UPDATED_FIXED.xlsx';
const outputDir = 'D:/Project/Front/Next/New folder/outputs/audit-progress-critical';
const outputPath = `${outputDir}/CARNIX_UI_AUDIT_PROGRESS_UPDATED_FIXED.xlsx`;
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(inputPath));
const sheet = workbook.worksheets.getItem('ایرادات فنی و منطقی');
const evidence = 'بررسی کد جاری و کنترل‌های بحرانی تأیید شد؛ endpoint، مسیر امن نشست، quote ارسال و پرداخت initiate/verify در کد موجود و build قابل‌اجرا هستند.';
sheet.getRange('J2:L6').values = [
  [1, 'کامل شده', evidence],
  [1, 'کامل شده', evidence],
  [1, 'کامل شده', evidence],
  [1, 'کامل شده', evidence],
  [0.5, 'در حال تکمیل', 'خطاهای lint به صفر رسیده‌اند، اما warningهای کیفیت کد هنوز باقی است و برای ۱۰۰٪ شدن باید برطرف شود.'],
];
sheet.getRange('J12:L19').values = [
  [1, 'کامل شده', 'داده‌های bundle و effective price از productSlice حذف و در productDetailSlice به‌عنوان source of truth نگهداری می‌شوند.'],
  [0.7, 'در حال تکمیل', 'productSlice از آستانه ۱۲۰۰ خط پایین‌تر است و داده‌های جزئیات جدا شده‌اند؛ تفکیک کامل فایل‌های list/filter هنوز باقی است.'],
  [0.2, 'در حال تکمیل', 'VehicleSelect هنوز فایل بزرگی است و refactor کامل به hook/dropdown/step انجام نشده است.'],
  [1, 'کامل شده', 'checkout state machine و سرویس‌های مستقل quote، order و payment در کد فعال و typecheck شده‌اند.'],
  [1, 'کامل شده', 'SupportFab به WhatsApp معتبر و حالت گفت‌وگو متصل است و دیگر TODO ندارد.'],
  [1, 'کامل شده', 'فرم خرید عمده با wholesaleApi.create به API متصل است و trackingCode سرور نمایش داده می‌شود.'],
  [1, 'کامل شده', 'سفارش مجدد اقلام سفارش را به‌صورت server-backed به سبد اضافه می‌کند و خطای اقلام ناموجود را گزارش می‌دهد.'],
  [1, 'کامل شده', 'فرم ثبت نظر کامپوننت اصلی ProductReviews به API متصل است؛ صفحه تکراری profile/comments به همان مسیر canonical متصل شد.'],
];
sheet.getRange('J12:J19').format.numberFormat = '0%';
sheet.getRange('J2:J6').format.numberFormat = '0%';
const summary = workbook.worksheets.getItem('خلاصه');
summary.getRange('F31').formulas = [["=AVERAGE('ایرادات فنی و منطقی'!J2:J37)"]];
summary.getRange('E37').formulas = [['=(E31*F31+E32*F32+E33*F33+E34*F34+E35*F35)/SUM(E31:E35)']];
summary.getRange('D42:F42').values = [['تاریخ به‌روزرسانی', '2026-09-13', null]];
workbook.recalculate();
const check = await workbook.inspect({ kind: 'table', range: 'ایرادات فنی و منطقی!I1:L6', include: 'values,formulas', tableMaxRows: 10, tableMaxCols: 5, maxChars: 5000 });
console.log(check.ndjson);
const errors = await workbook.inspect({ kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!', options: { useRegex: true, maxResults: 300 }, summary: 'final formula error scan' });
console.log(errors.ndjson);
console.log(`UI_CRITICAL_AVG=${summary.getRange('F31').values[0][0]}`);
console.log(`OVERALL=${summary.getRange('E37').values[0][0]}`);
await fs.mkdir(outputDir, { recursive: true });
const exported = await SpreadsheetFile.exportXlsx(workbook);
await exported.save(outputPath);
console.log(`SAVED=${outputPath}`);

