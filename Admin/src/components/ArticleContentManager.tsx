'use client';

import { useEffect, useState } from 'react';
import { api, unwrapList } from '@/lib/api';
import { useToast } from './Toast';

const get = (row: any, key: string) => {
  if (!row) return undefined;
  if (row[key] !== undefined) return row[key];
  const match = Object.keys(row).find((item) => item.toLowerCase() === key.toLowerCase());
  return match ? row[match] : undefined;
};

const initialForm = { contentTypeId: '', contentTemplateId: '', title: '', body: '', slug: '', pageTitle: '', metaDescription: '', metaKeywords: '', canonicalUrl: '', blocks: '[]', articleCategory: '', coverImageUrl: '', displayOrder: '0', isFeatured: false };

export function ArticleContentManager() {
  const { show } = useToast();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [form, setForm] = useState<any>(initialForm);
  const [createOpen, setCreateOpen] = useState(false);
  const [presentation, setPresentation] = useState<any | null>(null);

  const load = async () => { setLoading(true); try { setRows(unwrapList(await api('api/ContentManager/all', { query: { page: 1, pageSize: 50, status } }))); } catch (error: any) { show(error.message, 'error'); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);

  const updateForm = (key: string, value: any) => setForm((current: any) => ({ ...current, [key]: value }));
  const updatePresentation = (key: string, value: any) => setPresentation((current: any) => ({ ...current, [key]: value }));

  const create = async () => {
    try {
      await api('api/ContentManager/CreateFullContent', { method: 'POST', body: { contentTypeId: Number(form.contentTypeId), contentTemplateId: Number(form.contentTemplateId), title: form.title, body: form.body, articleCategory: form.articleCategory || null, coverImageUrl: form.coverImageUrl || null, displayOrder: Number(form.displayOrder || 0), isFeatured: form.isFeatured, blocks: JSON.parse(form.blocks || '[]'), seoMetadata: { pageTitle: form.pageTitle || form.title, metaDescription: form.metaDescription || '', metaKeywords: form.metaKeywords || '', slug: form.slug, canonicalUrl: form.canonicalUrl || '' } } });
      show('مقاله ایجاد شد. برای نمایش در سایت آن را منتشر کنید.'); setCreateOpen(false); setForm(initialForm); await load();
    } catch (error: any) { show(error.message || 'ایجاد مقاله ناموفق بود.', 'error'); }
  };

  const publish = async (row: any) => { try { await api(`api/ContentManager/${get(row, 'dynamicContentId') ?? get(row, 'id')}/publish`, { method: 'PATCH' }); show('مقاله منتشر شد.'); await load(); } catch (error: any) { show(error.message, 'error'); } };
  const openPresentation = (row: any) => setPresentation({ id: get(row, 'dynamicContentId') ?? get(row, 'id'), title: get(row, 'title') || '', articleCategory: get(row, 'articleCategory') || '', coverImageUrl: get(row, 'imageUrl') || get(row, 'coverImageUrl') || '', displayOrder: String(get(row, 'displayOrder') ?? 0), isFeatured: Boolean(get(row, 'isFeatured')) });
  const savePresentation = async () => { if (!presentation) return; try { await api(`api/ContentManager/${presentation.id}/presentation`, { method: 'PATCH', body: { articleCategory: presentation.articleCategory || null, coverImageUrl: presentation.coverImageUrl || null, displayOrder: Number(presentation.displayOrder || 0), isFeatured: presentation.isFeatured } }); show('چیدمان و مقاله منتخب ذخیره شد.'); setPresentation(null); await load(); } catch (error: any) { show(error.message, 'error'); } };

  return <>
    <div className="page-head"><div><div className="eyebrow">محتوا</div><h1>مقالات مجله</h1><p>دسته، تصویر شاخص، ترتیب و مقاله منتخب را از همین بخش مدیریت کنید.</p></div><button className="primary" onClick={() => setCreateOpen(true)}>＋ مقاله جدید</button></div>
    <div className="toolbar"><select className="select-filter" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">همه وضعیت‌ها</option><option value="Draft">پیش‌نویس</option><option value="Published">منتشرشده</option></select><button className="ghost" onClick={load}>↻ بروزرسانی</button></div>
    <div className="card table-card">{loading ? <div className="loading"><i/><span>دریافت مقالات...</span></div> : <div className="table-wrap"><table><thead><tr><th>عنوان</th><th>دسته</th><th>ترتیب</th><th>منتخب</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>{rows.map((row, index) => <tr key={get(row, 'dynamicContentId') ?? get(row, 'id') ?? index}><td>{get(row, 'title') || '—'}</td><td>{get(row, 'articleCategory') || 'بدون دسته'}</td><td>{Number(get(row, 'displayOrder') ?? 0).toLocaleString('fa-IR')}</td><td>{get(row, 'isFeatured') ? <span className="badge success">منتخب</span> : '—'}</td><td><span className="badge info">{get(row, 'status') || '—'}</span></td><td><button className="table-button" onClick={() => openPresentation(row)}>چیدمان</button>{get(row, 'status') !== 'Published' && <button className="table-button" onClick={() => publish(row)}>انتشار</button>}</td></tr>)}</tbody></table>{!rows.length && <div className="empty small">مقاله‌ای وجود ندارد.</div>}</div>}</div>
    {createOpen && <div className="modal-layer" onMouseDown={() => setCreateOpen(false)}><div className="modal content-modal" onMouseDown={(event) => event.stopPropagation()}><header><div><b>مقاله جدید</b><span>محتوا و نحوه نمایش در مجله</span></div><button onClick={() => setCreateOpen(false)}>×</button></header><div className="form-grid"><label><span>Content Type ID</span><input type="number" value={form.contentTypeId} onChange={(event) => updateForm('contentTypeId', event.target.value)}/></label><label><span>Template ID</span><input type="number" value={form.contentTemplateId} onChange={(event) => updateForm('contentTemplateId', event.target.value)}/></label><label><span>عنوان</span><input value={form.title} onChange={(event) => updateForm('title', event.target.value)}/></label><label><span>Slug</span><input dir="ltr" value={form.slug} onChange={(event) => updateForm('slug', event.target.value)}/></label><label><span>دسته مقاله</span><input placeholder="مثلاً آموزش خودرو" value={form.articleCategory} onChange={(event) => updateForm('articleCategory', event.target.value)}/></label><label><span>ترتیب نمایش</span><input type="number" value={form.displayOrder} onChange={(event) => updateForm('displayOrder', event.target.value)}/></label><label className="span-2"><span>آدرس تصویر شاخص</span><input dir="ltr" value={form.coverImageUrl} onChange={(event) => updateForm('coverImageUrl', event.target.value)}/></label><label className="span-2"><span>بدنه مقاله</span><textarea rows={8} value={form.body} onChange={(event) => updateForm('body', event.target.value)}/></label><label className="span-2"><span>توضیحات متا</span><textarea rows={3} value={form.metaDescription} onChange={(event) => updateForm('metaDescription', event.target.value)}/></label><label><span>Page Title</span><input value={form.pageTitle} onChange={(event) => updateForm('pageTitle', event.target.value)}/></label><label><span>Canonical URL</span><input dir="ltr" value={form.canonicalUrl} onChange={(event) => updateForm('canonicalUrl', event.target.value)}/></label><label className="span-2"><span>Meta Keywords</span><input value={form.metaKeywords} onChange={(event) => updateForm('metaKeywords', event.target.value)}/></label><label className="span-2"><span>Blocks JSON</span><textarea rows={4} dir="ltr" value={form.blocks} onChange={(event) => updateForm('blocks', event.target.value)}/></label><label><span>مقاله منتخب</span><input type="checkbox" checked={form.isFeatured} onChange={(event) => updateForm('isFeatured', event.target.checked)}/></label></div><footer><button className="ghost" onClick={() => setCreateOpen(false)}>انصراف</button><button className="primary" onClick={create}>ایجاد مقاله</button></footer></div></div>}
    {presentation && <div className="modal-layer" onMouseDown={() => setPresentation(null)}><div className="modal" onMouseDown={(event) => event.stopPropagation()}><header><div><b>چیدمان مقاله</b><span>{presentation.title}</span></div><button onClick={() => setPresentation(null)}>×</button></header><div className="form-grid"><label><span>دسته مقاله</span><input value={presentation.articleCategory} onChange={(event) => updatePresentation('articleCategory', event.target.value)}/></label><label><span>ترتیب نمایش</span><input type="number" value={presentation.displayOrder} onChange={(event) => updatePresentation('displayOrder', event.target.value)}/></label><label className="span-2"><span>آدرس تصویر شاخص</span><input dir="ltr" value={presentation.coverImageUrl} onChange={(event) => updatePresentation('coverImageUrl', event.target.value)}/></label><label><span>نمایش به‌عنوان مقاله منتخب</span><input type="checkbox" checked={presentation.isFeatured} onChange={(event) => updatePresentation('isFeatured', event.target.checked)}/></label></div><footer><button className="ghost" onClick={() => setPresentation(null)}>انصراف</button><button className="primary" onClick={savePresentation}>ذخیره چیدمان</button></footer></div></div>}
  </>;
}
