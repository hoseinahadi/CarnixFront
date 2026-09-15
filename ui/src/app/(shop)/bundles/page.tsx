'use client';
import { useEffect,useState } from 'react';
import Link from 'next/link';
import { ProductApi } from '@/services/api/product/productApi';
import type { ProductBundleDto } from '@/models/ProductBundle/ProductBundle';
import styles from './Bundles.module.scss';
import { formatPrice } from '@/utils/price';
export default function BundlesPage(){const [data,setData]=useState<ProductBundleDto[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState('');useEffect(()=>{ProductApi.getAllBundles().then(r=>setData((r.data.data??[]).filter(x=>x.isActive))).catch(()=>setError('دریافت بسته‌های پیشنهادی ممکن نشد.')).finally(()=>setLoading(false))},[]);return <main className={styles.page} dir="rtl"><header><h1>بسته‌های پیشنهادی</h1><p>قطعات مکمل را یک‌جا و با سازگاری روشن انتخاب کنید.</p></header>{loading&&<div className={styles.state}>در حال دریافت بسته‌ها…</div>}{error&&<div className={styles.error}>{error}</div>}<div className={styles.grid}>{data.map(b=><article className={styles.card} key={b.productBundleId}><span>{(b.items?.length??0).toLocaleString('fa-IR')} قلم کالا</span><h2>{b.name}</h2><p>{b.description||'مجموعه‌ای از قطعات مکمل برای خرید آسان‌تر'}</p>{typeof b.price==='number'&&<strong>{formatPrice(b.price)} تومان</strong>}<Link href={`/bundles/${b.productBundleId}`}>مشاهده جزئیات بسته</Link></article>)}</div>{!loading&&!error&&!data.length&&<div className={styles.state}>در حال حاضر بسته فعالی وجود ندارد.</div>}</main>}
