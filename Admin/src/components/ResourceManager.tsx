"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FileImage, ImagePlus, RefreshCw, Upload, X } from 'lucide-react';
import type { FieldDef, ResourceConfig } from '@/lib/types';
import { api, fillPath, unwrapList } from '@/lib/api';
import { useToast } from './Toast';

type AnyRecord = Record<string, any>;
type FileMap = Record<string, File | undefined>;
type PreviewMap = Record<string, string | undefined>;
type CategoryOption = { id: number; name: string; parentId: number | null };
type BrandOption = { id: number; name: string };

function norm(obj: AnyRecord | null | undefined, key: string) {
  if (!obj) return undefined;
  if (obj[key] !== undefined) return obj[key];
  const match = Object.keys(obj).find((name) => name.toLowerCase() === key.toLowerCase());
  return match ? obj[match] : undefined;
}

function recordId(value: any, key: string) {
  const candidates = [value, value?.data, value?.result, value?.data?.data, value?.data?.result];
  for (const source of candidates) {
    if (!source || typeof source !== 'object') continue;
    const id = norm(source, key) ?? norm(source, 'id') ?? norm(source, 'recordId');
    if (id !== undefined && id !== null && id !== '') return id;
  }
  return undefined;
}

function format(value: any, render?: string) {
  if (value === null || value === undefined || value === '') return '—';
  if (render === 'boolean') return value ? <span className="badge ok">فعال</span> : <span className="badge muted">غیرفعال</span>;
  if (render === 'money') return Number.isFinite(Number(value)) ? Number(value).toLocaleString('fa-IR') : '—';
  if (render === 'date') { const date = new Date(value); return Number.isNaN(+date) ? String(value) : date.toLocaleString('fa-IR'); }
  if (render === 'status') return <span className="badge info">{String(value)}</span>;
  if (render === 'image' || (typeof value === 'string' && /^https?:\/\//.test(value) && /(jpg|jpeg|png|webp|avif)/i.test(value))) return <img className="thumb" src={value} alt="تصویر" />;
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

function initial(fields: FieldDef[]) {
  const values: AnyRecord = {};
  fields.forEach((field) => { values[field.key] = field.type === 'boolean' ? false : ''; });
  return values;
}

function flattenCategories(nodes: any[], parentFallback: number | null = null, output: CategoryOption[] = [], seen = new Set<number>()) {
  nodes.forEach((node) => {
    const id = Number(norm(node, 'categoryId') ?? norm(node, 'id'));
    if (!Number.isFinite(id) || id <= 0) return;
    const parentValue = norm(node, 'parentCategoryId');
    const parentId = parentValue === null || parentValue === undefined || parentValue === 0 ? parentFallback : Number(parentValue);
    if (!seen.has(id)) { seen.add(id); output.push({ id, name: String(norm(node, 'name') ?? norm(node, 'title') ?? `دسته ${id}`), parentId: parentId || null }); }
    const children = norm(node, 'subCategories') ?? norm(node, 'children');
    if (Array.isArray(children)) flattenCategories(children, id, output, seen);
  });
  return output;
}

function CategorySelect({ value, categories, loading, error, onRetry, onChange }: { value: any; categories: CategoryOption[]; loading: boolean; error: string; onRetry: () => void; onChange: (value: number) => void }) {
  const selectedId = Number(value) || 0;
  const findRoot = (id: number) => { let current = categories.find((category) => category.id === id); const visited = new Set<number>(); while (current?.parentId && !visited.has(current.id)) { visited.add(current.id); current = categories.find((category) => category.id === current?.parentId); } return current?.id || 0; };
  const [rootId, setRootId] = useState(() => findRoot(selectedId));
  useEffect(() => { setRootId(findRoot(selectedId)); }, [selectedId, categories]);
  const roots = categories.filter((category) => !category.parentId);
  const children = categories.filter((category) => category.parentId === rootId);
  const currentChild = selectedId && categories.find((category) => category.id === selectedId)?.parentId === rootId ? selectedId : 0;
  if (loading) return <label><span>دسته اصلی *</span><select disabled><option>در حال دریافت دسته‌ها...</option></select></label>;
  if (error) return <div className="category-load-error"><span>دریافت دسته‌بندی‌ها ناموفق بود.</span><button type="button" onClick={onRetry}><RefreshCw size={13} /> تلاش دوباره</button></div>;
  return <div className="category-selects"><label><span>دسته اصلی *</span><select value={rootId || ''} onChange={(event) => { const next = Number(event.target.value) || 0; setRootId(next); onChange(next); }}><option value="">انتخاب دسته اصلی</option>{roots.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>{rootId > 0 && <label><span>زیر‌دسته <small>(اختیاری)</small></span><select value={currentChild || ''} onChange={(event) => onChange(Number(event.target.value) || rootId)}><option value="">همان دسته اصلی</option>{children.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>}</div>;
}

function BrandSelect({ value, brands, loading, error, onRetry, onChange }: { value: any; brands: BrandOption[]; loading: boolean; error: string; onRetry: () => void; onChange: (value: number | null) => void }) {
  if (loading) return <label><span>برند</span><select disabled><option>در حال دریافت برندها...</option></select></label>;
  if (error) return <div className="category-load-error"><span>دریافت برندها ناموفق بود.</span><button type="button" onClick={onRetry}><RefreshCw size={13} /> تلاش دوباره</button></div>;
  return <label><span>برند <small>(اختیاری)</small></span><select value={value || ''} onChange={(event) => onChange(Number(event.target.value) || null)}><option value="">بدون برند</option>{brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select></label>;
}

function Field({ f, value, preview, file, onChange, onFileChange }: { f: FieldDef; value: any; preview?: string; file?: File; onChange: (value: any) => void; onFileChange: (file?: File) => void }) {
  if (f.type === 'boolean') return <label className="check"><input type="checkbox" checked={!!value} onChange={(event) => onChange(event.target.checked)} /><span>{f.label}{f.required && ' *'}</span></label>;
  if (f.type === 'image') return <label className="upload-control"><span>{f.label}{f.required && ' *'}</span><div className="upload-field"><div className="upload-preview">{preview || value ? <img src={preview || value} alt="پیش‌نمایش تصویر" /> : <FileImage size={28} />}</div><div className="upload-copy"><input id={`upload-${f.key}`} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => onFileChange(event.target.files?.[0])} /><label htmlFor={`upload-${f.key}`} className="upload-button"><ImagePlus size={16} /> {file ? 'تغییر تصویر' : 'انتخاب تصویر'}</label><small>{file ? file.name : value ? 'تصویر فعلی ثبت شده؛ برای جایگزینی فایل جدید انتخاب کنید.' : 'PNG، JPG یا WebP · حداکثر ۱۰ مگابایت'}</small>{file && <button type="button" className="remove-upload" onClick={() => onFileChange(undefined)}><X size={14} /> لغو انتخاب</button>}</div></div></label>;
  if (f.type === 'textarea' || f.type === 'json') return <label><span>{f.label}{f.required && ' *'}</span><textarea rows={f.type === 'json' ? 7 : 3} placeholder={f.placeholder} value={value ?? ''} readOnly={f.readOnly} onChange={(event) => onChange(event.target.value)} /></label>;
  const inputType = f.type === 'decimal' || f.type === 'number' ? 'number' : f.type === 'datetime' ? 'datetime-local' : f.type === 'date' ? 'date' : f.type || 'text';
  return <label><span>{f.label}{f.required && ' *'}</span><input type={inputType} step={f.type === 'decimal' ? 'any' : undefined} placeholder={f.placeholder} value={value ?? ''} readOnly={f.readOnly} onChange={(event) => { let next: any = event.target.value; if ((f.type === 'number' || f.type === 'decimal') && next !== '') next = Number(next); onChange(next); }} /></label>;
}

async function uploadProductImage(file: File, productId: string | number) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('mediaType', 'Image');
  formData.append('productId', String(productId));
  formData.append('displayOrder', '0');
  formData.append('isPrimary', 'true');
  formData.append('isActive', 'true');
  await api('api/product-medias/upload', { method: 'POST', formData });
}

export function ResourceManager({ config }: { config: ResourceConfig }) {
  const { show } = useToast();
  const [rows, setRows] = useState<AnyRecord[]>([]);
  const [raw, setRaw] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AnyRecord | null>(null);
  const [form, setForm] = useState<AnyRecord>(() => initial(config.fields));
  const [files, setFiles] = useState<FileMap>({});
  const [previews, setPreviews] = useState<PreviewMap>({});
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState('');
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [brandLoading, setBrandLoading] = useState(false);
  const [brandError, setBrandError] = useState('');
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<AnyRecord | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params: AnyRecord = { ...(config.list.defaultQuery || {}) };
      if ('page' in params) params.page = page;
      if (config.searchKey && query) params[config.searchKey] = query;
      const response = await api(config.list.path, { query: params });
      setRaw(response); setRows(unwrapList(response));
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'خطا در دریافت اطلاعات'); }
    finally { setLoading(false); }
  }, [config, page, query]);

  useEffect(() => { const timer = setTimeout(() => void load(), query ? 350 : 0); return () => clearTimeout(timer); }, [load, query]);
  useEffect(() => { setPage(1); }, [query]);
  useEffect(() => { if (!modal && !selected) return; const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { setModal(false); setSelected(null); } }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, [modal, selected]);
  const loadCategories = useCallback(async () => { setCategoryLoading(true); setCategoryError(''); try { const response = await api('api/Category/menu'); const list = unwrapList(response).length ? unwrapList(response) : Array.isArray(response?.Data) ? response.Data : Array.isArray(response?.Result) ? response.Result : []; setCategories(flattenCategories(list)); } catch (cause) { setCategoryError(cause instanceof Error ? cause.message : 'خطا در دریافت دسته‌بندی‌ها'); } finally { setCategoryLoading(false); } }, []);
  const loadBrands = useCallback(async () => { setBrandLoading(true); setBrandError(''); try { const response = await api('api/brands/get-all'); const list = unwrapList(response).length ? unwrapList(response) : Array.isArray(response?.Data) ? response.Data : Array.isArray(response?.Result) ? response.Result : []; setBrands(list.map((brand: AnyRecord) => ({ id: Number(norm(brand, 'brandId') ?? norm(brand, 'id')), name: String(norm(brand, 'name') ?? norm(brand, 'title') ?? 'برند بدون نام') })).filter((brand: BrandOption) => brand.id > 0)); } catch (cause) { setBrandError(cause instanceof Error ? cause.message : 'خطا در دریافت برندها'); } finally { setBrandLoading(false); } }, []);
  useEffect(() => { if (config.key === 'products') void loadCategories(); }, [config.key, loadCategories]);
  useEffect(() => { if (config.key === 'products') void loadBrands(); }, [config.key, loadBrands]);

  const idOf = (row: AnyRecord) => norm(row, config.idKey) ?? norm(row, 'id');
  const clearFiles = () => { Object.values(previews).forEach((url) => { if (url?.startsWith('blob:')) URL.revokeObjectURL(url); }); setFiles({}); setPreviews({}); };
  const closeModal = () => { setModal(false); clearFiles(); };
  const openCreate = () => { setEditing(null); setForm(initial(config.fields)); clearFiles(); setModal(true); };
  const openEdit = (row: AnyRecord) => { setEditing(row); const values: AnyRecord = {}; config.fields.forEach((field) => { values[field.key] = norm(row, field.key) ?? (field.type === 'boolean' ? false : ''); }); clearFiles(); setForm(values); setModal(true); };
  const onFileChange = (key: string, file?: File) => { if (file && !['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) { show('فرمت تصویر باید JPG، PNG، WebP یا AVIF باشد.', 'error'); return; } if (file && file.size > 10 * 1024 * 1024) { show('حجم تصویر نباید بیشتر از ۱۰ مگابایت باشد.', 'error'); return; } setFiles((current) => ({ ...current, [key]: file })); setPreviews((current) => { const old = current[key]; if (old?.startsWith('blob:')) URL.revokeObjectURL(old); return { ...current, [key]: file ? URL.createObjectURL(file) : undefined }; }); };

  const save = async () => {
    if (config.readOnly) return;
    for (const field of config.fields) if (field.required && (form[field.key] === undefined || form[field.key] === null || form[field.key] === '')) { show(`${field.label} الزامی است`, 'error'); return; }
    setBusy(true);
    try {
      const endpoint = editing ? config.update : config.create;
      if (!endpoint) throw new Error('عملیات برای این بخش تعریف نشده است.');
      const path = fillPath(endpoint.path, { id: idOf(editing || {}) });
      const body: AnyRecord = { ...form };
      Object.keys(body).forEach((key) => { if (files[key]) delete body[key]; else if (body[key] === '') body[key] = null; });
      const response = await api(path, { method: endpoint.method, body });
      const imageFile = files.imageUrl;
      if (config.key === 'products' && imageFile) {
        const productId = recordId(response, config.idKey) ?? idOf(editing || {});
        if (!productId) throw new Error('محصول ذخیره شد اما شناسه آن برای آپلود تصویر دریافت نشد.');
        try { await uploadProductImage(imageFile, productId); } catch { show('محصول ذخیره شد، اما آپلود تصویر ناموفق بود. از بخش مدیا دوباره تلاش کنید.', 'error'); }
      }
      show(editing ? 'محصول با موفقیت ویرایش شد.' : 'محصول جدید با موفقیت ایجاد شد.');
      closeModal(); await load();
    } catch (cause) { show(cause instanceof Error ? cause.message : 'ذخیره اطلاعات ناموفق بود.', 'error'); }
    finally { setBusy(false); }
  };

  const remove = async (row: AnyRecord) => { if (!config.delete || !window.confirm(`حذف ${config.singular} با شناسه ${idOf(row)} انجام شود؟`)) return; try { await api(fillPath(config.delete.path, { id: idOf(row) }), { method: 'DELETE' }); show('حذف انجام شد.'); await load(); } catch (cause) { show(cause instanceof Error ? cause.message : 'حذف ناموفق بود.', 'error'); } };
  const total = useMemo(() => raw?.totalCount ?? raw?.data?.totalCount ?? raw?.total ?? rows.length, [raw, rows]);
  const pageSize = Number(config.list.defaultQuery?.pageSize || rows.length || 1);
  const hasNext = Number(total) > page * pageSize || (Number(total) === rows.length && rows.length === pageSize);

  return <>
    <div className="page-head"><div><div className="eyebrow">{config.group}</div><h1>{config.title}</h1><p>{config.description}</p></div>{!config.readOnly && config.create && <button className="primary" type="button" onClick={openCreate}>＋ افزودن {config.singular}</button>}</div>
    <div className="toolbar"><div className="searchbox"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={config.searchKey ? 'جست‌وجو...' : 'فیلتر در نتایج...'} aria-label={`جست‌وجوی ${config.title}`} />{query && <button type="button" className="search-clear" onClick={() => setQuery('')} aria-label="پاک کردن جست‌وجو">×</button>}</div><button type="button" onClick={() => void load()} className="ghost">↻ بروزرسانی</button><div className="count" aria-live="polite">{Number(total || 0).toLocaleString('fa-IR')} رکورد</div></div>
    <div className="card table-card">{error ? <div className="error-state"><b>دریافت اطلاعات ناموفق بود</b><span>{error}</span><button type="button" onClick={() => void load()}>تلاش مجدد</button></div> : loading ? <div className="loading"><i /><span>در حال دریافت اطلاعات از بک‌اند...</span></div> : rows.length === 0 ? <div className="empty"><b>داده‌ای یافت نشد</b><span>پاسخ API خالی است یا فیلتر فعلی نتیجه‌ای ندارد.</span></div> : <div className="table-wrap"><table><thead><tr>{config.columns.map((column) => <th key={column.key}>{column.label}</th>)}<th>عملیات</th></tr></thead><tbody>{rows.map((row, index) => <tr key={String(idOf(row) ?? index)} onClick={() => setSelected(row)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(row); } }} tabIndex={0}>{config.columns.map((column) => <td key={column.key}>{format(norm(row, column.key), column.render)}</td>)}<td className="actions" onClick={(event) => event.stopPropagation()}>{!config.readOnly && config.update && <button type="button" onClick={() => openEdit(row)}>ویرایش</button>}{config.delete && <button type="button" className="danger-link" onClick={() => void remove(row)}>حذف</button>}<button type="button" onClick={() => setSelected(row)}>جزئیات</button></td></tr>)}</tbody></table></div>}</div>
    {config.list.defaultQuery?.page !== undefined && <div className="pagination"><button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>قبلی</button><span>صفحه {page.toLocaleString('fa-IR')}</span><button type="button" disabled={!hasNext} onClick={() => setPage((current) => current + 1)}>بعدی</button></div>}
    {modal && <div className="modal-layer" role="presentation" onMouseDown={closeModal}><div className="modal resource-modal" role="dialog" aria-modal="true" aria-labelledby="resource-modal-title" onMouseDown={(event) => event.stopPropagation()}><header className="resource-modal-header"><div className="modal-heading"><span className="modal-heading-icon"><Upload size={18} /></span><div><b id="resource-modal-title">{editing ? `ویرایش ${config.singular}` : `ایجاد ${config.singular}`}</b><span>اطلاعات را کامل کنید و در پایان ذخیره را بزنید.</span></div></div><button type="button" onClick={closeModal} aria-label="بستن">×</button></header><div className="resource-modal-body"><section className="form-section"><div className="form-section-heading"><div><b>اطلاعات اصلی</b><span>فیلدهای ستاره‌دار الزامی هستند.</span></div><span className="required-hint">* الزامی</span></div><div className="form-grid">{config.fields.filter((field) => !(field.readOnly && !editing)).map((field) => config.key === 'products' && field.key === 'categoryId' ? <CategorySelect key={field.key} value={form[field.key]} categories={categories} loading={categoryLoading} error={categoryError} onRetry={() => void loadCategories()} onChange={(value) => setForm((current) => ({ ...current, categoryId: value }))} /> : <Field key={field.key} f={field} value={form[field.key]} preview={previews[field.key]} file={files[field.key]} onChange={(value) => setForm((current) => ({ ...current, [field.key]: value }))} onFileChange={(file) => onFileChange(field.key, file)} />)}</div></section><details className="json-preview"><summary>نمایش پیش‌نمایش فنی JSON</summary><pre>{JSON.stringify(form, null, 2)}</pre></details></div><footer><button type="button" className="ghost" onClick={closeModal}>انصراف</button><button type="button" className="primary" disabled={busy} onClick={() => void save()}>{busy ? 'در حال ذخیره...' : 'ذخیره تغییرات'}</button></footer></div></div>}
    {selected && <div className="drawer-layer" role="presentation" onMouseDown={() => setSelected(null)}><aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="resource-drawer-title" onMouseDown={(event) => event.stopPropagation()}><header><div><b id="resource-drawer-title">جزئیات {config.singular}</b><span>شناسه: {String(idOf(selected) ?? '—')}</span></div><button type="button" onClick={() => setSelected(null)} aria-label="بستن">×</button></header><div className="detail-grid">{Object.entries(selected).map(([key, value]) => <div className="detail-item" key={key}><small>{key}</small><strong>{typeof value === 'object' ? JSON.stringify(value) : String(value ?? '—')}</strong></div>)}</div></aside></div>}
  </>;
}
