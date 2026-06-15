'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  createAddress, 
  updateAddress, 
  deleteAddress,
  setDefaultAddress
} from '@/store/feature/address/AddressThunks';
import { 
  selectAddressesActionLoading, 
  selectAddressesError
} from '@/store/feature/address/AddressSelectors';
import { 
  X, 
  MapPin, 
  Phone, 
  User, 
  Home, 
  Building2,
  Trash2
} from 'lucide-react';
import styles from './AddressModal.module.scss';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  mode: 'create' | 'edit' | 'delete';
  userId?: number;
}

const AddressModal: React.FC<AddressModalProps> = ({ 
  isOpen, 
  onClose, 
  initialData, 
  mode,
  userId 
}) => {
  const dispatch = useAppDispatch();
  const actionLoading = useAppSelector(selectAddressesActionLoading);
  const error = useAppSelector(selectAddressesError);

  // State برای تشخیص اینکه عملیات انجام شده یا خیر
  const [operationCompleted, setOperationCompleted] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // State فرم
  const [formData, setFormData] = useState({
    addressTitle: '',
    recipientName: '',
    phoneNumber: '',
    landlineNumber: '',
    fullAddress: '',
    city: '',
    province: '',
    postalCode: '',
    isDefault: false,
    latitude: null as number | null,
    longitude: null as number | null,
  });

  // وقتی مودال باز می‌شود، داده‌ها را پر کن
  useEffect(() => {
    if (isOpen) {
      console.log('Modal opened in mode:', mode, 'with data:', initialData);
      
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
          longitude: initialData.longitude || null,
        });
      } else if (mode === 'create') {
        // ریست فرم برای ایجاد جدید
        setFormData({
          addressTitle: '',
          recipientName: '',
          phoneNumber: '',
          landlineNumber: '',
          fullAddress: '',
          city: '',
          province: '',
          postalCode: '',
          isDefault: false,
          latitude: null,
          longitude: null,
        });
      }
      
      // ریست وضعیت‌ها
      setOperationCompleted(false);
      setLocalError(null);
    }
  }, [isOpen, mode, initialData]);

  // فقط زمانی مودال را ببند که عملیات انجام شده باشد
  useEffect(() => {
    if (operationCompleted && !actionLoading && isOpen) {
      console.log('Operation completed, closing modal');
      const timer = setTimeout(() => {
        onClose();
        setOperationCompleted(false);
      }, 500); // یک تأخیر کوچک برای نمایش پیام موفقیت
      
      return () => clearTimeout(timer);
    }
  }, [actionLoading, isOpen, onClose, operationCompleted]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    setLocalError(null);
    console.log('Submitting form in mode:', mode);
    
    try {
      if (mode === 'create') {
        const dataToSend = {
          ...formData,
          userId: userId || 0,
          isActive: true,
        };
        const result = await dispatch(createAddress(dataToSend)).unwrap();
        console.log('Create successful:', result);
        setOperationCompleted(true);
      } else if (mode === 'edit' && initialData) {
        const dataToSend = {
          ...formData,
          userAddressId: initialData.userAddressId,
          userId: initialData.userId,
          isActive: initialData.isActive,
        };
        const result = await dispatch(updateAddress({ 
          id: initialData.userAddressId, 
          data: dataToSend 
        })).unwrap();
        console.log('Update successful:', result);
        setOperationCompleted(true);
      }
    } catch (err: any) {
      console.error('Error in form submission:', err);
      
      // اگر خطا شامل پیام موفقیت است (مشکل در ساختار thunk)
      if (typeof err === 'string' && err.includes('موفقیت')) {
        setOperationCompleted(true);
      } else {
        setLocalError(typeof err === 'string' ? err : err?.message || 'خطا در انجام عملیات');
      }
    }
  };

  const handleDelete = async () => {
    if (initialData) {
      setLocalError(null);
      
      try {
        const result = await dispatch(deleteAddress(initialData.userAddressId)).unwrap();
        console.log('Delete successful:', result);
        setOperationCompleted(true);
      } catch (err: any) {
        console.log('Delete response:', err); // دیباگ
        
        // اگر پاسخ شامل پیام موفقیت است
        if (
          typeof err === 'string' && 
          (err.includes('موفقیت') || err.includes('حذف شد'))
        ) {
          console.log('Delete was actually successful');
          setOperationCompleted(true);
        } else if (err?.message && (
          err.message.includes('موفقیت') || 
          err.message.includes('حذف شد')
        )) {
          console.log('Delete was actually successful (from message)');
          setOperationCompleted(true);
        } else {
          console.error('Error in delete:', err);
          setLocalError(
            typeof err === 'string' 
              ? err 
              : err?.message || 'خطا در حذف آدرس'
          );
        }
      }
    }
  };

  const handleSetDefault = async () => {
    if (initialData) {
      setLocalError(null);
      
      try {
        const result = await dispatch(setDefaultAddress(initialData.userAddressId)).unwrap();
        console.log('Set default successful:', result);
        setOperationCompleted(true);
      } catch (err: any) {
        console.error('Error in set default:', err);
        
        if (typeof err === 'string' && err.includes('موفقیت')) {
          setOperationCompleted(true);
        } else {
          setLocalError(typeof err === 'string' ? err : err?.message || 'خطا در تغییر آدرس پیش‌فرض');
        }
      }
    }
  };

  // اگر مودال بسته است، هیچ چیزی رندر نکن
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        {/* هدر مودال */}
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            {mode === 'create' && 'افزودن آدرس جدید'}
            {mode === 'edit' && 'ویرایش آدرس'}
            {mode === 'delete' && 'حذف آدرس'}
          </h3>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            <X size={24} />
          </button>
        </div>

        {/* بدنه مودال */}
        <div className={styles.modalBody}>
          {/* نمایش پیام موفقیت */}
          {operationCompleted && !actionLoading && (
            <div className={styles.successMessage}>
              عملیات با موفقیت انجام شد. در حال بستن...
            </div>
          )}

          {mode === 'delete' ? (
            /* حالت حذف */
            <div className={styles.deleteContent}>
              <div className={styles.deleteIcon}>
                <Trash2 size={48} />
              </div>
              <p className={styles.deleteText}>
                آیا مطمئن هستید که می‌خواهید آدرس "{initialData?.addressTitle}" را حذف کنید؟
              </p>
              
              {/* نمایش خطا */}
              {(error || localError) && (
                <div className={styles.errorMessage}>
                  {localError || error}
                </div>
              )}
              
              <div className={styles.deleteActions}>
                <button 
                  type="button"
                  className={styles.cancelBtn}
                  onClick={onClose}
                  disabled={actionLoading}
                >
                  انصراف
                </button>
                <button 
                  type="button"
                  className={styles.deleteConfirmBtn}
                  onClick={handleDelete}
                  disabled={actionLoading || operationCompleted}
                >
                  {actionLoading ? 'در حال حذف...' : 'حذف آدرس'}
                </button>
              </div>
            </div>
          ) : (
            /* فرم ایجاد و ویرایش */
            <form className={styles.addressForm} onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                {/* عنوان آدرس */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    عنوان آدرس <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <Home size={20} className={styles.inputIcon} />
                    <input
                      type="text"
                      name="addressTitle"
                      value={formData.addressTitle}
                      onChange={handleInputChange}
                      placeholder="مثلاً: منزل، محل کار"
                      className={styles.input}
                      required
                      disabled={actionLoading}
                    />
                  </div>
                </div>

                {/* نام گیرنده */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    نام و نام خانوادگی گیرنده <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <User size={20} className={styles.inputIcon} />
                    <input
                      type="text"
                      name="recipientName"
                      value={formData.recipientName}
                      onChange={handleInputChange}
                      placeholder="نام و نام خانوادگی"
                      className={styles.input}
                      required
                      disabled={actionLoading}
                    />
                  </div>
                </div>

                {/* شماره تماس */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    شماره تماس <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <Phone size={20} className={styles.inputIcon} />
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      className={styles.input}
                      required
                      disabled={actionLoading}
                    />
                  </div>
                </div>

                {/* تلفن ثابت (اختیاری) */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    تلفن ثابت
                  </label>
                  <div className={styles.inputWrapper}>
                    <Building2 size={20} className={styles.inputIcon} />
                    <input
                      type="text"
                      name="landlineNumber"
                      value={formData.landlineNumber}
                      onChange={handleInputChange}
                      placeholder="۰۲۱-۱۲۳۴۵۶۷۸"
                      className={styles.input}
                      disabled={actionLoading}
                    />
                  </div>
                </div>

                {/* استان */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    استان <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <MapPin size={20} className={styles.inputIcon} />
                    <input
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      placeholder="استان"
                      className={styles.input}
                      required
                      disabled={actionLoading}
                    />
                  </div>
                </div>

                {/* شهر */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    شهر <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <MapPin size={20} className={styles.inputIcon} />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="شهر"
                      className={styles.input}
                      required
                      disabled={actionLoading}
                    />
                  </div>
                </div>

                {/* کد پستی */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    کد پستی <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <Building2 size={20} className={styles.inputIcon} />
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="کد پستی ۱۰ رقمی"
                      className={styles.input}
                      required
                      disabled={actionLoading}
                    />
                  </div>
                </div>

                {/* آدرس کامل */}
                <div className={styles.fullWidthGroup}>
                  <label className={styles.label}>
                    آدرس کامل <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.textareaWrapper}>
                    <textarea
                      name="fullAddress"
                      value={formData.fullAddress}
                      onChange={handleInputChange}
                      placeholder="خیابان، پلاک، واحد، کوچه، ..."
                      className={styles.textarea}
                      rows={3}
                      required
                      disabled={actionLoading}
                    />
                  </div>
                </div>

                {/* آدرس پیش‌فرض */}
                <div className={styles.fullWidthGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={formData.isDefault}
                      onChange={handleInputChange}
                      disabled={actionLoading}
                    />
                    <span>این آدرس به عنوان آدرس پیش‌فرض انتخاب شود</span>
                  </label>
                </div>
              </div>

              {/* نمایش خطا */}
              {(error || localError) && (
                <div className={styles.errorMessage}>
                  {localError || error}
                </div>
              )}

              {/* دکمه‌های اقدام */}
              <div className={styles.formActions}>
                <button 
                  type="button"
                  className={styles.cancelBtn}
                  onClick={onClose}
                  disabled={actionLoading}
                >
                  انصراف
                </button>
                <button 
                  type="submit"
                  className={styles.submitBtn}
                  disabled={actionLoading || operationCompleted}
                >
                  {actionLoading ? 'در حال ذخیره...' : (
                    <>
                      {mode === 'create' ? 'ایجاد آدرس' : 'ذخیره تغییرات'}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressModal;