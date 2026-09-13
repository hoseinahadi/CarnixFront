import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const inputPath = 'C:/Users/hosein/Downloads/CARNIX_UI_AUDIT_PROGRESS_UPDATED_FIXED.xlsx';
const outputDir = 'D:/Project/Front/Next/New folder/outputs/audit-progress-full';
const outputPath = `${outputDir}/CARNIX_UI_AUDIT_PROGRESS_UPDATED_FIXED.xlsx`;
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(inputPath));
const sheet = workbook.worksheets.getItem('ایرادات فنی و منطقی');
const scores = [
  1, 1, 1, 1,
  0.5, 1, 1, 1, 1, 1, 1, 0.7, 0.6, 1, 1, 1, 1, 1, 1,
  0.3, 1, 0.9, 1, 1, 1, 1, 1, 1, 0.8, 1, 0.6, 0.6, 1, 1, 0.7, 1,
];
const statuses = scores.map((score) => score === 1 ? 'کامل شده' : score === 0 ? 'انجام نشده' : 'در حال تکمیل');
const evidence = [
  'endpoint /Auth/refresh، rotation/revoke و مسیر refresh در فرانت و API وجود دارد و check بحرانی موفق است.',
  'توکن خام در localStorage یا cookie خوانا نگهداری نمی‌شود؛ refresh token در HttpOnly cookie و access token کوتاه‌عمر است.',
  'هزینه ارسال فقط پس از shipping quote معتبر وارد checkout و ثبت سفارش می‌شود.',
  'مسیر initiate، callback و verify پرداخت سمت سرور و فرانت متصل و typecheck شده است.',
  'خطاهای lint صفر شده‌اند، اما warningهای کیفیت کد هنوز باقی است.',
  'proxy رسمی Next 16 تنها route guard فعال است و route matrix در build معتبر است.',
  'config مشترک runtime برای client/server/media استفاده می‌شود.',
  'SSG در نبود API با policy اختیاری ادامه می‌یابد و STRICT_SSG_DATA حالت fail-fast دارد.',
  'قیمت‌ها بدون گرد کردن درشت و با واحد واقعی تومان محاسبه می‌شوند.',
  'Bundleها از endpoint وابسته به همان محصول دریافت و cache می‌شوند.',
  'bundle و effective price فقط در productDetailSlice نگهداری می‌شوند.',
  'productSlice زیر آستانه ۱۲۰۰ خط است؛ تفکیک کامل فایل‌های list/filter باقی است.',
  'VehicleSelect به زیر ۱۰۰۰ خط رسیده، اما تفکیک کامل hook/dropdown/step باقی است.',
  'checkout state machine و سرویس‌های quote/order/payment فعال و typecheck شده‌اند.',
  'SupportFab به WhatsApp معتبر و حالت گفت‌وگو متصل است.',
  'فرم خرید عمده به API متصل است و trackingCode سرور نمایش داده می‌شود.',
  'سفارش مجدد اقلام را به سبد اضافه و اقلام ناموجود را گزارش می‌کند.',
  'ثبت نظر در ProductReviews به API متصل است و مسیر تکراری حذف شده است.',
  'مسیرهای Footer به routeهای موجود متصل هستند.',
  'تلفن و لینک‌های شبکه اجتماعی از تنظیمات سایت خوانده می‌شوند؛ داده واقعی محیط تولید باید بررسی شود.',
  'FAQ از publicContentApi می‌خواند و متن لورم هاردکد ندارد.',
  'ProductGrid خطا را نمایش می‌دهد و retry صریح دارد.',
  'Header menu برای شکست category/brand/vehicle retry کنترل‌شده و CTA دارد.',
  'next/image، remotePatterns، sizes و lazy loading فعال هستند.',
  'NODE_TLS_REJECT_UNAUTHORIZED در تنظیمات process-wide وجود ندارد.',
  'server.js از public خارج و به ریشه پروژه UI منتقل شد.',
  'کارت محصول با Link معنایی ساخته شده و کنترل‌های داخلی مستقل هستند.',
  'Modalهای مشترک role، aria-modal، Escape و focus handling دارند.',
  'بخشی از buttonها type صریح دارند؛ تکمیل سراسری هنوز باقی است.',
  'reduced-motion برای animationها پیاده‌سازی شده است.',
  'مسیر محصول اکنون adapter typed واحد دارد و fallbackهای any/data/mainResults از thunkها حذف شده‌اند؛ schema validation همه endpointها باقی است.',
  'cache identity-aware است؛ تست E2E جداسازی دو کاربر باقی است.',
  'ChangePassword در صفحه اطلاعات پروفایل نمایش داده می‌شود.',
  'error boundary، trace id و logging بدون داده حساس فعال است.',
  'check scriptهای بحرانی و typecheck وجود دارند؛ تست E2E کامل باقی است.',
  'Storage فقط پس از mount در StoreProvider خوانده می‌شود؛ /products در مرورگر واقعی و check P3 بدون hydration mismatch رندر شد.',
];
if (scores.length !== 36 || evidence.length !== 36) throw new Error(`audit row mismatch: ${scores.length}/${evidence.length}`);
sheet.getRange('J2:L37').values = scores.map((score, index) => [score, statuses[index], evidence[index]]);
sheet.getRange('J2:J37').format.numberFormat = '0%';
const summary = workbook.worksheets.getItem('خلاصه');
summary.getRange('F31').formulas = [["=AVERAGE('ایرادات فنی و منطقی'!J2:J37)"]];
summary.getRange('E37').formulas = [['=(E31*F31+E32*F32+E33*F33+E34*F34+E35*F35)/SUM(E31:E35)']];
summary.getRange('D42:F42').values = [['تاریخ به‌روزرسانی', '2026-09-13', null]];
workbook.recalculate();
const inspect = await workbook.inspect({ kind: 'table', range: 'ایرادات فنی و منطقی!J1:L37', include: 'values,formulas', tableMaxRows: 40, tableMaxCols: 12, maxChars: 5000 });
console.log(inspect.ndjson);
const errors = await workbook.inspect({ kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!', options: { useRegex: true, maxResults: 300 }, summary: 'final formula error scan' });
console.log(errors.ndjson);
console.log(`TECHNICAL_AVG=${summary.getRange('F31').values[0][0]}`);
console.log(`OVERALL=${summary.getRange('E37').values[0][0]}`);
await fs.mkdir(outputDir, { recursive: true });
const exported = await SpreadsheetFile.exportXlsx(workbook);
await exported.save(outputPath);
console.log(`SAVED=${outputPath}`);

