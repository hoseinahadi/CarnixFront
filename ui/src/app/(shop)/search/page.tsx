'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/product/productCard/ProductCard';
import { ProductApi } from '@/services/api/product/productApi';
import type { Product } from '@/models/product/Product';
import styles from './SearchPage.module.scss';

function SearchContent(){
 const params=useSearchParams(); const query=(params.get('q')??'').trim();
 const [items,setItems]=useState<Product[]>([]); const [loading,setLoading]=useState(false); const [error,setError]=useState('');
 useEffect(()=>{let active=true;if(query.length<2){setItems([]);return}setLoading(true);setError('');ProductApi.search(query).then(r=>{if(active)setItems(r.data.data??[])}).catch(()=>{if(active)setError('دریافت نتایج جست‌وجو ممکن نشد.')}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[query]);
 return <main className={styles.page} dir="rtl"><header><h1>نتایج جست‌وجو</h1><p>{query?`نتایج مرتبط با «${query}»`:'عبارت مورد نظر را در نوار جست‌وجو وارد کنید.'}</p></header>{loading&&<div className={styles.state}>در حال جست‌وجو…</div>}{error&&<div className={styles.error}>{error}</div>}{!loading&&!error&&query.length>=2&&items.length===0&&<div className={styles.state}>محصولی پیدا نشد.</div>}<div className={styles.grid}>{items.map(p=><ProductCard key={p.productId} product={p}/>)}</div></main>
}

export default function SearchPage(){return <Suspense fallback={<main className={styles.page} dir="rtl"><div className={styles.state}>در حال آماده‌سازی جست‌وجو…</div></main>}><SearchContent/></Suspense>}
