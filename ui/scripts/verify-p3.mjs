import fs from 'node:fs';
const read=(p)=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const checks=[
 ['HTTPS backend on 7191',read('src/config/runtime.ts').includes("https://localhost:7191")],
 ['legal pages', ['about','privacy','rules'].every(x=>fs.existsSync(new URL(`../src/app/(shop)/${x}/page.tsx`,import.meta.url)))],
 ['search results',fs.existsSync(new URL('../src/app/(shop)/search/page.tsx',import.meta.url))&&read('src/features/search/components/SearchAutocomplete/SearchAutocomplete.tsx').includes('/search?q=')],
 ['quick view',read('src/components/product/productCard/ProductCard.tsx').includes('quickViewBtn')],
 ['bundle list/detail',fs.existsSync(new URL('../src/app/(shop)/bundles/page.tsx',import.meta.url))&&fs.existsSync(new URL('../src/app/(shop)/bundles/[id]/page.tsx',import.meta.url))],
 ['working reorder',read('src/app/(shop)/profile/orders/[id]/OrderDetailContent.tsx').includes('dispatch(addToCart')],
 ['bulk action',!read('src/app/(shop)/bulk-purchase/page.tsx').includes('TODO: اتصال به API')],
 ['support actions',!read('src/components/common/SupportFab/SupportFab.tsx').includes('TODO:')&&!read('src/components/layouts/Footer/Footer.tsx').includes('href="#"')],
 ['encoding repair',fs.existsSync(new URL('../src/utils/text/repairMojibake.ts',import.meta.url))],
 ['typed product boundary',!read('src/services/api/product/productApi.ts').includes(': any')&&!read('src/store/feature/product/productThunks.ts').includes(': any')&&!read('src/store/feature/product/productThunks.ts').includes('as any')],
 ['response adapter',read('src/services/api/common/apiError.ts').includes('unwrapApiData')&&read('src/store/feature/product/productThunks.ts').includes('readApiData')],
 ['identity aware cache',read('src/services/api/common/requestCache.ts').includes('setRequestCacheIdentity')&&read('src/services/api/common/authTokenStorage.ts').includes('setRequestCacheIdentity')],
 ['stable product hydration',read('src/components/providers/StoreProvider.tsx').includes('useEffect(() =>')&&!read('src/app/(shop)/products/ProductsContent.tsx').match(/localStorage|sessionStorage|window\./)&&read('src/app/(shop)/products/page.tsx').includes('<Suspense')],
];
const failed=checks.filter(([,ok])=>!ok);if(failed.length){for(const [name] of failed)console.error(`FAIL: ${name}`);process.exit(1)}console.log('P3 checks passed.');
