// app/wholesale/page.tsx
'use client'

import React, { useState } from 'react'
import { 
  IconPhone, 
  IconUser, 
  IconPackage, 
  IconCategory,
  IconMapPin,
  IconBuilding,
  IconMessage,
  IconSend,
  IconCheck
} from '@tabler/icons-react'
import styles from './WholesalePage.module.scss'

interface WholesaleFormData {
  phone: string
  firstName: string
  lastName: string
  products: string
  category: string
  city: string
  province: string
  description: string
}

interface FormErrors {
  [key: string]: string
}

const categories = [
  'قطعات موتوری',
  'قطعات بدنه',
  'قطعات برقی',
  'لوازم جانبی',
  'روغن و فیلتر',
  'لاستیک و رینگ',
  'سایر',
]

const provinces = [
  'آذربایجان شرقی', 'آذربایجان غربی', 'اردبیل', 'اصفهان', 'البرز',
  'ایلام', 'بوشهر', 'تهران', 'چهارمحال و بختیاری', 'خراسان جنوبی',
  'خراسان رضوی', 'خراسان شمالی', 'خوزستان', 'زنجان', 'سمنان',
  'سیستان و بلوچستان', 'فارس', 'قزوین', 'قم', 'کردستان',
  'کرمان', 'کرمانشاه', 'کهگیلویه و بویراحمد', 'گلستان', 'گیلان',
  'لرستان', 'مازندران', 'مرکزی', 'هرمزگان', 'همدان', 'یزد',
]

const WholesalePage = () => {
  const [formData, setFormData] = useState<WholesaleFormData>({
    phone: '',
    firstName: '',
    lastName: '',
    products: '',
    category: '',
    city: '',
    province: '',
    description: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // اعتبارسنجی شماره تماس
    if (!formData.phone.trim()) {
      newErrors.phone = 'شماره تماس الزامی است'
    } else if (!/^09\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'شماره تماس معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹)'
    }

    // اعتبارسنجی نام
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'نام الزامی است'
    }

    // اعتبارسنجی نام خانوادگی
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'نام خانوادگی الزامی است'
    }

    // اعتبارسنجی محصولات
    if (!formData.products.trim()) {
      newErrors.products = 'محصولات مورد نظر الزامی است'
    }

    // اعتبارسنجی دسته‌بندی
    if (!formData.category) {
      newErrors.category = 'انتخاب دسته‌بندی الزامی است'
    }

    // اعتبارسنجی شهر
    if (!formData.city.trim()) {
      newErrors.city = 'شهر الزامی است'
    }

    // اعتبارسنجی استان
    if (!formData.province) {
      newErrors.province = 'انتخاب استان الزامی است'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // حذف ارور فیلد هنگام تایپ
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      // اسکرول به اولین ارور
      const firstError = document.querySelector(`.${styles.fieldError}`)
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setIsSubmitting(true)

    try {
      // TODO: اتصال به API
      // const response = await fetch('/api/wholesale', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // })

      // شبیه‌سازی ارسال
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setIsSuccess(true)
      
      // ریست فرم بعد از ۳ ثانیه
      setTimeout(() => {
        setFormData({
          phone: '',
          firstName: '',
          lastName: '',
          products: '',
          category: '',
          city: '',
          province: '',
          description: '',
        })
        setIsSuccess(false)
      }, 3000)

    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.successState}>
            <div className={styles.successIcon}>
              <IconCheck size={48} stroke={2} />
            </div>
            <h2 className={styles.successTitle}>درخواست شما با موفقیت ثبت شد</h2>
            <p className={styles.successText}>
              کارشناسان ما حداکثر طی ۲۴ ساعت آینده برای هماهنگی با شما تماس خواهند گرفت.
            </p>
            <button 
              className={styles.newRequestButton}
              onClick={() => setIsSuccess(false)}
            >
              ثبت درخواست جدید
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* هدر */}
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <IconPackage size={32} stroke={1.5} />
          </div>
          <h1 className={styles.title}>خرید عمده محصولات</h1>
          <p className={styles.subtitle}>
            برای خرید عمده قطعات یدکی درخواست خود را ثبت کنید تا کارشناسان ما حداکثر طی ۲۴ ساعت برای هماهنگی با شما تماس بگیرند.
          </p>
        </div>

        {/* فرم */}
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.formGrid}>
            {/* شماره تماس */}
            <div className={`${styles.fieldGroup} ${errors.phone ? styles.fieldError : ''}`}>
              <label className={styles.label}>
                <IconPhone size={18} stroke={1.5} />
                شماره تماس
                <span className={styles.required}>*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                className={styles.input}
                dir="ltr"
                maxLength={11}
              />
              {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
            </div>

            {/* نام */}
            <div className={`${styles.fieldGroup} ${errors.firstName ? styles.fieldError : ''}`}>
              <label className={styles.label}>
                <IconUser size={18} stroke={1.5} />
                نام
                <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="نام خود را وارد کنید"
                className={styles.input}
              />
              {errors.firstName && <span className={styles.errorText}>{errors.firstName}</span>}
            </div>

            {/* نام خانوادگی */}
            <div className={`${styles.fieldGroup} ${errors.lastName ? styles.fieldError : ''}`}>
              <label className={styles.label}>
                <IconUser size={18} stroke={1.5} />
                نام خانوادگی
                <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="نام خانوادگی خود را وارد کنید"
                className={styles.input}
              />
              {errors.lastName && <span className={styles.errorText}>{errors.lastName}</span>}
            </div>

            {/* محصولات */}
            <div className={`${styles.fieldGroup} ${errors.products ? styles.fieldError : ''}`}>
              <label className={styles.label}>
                <IconPackage size={18} stroke={1.5} />
                محصولات
                <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="products"
                value={formData.products}
                onChange={handleChange}
                placeholder="محصولات مورد نظر خود را وارد کنید"
                className={styles.input}
              />
              {errors.products && <span className={styles.errorText}>{errors.products}</span>}
            </div>

            {/* دسته‌بندی */}
            <div className={`${styles.fieldGroup} ${errors.category ? styles.fieldError : ''}`}>
              <label className={styles.label}>
                <IconCategory size={18} stroke={1.5} />
                دسته‌بندی
                <span className={styles.required}>*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="">انتخاب دسته‌بندی</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <span className={styles.errorText}>{errors.category}</span>}
            </div>

            {/* شهر */}
            <div className={`${styles.fieldGroup} ${errors.city ? styles.fieldError : ''}`}>
              <label className={styles.label}>
                <IconBuilding size={18} stroke={1.5} />
                شهر
                <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="نام شهر خود را وارد کنید"
                className={styles.input}
              />
              {errors.city && <span className={styles.errorText}>{errors.city}</span>}
            </div>

            {/* استان */}
            <div className={`${styles.fieldGroup} ${errors.province ? styles.fieldError : ''}`}>
              <label className={styles.label}>
                <IconMapPin size={18} stroke={1.5} />
                استان
                <span className={styles.required}>*</span>
              </label>
              <select
                name="province"
                value={formData.province}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="">انتخاب استان</option>
                {provinces.map(province => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
              {errors.province && <span className={styles.errorText}>{errors.province}</span>}
            </div>
          </div>

          {/* توضیحات تکمیلی */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <IconMessage size={18} stroke={1.5} />
              توضیحات تکمیلی
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="توضیحات اضافه خود را اینجا بنویسید..."
              className={styles.textarea}
              rows={4}
            />
          </div>

          {/* دکمه ارسال */}
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className={styles.spinner}></div>
                در حال ارسال...
              </>
            ) : (
              <>
                <IconSend size={20} stroke={1.5} />
                ارسال درخواست
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default WholesalePage