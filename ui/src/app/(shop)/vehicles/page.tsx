'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Car, ArrowLeft } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { getAllMakes, getModelsByMakeId } from '@/store/feature/vehicle/VehicleThunks'
import { selectMakes, selectModels, selectVehicleLoading } from '@/store/feature/vehicle/VehicleSelectors'
import { clearModels } from '@/store/feature/vehicle/VehicleSlice'
import styles from './VehiclesPage.module.scss'
import classNames from 'classnames'

const VehiclesPage = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  
  const makes = useAppSelector(selectMakes)
  const models = useAppSelector(selectModels)
  const loading = useAppSelector(selectVehicleLoading)
  
  const [activeMake, setActiveMake] = useState(makes[0] ?? null)

  useEffect(() => {
    if (makes.length === 0) {
      dispatch(getAllMakes())
    }
  }, [dispatch, makes.length])

  useEffect(() => {
    if (makes.length > 0 && !activeMake) {
      setActiveMake(makes[0])
    }
  }, [makes, activeMake])

  useEffect(() => {
    if (activeMake) {
      dispatch(clearModels())
      dispatch(getModelsByMakeId(activeMake.vehicleMakeId))
    }
  }, [activeMake, dispatch])

  // ✅ وقتی روی مدل کلیک می‌شود، به صفحه قطعات آن ماشین بروید
  const handleModelClick = (makeName: string, modelName: string) => {
    // به صفحه قطعات ماشین بروید - آدرس را طبق ساختار پروژه خود تنظیم کنید
    router.push(`/products?make=${makeName}&model=${modelName}`)
  }

  return (
    <div className={styles.page}>
      {/* هدر صفحه */}
      <div className={styles.pageHeader}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <ArrowLeft size={20} />
          <span>بازگشت</span>
        </button>
        <div className={styles.headerContent}>
          <Car className={styles.headerIcon} size={28} />
          <h1 className={styles.pageTitle}>ماشین‌ها</h1>
        </div>
      </div>

      {/* محتوای اصلی */}
      <div className={styles.content}>
        {/* ستون برندهای ماشین */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarTitle}>برندها</div>
          {makes.map(make => (
            <div
              key={make.vehicleMakeId}
              className={classNames(styles.sidebarItem, {
                [styles.active]: make.vehicleMakeId === activeMake?.vehicleMakeId
              })}
              onClick={() => setActiveMake(make)}
            >
              <Car size={18} />
              <span>{make.name}</span>
            </div>
          ))}
        </div>

        {/* ستون مدل‌ها */}
        <div className={styles.models}>
          {activeMake && (
            <>
              <div className={styles.modelsHeader}>
                <h2 className={styles.modelsTitle}>مدل‌های {activeMake.name}</h2>
                <span className={styles.modelsCount}>{models.length} مدل</span>
              </div>

              {loading ? (
                <div className={styles.stateContainer}>
                  <div className={styles.spinner}></div>
                  <span>در حال دریافت مدل‌ها...</span>
                </div>
              ) : (
                <div className={styles.modelsGrid}>
                  {models.map(model => (
                    <div
                      key={model.vehicleGenerationId || model.name}
                      className={styles.modelCard}
                      onClick={() => handleModelClick(activeMake.name, model.name)}
                    >
                      <div className={styles.carImageBox}>
                        <Car size={40} strokeWidth={1.5} />
                      </div>
                      <span className={styles.modelName}>{model.name}</span>
                    </div>
                  ))}
                  {models.length === 0 && !loading && (
                    <div className={styles.stateContainer}>مدلی یافت نشد.</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default VehiclesPage