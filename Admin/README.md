# Carnix Admin — Complete

پنل مدیریت مستقل **Next.js + TypeScript** که مستقیم از روی Controllerها، Routeها، DTOها و الگوی Authentication بک‌اند Carnix ساخته شده است.

## اجرا

```bash
cp .env.example .env.local
npm install
npm run dev
```

پنل به‌صورت پیش‌فرض روی `http://localhost:3001` اجرا می‌شود. CORS فعلی بک‌اند Carnix پورت 3001 را مجاز کرده است.

در `.env.local` آدرس API را تنظیم کنید:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:7191
NEXT_PUBLIC_STORE_URL=http://localhost:3000
```

## Authentication

- Login: `POST /api/Auth/login`
- Header تمام درخواست‌های احرازشده: `Authorization: ApiToken <token>`
- Session verification: `GET /api/Auth/me`
- Logout: `POST /api/Auth/logout`
- روی HTTP 401 توکن پاک و کاربر به `/login` هدایت می‌شود.

## امکانات اصلی

- Dashboard واقعی: Stats + Trends
- محصولات، دسته‌بندی، برند، Tag، Feature Definition/Option/Value، Category Feature
- SKU، تصویر، Media، Video، 360 View، Warranty
- Product Tools: SEO، SKU Attribute، Product Tag، Similarity، Upload Media
- سفارش‌ها: فهرست، جستجو، آمار، جزئیات، تغییر Status/Carrier، لغو
- Order Statuses، Carts، Product Discounts، Price History، Bundles
- Inventory: Low Stock، Set، Adjust، Transfer، Reserve، Release
- Warehouses
- Users، Roles، Permissions، Permission Rescan
- Content: CreateFullContent + SEO + Blocks + Publish
- Reviews + Product Questions
- Vehicle Makes/Models
- Shipping Methods + Payment Methods
- API Center برای تمام اکشن‌های Controllerهای بک‌اند

## پوشش Backend

فایل `BACKEND-COVERAGE.md` شامل فهرست کامل Routeهاست. فایل `src/lib/endpoints.json` نیز inventory قابل استفاده داخل خود پنل را نگه می‌دارد.

در نسخه تحویلی فعلی:

- 48 Controller
- 263 HTTP Action
- 0 Route بدون `api/`
- تمام بخش‌های منوی پنل Resolve می‌شوند
- TypeScript/TSX از نظر Syntax بررسی شده است

## UI rules

- RTL کامل
- Font stack با اولویت `IRANYekan` / `IRANYekanX`
- حداقل Font Size برابر 16px
- Select/Dropdown راست‌چین
- Responsive desktop/tablet/mobile
- Loading spinner تا پایان واقعی Request فعال می‌ماند

## نسخه‌ها

- Next.js 16.3.3
- React / React DOM 19.2.8
- TypeScript 5.8.x

## نکته مهم

Backend همچنان مرجع نهایی Permission، Validation و Business Rule است. پنل محدودیت‌های Authorization را دور نمی‌زند و همان API Token و PermissionFilter بک‌اند را استفاده می‌کند.
