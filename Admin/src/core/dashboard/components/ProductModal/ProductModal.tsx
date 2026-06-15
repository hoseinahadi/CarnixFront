'use client';

import React, { useEffect, useState } from 'react';
import BaseModal from '@/layout/components/dasboard/BaseModal/BaseModal';
import type { Product } from '@/models/product/Product';
import type { Category } from '@/models/category/Category';
import type { Brand } from '@/models/Brand/Brand';
import ProductMediaManager, { type MediaItem } from '../ProductMediaManager/ProductMediaManager';
import styles from './ProductModal.module.scss';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingProduct?: Product | null;
  categories: Category[];
  brands?: Brand[];
}

type TabType = 'basic' | 'details' | 'seo' | 'media';

const initialFormState = {
  productName     : '',
  productCode     : '',
  categoryId      : '',
  brandId         : '',
  basePrice       : '',
  totalStock      : '',
  shortDescription: '',
  fullDescription : '',
  isActive        : true,
  isFeatured      : false,
  displayOrder    : '0',
  pageTitle       : '',
  metaDescription : '',
  metaKeywords    : '',
  slug            : '',
  h1Tag           : '',
  h2Tag           : '',
  mainImageAltText: '',
  mainImageUrl    : '',
};

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingProduct,
  categories,
  brands = [],
}) => {
  // ✅ همه هوک‌ها اینجا — قبل از هر return
  const [activeTab,   setActiveTab]   = useState<TabType>('basic');
  const [formData,    setFormData]    = useState(initialFormState);
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [mediaItems,  setMediaItems]  = useState<MediaItem[]>([]);  // ← اضافه شد

  useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        setFormData({
          productName     : editingProduct.productName      || '',
          productCode     : editingProduct.productCode      || '',
          categoryId      : editingProduct.categoryId?.toString()  || '',
          brandId         : editingProduct.brandId?.toString()     || '',
          basePrice       : editingProduct.basePrice?.toString()   || '',
          totalStock      : editingProduct.totalStock?.toString()  || '',
          shortDescription: editingProduct.shortDescription || '',
          fullDescription : editingProduct.fullDescription  || '',
          isActive        : editingProduct.isActive  ?? true,
          isFeatured      : editingProduct.isFeatured ?? false,
          displayOrder    : editingProduct.displayOrder?.toString() || '0',
          pageTitle       : '',
          metaDescription : '',
          metaKeywords    : '',
          slug            : '',
          h1Tag           : '',
          h2Tag           : '',
          mainImageAltText: '',
          mainImageUrl    : '',
        });
      } else {
        setFormData(initialFormState);
      }
      setMediaItems([]);   // ← reset رسانه‌ها
      setErrors({});
      setActiveTab('basic');
    }
  }, [isOpen, editingProduct]);

  // ✅ حالا می‌تونیم return null بذاریم — بعد از همه هوک‌ها
  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.productName.trim())
      newErrors.productName = 'نام محصول الزامی است';
    if (!formData.categoryId)
      newErrors.categoryId  = 'انتخاب دسته‌بندی الزامی است';
    if (!formData.basePrice || Number(formData.basePrice) <= 0)
      newErrors.basePrice   = 'قیمت باید بیشتر از صفر باشد';
    if (!formData.totalStock || Number(formData.totalStock) < 0)
      newErrors.totalStock  = 'موجودی نمی‌تواند منفی باشد';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setActiveTab('basic');
      return;
    }

    const payload = {
      categoryId      : Number(formData.categoryId),
      brandId         : formData.brandId ? Number(formData.brandId) : null,
      productName     : formData.productName.trim(),
      productCode     : formData.productCode.trim()      || null,
      shortDescription: formData.shortDescription.trim() || null,
      fullDescription : formData.fullDescription.trim()  || null,
      basePrice       : Number(formData.basePrice),
      totalStock      : Number(formData.totalStock),
      isActive        : formData.isActive,
      isFeatured      : formData.isFeatured,
      displayOrder    : Number(formData.displayOrder),
      mediaItems,   // ← رسانه‌ها هم ارسال می‌شن
    };

    onSubmit(
      editingProduct
        ? { ...payload, productId: Number(editingProduct.productId) }
        : payload
    );
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProduct ? 'ویرایش محصول' : 'افزودن محصول جدید'}
      maxWidth="800px"
    >
      <form onSubmit={handleSubmit} className={styles.modalForm}>

        {/* ── Tabs ────────────────────────────────────── */}
        <div className={styles.tabs}>
          {([
            { key: 'basic',   label: 'اطلاعات پایه' },
            { key: 'details', label: 'جزئیات'        },
            { key: 'seo',     label: 'سئو'            },
            { key: 'media',   label: 'رسانه'          },
          ] as { key: TabType; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`${styles.tab} ${activeTab === key ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className={styles.tabContent}>

          {/* ── TAB 1: اطلاعات پایه ─────────────────── */}
          {activeTab === 'basic' && (
            <>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    نام محصول <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    placeholder="مثال: گوشی سامسونگ S24"
                    className={`${styles.input} ${errors.productName ? styles.inputError : ''}`}
                  />
                  {errors.productName && (
                    <span className={styles.errorMsg}>{errors.productName}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>کد محصول</label>
                  <input
                    type="text"
                    name="productCode"
                    value={formData.productCode}
                    onChange={handleChange}
                    placeholder="مثال: PROD-001"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    دسته‌بندی <span className={styles.required}>*</span>
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className={`${styles.select} ${errors.categoryId ? styles.inputError : ''}`}
                  >
                    <option value="">انتخاب کنید...</option>
                    {categories.map((cat) => (
                      <option key={cat.categoryId} value={cat.categoryId}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <span className={styles.errorMsg}>{errors.categoryId}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>برند</label>
                  <select
                    name="brandId"
                    value={formData.brandId}
                    onChange={handleChange}
                    className={styles.select}
                  >
                    <option value="">بدون برند</option>
                    {brands.map((brand) => (
                      <option key={brand.brandId} value={brand.brandId}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    قیمت پایه (تومان) <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleChange}
                    placeholder="مثال: 50000000"
                    className={`${styles.input} ${errors.basePrice ? styles.inputError : ''}`}
                  />
                  {errors.basePrice && (
                    <span className={styles.errorMsg}>{errors.basePrice}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    موجودی کل <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    name="totalStock"
                    value={formData.totalStock}
                    onChange={handleChange}
                    placeholder="تعداد در انبار"
                    className={`${styles.input} ${errors.totalStock ? styles.inputError : ''}`}
                  />
                  {errors.totalStock && (
                    <span className={styles.errorMsg}>{errors.totalStock}</span>
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>ترتیب نمایش</label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleChange}
                    placeholder="0"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>وضعیت</label>
                  <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className={styles.checkbox}
                      />
                      محصول فعال باشد
                    </label>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={formData.isFeatured}
                        onChange={handleChange}
                        className={styles.checkbox}
                      />
                      محصول ویژه
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── TAB 2: جزئیات ───────────────────────── */}
          {activeTab === 'details' && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>توضیح کوتاه</label>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  rows={3}
                  placeholder="خلاصه‌ای از محصول..."
                  className={styles.textarea}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>توضیحات کامل</label>
                <textarea
                  name="fullDescription"
                  value={formData.fullDescription}
                  onChange={handleChange}
                  rows={6}
                  placeholder="توضیحات کامل محصول..."
                  className={styles.textarea}
                />
              </div>
            </>
          )}

          {/* ── TAB 3: سئو ──────────────────────────── */}
          {activeTab === 'seo' && (
            <>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>عنوان صفحه</label>
                  <input
                    type="text"
                    name="pageTitle"
                    value={formData.pageTitle}
                    onChange={handleChange}
                    placeholder="عنوان برای موتورهای جستجو"
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Slug</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="product-name-slug"
                    className={styles.input}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Meta Description</label>
                <textarea
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleChange}
                  rows={3}
                  placeholder="توضیح کوتاه برای نتایج جستجو..."
                  className={styles.textarea}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Meta Keywords</label>
                <input
                  type="text"
                  name="metaKeywords"
                  value={formData.metaKeywords}
                  onChange={handleChange}
                  placeholder="کلمه1، کلمه2، کلمه3"
                  className={styles.input}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>تگ H1</label>
                  <input
                    type="text"
                    name="h1Tag"
                    value={formData.h1Tag}
                    onChange={handleChange}
                    placeholder="عنوان اصلی صفحه"
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>تگ H2</label>
                  <input
                    type="text"
                    name="h2Tag"
                    value={formData.h2Tag}
                    onChange={handleChange}
                    placeholder="عنوان فرعی"
                    className={styles.input}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Alt Text تصویر اصلی</label>
                <input
                  type="text"
                  name="mainImageAltText"
                  value={formData.mainImageAltText}
                  onChange={handleChange}
                  placeholder="توضیح تصویر برای دسترسی‌پذیری"
                  className={styles.input}
                />
              </div>
            </>
          )}

          {/* ── TAB 4: رسانه ────────────────────────── */}
          {activeTab === 'media' && (
            <ProductMediaManager
              productId={editingProduct?.productId ?? null}
              initialMedia={mediaItems}
              onChange={setMediaItems}
            />
          )}

        </div>

        {/* ── Footer ──────────────────────────────────── */}
        <div className={styles.modalFooter}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            انصراف
          </button>
          <button type="submit" className={styles.submitButton}>
            {editingProduct ? 'ذخیره تغییرات' : 'ثبت محصول'}
          </button>
        </div>

      </form>
    </BaseModal>
  );
};

export default ProductModal;
