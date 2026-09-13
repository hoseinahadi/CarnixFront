import { existsSync, readFileSync } from 'node:fs';

const failures = [];
const requireFile = (path) => {
  if (!existsSync(path)) failures.push(`Missing P1 file: ${path}`);
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
};

const quote = requireFile('src/features/checkout/api/referenceDataApi.ts');
if (!quote.includes("'/Shipping/quote'")) failures.push('Shipping quote is not connected to the server.');
const step2 = requireFile('src/components/cart/CartStep2.tsx');
if (!step2.includes('quoteReady') || /setSelectedShippingCost\(\s*220000/.test(step2)) failures.push('Shipping price can bypass a valid quote.');
const step3 = requireFile('src/components/cart/CartStep3.tsx');
if (/[ØÙÛ]|ðŸ|âš|âœ/.test(step3)) failures.push('Checkout contains broken UTF-8 text.');
const machine = requireFile('src/features/checkout/model/checkoutMachine.ts');
if (!machine.includes('DELIVERY_CONFIRMED') || !machine.includes("step: 2, shippingCost: null")) failures.push('Checkout recovery does not invalidate stale quotes.');
const callback = requireFile('src/app/(shop)/payment/callback/page.tsx');
if (!callback.includes('PaymentApi.verify')) failures.push('Payment callback does not verify with the server.');
const auth = requireFile('src/store/feature/auth/authThunks.ts');
if (!auth.includes('loadAuthenticatedUserData')) failures.push('Authenticated OTP/login flow does not restore user data and cart.');
const cartThunks = requireFile('src/store/feature/cart/cartThunks.ts');
if (!cartThunks.includes('CartApi.mergeCart')) failures.push('Guest cart merge is missing.');
requireFile('src/components/common/AsyncState/AsyncState.tsx');
const paymentController = requireFile('../Carnix/Carnix/Controllers/PaymentController.cs');
if (!paymentController.includes('[HttpPost("initiate")]') || !paymentController.includes('[HttpPost("verify")]')) failures.push('Backend payment endpoints are missing.');
const paymentService = requireFile('../Carnix/Application/Services/Payment/PaymentService.cs');
if (paymentService.includes('isBankVerificationSuccessful = true')) failures.push('Payment verification still accepts every callback.');
const backendProgram = requireFile('../Carnix/Carnix/Program.cs');
if (!backendProgram.includes('IPaymentService') || !backendProgram.includes('PaymentService')) failures.push('Payment service is not registered in backend DI.');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('P1 checkout checks passed.');
