'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectAddresses, selectAddressActionLoading} from '@/store/feature/address/AddressSelectors';
import { fetchAddresses } from '@/store/feature/address/AddressThunks';
import { 
  Plus, 
  Home, 
  MapPin, 
  Edit3,
  Trash2,
  Truck,
  Loader2
} from 'lucide-react';
import styles from './CartStep2.module.scss';
import AddressModal from '../address/AddressModal';
import axiosClient from '@/services/api/common/axiosClient';

interface CartStep2Props {
  cart: any;
  onNext: (addressId: number, shippingMethod: string, shippingCost: number) => void;
  onBack: () => void;
}

interface ShippingMethod {
  shippingMethodId: number;
  name: string;
  code: string;
  description: string;
  baseCost: number;
  estimatedDeliveryDays: number;
  isActive: boolean;
  maxWeightKg: number | null;
  regionLimit: string | null;
}

const CartStep2: React.FC<CartStep2Props> = ({ cart, onNext, onBack }) => {
  const dispatch = useAppDispatch();
  const addresses = useAppSelector(selectAddresses);
  const addressesLoading = useAppSelector(selectAddressActionLoading);

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [selectedShippingCode, setSelectedShippingCode] = useState<string>('STANDARD');
  const [selectedShippingCost, setSelectedShippingCost] = useState<number>(220000);
  
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [shippingLoading, setShippingLoading] = useState(true);
  const [shippingError, setShippingError] = useState<string | null>(null);
  
  const [modalKey, setModalKey] = useState<number>(0);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'delete';
    initialData?: any;
  }>({
    isOpen: false,
    mode: 'create',
    initialData: undefined,
  });

  const itemsCount = cart?.totalItemsCount || cart?.items?.length || 0;
  const cartSubTotal = cart?.subTotal || 0;
  const cartTax = cart?.taxAmount || 0;

  useEffect(() => {
    dispatch(fetchAddresses());
    fetchShippingMethods();
  }, []);

  useEffect(() => {
    if (addresses.length > 0 && selectedAddressId === null) {
      const defaultAddress = addresses.find(a => a.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.userAddressId);
      } else {
        setSelectedAddressId(addresses[0].userAddressId);
      }
    }
  }, [addresses]);

  // ⭐ دریافت روش‌های ارسال
  const fetchShippingMethods = async () => {
    setShippingLoading(true);
    setShippingError(null);
    
    try {
      const response = await axiosClient.get('/ShippingMethod/GetAll');
      
      console.log('📦 API Response:', response.data);
      
      let methods: ShippingMethod[] = [];
      
      // ⭐ بررسی ساختارهای مختلف پاسخ
      if (response.data?.data) {
        // ممکنه response.data.data آرایه باشه
        if (Array.isArray(response.data.data)) {
          methods = response.data.data;
        }
        // یا response.data.data.data
        else if (response.data.data?.data && Array.isArray(response.data.data.data)) {
          methods = response.data.data.data;
        }
        // یا response.data.data.mainResults
        else if (response.data.data?.mainResults && Array.isArray(response.data.data.mainResults)) {
          methods = response.data.data.mainResults;
        }
      }
      // یا response.data.mainResults
      else if (response.data?.mainResults && Array.isArray(response.data.mainResults)) {
        methods = response.data.mainResults;
      }
      
      console.log('📦 Extracted Methods:', methods);
      
      if (methods.length > 0) {
        // فیلتر روش‌های فعال
        const activeMethods = methods.filter(m => m.isActive);
        
        if (activeMethods.length > 0) {
          setShippingMethods(activeMethods);
          // انتخاب اولین روش به عنوان پیش‌فرض
          setSelectedShippingCode(activeMethods[0].code);
          setSelectedShippingCost(activeMethods[0].baseCost);
          console.log('✅ Active Methods:', activeMethods);
        } else {
          setShippingMethods(getDefaultMethods());
        }
      } else {
        console.log('⚠️ No methods found, using defaults');
        setShippingMethods(getDefaultMethods());
      }
    } catch (error: any) {
      console.error('❌ Error fetching shipping methods:', error);
      setShippingMethods(getDefaultMethods());
      setShippingError('روش‌های پیش‌فرض نمایش داده می‌شوند.');
    } finally {
      setShippingLoading(false);
    }
  };

  // ⭐ روش‌های پیش‌فرض
  const getDefaultMethods = (): ShippingMethod[] => {
    return [
      {
        shippingMethodId: 1,
        name: 'پست پیشتاز',
        code: 'STANDARD',
        description: 'ارسال استاندارد با پست',
        baseCost: 220000,
        estimatedDeliveryDays: 5,
        isActive: true,
        maxWeightKg: null,
        regionLimit: null
      },
      {
        shippingMethodId: 2,
        name: 'تیپاکس',
        code: 'TIPAX',
        description: 'ارسال سریع با تیپاکس',
        baseCost: 300000,
        estimatedDeliveryDays: 3,
        isActive: true,
        maxWeightKg: null,
        regionLimit: null
      },
      {
        shippingMethodId: 3,
        name: 'پیک',
        code: 'PICKUP',
        description: 'تحویل حضوری در تهران و همدان',
        baseCost: 0,
        estimatedDeliveryDays: 1,
        isActive: true,
        maxWeightKg: null,
        regionLimit: 'تهران, همدان'
      }
    ];
  };

  // ⭐ بررسی محدودیت منطقه‌ای
  const isShippingAvailable = (method: ShippingMethod): boolean => {
    if (!selectedAddressId || !method.regionLimit) return true;
    
    const selectedAddress = addresses.find(a => a.userAddressId === selectedAddressId);
    if (!selectedAddress) return true;
    
    const allowedCities = method.regionLimit.split(',').map(c => c.trim());
    const userCity = selectedAddress.city  || selectedAddress.province || '';
    
    return allowedCities.some(city => userCity.includes(city));
  };

  const handleShippingSelect = (method: ShippingMethod) => {
    if (!isShippingAvailable(method)) return;
    
    setSelectedShippingCode(method.code);
    setSelectedShippingCost(method.baseCost);
  };

  const handleSubmit = () => {
    if (!selectedAddressId) {
      alert('لطفاً یک آدرس انتخاب کنید');
      return;
    }
    onNext(selectedAddressId, selectedShippingCode, selectedShippingCost);
  };

  const openModal = (mode: 'create' | 'edit' | 'delete', address?: any) => {
    setModalKey(prev => prev + 1);
    setModalConfig({
      isOpen: true,
      mode,
      initialData: address,
    });
  };

  const closeModal = () => {
    setModalConfig({
      isOpen: false,
      mode: 'create',
      initialData: undefined,
    });
    dispatch(fetchAddresses());
  };

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('fa-IR');
  };

  const getDeliveryDaysText = (days: number): string => {
    if (days === 0) return 'همان روز';
    if (days === 1) return '۱ روز کاری';
    return `${days} روز کاری`;
  };

  // ⭐ لودینگ آدرس‌ها
  if (addressesLoading) {
    return (
      <div className={styles.loading}>
        <Loader2 className={styles.spinner} size={32} />
        <p>در حال بارگذاری آدرس‌ها...</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.sectionHeader}>
        <h3>آدرس‌ها</h3>
        <p className={styles.sectionSubtitle}>لطفاً از بین آدرس‌های موجود یکی را انتخاب کنید</p>
      </div>

      <div className={styles.step2Container}>
        {/* سمت راست */}
        <div className={styles.addressesSection}>
          
          {/* ⭐ لیست آدرس‌ها */}
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
                      <span>👤 {address.recipientName}</span>
                      <span>📞 {address.phoneNumber}</span>
                    </div>
                  </div>
                </div>
              ))
            )}

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

          {/* ⭐ روش‌های ارسال */}
          <div className={styles.shippingSection}>
            <h3 className={styles.shippingTitle}>نحوه ارسال</h3>
            
            {shippingError && (
              <div className={styles.shippingError}>
                ⚠️ {shippingError}
              </div>
            )}
            
            {shippingLoading ? (
              <div className={styles.loading}>
                <Loader2 className={styles.spinner} size={24} />
                <p>در حال بارگذاری روش‌های ارسال...</p>
              </div>
            ) : shippingMethods.length === 0 ? (
              <div className={styles.noMethods}>
                <p>روش ارسالی یافت نشد.</p>
              </div>
            ) : (
              <div className={styles.shippingMethods}>
                {shippingMethods.map((method) => {
                  const available = isShippingAvailable(method);
                  const isSelected = selectedShippingCode === method.code;
                  
                  return (
                    <div
                      key={method.shippingMethodId}
                      className={`
                        ${styles.shippingMethod} 
                        ${isSelected ? styles.selected : ''}
                        ${!available ? styles.disabled : ''}
                      `}
                      onClick={() => handleShippingSelect(method)}
                    >
                      <div className={styles.methodInfo}>
                        <div className={styles.methodName}>
                          <Truck size={18} />
                          <span>{method.name}</span>
                        </div>
                        <div className={styles.methodDetails}>
                          <span className={styles.methodPrice}>
                            {method.baseCost > 0 
                              ? `${formatCurrency(method.baseCost)} تومان` 
                              : 'رایگان'
                            }
                          </span>
                          <span className={styles.methodDays}>
                            {getDeliveryDaysText(method.estimatedDeliveryDays)}
                          </span>
                        </div>
                        {method.description && (
                          <div className={styles.methodDescription}>
                            {method.description}
                          </div>
                        )}
                        {!available && method.regionLimit && (
                          <div className={styles.methodUnavailable}>
                            ⚠️ فقط {method.regionLimit}
                          </div>
                        )}
                      </div>
                      <div className={styles.radioCircle}>
                        {isSelected && (
                          <div className={styles.radioInner} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ⭐ سمت چپ: خلاصه سفارش */}
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
              <span>{formatCurrency(cartSubTotal)} تومان</span>
            </div>
            {cartTax > 0 && (
              <div className={styles.summaryRow}>
                <span>مالیات</span>
                <span>{formatCurrency(cartTax)} تومان</span>
              </div>
            )}
            <div className={styles.summaryRow}>
              <span>هزینه ارسال</span>
              <span>
                {selectedShippingCost > 0 
                  ? `${formatCurrency(selectedShippingCost)} تومان` 
                  : 'رایگان'
                }
              </span>
            </div>
            <div className={styles.summaryDivider} />
            <div className={styles.summaryRowTotal}>
              <span>جمع کل</span>
              <span>{formatCurrency(cartSubTotal + cartTax + selectedShippingCost)} تومان</span>
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.backBtn} onClick={onBack}>
              بازگشت
            </button>
            <button 
              className={styles.nextBtn} 
              onClick={handleSubmit}
              disabled={!selectedAddressId || shippingLoading}
            >
              ادامه
            </button>
          </div>
        </div>
      </div>

      {/* ⭐ مودال آدرس */}
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