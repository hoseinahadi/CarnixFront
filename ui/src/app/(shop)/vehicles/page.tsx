'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Car, ArrowLeft, ChevronLeft } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { getAllMakes, getModelsByMakeId } from '@/store/feature/vehicle/VehicleThunks'
import { selectMakes, selectModels, selectVehicleLoading } from '@/store/feature/vehicle/VehicleSelectors'
import { clearModels } from '@/store/feature/vehicle/VehicleSlice'
import styles from './VehiclesPage.module.scss'
import classNames from 'classnames'
import { resolveVehicleMakeId, resolveVehicleModelId } from '@/utils/vehicleIds'

// 🟢 تابع استخراج‌گر ایمن برای مدل‌ها
const extractSafeArray = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data; 
  if (Array.isArray(data.items)) return data.items; 
  if (Array.isArray(data.data)) return data.data; 
  if (Array.isArray(data.mainResults)) return data.mainResults; 
  if (data.data && Array.isArray(data.data.items)) return data.data.items; 
  if (data.mainResults && Array.isArray(data.mainResults.items)) return data.mainResults.items;
  return [];
};

// 🟢 تابع هوشمند برای اتصال آدرس سرور بک‌اند به عکس ماشین
const getImageUrl = (url: string | null | undefined) => {
  if (!url) return '';
  if (url.startsWith('http')) return url; 
  
  let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'; 
  
  if (baseUrl.endsWith('/api')) {
    baseUrl = baseUrl.substring(0, baseUrl.length - 4);
  } else if (baseUrl.endsWith('/api/')) {
    baseUrl = baseUrl.substring(0, baseUrl.length - 5);
  }

  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

const VehiclesPage = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  
  const rawMakes = useAppSelector(selectMakes)
  const rawModels = useAppSelector(selectModels)
  const loading = useAppSelector(selectVehicleLoading)
  const makesStatus = useAppSelector(
    (state) => state.vehicle?.makesStatus ?? 'idle',
  )
  
  const makes = useMemo(() => extractSafeArray(rawMakes), [rawMakes]);
  const models = useMemo(() => extractSafeArray(rawModels), [rawModels]);

  const [activeMake, setActiveMake] = useState<any>(null)

  useEffect(() => {
    if (makesStatus === 'idle') {
      void dispatch(getAllMakes())
    }
  }, [dispatch, makesStatus])

  useEffect(() => {
    if (makes.length > 0 && !activeMake) {
      setActiveMake(makes[0])
    }
  }, [makes, activeMake])

  useEffect(() => {
    const makeId = resolveVehicleMakeId(activeMake)
    if (makeId) {
      dispatch(clearModels())
      void dispatch(getModelsByMakeId(makeId))
    }
  }, [activeMake, dispatch])

  // 🟢 تغییر مهم: دریافت ID به جای نام ماشین
  const handleModelClick = (make: unknown, model: unknown) => {
    const makeId = resolveVehicleMakeId(make)
    const modelId = resolveVehicleModelId(model)

    // هیچ‌وقت URL ناقص مثل modelId=undefined ساخته نشود.
    if (!makeId || !modelId) return

    router.push(`/products?makeId=${makeId}&modelId=${modelId}`)
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
          <div className={styles.iconWrapper}>
            <Car className={styles.headerIcon} size={24} />
          </div>
          <h1 className={styles.pageTitle}>ماشین‌ها</h1>
        </div>
      </div>

      {/* محتوای اصلی */}
      <div className={styles.content}>
        
        {/* ستون برندهای ماشین */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarTitle}>انتخاب برند</div>
          <div className={styles.sidebarList}>
            {makes.map(make => (
              <div
                key={resolveVehicleMakeId(make) ?? make.name}
                className={classNames(styles.sidebarItem, {
                  [styles.active]: resolveVehicleMakeId(make) === resolveVehicleMakeId(activeMake)
                })}
                onClick={() => setActiveMake(make)}
              >
                <Car size={18} className={styles.makeIcon} />
                <span className={styles.makeName}>{make.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ستون مدل‌ها */}
        <div className={styles.models}>
          {activeMake && (
            <>
              <div className={styles.modelsHeader}>
                <h2 className={styles.modelsTitle}>مدل‌های {activeMake.name}</h2>
                <span className={styles.modelsBadge}>{models.length} مدل خودرو</span>
              </div>

              {loading ? (
                <div className={styles.modelsGrid}>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={`skeleton-${index}`} className={styles.skeletonCard}>
                      <div className={styles.skeletonIcon}></div>
                      <div className={styles.skeletonText}></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.modelsGrid}>
                  {models.map(model => (
                    <div
                      key={resolveVehicleModelId(model) ?? model.name}
                      className={styles.modelCard}
                      onClick={() => handleModelClick(activeMake, model)}
                    >
                      <div className={styles.carImageBox}>
                        {model.imageUrl ? (
                          <img 
                            src={getImageUrl(model.imageUrl)} 
                            alt={model.name} 
                            className={styles.carImage} 
                            loading="lazy" 
                          />
                        ) : (
                          <Car size={32} strokeWidth={1.5} className={styles.carIcon} />
                        )}
                      </div>
                      <span className={styles.modelName}>{model.name}</span>
                      <ChevronLeft size={20} className={styles.arrowIcon} />
                    </div>
                  ))}
                  
                  {models.length === 0 && !loading && (
                    <div className={styles.stateContainer}>
                      <div className={styles.emptyStateIcon}>
                         <Car size={48} strokeWidth={1} />
                      </div>
                      <span className={styles.emptyStateText}>مدلی برای این برند یافت نشد.</span>
                    </div>
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