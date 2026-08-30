# Frontend fixes

- Unified global typography to `IRANYEKAN` and raised explicit font sizes below 16px to at least 16px.
- Enforced RTL/right alignment for form controls, dropdown/listbox/menu/combobox UI and MUI portal content.
- Fixed vehicle selection dropdown typography, RTL layout, search/results alignment and loading/retry states.
- Hardened vehicle make/model requests against stale async responses.
- Fixed loader/spinner animations across auth, vehicle, cart, product and address-related flows.
- Added/fixed missing CSS-module states discovered during review (loading/error/skeleton/etc.).
- TS/TSX syntax scan completed successfully for 228 source/config files.

## Font files
Binary font files are intentionally not included in this ZIP. Keep/copy the original project's font binaries back under `src/assets/fonts/` using the existing directory structure. The stylesheet references remain intact.

## 2026-08-30 - حذف مالیات و رند قیمت‌ها
- مالیات از تمام نمایش‌ها و محاسبات سمت فرانت سبد خرید/پرداخت حذف شد.
- جمع قابل پرداخت دیگر از `grandTotal` مالیات‌دار بک‌اند برای UI استفاده نمی‌کند.
- همه قیمت‌ها با قانون مرکزی به نزدیک‌ترین 100,000 تومان گرد می‌شوند.
- مثال: `7,385,840` → `7,400,000` تومان.
- قیمت محصولات، قیمت تخفیفی، سبد خرید، هزینه ارسال، کوپن، سفارش‌های پروفایل، علاقه‌مندی و فیلتر قیمت یکپارچه شدند.
- utility مرکزی در `src/utils/price.ts` اضافه شد.
