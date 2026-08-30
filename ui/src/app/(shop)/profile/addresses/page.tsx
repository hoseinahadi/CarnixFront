'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchAddresses,
  deleteAddress,
  createAddress,
  updateAddress,
  setDefaultAddress
} from '@/store/feature/address/AddressThunks'
import {
  selectAddresses,
  selectAddressActionLoading,
  selectAddressError,
  selectAddressLoading,
  selectSelectedAddress
} from '@/store/feature/address/AddressSelectors'
import { setSelectedAddress } from '@/store/feature/address/AddressSlice'
import { useModalManager } from '@/hooks/useModalManager'
import AddressModal from '@/components/address/AddressModal'
import styles from './AddressesPage.module.scss'
import {
  IconMapPin,
  IconPlus,
  IconTrash,
  IconCheck,
  IconRefresh,
  IconAlertCircle,
  IconStar,
  IconLoader2,
  IconPhone,
  IconUser,
  IconMail
} from '@tabler/icons-react'
import { ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Types
interface Address {
  userAddressId: number
  addressTitle: string
  recipientName: string
  phoneNumber: string
  landlineNumber?: string
  fullAddress: string
  city: string
  province: string
  postalCode: string
  isDefault: boolean
  isActive: boolean
  userId: number
  latitude?: number | null
  longitude?: number | null
}

type ModalMode = 'create' | 'edit' | 'delete' | null

// Skeletons & States
const SkeletonCard = () => (
  <div className={styles.skeletonCard}>
    <div className={styles.skeletonLine} style={{ width: '30%', height: '22px' }} />
    <div className={styles.skeletonLine} style={{ width: '80%' }} />
    <div className={styles.skeletonLine} style={{ width: '60%' }} />
  </div>
)

const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className={styles.errorState}>
    <IconAlertCircle size={48} stroke={1.5} />
    <h3>خطا در بارگذاری</h3>
    <p>{message || 'متأسفانه در دریافت اطلاعات آدرس‌ها مشکلی پیش آمده است.'}</p>
    <button className={styles.retryButton} onClick={onRetry}><IconRefresh size={20} /> تلاش مجدد</button>
  </div>
)

const EmptyState: React.FC<{ onAddAddress: () => void }> = ({ onAddAddress }) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyIconWrapper}>
      <IconMapPin size={64} stroke={1} className={styles.emptyIcon} />
    </div>
    <h3>آدرسی ثبت نشده</h3>
    <p>شما هنوز هیچ آدرسی ثبت نکرده‌اید. با افزودن آدرس، فرآیند خرید را سریع‌تر کنید.</p>
    <button className={styles.addFirstAddress} onClick={onAddAddress}>
      <IconPlus size={20} /> ثبت اولین آدرس
    </button>
  </div>
)

export default function AddressesPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()

  const rawAddresses = useAppSelector(selectAddresses)
  const addresses: Address[] = Array.isArray(rawAddresses) ? rawAddresses : []
  const selectedAddress = useAppSelector(selectSelectedAddress)
  const loading = useAppSelector(selectAddressLoading)
  const actionLoading = useAppSelector(selectAddressActionLoading)
  const error = useAppSelector(selectAddressError)

  const [retryCount, setRetryCount] = useState(0)
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null)
  const [isSettingDefault, setIsSettingDefault] = useState<number | null>(null)

  useModalManager(modalMode !== null)

  useEffect(() => {
    dispatch(fetchAddresses(retryCount > 0 ? { force: true } : undefined))
  }, [dispatch, retryCount])

  const handleRetry = useCallback(() => setRetryCount(prev => prev + 1), [])
  const handleOpenCreateModal = useCallback(() => {
    dispatch(setSelectedAddress(null))
    setModalMode('create')
  }, [dispatch])
  const handleOpenEditModal = useCallback((address: Address) => {
    dispatch(setSelectedAddress(address as any))
    setModalMode('edit')
  }, [dispatch])
  const handleOpenDeleteModal = useCallback((address: Address) => {
    setAddressToDelete(address)
    setModalMode('delete')
  }, [])
  const handleCloseModal = useCallback(() => {
    setModalMode(null)
    setAddressToDelete(null)
    dispatch(setSelectedAddress(null))
  }, [dispatch])

  const handleSetDefault = useCallback(async (addressId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setIsSettingDefault(addressId)
    try {
      await dispatch(setDefaultAddress(addressId)).unwrap()
    } catch (err) {
      console.error('Error setting default address:', err)
    } finally {
      setIsSettingDefault(null)
    }
  }, [dispatch])

  if (loading && addresses.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
           <h2 className={styles.title}>آدرس های من</h2>
           <button className={styles.addButton} disabled><IconPlus size={16} /> آدرس جدید</button>
        </div>
        <div className={styles.addressList}>{[1, 2].map(i => <SkeletonCard key={i} />)}</div>
      </div>
    )
  }

  if (error && addresses.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
           <h2 className={styles.title}>آدرس های من</h2>
        </div>
        <ErrorState message={error} onRetry={handleRetry} />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.mobileHeader}>
          <div className={styles.mobileTitleGroup}>
            {/* اصلاح روتیگ برای حل مشکل عدم باز شدن مجدد تب در سایدبار */}
            <button className={styles.backBtn} onClick={() => router.push('/profile/info')}>
              <ChevronRight size={20} />
            </button>
            <h2 className={styles.title}>آدرس های من</h2>
          </div>
          <button className={styles.mobileAddBtn} onClick={handleOpenCreateModal}>
            + افزودن آدرس جدید
          </button>
        </div>

        <div className={styles.desktopHeader}>
          <h2 className={styles.title}>آدرس های من</h2>
          <button className={styles.desktopAddBtn} onClick={handleOpenCreateModal}>
            + آدرس جدید
          </button>
        </div>
      </div>

      {error && addresses.length > 0 && (
        <div className={styles.errorBanner}>
          <IconAlertCircle size={18} /><span>{error}</span>
        </div>
      )}

      {loading && addresses.length > 0 && <div className={styles.loadingBar}><div className={styles.loadingProgress} /></div>}

      {addresses.length === 0 && !loading && !error ? (
        <EmptyState onAddAddress={handleOpenCreateModal} />
      ) : (
        <div className={styles.addressList}>
          {addresses.map(address => (
            <div key={address.userAddressId} className={`${styles.addressCard} ${address.isDefault ? styles.defaultCard : ''}`}>

              <div className={styles.cardContentRight}>
                <div className={styles.cardHeader}>
                  <h4 className={styles.addressTitle}>{address.addressTitle || 'آدرس من'}</h4>
                  <div className={styles.cardActionsHeader}>
                    {address.isDefault && <span className={styles.defaultBadge}><IconCheck size={14} /> پیش‌فرض</span>}
                    {!address.isDefault && (
                      <button className={styles.iconBtn} onClick={(e) => handleSetDefault(address.userAddressId, e)} title="تنظیم به عنوان پیش‌فرض">
                        {isSettingDefault === address.userAddressId ? <IconLoader2 size={16} className={styles.spinning} /> : <IconStar size={18} />}
                      </button>
                    )}
                    <button className={styles.iconBtnDanger} onClick={() => handleOpenDeleteModal(address)} title="حذف آدرس">
                      <IconTrash size={18} />
                    </button>
                  </div>
                </div>

                <p className={styles.fullAddressText}>{address.fullAddress}</p>

                <div className={styles.detailsGrid}>
                  <div className={styles.detailItem}>
                    <IconMapPin size={18} />
                    <span>{address.city}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <IconPhone size={18} />
                    <span dir="ltr">{address.phoneNumber}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <IconUser size={18} />
                    <span>{address.recipientName}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <IconMail size={18} />
                    <span dir="ltr">{address.postalCode}</span>
                  </div>
                </div>
              </div>

              <div className={styles.cardContentLeft}>
                <div className={styles.mapThumbnail}>
                  {address.latitude && address.longitude ? (
                    <div className={styles.mapCropWrapper}>
                      <iframe
                        frameBorder="0"
                        scrolling="no"
                        marginHeight={0}
                        marginWidth={0}
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${address.longitude - 0.012},${address.latitude - 0.012},${address.longitude + 0.012},${address.latitude + 0.012}&layer=mapnik&marker=${address.latitude},${address.longitude}`}
                        title={`نقشه آدرس ${address.addressTitle}`}
                      />
                    </div>
                  ) : (
                    <div className={styles.mapPlaceholderBox}>
                      <IconMapPin size={24} className={styles.mapPinIcon} />
                      <span>موقعیت ثبت نشده</span>
                    </div>
                  )}
                </div>
                <button className={styles.editOutlineBtn} onClick={() => handleOpenEditModal(address)} disabled={!!actionLoading}>
                  ویرایش آدرس
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {modalMode && (
        <AddressModal
          isOpen={modalMode !== null}
          onClose={handleCloseModal}
          initialData={modalMode === 'edit' ? selectedAddress : modalMode === 'delete' ? addressToDelete : undefined}
          mode={modalMode}
          userId={0}
        />
      )}
    </div>
  )
}