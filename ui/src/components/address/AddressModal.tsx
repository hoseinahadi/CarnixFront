// components/common/AddressModal/AddressModal.tsx
'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { createAddress, updateAddress, deleteAddress } from '@/store/feature/address/AddressThunks'
import { selectAddressActionLoading, selectAddressError } from '@/store/feature/address/AddressSelectors'
import { X, ChevronLeft, Trash2, AlertCircle, Loader2 } from 'lucide-react'
import MapPicker from '@/components/common/MapPicker/MapPicker'
import styles from './AddressModal.module.scss'

interface AddressFormData {
  addressTitle: string
  recipientName: string
  phoneNumber: string
  landlineNumber: string
  fullAddress: string
  city: string
  province: string
  postalCode: string
  isDefault: boolean
  latitude: number | null
  longitude: number | null
}

interface AddressModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: any
  mode: 'create' | 'edit' | 'delete'
  userId?: number
}

interface FormErrors { [key: string]: string }

const initialFormState: AddressFormData = {
  addressTitle: '', recipientName: '', phoneNumber: '', landlineNumber: '', fullAddress: '', city: '', province: '', postalCode: '', isDefault: false, latitude: null, longitude: null
}

const validateForm = (data: AddressFormData): FormErrors => {
  const errors: FormErrors = {}
  if (!data.recipientName.trim()) errors.recipientName = 'نام الزامی است'
  if (!data.phoneNumber.trim()) errors.phoneNumber = 'شماره الزامی است'
  else if (!/^(\+98|0)?9\d{9}$/.test(data.phoneNumber.replace(/-/g, ''))) errors.phoneNumber = 'موبایل نامعتبر است'
  if (!data.province.trim()) errors.province = 'استان الزامی است'
  if (!data.city.trim()) errors.city = 'شهر الزامی است'
  if (!data.fullAddress.trim()) errors.fullAddress = 'آدرس کامل الزامی است'
  else if (data.fullAddress.trim().length < 10) errors.fullAddress = 'حداقل ۱۰ کاراکتر'
  if (!data.postalCode.trim()) errors.postalCode = 'کد پستی الزامی است'
  else if (!/^\d{10}$/.test(data.postalCode)) errors.postalCode = '۱۰ رقم'
  return errors
}

const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose, initialData, mode, userId }) => {
  const dispatch = useAppDispatch()
  const actionLoadingState = useAppSelector(selectAddressActionLoading)
  const error = useAppSelector(selectAddressError)

  const [formData, setFormData] = useState<AddressFormData>(initialFormState)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [localError, setLocalError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [showMap, setShowMap] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const isLoading = isSubmitting || actionLoadingState !== null

  useEffect(() => {
    if (!isOpen) { 
      setShowMap(false)
      return 
    }
    
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) setShowMap(true)
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)

    if (mode === 'edit' && initialData) {
      setFormData({
        addressTitle: initialData.addressTitle || '',
        recipientName: initialData.recipientName || '',
        phoneNumber: initialData.phoneNumber || '',
        landlineNumber: initialData.landlineNumber || '',
        fullAddress: initialData.fullAddress || '',
        city: initialData.city || '',
        province: initialData.province || '',
        postalCode: initialData.postalCode || '',
        isDefault: initialData.isDefault || false,
        latitude: initialData.latitude || null,
        longitude: initialData.longitude || null
      })
    } else {
      setFormData(initialFormState)
    }
    
    setFormErrors({})
    setLocalError(null)
    setIsSubmitting(false)

    return () => window.removeEventListener('resize', checkIsMobile)
  }, [isOpen, mode, initialData])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) { setFormErrors(prev => { const n = { ...prev }; delete n[name]; return n }) }
  }, [formErrors])

  const handleLocationSelect = useCallback((lat: number, lng: number, address?: string) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng, fullAddress: address || prev.fullAddress }))
  }, [])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const errors = validateForm(formData)
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    setLocalError(null)
    setIsSubmitting(true)
    try {
      if (mode === 'create') {
        await dispatch(createAddress({ ...formData, userId: userId || 0, isActive: true, latitude: formData.latitude ?? undefined, longitude: formData.longitude ?? undefined })).unwrap()
        onClose()
      } else if (mode === 'edit' && initialData) {
        await dispatch(updateAddress({ id: initialData.userAddressId, data: { ...formData, userAddressId: initialData.userAddressId,  isActive: initialData.isActive, latitude: formData.latitude ?? undefined, longitude: formData.longitude ?? undefined } })).unwrap()
        onClose()
      }
    } catch (err: any) {
      setLocalError(typeof err === 'string' ? err : err?.message || 'خطا در عملیات')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!initialData) return
    setIsSubmitting(true)
    try {
      await dispatch(deleteAddress(initialData.userAddressId)).unwrap()
      onClose()
    } catch (err: any) { setLocalError(err?.message || 'خطا') } finally { setIsSubmitting(false) }
  }

  if (!isOpen) return null

  if (mode === 'delete') {
    return (
      <div className={styles.modalOverlay} onClick={isLoading ? undefined : onClose}>
        <div className={styles.modalContainerDelete} onClick={e => e.stopPropagation()}>
          <div className={styles.deleteContent}>
            <Trash2 size={48} className={styles.deleteIcon} />
            <h4>حذف آدرس</h4>
            <p>آیا از حذف این آدرس اطمینان دارید؟</p>
            <div className={styles.deleteActions}>
              <button type="button" className={styles.cancelBtn} onClick={onClose}>انصراف</button>
              <button type="button" className={styles.deleteConfirmBtn} onClick={handleDelete} disabled={isLoading}>
                {isLoading ? <Loader2 className={styles.spinning} /> : 'حذف آدرس'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.modalOverlay} onClick={isLoading ? undefined : onClose}>
      <div className={styles.modalContainer} onClick={e => e.stopPropagation()}>
        
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{mode === 'create' ? 'آدرس جدید' : 'ویرایش آدرس'}</h3>
          <button className={styles.closeBtn} onClick={onClose} disabled={isLoading}>
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <form className={styles.addressForm} onSubmit={handleSubmit} noValidate>
            
            <h4 className={styles.sectionTitle}>اطلاعات گیرنده</h4>
            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${formErrors.recipientName ? styles.hasError : ''}`}>
                <label className={styles.floatingLabel}>نام و نام خانوادگی</label>
                <input name="recipientName" value={formData.recipientName} onChange={handleInputChange} className={styles.input} />
              </div>
              <div className={`${styles.formGroup} ${formErrors.phoneNumber ? styles.hasError : ''}`}>
                <label className={styles.floatingLabel}>شماره تماس</label>
                <input dir="ltr" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className={styles.input} />
              </div>
            </div>

            <h4 className={styles.sectionTitle}>جزئیات آدرس</h4>
            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${formErrors.province ? styles.hasError : ''}`}>
                <label className={styles.floatingLabel}>استان</label>
                <select name="province" value={formData.province} onChange={handleInputChange} className={styles.input}>
                  <option value="">انتخاب...</option>
                  <option value="تهران">تهران</option>
                  <option value="اصفهان">اصفهان</option>
                </select>
              </div>
              <div className={`${styles.formGroup} ${formErrors.city ? styles.hasError : ''}`}>
                <label className={styles.floatingLabel}>شهر</label>
                <select name="city" value={formData.city} onChange={handleInputChange} className={styles.input}>
                  <option value="">انتخاب...</option>
                  <option value="تهران">تهران</option>
                  <option value="اصفهان">اصفهان</option>
                </select>
              </div>
              <div className={`${styles.formGroup} ${formErrors.postalCode ? styles.hasError : ''} ${styles.fullWidthMobile}`}>
                <label className={styles.floatingLabel}>کد پستی</label>
                <input dir="ltr" name="postalCode" value={formData.postalCode} onChange={handleInputChange} className={styles.input} maxLength={10} />
              </div>
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth} ${formErrors.fullAddress ? styles.hasError : ''}`}>
              <label className={styles.floatingLabel}>آدرس کامل</label>
              <textarea name="fullAddress" value={formData.fullAddress} onChange={handleInputChange} className={styles.textarea} rows={2} />
            </div>

            {isMobile && (
              <div className={styles.mapLinkSection}>
                 <button type="button" className={styles.mapLinkBtn} onClick={() => setShowMap(!showMap)}>
                    {showMap ? 'بستن نقشه' : 'انتخاب موقعیت روی نقشه'}
                    {!showMap && <ChevronLeft size={16} />}
                 </button>
              </div>
            )}

            {(!isMobile || showMap) && (
              <div className={styles.mapContainer}>
                <MapPicker 
                  initialLocation={formData.latitude ? { lat: formData.latitude, lng: formData.longitude! } : null} 
                  onLocationSelect={handleLocationSelect} 
                  showSearch={false} 
                  showCurrentLocation={false} 
                  
                />
              </div>
            )}

            {(error || localError) && (
              <div className={styles.errorMessage}><AlertCircle size={16} /> <span>{localError || error}</span></div>
            )}

          </form>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.submitBtn} onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <Loader2 className={styles.spinning} /> : 'ذخیره تغییرات'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default AddressModal