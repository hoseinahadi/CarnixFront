'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectAddresses, selectAddressesLoading } from '@/store/feature/address/AddressSelectors';
import { fetchAddresses } from '@/store/feature/address/AddressThunks';
import { 
  Plus, 
  Home, 
  MapPin, 
  Edit3,
  Trash2
} from 'lucide-react';
import styles from './CartStep2.module.scss';
import AddressModal from '../address/AddressModal';

interface CartStep2Props {
  cart: any;
  onNext: (shippingMethod: string) => void;
  onBack: () => void;
}

const CartStep2: React.FC<CartStep2Props> = ({ cart, onNext, onBack }) => {
  const dispatch = useAppDispatch();
  const addresses = useAppSelector(selectAddresses);
  const addressesLoading = useAppSelector(selectAddressesLoading);

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string>('post');
  const [modalKey, setModalKey] = useState<number>(0);
  
  // State مودال
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'delete';
    initialData?: any;
  }>({
    isOpen: false,
    mode: 'create',
    initialData: undefined,
  });

  // محاسبه مجموع قیمت اقلام از روی آیتم‌های سبد (حتی اگر grandTotal موجود نباشد)
  const cartTotal = cart?.items?.reduce((sum: number, item: any) => {
    const itemPrice = item.price || item.unitPrice || 0;
    return sum + itemPrice * item.quantity;
  }, 0) || 0;

  const itemsCount = cart?.totalItemsCount || cart?.items?.length || 0;

  // دریافت آدرس‌ها در زمان لود
  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  // اگر آدرس پیش‌فرض وجود دارد، آن را انتخاب کن
  useEffect(() => {
    if (addresses.length > 0 && selectedAddressId === null) {
      const defaultAddress = addresses.find(a => a.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.userAddressId);
      } else {
        setSelectedAddressId(addresses[0].userAddressId);
      }
    }
  }, [addresses, selectedAddressId]);

  // روش‌های ارسال
  const shippingMethods = [
    { id: 'post', label: 'پست پیشتاز', price: 220000, days: '۳-۵ روز کاری' },
    { id: 'tipax', label: 'تیپاکس', price: 300000, days: '۲-۳ روز کاری' },
    { id: 'peyk', label: 'پیک', price: 0, days: 'فقط تهران و همدان' },
  ];

  // هزینه ارسال انتخاب شده
  const selectedShipping = shippingMethods.find(m => m.id === selectedShippingMethod);
  const shippingCost = selectedShipping?.price || 0;

  // مبلغ کل
  const totalAmount = cartTotal + shippingCost;

  const handleSubmit = () => {
    if (!selectedAddressId) {
      alert('لطفاً یک آدرس انتخاب کنید');
      return;
    }
    onNext(selectedShippingMethod);
  };

  // باز کردن مودال
  const openModal = (mode: 'create' | 'edit' | 'delete', address?: any) => {
    setModalKey(prev => prev + 1);
    setModalConfig({
      isOpen: true,
      mode,
      initialData: address,
    });
  };

  // بستن مودال
  const closeModal = () => {
    setModalConfig({
      isOpen: false,
      mode: 'create',
      initialData: undefined,
    });
    dispatch(fetchAddresses());
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fa-IR');
  };

  if (addressesLoading) {
    return <div className={styles.loading}>در حال بارگذاری آدرس‌ها...</div>;
  }

  return (
    <>
      <div className={styles.sectionHeader}>
        <h3>آدرس‌ها</h3>
        <p className={styles.sectionSubtitle}>لطفاً از بین آدرس‌های موجود یکی را انتخاب کنید</p>
      </div>

      <div className={styles.step2Container}>
        {/* سمت راست: لیست آدرس‌ها */}
        <div className={styles.addressesSection}>
          <div className={styles.addressList}>
            {addresses.length === 0 ? (
              <div className={styles.noAddress}>
                <div className={styles.noAddressIcon}>
                  <Home size={48} />
                </div>
                <p>هیچ آدرسی ثبت نشده است</p>
                <button 
                  className={styles.addFirstAddressBtn}
                  onClick={() => openModal('create')}
                >
                  <Plus size={20} />
                  ثبت اولین آدرس
                </button>
              </div>
            ) : (
              addresses.map((address) => (
                <div
                  key={address.userAddressId}
                  className={`${styles.addressCard} ${selectedAddressId === address.userAddressId ? styles.selected : ''}`}
                  onClick={() => setSelectedAddressId(address.userAddressId)}
                >
                  <div className={styles.addressHeader}>
                    <div className={styles.addressTitleWrapper}>
                      <span className={styles.addressTitle}>{address.addressTitle}</span>
                      {address.isDefault && (
                        <span className={styles.defaultBadge}>پیش‌فرض</span>
                      )}
                    </div>
                    <div className={styles.addressActions}>
                      <button 
                        className={styles.iconBtn} 
                        aria-label="ویرایش آدرس"
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal('edit', address);
                        }}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        className={styles.iconBtn} 
                        aria-label="حذف آدرس"
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal('delete', address);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className={styles.addressBody}>
                    <div className={styles.addressText}>
                      <MapPin size={16} />
                      <span>{address.fullAddress}</span>
                    </div>
                    <div className={styles.addressFooter}>
                      <span>{address.phoneNumber}</span>
                      <span>{address.recipientName}</span>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* دکمه افزودن آدرس جدید */}
            {addresses.length > 0 && (
              <button 
                className={styles.addAddressBtn}
                onClick={() => openModal('create')}
              >
                <Plus size={20} />
                افزودن آدرس جدید
              </button>
            )}
          </div>

          {/* بخش روش ارسال */}
          <div className={styles.shippingSection}>
            <h3 className={styles.shippingTitle}>نحوه ارسال</h3>
            <div className={styles.shippingMethods}>
              {shippingMethods.map((method) => (
                <div
                  key={method.id}
                  className={`${styles.shippingMethod} ${selectedShippingMethod === method.id ? styles.selected : ''}`}
                  onClick={() => setSelectedShippingMethod(method.id)}
                >
                  <div className={styles.methodInfo}>
                    <div className={styles.methodName}>{method.label}</div>
                    <div className={styles.methodDetails}>
                      <span className={styles.methodPrice}>{formatCurrency(method.price)} تومان</span>
                      <span className={styles.methodDays}>{method.days}</span>
                    </div>
                  </div>
                  <div className={styles.radioCircle}>
                    {selectedShippingMethod === method.id && <div className={styles.radioInner} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* سمت چپ: خلاصه سفارش */}
        <div className={styles.summary}>
          <div className={styles.summaryHeader}>
            <h3>خلاصه سفارش</h3>
          </div>

          <div className={styles.summaryContent}>
            <div className={styles.summaryRow}>
              <span>تعداد کالا</span>
              <span>{itemsCount} عدد</span>
            </div>
            <div className={styles.summaryRow}>
              <span>قیمت کالاها</span>
              <span>{formatCurrency(cartTotal)} تومان</span>
            </div>
            <div className={styles.summaryRow}>
              <span>هزینه ارسال</span>
              <span>{formatCurrency(shippingCost)} تومان</span>
            </div>
            <div className={styles.summaryRowTotal}>
              <span>جمع کل</span>
              <span>{formatCurrency(totalAmount)} تومان</span>
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.backBtn} onClick={onBack}>
              بازگشت
            </button>
            <button className={styles.nextBtn} onClick={handleSubmit}>
              ادامه
            </button>
          </div>
        </div>
      </div>

      {/* مودال */}
      {modalConfig.isOpen && (
        <AddressModal
          key={modalKey}
          isOpen={modalConfig.isOpen}
          onClose={closeModal}
          mode={modalConfig.mode}
          initialData={modalConfig.initialData}
        />
      )}
    </>
  );
};

export default CartStep2;