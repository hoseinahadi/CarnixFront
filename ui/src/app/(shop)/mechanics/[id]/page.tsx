'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import JalaliDatePicker from '@/components/common/JalaliDatePicker/JalaliDatePicker';
import AppSelect from '@/components/common/AppSelect/AppSelect';
import s from '@/components/p4/P4.module.scss';
import { p4Api, parseList, type Mechanic } from '@/features/p4/p4Api';
import styles from './MechanicDetail.module.scss';

export default function MechanicDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [mechanic, setMechanic] = useState<Mechanic>();
  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void p4Api.mechanics.get(id).then((result) => {
      setMechanic(result);
      setService(parseList(result.servicesJson)[0] || '');
    }).catch(() => toast.error('مکانیک پیدا نشد.'));
  }, [id]);

  if (!mechanic) return <main className={`${s.page} ${styles.page}`}><div className={s.state}>در حال دریافت اطلاعات مکانیک…</div></main>;

  const services = parseList(mechanic.servicesJson);
  const vehicles = parseList(mechanic.vehiclesJson);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!service || !date || !vehicle.trim()) {
      toast.error('خدمت، تاریخ نوبت و خودرو را کامل کنید.');
      return;
    }
    setSubmitting(true);
    try {
      await p4Api.bookings.add({ mechanicProfileId: mechanic.mechanicProfileId, service, appointmentDate: date, vehicle });
      setDone(true);
    } catch (error: unknown) {
      const responseMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(responseMessage || 'ثبت نوبت انجام نشد. دوباره تلاش کنید.');
    } finally { setSubmitting(false); }
  };

  return <main className={`${s.page} ${styles.page}`}>
    <Link className={`${s.link} ${styles.back}`} href="/mechanics">بازگشت به فهرست مکانیک‌ها</Link>
    <section className={styles.profileHeader}><div className={styles.profileAvatar} aria-hidden="true">{mechanic.name.trim().charAt(0)}</div><div className={styles.profileInfo}><h1>{mechanic.shop} {mechanic.isVerified&&<span>◉</span>}</h1><p>{mechanic.name}</p><p className={styles.meta}>شماره تماس: <b dir="ltr">{mechanic.phone}</b></p><p>⊙ {mechanic.city}، {mechanic.district} · {mechanic.experience.toLocaleString('fa-IR')} سال سابقه · ⭐ {mechanic.rating.toLocaleString('fa-IR')}</p><div className={styles.chips}>{services.slice(0,2).map(x=><span key={x}>{x}</span>)}</div></div><div className={styles.profileActions}><a className={s.primary} href={`tel:${mechanic.phone}`}>تماس با تعمیرگاه</a><a className={s.secondary} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${mechanic.city} ${mechanic.district}`)}`} target="_blank" rel="noreferrer">مسیریابی</a></div></section>
    <section className={`${s.card} ${styles.section}`}><h2>معرفی تعمیرگاه</h2><p>{mechanic.about}</p><h3>آدرس</h3><p>{mechanic.city}، {mechanic.district}</p></section>
    <section className={`${s.card} ${styles.section}`}><h2>خدمات تعمیرگاه</h2><div className={styles.serviceGroups}><div><h3>خدمات اصلی</h3><div className={styles.chips}>{services.map(x=><span key={x}>{x}</span>)}</div></div><div><h3>خودروهای تحت پوشش</h3><div className={styles.chips}>{vehicles.map(x=><span key={x}>{x}</span>)}</div></div></div></section>
    <section className={`${s.card} ${styles.section} ${styles.ratingBox}`}><div><h2>امتیاز تعمیرگاه</h2><strong>{mechanic.rating.toLocaleString('fa-IR')} از ۵</strong><p>⭐</p><small>{mechanic.reviews.toLocaleString('fa-IR')} نظر ثبت‌شده</small></div></section>
    {done ? <section className={`${s.card} ${styles.success}`}><h2>درخواست نوبت ثبت شد</h2><p className={s.muted}>نتیجه از پنل شما قابل پیگیری است.</p><Link className={s.primary} href="/mechanics/dashboard">مشاهده نوبت‌ها</Link></section> : <form className={`${s.form} ${styles.bookingForm}`} onSubmit={submit}><h2>درخواست نوبت جدید</h2><label className={s.field}>خدمت<AppSelect value={service} onChange={setService} ariaLabel="انتخاب خدمت" options={services.map((item) => ({ value: item, label: item }))}/></label><label className={s.field} htmlFor="appointment-date">تاریخ نوبت<JalaliDatePicker id="appointment-date" value={date} onChange={setDate} /></label><label className={s.field}>خودرو<input value={vehicle} onChange={(event) => setVehicle(event.target.value)} placeholder="مثلاً پژو ۲۰۶ تیپ ۵" required /></label><button className={s.primary} type="submit" disabled={submitting || !service || !date || !vehicle.trim()}>{submitting ? 'در حال ثبت…' : 'ثبت نوبت'}</button></form>}
  </main>;
}
