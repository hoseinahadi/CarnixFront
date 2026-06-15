'use client'

import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchAddresses } from '@/store/feature/address/AddressThunks'
import { 
  selectAddresses, 
  selectAddressesLoading,
  selectAddressesError 
} from '@/store/feature/address/AddressSelectors'
import styles from './AddressesPage.module.scss'
import { IconMapPin, IconPlus, IconPencil, IconTrash, IconCheck } from '@tabler/icons-react'

export default function AddressesPage() {
  const dispatch = useAppDispatch()
  const addresses = useAppSelector(selectAddresses)
  const loading = useAppSelector(selectAddressesLoading)
  const error = useAppSelector(selectAddressesError)

  useEffect(() => {
    dispatch(fetchAddresses())
  }, [dispatch])

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>در حال دریافت آدرس‌ها...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>آدرس‌های من</h2>
        <button className={styles.addButton}>
          <IconPlus size={20} />
          افزودن آدرس جدید
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage}>{error}</div>
      )}

      {addresses.length === 0 ? (
        <div className={styles.emptyState}>
          <IconMapPin size={64} stroke={1} className={styles.emptyIcon} />
          <h3>آدرسی ثبت نشده</h3>
          <p>شما هنوز هیچ آدرسی ثبت نکرده‌اید.</p>
        </div>
      ) : (
        <div className={styles.addressList}>
          {addresses.map((address) => (
            <div key={address.userAddressId} className={styles.addressCard}>
              {address.isDefault && (
                <span className={styles.defaultBadge}>
                  <IconCheck size={14} />
                  پیش‌فرض
                </span>
              )}
              
              <div className={styles.addressContent}>
                <h4 className={styles.addressTitle}>{address.addressTitle}</h4>
                <p className={styles.addressDetail}>
                  <strong>گیرنده:</strong> {address.recipientName}
                </p>
                <p className={styles.addressDetail}>
                  <strong>تلفن:</strong> {address.phoneNumber}
                </p>
                <p className={styles.addressDetail}>
                  <strong>آدرس:</strong> {address.fullAddress}
                </p>
                <p className={styles.addressDetail}>
                  <strong>شهر:</strong> {address.city} - {address.province}
                </p>
                <p className={styles.addressDetail}>
                  <strong>کد پستی:</strong> {address.postalCode}
                </p>
              </div>

              <div className={styles.addressActions}>
                <button className={styles.editButton}>
                  <IconPencil size={18} />
                  ویرایش
                </button>
                <button className={styles.deleteButton}>
                  <IconTrash size={18} />
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}