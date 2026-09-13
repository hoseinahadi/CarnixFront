'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { p4Api, parseList, type Mechanic } from '@/features/p4/p4Api';
import s from '@/components/p4/P4.module.scss';
import m from './MechanicsPage.module.scss';

export default function Mechanics() {
  const [q, setQ] = useState(''); const [city, setCity] = useState('all'); const [service, setService] = useState('all');
  const [data, setData] = useState<Mechanic[]>([]); const [catalog, setCatalog] = useState<Mechanic[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => { setLoading(true); setError(null); return Promise.all([p4Api.mechanics.list(q, city), p4Api.mechanics.list()]).then(([items, allItems]) => { setCatalog(allItems); setData(service === 'all' ? items : items.filter((item) => parseList(item.servicesJson).includes(service))); }).catch(() => setError('دریافت فهرست مکانیک‌ها انجام نشد.')).finally(() => setLoading(false)); }, [q, city, service]);
  useEffect(() => { const timer = setTimeout(() => void load(), 250); return () => clearTimeout(timer); }, [load]);
  const services = [...new Set(catalog.flatMap((item) => parseList(item.servicesJson)))];
  const cities = [...new Set(catalog.map((item) => item.city).filter(Boolean))];
  return <main className={`${s.page} ${m.page}`}>
    <div className={m.breadcrumb}>صفحه اصلی / مکانیک‌ها</div>
    <div className={m.titleRow}><div><h1>مکانیک ها</h1><p className={s.muted}>{data.length.toLocaleString('fa-IR')} مورد</p></div><Link className={s.secondary} href="/mechanics/dashboard">نوبت‌های من</Link></div>
    <div className={m.resultsLayout}>
      <aside className={m.filters}><div className={m.filtersTitle}>فیلترها <span>⌘</span></div><label>تخصص‌ها</label><input value={q} onChange={(event) => setQ(event.target.value)} placeholder="جست‌وجو در تخصص‌ها" /><div className={m.checks}>{services.map((item)=><label key={item}><input type="checkbox" checked={service===item} onChange={()=>setService(service===item?'all':item)}/>{item}</label>)}</div><label>استان</label><div className={m.checks}>{cities.map((item)=><label key={item}><input type="checkbox" checked={city===item} onChange={()=>setCity(city===item?'all':item)}/>{item}</label>)}</div></aside>
      <section className={m.results}>
        {loading && <div className={m.skeletonGrid}>{[1, 2, 3, 4].map((item) => <div className={`${s.card} ${m.skeleton}`} key={item} />)}</div>}
        {!loading && error && <div className={s.state} role="alert">{error}<button className={s.secondary} onClick={() => void load()}>تلاش مجدد</button></div>}
        {!loading && !error && <div className={m.grid}>{data.map((mechanic) => <article className={`${s.card} ${m.card}`} key={mechanic.mechanicProfileId}><div className={m.identity}><div className={m.avatar} aria-hidden="true">{mechanic.name.trim().charAt(0)}</div><div className={m.identityText}><h2>{mechanic.name} {mechanic.isVerified && <span className={m.verified} title="تأییدشده">◉</span>}</h2><p className={m.rating}><b>★ {mechanic.rating.toLocaleString('fa-IR')}</b><span>({mechanic.reviews.toLocaleString('fa-IR')} نظر)</span></p><p className={m.location}>⊙ {mechanic.city}، {mechanic.district}</p></div></div><div className={m.divider}/><div className={m.experience}>♙ {mechanic.experience.toLocaleString('fa-IR')} سال سابقه کار</div><div className={m.tags}>{parseList(mechanic.servicesJson).slice(0, 3).map((item) => <span key={item}>{item}</span>)}</div><div className={m.cardActions}><Link className={`${s.primary} ${m.primary}`} href={`/mechanics/${mechanic.slug}`}>مشاهده پروفایل</Link><a className={s.secondary} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${mechanic.city} ${mechanic.district}`)}`} target="_blank" rel="noreferrer">مسیریابی</a></div></article>)}</div>}
      </section>
    </div>
    {!loading && !data.length && <div className={s.state}>مکانیکی با این مشخصات پیدا نشد.</div>}
  </main>;
}
