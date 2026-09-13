'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Car, Edit3, Plus, Trash2, Wrench, X } from 'lucide-react';
import toast from 'react-hot-toast';

import VehicleSelect from '@/features/vehicle/components/VehicleSelect';
import { p4Api, type CompatibilityProduct, type GarageVehicle } from '@/features/p4/p4Api';
import ProductCard from '@/components/product/productCard/ProductCard';
import type { Product } from '@/models/product/Product';
import { getMediaUrl } from '@/utils/media/getMediaUrl';
import styles from './GaragePage.module.scss';

const fallbackVehicleImage = (title: string, index: number) =>
  title.includes('207') || index % 2 === 1
    ? '/figma-assets/garage-peugeot-207.png'
    : '/figma-assets/garage-dena.png';

const toProductCardModel = (product: CompatibilityProduct): Product => ({
  productId: product.productId,
  productName: product.name,
  basePrice: product.basePrice,
  totalStock: product.totalStock,
  categoryId: 0,
  isActive: true,
  isFeatured: false,
  imageUrl: product.imageUrl || '/figma-assets/bundle-service-thumb-parts.png',
});

type PlateParts = {
  iranCode: string;
  number: string;
  letter: string;
  serial: string;
};

const emptyPlate: PlateParts = { iranCode: '', number: '', letter: '', serial: '' };
const plateKeys: Array<keyof PlateParts> = ['iranCode', 'number', 'letter', 'serial'];

const parsePlate = (value: string): PlateParts => {
  const chunks = value.split(/[\s-]+/).filter(Boolean);
  if (chunks.length >= 4) {
    return { iranCode: chunks[0].slice(0, 2), number: chunks[1].slice(0, 3), letter: chunks[2].slice(0, 1), serial: chunks[3].slice(0, 2) };
  }
  const digits = value.match(/[0-9۰-۹٠-٩]+/g) || [];
  const letters = value.replace(/[0-9۰-۹٠-٩\s-]/g, '').trim();
  return {
    iranCode: digits[0]?.slice(0, 2) || '',
    number: digits[1]?.slice(0, 3) || '',
    letter: letters.slice(0, 1),
    serial: digits[2]?.slice(0, 2) || '',
  };
};

const plateToString = (parts: PlateParts) => [parts.iranCode, parts.number, parts.letter, parts.serial].filter(Boolean).join('-');

export default function Garage() {
  const [data, setData] = useState<GarageVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [compatibility, setCompatibility] = useState<Record<number, CompatibilityProduct[]>>({});
  const [compatibilityLoading, setCompatibilityLoading] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [vehicle, setVehicle] = useState('');
  const [year, setYear] = useState('');
  const [plateParts, setPlateParts] = useState<PlateParts>(emptyPlate);
  const plateRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [mileage, setMileage] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = useCallback(() => p4Api.garage.list()
    .then(setData)
    .catch(() => toast.error('دریافت گاراژ انجام نشد.'))
    .finally(() => setLoading(false)), []);

  useEffect(() => { void load(); }, [load]);

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setVehicle('');
    setYear('');
    setPlateParts(emptyPlate);
    setMileage('');
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const wasEditing = editingId !== null;
    try {
      const input = { title: vehicle, year, plate: plateToString(plateParts), mileage: Number(mileage) || 0 };
      if (editingId) await p4Api.garage.update(editingId, input);
      else await p4Api.garage.add(input);
      closeForm();
      await load();
      toast.success(wasEditing ? 'اطلاعات خودرو به‌روزرسانی شد.' : 'خودرو در گاراژ ذخیره شد.');
    } catch {
      toast.error('ذخیره خودرو انجام نشد.');
    }
  };

  const startEditing = (item: GarageVehicle) => {
    setEditingId(item.garageVehicleId);
    setVehicle(item.title);
    setYear(item.year);
    setPlateParts(parsePlate(item.plate || ''));
    setMileage(String(item.mileage || ''));
    setFormOpen(true);
  };

  const updatePlatePart = (index: number, value: string) => {
    const key = plateKeys[index];
    const isLetter = key === 'letter';
    const maxLength = key === 'number' ? 3 : 2;
    const cleaned = isLetter
      ? value.replace(/[^\u0600-\u06FFa-zA-Z]/g, '').slice(0, 1)
      : value.replace(/[^0-9۰-۹٠-٩]/g, '').slice(0, maxLength);
    setPlateParts((current) => ({ ...current, [key]: cleaned }));
    if (cleaned.length >= maxLength && index < plateKeys.length - 1) plateRefs.current[index + 1]?.focus();
  };

  const handlePlateKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !event.currentTarget.value && index > 0) plateRefs.current[index - 1]?.focus();
  };

  const showCompatibility = async (id: number) => {
    if (compatibility[id]) {
      setCompatibility((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      return;
    }
    setCompatibilityLoading(id);
    try {
      const result = await p4Api.garage.compatibility(id);
      setCompatibility((current) => ({ ...current, [id]: result.products }));
    } catch {
      toast.error('دریافت قطعات سازگار انجام نشد.');
    } finally {
      setCompatibilityLoading(null);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div><h1>گاراژ من</h1><p>خودروهایتان را برای بررسی سریع سازگاری قطعات نگه دارید.</p></div>
        <button className={styles.addButton} type="button" onClick={() => setFormOpen(true)}><Plus size={18} /> ماشین جدید</button>
      </header>

      <section className={styles.vehicleList} aria-busy={loading}>
        {data.map((item, index) => {
          const source = getMediaUrl(item.imageUrl || undefined) || fallbackVehicleImage(item.title, index);
          return (
            <article className={styles.vehicleCard} key={item.garageVehicleId}>
              <div className={styles.vehicleMain}>
                <div className={styles.vehicleImage}><Image src={source} alt={item.title} width={72} height={72} sizes="72px" /></div>
                <div className={styles.vehicleInfo}><h2>{item.title}</h2><p>مدل {item.year}{item.plate ? ` · پلاک ${item.plate}` : ''}{item.mileage ? ` · ${item.mileage.toLocaleString('fa-IR')} کیلومتر` : ''}</p></div>
              </div>

              <div className={styles.actions}>
                <button type="button" onClick={() => void showCompatibility(item.garageVehicleId)} disabled={compatibilityLoading === item.garageVehicleId}><Wrench size={16} />{compatibilityLoading === item.garageVehicleId ? 'در حال بررسی…' : 'محصولات این ماشین'}</button>
                <button type="button" onClick={() => startEditing(item)}><Edit3 size={16} /> مشاهده جزئیات</button>
                <button className={styles.deleteButton} type="button" aria-label={`حذف ${item.title}`} onClick={async () => { await p4Api.garage.remove(item.garageVehicleId); await load(); }}><Trash2 size={17} /></button>
              </div>

              {compatibility[item.garageVehicleId] && (
                <div className={styles.compatibility}>
                  <h3>قطعات سازگار با {item.title}</h3>
                  {compatibility[item.garageVehicleId].length > 0 ? (
                    <div className={styles.products}>
                      {compatibility[item.garageVehicleId].map((product) => (
                        <ProductCard key={product.productId} product={toProductCardModel(product)} />
                      ))}
                    </div>
                  ) : <p>قطعه سازگاری برای این خودرو پیدا نشد.</p>}
                </div>
              )}
            </article>
          );
        })}
        {!loading && data.length === 0 && <div className={styles.empty}><Car size={34} /><strong>هنوز خودرویی ثبت نشده است.</strong><button type="button" onClick={() => setFormOpen(true)}>افزودن اولین خودرو</button></div>}
      </section>

      {formOpen && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) closeForm(); }}>
          <form className={styles.form} onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="garage-form-title">
            <div className={styles.formHeader}><h2 id="garage-form-title">{editingId ? 'ویرایش خودرو' : 'افزودن خودرو'}</h2><button type="button" onClick={closeForm} aria-label="بستن"><X size={20} /></button></div>
            <label><span>برند و مدل</span><VehicleSelect value={vehicle} onChange={setVehicle} /></label>
            <label><span>سال ساخت</span><input value={year} onChange={(event) => setYear(event.target.value)} inputMode="numeric" required /></label>
            <label>
              <span>پلاک</span>
              <div className={styles.plateInputs} dir="ltr" aria-label="اجزای پلاک خودرو">
                {plateKeys.map((key, index) => {
                  const maxLength = key === 'number' ? 3 : key === 'letter' ? 1 : 2;
                  const labels: Record<keyof PlateParts, string> = { iranCode: 'ایران', number: 'سه رقم', letter: 'حرف', serial: 'دو رقم' };
                  return (
                    <input
                      key={key}
                      ref={(element) => { plateRefs.current[index] = element; }}
                      className={`${styles.platePart} ${key === 'iranCode' ? styles.iranCode : ''}`}
                      value={plateParts[key]}
                      onChange={(event) => updatePlatePart(index, event.target.value)}
                      onKeyDown={(event) => handlePlateKeyDown(index, event)}
                      inputMode={key === 'letter' ? 'text' : 'numeric'}
                      maxLength={maxLength}
                      placeholder={labels[key]}
                      aria-label={labels[key]}
                    />
                  );
                })}
              </div>
              <small className={styles.plateHint}>کد ایران، سه رقم، حرف و دو رقم پلاک را وارد کنید.</small>
            </label>
            <label><span>کارکرد</span><input value={mileage} onChange={(event) => setMileage(event.target.value)} inputMode="numeric" /></label>
            <button className={styles.saveButton} disabled={!vehicle}>{editingId ? 'ذخیره تغییرات' : 'ذخیره در گاراژ'}</button>
          </form>
        </div>
      )}
    </main>
  );
}
