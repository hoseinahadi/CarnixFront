import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(`Critical verification failed: ${message}`);
};

const authController = read('Carnix/Carnix/Controllers/AuthController.cs');
const authService = read('Carnix/Application/Services/Auth/AuthService.cs');
const tokenStorage = read('ui/src/services/api/common/authTokenStorage.ts');
const setTokensRoute = read('ui/src/app/api/auth/set-tokens/route.ts');
const refreshRoute = read('ui/src/app/api/auth/refresh/route.ts');
const cartStep2 = read('ui/src/components/cart/CartStep2.tsx');
const cartStep3 = read('ui/src/components/cart/CartStep3.tsx');
const orderService = read('Carnix/Application/Services/Order/OrderService.cs');

assert(authController.includes('[HttpPost("refresh")]'), 'backend refresh endpoint is missing');
assert(authController.includes('RefreshAccessTokenAsync'), 'refresh endpoint is not connected to rotation service');
assert(authController.includes('ایجاد نشست امن ممکن نشد'), 'login can succeed without issuing a refresh token');
assert(authService.includes('Purpose == "RefreshToken"') && authService.includes('refreshEntry.IsActive = false'), 'refresh rotation/revocation is incomplete');
assert(tokenStorage.includes('HTTP_ONLY_SESSION_MARKER'), 'HTTP-only session marker is missing');
assert(!tokenStorage.includes('localStorage.setItem(ACCESS_TOKEN_KEY'), 'access token is still written to localStorage');
assert(!tokenStorage.includes('localStorage.setItem(REFRESH_TOKEN_KEY'), 'refresh token is still written to localStorage');
assert(setTokensRoute.includes('httpOnly: true'), 'token cookies are not HttpOnly');
assert(refreshRoute.includes('/Auth/refresh') && refreshRoute.includes('cookieStore.get(\'refreshToken\')'), 'frontend refresh route is not cookie-backed');
assert(cartStep2.includes('getShippingQuote') && cartStep2.includes('quoteReady'), 'checkout does not require a shipping quote');
assert(cartStep3.includes('quoteFingerprint') && cartStep3.includes('هزینه ارسال معتبر نیست'), 'payment step accepts an unquoted shipping amount');
assert(orderService.includes('CalculateShippingCostAsync'), 'server order creation does not recalculate shipping');

for (const file of [cartStep2, cartStep3, read('ui/src/views/Cart/CartPage.tsx')]) {
  assert(!file.includes('220000') && !file.includes('۲۲۰٬۰۰۰'), 'hardcoded 220,000 shipping cost found in checkout');
}

console.log('Critical UI-001/UI-002/UI-003 checks passed.');
