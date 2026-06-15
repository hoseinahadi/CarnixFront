'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ProductMediaApi } from '@/api/product/ProductMediaApi';
import type {
  ProductImageDto,
  ProductVideoDto,
  Product360ViewDto,
  AddProductMediaDto,
} from '@/models/product/ProductMedia';
import styles from './ProductMediaManager.module.scss';

// ─── Union type برای نمایش یکپارچه در grid ────────────────────────────────────
type MediaItem =
  | (ProductImageDto  & { _type: 'Image' })
  | (ProductVideoDto  & { _type: 'Video' })
  | (Product360ViewDto & { _type: '360' });

// ─── فایل در حال آپلود ────────────────────────────────────────────────────────
interface UploadingFile {
  id       : string;
  file     : File;
  progress : number;
  type     : 'Image' | 'Video' | '360';
  preview? : string;
  error?   : string;
  aborted? : boolean;
}

interface Props {
  productId : number | string;
  onChange? : (images: ProductImageDto[], videos: ProductVideoDto[], views: Product360ViewDto[]) => void;
}

// ─── آپلود XHR با progress ────────────────────────────────────────────────────
function xhrUpload(
  url     : string,
  payload : AddProductMediaDto,
  onProgress: (pct: number) => void
): { promise: Promise<any>; abort: () => void } {
  const xhr  = new XMLHttpRequest();
  const form = new FormData();

  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined && v !== null) form.append(k, v as any);
  });

  const promise = new Promise<any>((resolve, reject) => {
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload  = () => {
      try { resolve(JSON.parse(xhr.responseText)); }
      catch { reject(new Error('پاسخ نامعتبر از سرور')); }
    };
    xhr.onerror  = () => reject(new Error('خطای شبکه'));
    xhr.onabort  = () => reject(new Error('لغو شد'));
    xhr.open('POST', url);
    // اگر axiosInstance هدر Authorization می‌گذارد، آن را اینجا هم اضافه کنید
    // xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(form);
  });

  return { promise, abort: () => xhr.abort() };
}

const UPLOAD_URLS: Record<'Image' | 'Video' | '360', string> = {
  Image : '/api/product-images/Create',
  Video : '/api/product-videos/Create',
  '360' : '/api/product-360-views/Create',
};

// ─── کامپوننت اصلی ────────────────────────────────────────────────────────────
const ProductMediaManager: React.FC<Props> = ({ productId, onChange }) => {
  const [activeTab, setActiveTab] = useState<'Image' | 'Video' | '360'>('Image');

  const [images,   setImages]   = useState<ProductImageDto[]>([]);
  const [videos,   setVideos]   = useState<ProductVideoDto[]>([]);
  const [views360, setViews360] = useState<Product360ViewDto[]>([]);

  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragging,     setIsDragging]     = useState(false);
  const [isLoading,      setIsLoading]      = useState(false);

  // نگه‌داری مرجع abort برای هر آپلود
  const abortMap = useRef<Record<string, () => void>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const genId = () => Math.random().toString(36).slice(2, 11);

  // ─── notify parent ────────────────────────────────────────────────
  const notify = useCallback((
    imgs : ProductImageDto[]   = images,
    vids : ProductVideoDto[]   = videos,
    v360 : Product360ViewDto[] = views360,
  ) => onChange?.(imgs, vids, v360), [images, videos, views360, onChange]);

  // ─── بارگذاری اولیه ──────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [imgRes, vidRes, v360Res] = await Promise.all([
          ProductMediaApi.getImagesByProductId(productId),
          ProductMediaApi.getVideosByProductId(productId),
          ProductMediaApi.get360ViewsByProductId(productId),
        ]);
        const imgs = imgRes.data?.data  ?? [];
        const vids = vidRes.data?.data  ?? [];
        const v360 = v360Res.data?.data ?? [];
        setImages(imgs);
        setVideos(vids);
        setViews360(v360);
        onChange?.(imgs, vids, v360);
      } catch (e) {
        console.error('خطا در بارگذاری رسانه‌ها:', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // ─── آپلود ───────────────────────────────────────────────────────
  const uploadFile = useCallback((file: File, type: 'Image' | 'Video' | '360') => {
    const id      = genId();
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;

    const payload: AddProductMediaDto = {
      file,
      productId,
      displayOrder : (
        type === 'Image'  ? images.length  :
        type === 'Video'  ? videos.length  :
        views360.length
      ) + 1,
    };

    const { promise, abort } = xhrUpload(
      UPLOAD_URLS[type],
      payload,
      (pct) => setUploadingFiles(prev =>
        prev.map(f => f.id === id ? { ...f, progress: pct } : f)
      )
    );

    abortMap.current[id] = abort;
    setUploadingFiles(prev => [...prev, { id, file, progress: 0, type, preview }]);

    promise
      .then((res) => {
        if (!res?.isSuccess) throw new Error(res?.message || 'خطا در آپلود');

        setUploadingFiles(prev =>
          prev.map(f => f.id === id ? { ...f, progress: 100 } : f)
        );

        setTimeout(() => {
          if (type === 'Image') {
            setImages(prev => {
              const updated = [...prev, res.data as ProductImageDto];
              notify(updated, undefined, undefined);
              return updated;
            });
          } else if (type === 'Video') {
            setVideos(prev => {
              const updated = [...prev, res.data as ProductVideoDto];
              notify(undefined, updated, undefined);
              return updated;
            });
          } else {
            setViews360(prev => {
              const updated = [...prev, res.data as Product360ViewDto];
              notify(undefined, undefined, updated);
              return updated;
            });
          }
          setUploadingFiles(prev => prev.filter(f => f.id !== id));
          if (preview) URL.revokeObjectURL(preview);
          delete abortMap.current[id];
        }, 400);
      })
      .catch((err: Error) => {
        if (err.message === 'لغو شد') {
          setUploadingFiles(prev => prev.filter(f => f.id !== id));
          if (preview) URL.revokeObjectURL(preview);
        } else {
          setUploadingFiles(prev =>
            prev.map(f => f.id === id ? { ...f, error: err.message, progress: 0 } : f)
          );
        }
        delete abortMap.current[id];
      });
  }, [productId, images.length, videos.length, views360.length, notify]);

  // ─── لغو آپلود ───────────────────────────────────────────────────
  const handleCancel = (id: string) => {
    abortMap.current[id]?.();
  };

  // ─── رد خطا ──────────────────────────────────────────────────────
  const handleDismissError = (id: string) => {
    setUploadingFiles(prev => {
      const f = prev.find(x => x.id === id);
      if (f?.preview) URL.revokeObjectURL(f.preview);
      return prev.filter(x => x.id !== id);
    });
  };

  // ─── حذف رسانه ───────────────────────────────────────────────────
  const handleDelete = async (item: MediaItem) => {
    try {
      if (item._type === 'Image') {
        const res = await ProductMediaApi.deleteImage((item as ProductImageDto).productImageId);
        if (res.data?.isSuccess) {
          setImages(prev => {
            const updated = prev.filter(i => i.productImageId !== (item as ProductImageDto).productImageId);
            notify(updated, undefined, undefined);
            return updated;
          });
        }
      } else if (item._type === 'Video') {
        const res = await ProductMediaApi.deleteVideo((item as ProductVideoDto).productVideoId);
        if (res.data?.isSuccess) {
          setVideos(prev => {
            const updated = prev.filter(i => i.productVideoId !== (item as ProductVideoDto).productVideoId);
            notify(undefined, updated, undefined);
            return updated;
          });
        }
      } else {
        const res = await ProductMediaApi.delete360View((item as Product360ViewDto).product360ViewId);
        if (res.data?.isSuccess) {
          setViews360(prev => {
            const updated = prev.filter(i => i.product360ViewId !== (item as Product360ViewDto).product360ViewId);
            notify(undefined, undefined, updated);
            return updated;
          });
        }
      }
    } catch (e) {
      console.error('خطا در حذف:', e);
    }
  };

  // ─── Drag & Drop ──────────────────────────────────────────────────
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    Array.from(e.dataTransfer.files).forEach(f => uploadFile(f, activeTab));
  }, [activeTab, uploadFile]);

  // ─── ساختن MediaItem[] برای grid ─────────────────────────────────
  const currentItems: MediaItem[] = activeTab === 'Image'
    ? images.map(i  => ({ ...i,  _type: 'Image'  }))
    : activeTab === 'Video'
    ? videos.map(v  => ({ ...v,  _type: 'Video'  }))
    : views360.map(v => ({ ...v, _type: '360'    }));

  const uploading = uploadingFiles.filter(f => f.type === activeTab);

  // ─── helper: URL تصویر/ویدیو ──────────────────────────────────────
  const mediaUrl = (item: MediaItem): string => {
    if (item._type === 'Image')  return (item as ProductImageDto).imageUrl   ?? '';
    if (item._type === 'Video')  return (item as ProductVideoDto).videoUrl   ?? '';
    return (item as Product360ViewDto).viewUrl ?? '';
  };

  const mediaKey = (item: MediaItem): string | number => {
    if (item._type === 'Image')  return (item as ProductImageDto).productImageId;
    if (item._type === 'Video')  return (item as ProductVideoDto).productVideoId;
    return (item as Product360ViewDto).product360ViewId;
  };

  // ─── render ───────────────────────────────────────────────────────
  return (
    <div className={styles.wrapper}>

      {/* Tabs */}
      <div className={styles.tabs}>
        {(['Image', 'Video', '360'] as const).map(t => {
          const count = t === 'Image' ? images.length : t === 'Video' ? videos.length : views360.length;
          return (
            <button
              key={t} type="button"
              className={`${styles.tab} ${activeTab === t ? styles.active : ''}`}
              onClick={() => setActiveTab(t)}
            >
              {{ Image: '🖼 تصاویر', Video: '🎬 ویدیوها', '360': '🔄 360°' }[t]}
              {count > 0 && <span className={styles.badge}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Drop Zone */}
      <div
        className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <span className={styles.dropIcon}>📁</span>
        <p>فایل‌ها را اینجا رها کنید یا کلیک کنید</p>
        <small>
          {activeTab === 'Image' ? 'JPG، PNG، WebP — حداکثر ۵ مگابایت' :
           activeTab === 'Video' ? 'MP4، WebM — حداکثر ۱۰۰ مگابایت' :
           'JPG، PNG — نمای ۳۶۰ درجه'}
        </small>
        <input
          ref={fileInputRef} type="file" hidden multiple
          accept={activeTab === 'Video' ? 'video/*' : 'image/*'}
          onChange={e =>
            Array.from(e.target.files || []).forEach(f => uploadFile(f, activeTab))
          }
        />
      </div>

      {/* Uploading List */}
      {uploading.length > 0 && (
        <div className={styles.uploadingList}>
          {uploading.map(f => (
            <div key={f.id} className={styles.uploadingItem}>
              {f.preview && <img src={f.preview} className={styles.uploadPreview} alt="" />}
              <div className={styles.uploadInfo}>
                <div className={styles.uploadHeader}>
                  <span className={styles.uploadName}>{f.file.name}</span>
                  {f.error ? (
                    <button type="button" className={styles.dismissBtn}
                      onClick={() => handleDismissError(f.id)} title="بستن">✕</button>
                  ) : (
                    <button type="button" className={styles.cancelBtn}
                      onClick={() => handleCancel(f.id)} title="لغو">✕</button>
                  )}
                </div>
                {f.error ? (
                  <span className={styles.uploadError}>⚠ {f.error}</span>
                ) : (
                  <>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${f.progress}%` }} />
                    </div>
                    <div className={styles.uploadMeta}>
                      <span>{(f.file.size / 1024 / 1024).toFixed(2)} MB</span>
                      <span className={styles.progressPct}>{f.progress}%</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Grid */}
      {isLoading ? (
        <p className={styles.emptyText}>در حال بارگذاری...</p>
      ) : currentItems.length > 0 ? (
        <div className={styles.mediaGrid}>
          {currentItems.map(item => (
            <div key={mediaKey(item)} className={styles.mediaCard}>
              <div className={styles.mediaPreview}>
                {item._type === 'Video' ? (
                  <video src={mediaUrl(item)} controls className={styles.videoPreview} />
                ) : (
                  <img src={mediaUrl(item)} alt="" className={styles.imagePreview} />
                )}
              </div>
              <div className={styles.mediaFooter}>
                <div className={styles.mediaActions}>
                  <button type="button" className={styles.deleteBtn}
                    onClick={() => handleDelete(item)} title="حذف">🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : uploading.length === 0 ? (
        <p className={styles.emptyText}>
          {{ Image: 'هیچ تصویری', Video: 'هیچ ویدیویی', '360': 'هیچ نمایی' }[activeTab]}
          {' '}آپلود نشده است.
        </p>
      ) : null}

    </div>
  );
};

export default ProductMediaManager;
