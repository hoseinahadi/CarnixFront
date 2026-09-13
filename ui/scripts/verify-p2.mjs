import { existsSync, readFileSync } from 'node:fs';

const failures = [];
const read = (path) => existsSync(path) ? readFileSync(path, 'utf8') : (failures.push(`Missing: ${path}`), '');

const dialog = read('src/components/common/Dialog/Dialog.tsx');
for (const requirement of ['aria-modal="true"', "event.key === 'Escape'", 'focusableSelector', 'returnFocusRef']) {
  if (!dialog.includes(requirement)) failures.push(`Dialog accessibility requirement missing: ${requirement}`);
}
const plp = read('src/app/(shop)/products/ProductsPage.module.scss');
if (!plp.includes('.filterDrawer') || !plp.includes('max-width: 100%')) failures.push('PLP mobile drawer is not safe at 320px.');
const pdp = read('src/views/ProductDetail/ProductDetail.module.scss');
if (!pdp.includes('env(safe-area-inset-bottom') || !pdp.includes('position: sticky')) failures.push('PDP sticky purchase area is missing.');
const profile = read('src/app/(shop)/profile/ProfileLayout.module.scss');
if (!profile.includes('100dvh') || !profile.includes('safe-area-inset-bottom')) failures.push('Profile mobile shell does not handle safe areas.');
const hero = read('src/components/home/HeroSection/HeroSection.module.scss');
if (!hero.includes('clamp(190px, 56vw, 240px)')) failures.push('Mobile hero is not responsive.');
const nextConfig = read('next.config.ts');
if (nextConfig.includes('NODE_TLS_REJECT_UNAUTHORIZED') || nextConfig.includes('unoptimized: true')) failures.push('Unsafe or globally unoptimized Next configuration remains.');

if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log('P2 UI checks passed.');
