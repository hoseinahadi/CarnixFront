# ممیزی کامل پروژه Carnix

تاریخ بررسی: ۱۴۰۵/۰۶/۱۹ (2026-09-10)

## دامنه بررسی و نتیجه کلی

این گزارش از روی سه منبع تهیه شده است:

- فروشگاه Next.js در `ui/`
- پنل مدیریت Next.js در `Admin/`
- بک‌اند ASP.NET Core در `Carnix/`
- فایل Figma با کلید `DCj8hd61o7UzBWTNSmhVkw` و خروجی ZIP شامل ۱۰۹ تصویر

وضعیت فعلی در یک نگاه:

| بخش | نتیجه فنی | جمع‌بندی |
|---|---:|---|
| فروشگاه | build موفق؛ lint ناموفق با ۱۶۶ خطا و ۴۷ هشدار | قابل اجرا است، ولی آماده تحویل نهایی نیست |
| پنل مدیریت | typecheck ناموفق با ۸۱۹ خطا در ۷۰ فایل | در وضعیت فعلی قابل build و انتشار مطمئن نیست |
| بک‌اند | build موفق با ۰ خطا و ۱۴۷ هشدار | اجراپذیر است، ولی چرخه پرداخت و بخشی از امنیت/پایداری آماده production نیست |
| Figma | ۳ صفحه اصلی، ۵۹۳۳ لایه بررسی‌شده، ۱۰۹ خروجی PNG | طرح‌ها کامل‌تر از محصول فعلی‌اند، اما منبع نهایی طراحی مشخص نشده است |

## موارد بحرانی؛ قبل از انتشار باید حل شوند

### ۱. پنل ادمین از نظر TypeScript شکسته است

- `npm run lint` در `Admin/` تعداد ۸۱۹ خطا در ۷۰ فایل برمی‌گرداند.
- ۸۸ خطا مربوط به import یا dependency گمشده است؛ از جمله Axios، Redux Toolkit، MUI، React Router، Tabler Icons، Sass و چند alias داخلی.
- صدها خطای `implicit any` و چندین ناسازگاری واقعی DTO و props وجود دارد.
- نمونه‌های قرارداد شکسته: `cartId`، `zipCode` و `phoneNumber` در UI ادمین استفاده شده‌اند ولی در `OrderDto` تعریف نشده‌اند؛ امضای تغییر وضعیت سفارش نیز بین caller و component یکسان نیست.

اقدام: ابتدا یکی از دو معماری ادمین انتخاب و معماری دیگر از build خارج یا حذف شود؛ سپس dependencyها، aliasها و DTOها اصلاح شوند.

### ۲. دو پنل ادمین موازی در یک پروژه وجود دارد

- مسیر جدید `/admin/...` بر پایه Context، `fetch` و تعریف‌های عمومی `resources.ts` است.
- مسیر قدیمی `/dashboard/...` بر پایه Redux، Axios، MUI و SCSS است.
- هر دو مجموعه route و component داخل یک build قرار گرفته‌اند و خطاهای معماری قدیمی، نسخه جدید را هم آلوده کرده‌اند.
- دو login، دو guard، دو API client و دو الگوی مدیریت state وجود دارد.

اقدام: `/admin` یا `/dashboard` را رسماً منبع اصلی اعلام کنید. پیشنهاد فنی، نگه‌داشتن `/admin` و مهاجرت قابلیت‌های ضروری قدیمی به آن است.

### ۳. Refresh Token در فرانت وجود دارد ولی endpoint آن در بک‌اند وجود ندارد

- فروشگاه چند بار `POST /Auth/refresh` را صدا می‌زند.
- `AuthController` endpoint برای refresh ندارد.
- مدل `UserSession` فیلد `RefreshToken` دارد، اما چرخه صدور، rotation، revoke و refresh از طریق API کامل نشده است.

اثر: پس از انقضای access token، درخواست‌ها وارد چرخه refresh ناموفق و در نهایت logout می‌شوند.

اقدام: یا endpoint کامل refresh با rotation و revoke اضافه شود، یا تمام منطق refresh از فرانت حذف و عمر session به‌صورت شفاف بازطراحی شود.

### ۴. توکن‌های کاربر در محل ناامن نگهداری می‌شوند

- access token هم در `localStorage` و هم در cookie قابل خواندن با JavaScript ذخیره می‌شود.
- refresh token در `localStorage` ذخیره می‌شود.
- در نتیجه هر XSS موفق می‌تواند session را سرقت کند.

اقدام: refresh token در cookie با `HttpOnly + Secure + SameSite` نگهداری شود؛ access token کوتاه‌عمر باشد و duplication فعلی حذف شود.

### ۵. فایل‌های env حاوی کلیدهای توکن داخل Git هستند

- `Admin/.env.development`، `.env.production` و `.env.staging` track شده‌اند.
- کلیدهای `TOKEN` و `CARNIX_API_TOKEN` در این فایل‌ها دیده می‌شوند.

اقدام: اگر مقدارها واقعی‌اند فوراً rotate شوند، فایل‌های واقعی از Git خارج و فقط `.env.example` بدون مقدار حساس نگهداری شود. حذف فایل از آخرین commit برای توکنی که قبلاً push شده کافی نیست و rotation لازم است.

### ۶. پرداخت واقعی پیاده نشده است

- `PaymentService` لینک `https://mockgateway.com/pay/...` تولید می‌کند.
- هیچ `PaymentController`، callback، verify، reconciliation یا webhook در controllerهای بک‌اند وجود ندارد.
- UI مرحله پرداخت دارد، اما lifecycle مالی end-to-end کامل نیست.

اقدام: قرارداد پرداخت شامل initiate، callback، server-side verify، ثبت تراکنش، idempotency، وضعیت شکست/لغو و reconciliation پیاده شود.

### ۷. سفارش پیش از پرداخت موجودی را کم و سبد را خالی می‌کند

- در `OrderService.PlaceOrderAsync` ابتدا موجودی کم می‌شود.
- سپس سفارش ذخیره می‌شود، shipment ساخته می‌شود و آیتم‌های cart حذف می‌شوند.
- خود کد نیز این وضعیت را «Fake Payment» نامیده است.
- اگر پرداخت انجام نشود، کاربر سبد را از دست می‌دهد و موجودی رزرو/کسر شده باقی می‌ماند.

اقدام: قبل از پرداخت فقط order با وضعیت `PaymentPending` و رزرو زمان‌دار موجودی ساخته شود. کسر قطعی موجودی، پاک‌کردن سبد و ساخت shipment پس از verify موفق پرداخت انجام شود.

### ۸. ثبت سفارش transaction و idempotency قابل مشاهده ندارد

- کاهش موجودی، ذخیره سفارش، ساخت shipment و حذف cart یک transaction واحد ندارند.
- کد صراحتاً failure ساخت shipment را فقط log می‌کند و rollback نمی‌کند.
- ارسال دوباره درخواست می‌تواند سفارش تکراری و کاهش دوباره موجودی ایجاد کند.
- شماره سفارش با `new Random()` شش‌رقمی ساخته می‌شود و تضمین یکتایی قابل اتکا ندارد.

اقدام: transaction دیتابیس، کلید idempotency، unique constraint برای شماره سفارش و الگوی outbox برای عملیات جانبی اضافه شود.

### ۹. مبلغ ارسال در UI هاردکد است

- مقدار اولیه ارسال در `CartPage.tsx` برابر ۲۲۰٬۰۰۰ است.
- UI مبلغ نهایی را با `backendCartTotal + shippingCost` می‌سازد.
- بک‌اند هنگام ثبت سفارش هزینه ارسال را دوباره محاسبه می‌کند.

اثر: مبلغی که کاربر قبل از ثبت می‌بیند ممکن است با مبلغ واقعی سفارش فرق داشته باشد.

اقدام: quote معتبر سرور با شناسه/انقضا دریافت شود و همان quote هنگام ثبت سفارش مصرف شود. UI نباید fallback پولی هاردکد داشته باشد.

### ۱۰. dependencyهای بک‌اند آسیب‌پذیری شناخته‌شده دارند

خروجی build موارد high/critical را برای پکیج‌هایی مانند `System.Drawing.Common 4.7.0`، `System.Text.Encodings.Web 4.5.0`، `Microsoft.Data.SqlClient 2.1.4`، `Microsoft.AspNetCore.Http 2.1.0`، `AutoMapper 12.0.1` و چند پکیج token گزارش می‌کند.

اقدام: ارتقای هدفمند framework و dependencyها، سپس اجرای تست‌های regression. پکیج `GhasedakSms.Framework 1.0.7` نیز برای .NET Framework restore شده و سازگاری کامل با net6 تضمین نشده است.

## قابلیت‌هایی که در Figma هستند ولی در محصول end-to-end وجود ندارند

| قابلیت طراحی‌شده | فروشگاه | بک‌اند | وضعیت |
|---|---|---|---|
| لیست مکانیک‌ها | ندارد | controller مشخص ندارد | کاملاً غایب |
| پروفایل عمومی مکانیک | ندارد | API مشخص ندارد | کاملاً غایب |
| داشبورد مکانیک | ندارد | API مشخص ندارد | کاملاً غایب |
| امتیاز، مزایا و referral مکانیک | ندارد | API مشخص ندارد | کاملاً غایب |
| کیف پول مکانیک/کاربر | لینک شکسته `/profile/wallet` | API مشخص ندارد | کاملاً غایب |
| اطلاعات شخصی و فروشگاه مکانیک | ندارد | API مشخص ندارد | کاملاً غایب |
| عیب‌یاب خودرو، مراحل ۱ تا ۳ | ندارد | API مشخص ندارد | کاملاً غایب |
| تیکت پشتیبانی | ندارد | API مشخص ندارد | کاملاً غایب |
| مرکز پیام کامل | فقط FAB یا اجزای محدود | API گفتگو مشخص ندارد | عمدتاً غایب |
| اعلان‌ها و empty state | ندارد | API اعلان مشخص ندارد | کاملاً غایب |
| تنظیم کانال اعلان SMS/email/push | ندارد | API preference مشخص ندارد | کاملاً غایب |
| گاراژ شخصی و جزئیات خودروی کاربر | `/vehicles` فقط انتخاب/فهرست خودرو است | API مالکیت خودروی کاربر مشخص ندارد | کاملاً غایب |
| صفحه مستقل لیست باندل‌ها | ندارد | CRUD باندل دارد | فرانت غایب |
| صفحه مستقل جزئیات باندل | ندارد | داده پایه دارد | فرانت غایب |
| ارتباط باندل با خودروهای سازگار | ندارد | قرارداد روشن end-to-end دیده نشد | غایب/نیازمند طراحی API |
| مقایسه محصولات | ندارد | API مقایسه مشخص ندارد | کاملاً غایب |
| quick view محصول | ندارد | از API محصول قابل ساخت است | فرانت غایب |
| صفحه نتایج جست‌وجوی کامل و empty state | فقط autocomplete/hero search | SearchController دارد | ناقص |
| صفحه حریم خصوصی | لینک `/privacy` وجود دارد | نیاز ندارد | route غایب و لینک شکسته |
| نمایش کدهای تخفیف فعال کاربر | ندارد | Coupon عمومی وجود دارد | تجربه کاربر غایب |
| پرداخت با wallet | ندارد | wallet/payment واقعی ندارد | کاملاً غایب |
| review پس از خرید به شکل طراحی | صفحه comments ناقص است | review API دارد | ناقص |
| تنظیم/فراموشی password طبق annotationهای Figma | جریان کامل مشخص نیست | auth بزرگ ولی قرارداد نهایی نامشخص | نیازمند تصمیم محصول |

## قابلیت‌هایی که وجود دارند ولی با Figma کامل منطبق نیستند

### خانه

- route و چند سکشن اصلی وجود دارد.
- نسخه‌های Figma شامل desktop V10 و mobile home هستند، اما فایل طراحی نسخه‌های قدیمی‌تر را هم کنار نسخه جدید نگه داشته است.
- انتخاب خودرو، banner عیب‌یاب و بعضی CTAهای مکانیک در محصول کامل نیستند.

وضعیت: **نسبی**.

### PLP و فیلترها

- route لیست محصولات، دسته‌بندی، filter و sort وجود دارد.
- طرح‌های desktop/mobile و modal مرتب‌سازی در Figma مفصل‌ترند.
- compare، empty state کامل و برخی حالت‌های mobile هنوز وجود ندارند.

وضعیت: **نسبی**.

### PDP

- route جزئیات محصول، تصاویر، قیمت، review، related و بخش باندل وجود دارد.
- Figma نسخه‌های PDP متعدد، سازگاری خودرو، quick view و presentation متفاوت باندل دارد.
- داده bundle برای هر محصول با دانلود همه bundleها و filter سمت client تهیه می‌شود.

وضعیت: **نسبی، با مشکل مقیاس‌پذیری**.

### سبد و checkout

- مشاهده، حذف، آدرس، انتخاب ارسال و مرحله پرداخت وجود دارد.
- حالت‌های guest login/OTP، empty، promo، wallet و success طراحی شده‌اند، اما lifecycle یکپارچه نیست.
- UI به fallbackهای محلی و backend به چرخه Fake Payment متکی است.

وضعیت: **ظاهر تا حدی موجود، منطق مالی ناقص**.

### سفارش‌ها

- لیست، جزئیات، لغو، success و endpoint رهگیری وجود دارند.
- Figma tabهای all/completed/canceled، timeline و review را با حالت‌های desktop/mobile مشخص کرده است.
- pagination در backend بعد از load کل سفارش‌های کاربر انجام می‌شود، نه در query دیتابیس.

وضعیت: **نسبی، نیازمند تکمیل حالت‌ها و بهینه‌سازی query**.

### آدرس

- لیست و modal ایجاد/ویرایش وجود دارد.
- lint نشان می‌دهد بخشی از importهای create/update/delete در صفحه استفاده نشده‌اند و MapPicker چند dependency ناقص در hook دارد.

وضعیت: **موجود ولی نیازمند تست رفتاری**.

### احراز هویت OTP

- login، register و verify OTP وجود دارند.
- فایل‌های این جریان بسیار بزرگ‌اند و قرارداد refresh ناقص است.
- پاسخ‌های بک‌اند شکل‌های مختلف `token` و `accessToken` دارند و فرانت برای چند شکل پاسخ compatibility code نوشته است.

وضعیت: **ورود اولیه موجود، مدیریت session ناقص**.

### وبلاگ، FAQ و خرید عمده

- routeهای هر سه وجود دارند.
- build وقتی API در دسترس نبود، خطا را log کرد و با fallback ادامه داد؛ در نتیجه deployment می‌تواند با محتوای ناقص «موفق» گزارش شود.

وضعیت: **موجود، ولی failure policy باید شفاف شود**.

### 404

- `not-found.tsx` و style اختصاصی وجود دارد.
- باید pixel comparison با طرح `404 error.png` انجام شود.

وضعیت: **موجود**.

## ایرادهای منطقی و قراردادی فروشگاه

1. سه پیاده‌سازی guard مسیر در `ui/proxy.ts`، `ui/middleware.ts` و `ui/src/middleware.ts` وجود دارد. build نیز هشدار deprecation برای middleware داد.
2. API URL در چند فایل با fallback متفاوت ساخته می‌شود؛ بعضی جاها `/api` داخل base است و بعضی جاها بیرون آن.
3. build برای دریافت blog و category به API زنده وابسته می‌شود، ولی شکست شبکه را به fallback تبدیل می‌کند. این رفتار می‌تواند محتوای production را ناقص کند بدون اینکه pipeline fail شود.
4. `images.unoptimized = true` مزایای optimization داخلی Next Image را غیرفعال کرده و همزمان تعداد زیادی `<img>` خام وجود دارد.
5. در development، `NODE_TLS_REJECT_UNAUTHORIZED=0` به‌صورت process-wide تنظیم می‌شود. این کار خطاهای certificate را پنهان می‌کند و نباید به محیط‌های مشترک نشت کند.
6. `public/server.js` فایل اجرای Node است ولی داخل public قرار دارد و به‌عنوان asset عمومی قابل دانلود می‌شود.
7. lint فروشگاه ۲۱۳ مورد دارد: ۱۶۶ error و ۴۷ warning. موارد فقط cosmetic نیستند؛ hook dependency ناقص، setState داخل effect، typeهای `any`، ref mutation و importهای مرده دیده می‌شود.
8. `productSlice.ts` بیش از ۱۲۰۰ خط و `VehicleSelect.tsx` بیش از ۱۰۰۰ خط است. cart/auth thunks و MapPicker نیز بسیار بزرگ‌اند؛ تغییر کوچک می‌تواند چند رفتار را همزمان بشکند.
9. state محصول بین `productSlice` و `productDetailSlice` همپوشانی دارد؛ bundle نیز در هر دو نگهداری می‌شود.
10. مدل‌های محصول و قیمت بین Product و SKU چند منبع حقیقت دارند؛ قرارداد روشن برای «قیمت/موجودی نهایی» لازم است.
11. مالیات cart با ثابت ۹٪ محاسبه می‌شود، درحالی‌که backend سرویس و entity نرخ مالیات دارد.
12. تخفیف سطری محصول در `CartCalculationService` صریحاً صفر شده است؛ ProductDiscountها در محاسبه cart وارد نشده‌اند.
13. cache سفارشی درخواست‌ها وجود دارد؛ تمام keyهای وابسته به user باید ممیزی شوند تا داده profile/wishlist/address بین sessionها مخلوط نشود. پاک‌سازی کلی هنگام تعویض token وجود دارد، ولی تستی برای آن نیست.
14. صفحه comments handler ارسال review دارد که استفاده نمی‌شود؛ این علامت جریان نیمه‌کاره است.
15. route حریم خصوصی در footer لینک شده ولی ساخته نشده است.

## ایرادهای منطقی و معماری پنل مدیریت

1. دو فایل `next.config.ts` و `next.config.mjs` با تنظیمات متفاوت وجود دارد.
2. داخل فایل TypeScript از `module.exports` استفاده شده است.
3. API client جدید از `NEXT_PUBLIC_API_BASE_URL` و API client قدیمی از `NEXT_PUBLIC_API_URL` استفاده می‌کند.
4. مسیرهای جدید endpointها را با `api/...` می‌سازند، ولی قدیمی‌ها base دارای `/api` دارند. احتمال double/missing `/api` بالاست.
5. auth جدید فقط یک token با نام `carnix_admin_api_token` در localStorage نگه می‌دارد و refresh ندارد.
6. legacy code از React Router داخل Next App Router استفاده می‌کند.
7. `resources.ts` CRUD عمومی سریع ساخته است، ولی فرم‌ها برای validation دامنه‌ای، upload، relation picker و workflowهای پیچیده کافی نیستند.
8. dashboard طراحی‌شده در Figma داده‌های کارمند، نمودار و activity دارد و با مدل فعلی فروشگاه/سفارش Carnix هم‌راستا نیست؛ احتمالاً template مرجع است، نه specification نهایی.
9. Permission screen حدود ۹۶۳ خط است و هم UI، data access و state را یکجا نگه می‌دارد.
10. هیچ تست component، integration یا E2E برای ادمین وجود ندارد.

## ایرادهای بک‌اند و API

1. پروژه روی `net6.0` است و dependencyهای بسیار قدیمی ASP.NET 2.1/2.x هم داخل پروژه‌های net6 دیده می‌شوند.
2. ۱۴۷ warning شامل nullability گسترده در `CarnixDbContext`، بازگشت null در repository و dependency vulnerability است.
3. `CarnixDbContext` حدود ۸۷۳ خط و دارای تعداد بسیار زیادی DbSet است.
4. `GenericService` حدود ۲۲۲۱ خط و `GenericRepository` حدود ۱۱۴۵ خط است؛ قوانین دامنه در abstractionهای بسیار عمومی پخش شده‌اند.
5. `ProductService` حدود ۲۳۵۹ خط و `ShippingService` حدود ۱۶۴۹ خط است؛ مرز مسئولیت‌ها شکسته شده است.
6. PermissionFilter به‌صورت global روی همه controllerها نصب شده و نقش admin با fallback عدد جادویی ۶ bypass می‌شود.
7. Admin و SuperAdmin کل permission matrix را bypass می‌کنند؛ این تصمیم باید آگاهانه و ثبت‌شده باشد.
8. originهای CORS در `Program.cs` هاردکد شده‌اند و stage/legacy/production کنار هم قرار دارند.
9. خطای migration/validation دیتابیس در startup catch می‌شود و برنامه همچنان بالا می‌آید.
10. فقط `/health/live` وجود دارد و این endpoint دیتابیس را چک نمی‌کند؛ readiness واقعی وجود ندارد.
11. endpoint سفارش‌های کاربر ابتدا کل نتایج را می‌گیرد و سپس در حافظه page می‌کند.
12. backend برای response shape چند الگوی `MainResults`، `Data` و anonymous object دارد؛ فرانت مجبور به parse چندشکلی شده است.
13. encoding بعضی comment/stringهای سورس در خروجی ابزار خراب دیده شد؛ encoding repository باید روی UTF-8 استاندارد شود.
14. serviceهای mechanics، ticket، wallet، notification، user garage و symptom checker در controllerهای موجود دیده نمی‌شوند.
15. payment service controller ندارد و از جریان checkout متصل نیست.
16. تست خودکار یا پروژه تست برای backend پیدا نشد.
17. نام پروژه `Infrustructure` غلط املایی دارد؛ اصلاح آن فوری نیست، ولی در namespace، path و tooling هزینه دائمی ایجاد می‌کند.

## مشکلات خود فایل Figma

### منبع نهایی طراحی مشخص نیست

- صفحه `feature ui update`، صفحه `factory` و صفحه `design system` هر سه طرح محصول دارند.
- نمونه قدیمی `single product` مربوط به محصول camping کنار PDP خودرویی جدید قرار گرفته است.
- چند نسخه با نام‌های `v1`، `v2`، `v4`، `V10` و `V11` بدون وضعیت Approved/Deprecated وجود دارند.
- نام صفحه `factory` در عمل شامل home، PLP، PDP، compare، mechanic و garage است.

اقدام: یک صفحه `✅ Ready for Dev` بسازید و فقط frameهای نهایی را با version و تاریخ در آن نگه دارید. طرح‌های قبلی به `Archive` منتقل شوند.

### design token واقعی وجود ندارد

- تعداد Variable Collectionها در فایل: صفر.
- رنگ، spacing، radius و typography با Figma Variables مدل نشده‌اند.
- ۴۰ paint style، ۱۷ text style، ۸ effect style و ۳ grid style وجود دارد، اما mode و semantic binding ندارند.

اقدام: primitive و semantic tokenها ساخته شوند؛ حداقل color، spacing، radius، typography، elevation و breakpoint documentation. سپس با SCSS/CSS tokenهای کد هم‌نام شوند.

### component system پراکنده است

- صفحه design system دارای ۲۵ component set و ۲۹ component است.
- هر state ورودی مثل default/active/disabled/error به component set جدا تبدیل شده، به‌جای یک component set با propertyهای `state`، `required` و `size`.
- نام property بسیاری از componentها فقط `Property 1=Default` است.
- product cardهای default/hover/discount جدا و با الگوی نام‌گذاری ناهماهنگ‌اند.
- صفحه `feature ui update` با ۲۴۲۶ لایه هیچ Component/Component Set محلی ندارد و ۳۱۰ Instance استفاده می‌کند؛ ارتباط آن با کتابخانه نهایی مستند نشده است.

اقدام: input، dropdown، button و product card به variant setهای استاندارد تبدیل و Code Connect برای componentهای اصلی اضافه شود.

### نام‌گذاری و قابلیت تحویل ضعیف است

- typoهای پرتکرار: `defult`، `empth`، `deskot`، `ordres`، `reffreal`.
- نام‌های عمومی مانند `Frame 126...`، `Group ...` و `Rectangle ...` در بخش‌های مهم زیادند.
- فارسی و انگلیسی بدون convention واحد مخلوط شده‌اند.

اقدام: نام screenها بر اساس الگوی `Platform / Feature / State / Version` و نام layerها بر اساس نقش معنایی اصلاح شود.

### حالت‌های responsive و accessibility کامل تعریف نشده‌اند

- عمده خروجی‌ها فقط عرض ۱۴۴۰ و ۳۹۰ دارند.
- tablet، intermediate widths، wrapping، overflow و رفتار long content مشخص نیست.
- focus-visible، keyboard navigation، screen reader label، reduced motion و contrast acceptance criteria به‌صورت مستقل مشخص نشده‌اند.

اقدام: breakpoint behavior و accessibility stateها در کنار هر component ثبت شوند.

## چیزهایی که فعلاً نیاز به بازنویسی ندارند

این بخش‌ها پایه قابل استفاده دارند و بهتر است اصلاح تدریجی شوند:

- ساختار App Router فروشگاه و تفکیک routeهای auth/shop
- Redux Toolkit فروشگاه و typed hooks موجود
- Axios client مرکزی و request deduplication، پس از اصلاح auth و cache keyها
- APIهای پایه product، category، cart، address، wishlist، order، shipping، review، vehicle و content
- صفحه‌های blog، FAQ، bulk purchase، brands، wishlist، address و order به‌عنوان scaffold
- design styleهای رنگ و تایپوگرافی Figma به‌عنوان ورودی مهاجرت به Variables
- معماری لایه‌ای Domain/Application/Infrastructure/API در بک‌اند به‌عنوان اسکلت کلی
- Permission scanner/cache موجود، پس از حذف magic role و اضافه‌کردن تست
- build production فروشگاه که در وضعیت فعلی موفق می‌شود

## مشکلات repository و تحویل

1. repository در وضعیت dirty است و تغییرهای متعدد کاربر در Admin وجود دارد؛ قبل از refactor باید branch/commit امن ساخته شود.
2. `Carnix/` در Git فعلی untracked است.
3. archiveهای `Admin.zip`، `ui.rar` و `carnix.zip` داخل workspace وجود دارند.
4. `Admin/tsconfig.tsbuildinfo` untracked است و باید ignore شود.
5. README ریشه فقط نام پروژه را دارد و setup واقعی را توضیح نمی‌دهد.
6. تنها workflow موجود فروشگاه را deploy می‌کند؛ Admin و backend هیچ CI ندارند.
7. workflow قبل از deploy lint/test اجرا نمی‌کند.
8. workflow از `npm install` استفاده می‌کند؛ build reproducible با `npm ci` مناسب‌تر است.
9. deployment کل پوشه `ui` را با `/MIR` کپی می‌کند، شامل source و فایل‌های غیرضروری؛ بهتر است artifact مستقل و atomic deploy شود.
10. rollback واقعی و health check HTTP پس از restart وجود ندارد؛ فقط PID پردازش بررسی می‌شود.

## تست‌هایی که وجود ندارند و باید اضافه شوند

### حداقل تست‌های بک‌اند

- ثبت سفارش همزمان برای آخرین موجودی
- idempotency درخواست ثبت سفارش و callback پرداخت
- rollback کاهش موجودی در failure
- تطابق مبلغ cart، tax، coupon، shipping و order
- refresh/revoke/expired session
- permission برای هر role و جلوگیری از دسترسی cross-user
- pagination دیتابیسی سفارش‌ها

### حداقل تست‌های فروشگاه

- guest cart تا login/OTP و بازگشت به checkout
- refresh token و logout
- تغییر آدرس و quote ارسال
- شکست/موفقیت/لغو پرداخت
- order tracking و cancel
- cache isolation بین دو کاربر
- keyboard و mobile navigation

### حداقل تست‌های ادمین

- login و guard
- permission-based navigation
- CRUD محصول، SKU، media و inventory
- تغییر وضعیت سفارش
- upload و نمایش خطای API

## ترتیب پیشنهادی اجرا

### فاز صفر: تثبیت و امنیت

1. snapshot امن از تغییرات فعلی Git
2. rotate توکن‌های env و پاک‌سازی secrets
3. انتخاب معماری نهایی Admin
4. اصلاح dependencyهای بحرانی بک‌اند
5. تعریف قرارداد واحد response و API base URL

### فاز یک: چرخه خرید واقعی

1. refresh/session امن
2. cart calculation واحد در backend
3. shipping quote معتبر
4. payment gateway واقعی و callback/verify
5. transaction، idempotency و reservation موجودی
6. تکمیل order success/failure/tracking

### فاز دو: هم‌ترازی Figma و فروشگاه

1. تعیین frameهای Approved
2. ساخت Variables و mapping به SCSS tokens
3. خانه، PLP، PDP و checkout
4. bundle list/detail، compare و full search
5. privacy، coupon list و notification

### فاز سه: اکوسیستم مکانیک

1. مدل دامنه و permission
2. mechanic list/profile/review
3. dashboard، shop info، points و referral
4. wallet و تسویه
5. ticket/message/notification

### فاز چهار: خودرو و عیب‌یاب

1. user garage
2. vehicle compatibility
3. symptom checker و rule/data model
4. پیشنهاد محصول/مکانیک بر اساس نتیجه

### فاز پنج: کیفیت و انتشار

1. صفرکردن خطاهای lint/typecheck
2. تست‌های integration و E2E مسیرهای مالی
3. CI جدا برای ui/Admin/backend
4. artifact و atomic deployment
5. readiness، monitoring، error tracking و rollback

## معیار آماده بودن نسخه production

- Admin و UI هر دو build و typecheck/lint بدون error
- backend بدون vulnerability بحرانی/high شناخته‌شده
- هیچ token واقعی داخل Git
- پرداخت واقعی با verify سمت سرور و idempotency
- cart/order/shipping از یک منبع مبلغ استفاده کنند
- سفارش ناموفق موجودی یا سبد را از بین نبرد
- frameهای Figma وضعیت Approved داشته باشند
- تست E2E خرید، پرداخت و سفارش در CI سبز باشد
- health check علاوه بر process، API و dependencyهای ضروری را بررسی کند
