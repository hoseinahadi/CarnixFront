'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import VehicleSelect from '@/features/vehicle/components/VehicleSelect';
import ProductCard from '@/components/product/productCard/ProductCard';
import type { Product } from '@/models/product/Product';
import { p4Api, parseList, type DiagnosticEvaluation, type DiagnosticRule, type GarageVehicle } from '@/features/p4/p4Api';
import { getAccessToken } from '@/services/api/common/authTokenStorage';
import s from '@/components/p4/P4.module.scss';
import styles from './Diagnose.module.scss';
import DiagnosisCarMap from './DiagnosisCarMap';

type Step = 0 | 1 | 2 | 3 | 4;

export default function Diagnose() {
  const [step, setStep] = useState<Step>(0);
  const [rules, setRules] = useState<DiagnosticRule[]>([]);
  const [garage, setGarage] = useState<GarageVehicle[]>([]);
  const [vehicle, setVehicle] = useState('');
  const [garageId, setGarageId] = useState('');
  const [systemKey, setSystemKey] = useState('');
  const [symptomKey, setSymptomKey] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [when, setWhen] = useState('driving');
  const [evaluation, setEvaluation] = useState<DiagnosticEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadDiagnostics = async () => {
      const retryDelays = [0, 350, 900];

      for (const delay of retryDelays) {
        if (delay > 0) {
          await new Promise((resolve) => window.setTimeout(resolve, delay));
        }

        try {
          const result = await p4Api.diagnostics.list();
          if (cancelled) return;

          setRules(result);
          setError('');
          setLoading(false);
          return;
        } catch {
          if (cancelled) return;
        }
      }

      if (!cancelled) {
        setError('دریافت اطلاعات عیب‌یاب انجام نشد. دوباره تلاش کنید.');
        setLoading(false);
      }
    };

    void loadDiagnostics();

    // The garage endpoint is protected. Do not fire it for anonymous users:
    // a 401 from an optional request must not invalidate the public diagnosis.
    if (getAccessToken()) {
      p4Api.garage.list()
        .then((result) => {
          if (!cancelled) setGarage(result);
        })
        .catch(() => undefined);
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const systems = useMemo(() => [...new Map(rules.map((rule) => [rule.systemKey, rule.systemTitle])).entries()], [rules]);
  const symptoms = useMemo(() => rules.filter((rule) => rule.systemKey === systemKey), [rules, systemKey]);
  const symptom = rules.find((rule) => rule.symptomKey === symptomKey);

  const restart = () => { setStep(0); setVehicle(''); setGarageId(''); setSystemKey(''); setSymptomKey(''); setSeverity('medium'); setWhen('driving'); setEvaluation(null); setError(''); };

  const next = async () => {
    if (step < 3) { setStep((current) => (current + 1) as Step); return; }
    if (!symptom) return;
    setEvaluating(true); setError('');
    try {
      const result = await p4Api.diagnostics.evaluate({ diagnosticRuleId: symptom.diagnosticRuleId, severity, when, ...(garageId ? { garageVehicleId: Number(garageId) } : {}) });
      setEvaluation(result); setStep(4);
    } catch { setError('ارزیابی نشانه انجام نشد. دوباره تلاش کنید.'); }
    finally { setEvaluating(false); }
  };

  return (
    <main className={`${s.page} ${styles.page}`}>
      <div className={`${s.header} ${styles.header}`}><div><h1>عیب‌یاب خودرو</h1><p className={s.muted}>قواعد عیب‌یابی و پیشنهادها مستقیماً از سرور دریافت می‌شوند.</p></div>{step > 0 && <button className={s.secondary} onClick={restart}>شروع دوباره</button>}</div>
      {loading && <div className={s.state}>در حال دریافت اطلاعات عیب‌یاب…</div>}
      {!loading && error && step === 0 && <div className={s.state} role="alert">{error}</div>}
      {!loading && !error && <div className={s.progress}><span style={{ width: `${((step + 1) / 5) * 100}%` }} /></div>}

      {!loading && !error && step === 0 && <section className={s.form}><h2>کدام خودرو مشکل دارد؟</h2>{garage.length > 0 && <label className={s.field}>خودروی گاراژ<select className="unifiedSelect" value={garageId} onChange={(event) => { setGarageId(event.target.value); setVehicle(garage.find((item) => String(item.garageVehicleId) === event.target.value)?.title ?? ''); }}><option value="">انتخاب از گاراژ</option>{garage.map((item) => <option value={item.garageVehicleId} key={item.garageVehicleId}>{item.title}</option>)}</select></label>}{!garageId && <VehicleSelect value={vehicle} onChange={setVehicle} />}<button className={s.primary} disabled={!vehicle || !rules.length} onClick={() => void next()}>ادامه</button></section>}

      {!loading && !error && step === 1 && <div className={styles.diagnosisLayout}><section className={styles.carPanel}><h2>مشکل در کدام بخش خودرو است؟</h2><DiagnosisCarMap selectedSystem={systemKey} systems={systems} onSelect={(key) => { setSystemKey(key); setSymptomKey(''); }} /><p>بخش نزدیک به محل مشکل را انتخاب کنید.</p></section><section className={s.form}><h2>یک بخش را انتخاب کنید</h2>{systems.map(([key, title]) => <button key={key} className={`${s.choice} ${systemKey === key ? s.selected : ''}`} onClick={() => { setSystemKey(key); setSymptomKey(''); }}>{title}</button>)}<div className={s.actions}><button className={s.secondary} onClick={() => setStep(0)}>قبلی</button><button className={s.primary} disabled={!systemKey} onClick={() => void next()}>ادامه</button></div></section></div>}

      {!loading && !error && step === 2 && <div className={styles.diagnosisLayout}><section className={styles.carPanel}><h2>بخش انتخاب‌شده</h2><DiagnosisCarMap selectedSystem={systemKey} systems={systems} onSelect={(key) => { setSystemKey(key); setSymptomKey(''); }} /><strong>{systems.find(([key])=>key===systemKey)?.[1]}</strong></section><section className={s.form}><h2>نشانه اصلی را انتخاب کنید</h2>{symptoms.map((item) => <button key={item.symptomKey} className={`${s.choice} ${symptomKey === item.symptomKey ? s.selected : ''}`} onClick={() => setSymptomKey(item.symptomKey)}>{item.symptomTitle}</button>)}<div className={s.actions}><button className={s.secondary} onClick={() => setStep(1)}>قبلی</button><button className={s.primary} disabled={!symptomKey} onClick={() => void next()}>ادامه</button></div></section></div>}

      {!loading && !error && step === 3 && <section className={s.form}><h2>جزئیات نشانه</h2><label className={s.field}>شدت مشکل<select className="unifiedSelect" value={severity} onChange={(event) => setSeverity(event.target.value)}><option value="low">کم</option><option value="medium">متوسط</option><option value="high">زیاد</option></select></label><label className={s.field}>چه زمانی رخ می‌دهد؟<select className="unifiedSelect" value={when} onChange={(event) => setWhen(event.target.value)}><option value="start">هنگام روشن کردن</option><option value="driving">هنگام حرکت</option><option value="brake">هنگام ترمز</option><option value="always">همیشه</option></select></label>{error && <p className={s.message} role="alert">{error}</p>}<button className={s.primary} disabled={evaluating} onClick={() => void next()}>{evaluating ? 'در حال ارزیابی…' : 'نمایش نتیجه'}</button></section>}

      {!loading && step === 4 && evaluation && <section className={`${s.list} ${styles.results}`}><article className={`${s.card} ${s.result}`}><span className={s.badge}>{evaluation.rule.isUrgent || evaluation.severity === 'high' ? 'اولویت بالا' : 'نیازمند بررسی'}</span><h2>{evaluation.rule.symptomTitle}</h2><p>برای {evaluation.garage?.title || vehicle}، علت‌های محتمل:</p><ol>{parseList(evaluation.rule.causesJson).map((cause) => <li key={cause}>{cause}</li>)}</ol>{(evaluation.rule.isUrgent || evaluation.severity === 'high') && <p><strong>تا بررسی مکانیک از ادامه رانندگی خودداری کنید.</strong></p>}<div className={s.actions}><Link className={s.primary} href={`/search?q=${encodeURIComponent(evaluation.rule.searchTerm)}`}>مشاهده قطعات مرتبط</Link><Link className={s.secondary} href={`/mechanics?q=${encodeURIComponent(evaluation.rule.service)}`}>یافتن مکانیک</Link></div></article>{evaluation.mechanics.length > 0 && <div className={s.grid}>{evaluation.mechanics.map((mechanic) => <article className={s.card} key={mechanic.mechanicProfileId}><h3>{mechanic.name}</h3><p>{mechanic.shop} · {mechanic.city}</p><Link className={s.link} href={`/mechanics/${mechanic.slug}`}>مشاهده و رزرو</Link></article>)}</div>}{evaluation.products.length > 0 && <div className={styles.productCards}>{evaluation.products.map((product) => { const card: Product = { productId: product.productId, productName: product.name, basePrice: product.basePrice, totalStock: 1, categoryId: 0, isActive: true, isFeatured: false, imageUrl: product.imageUrl || undefined }; return <div className={styles.productCard} key={product.productId}><ProductCard product={card} /></div>; })}</div>}</section>}
    </main>
  );
}
