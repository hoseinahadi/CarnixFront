'use client'
import { useEffect, useState } from 'react'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { getModelsByMakeId } from '@/store/feature/vehicle/VehicleThunks'
import { selectModels, selectVehicleLoading, selectVehicleError } from '@/store/feature/vehicle/VehicleSelectors'
import { clearModels } from '@/store/feature/vehicle/VehicleSlice'
import { Link } from '@/components/common/Link/Link'
import styles from './VehicleDropdown.module.scss'
import classNames from 'classnames'
import { Car } from 'lucide-react'
import { VehicleMake } from '@/models/Vehicle/Vehicle'

type Props = {
  makes: VehicleMake[]
}

const VehicleDropdown = ({ makes }: Props) => {
  const dispatch = useAppDispatch()
  const models = useAppSelector(selectModels)
  const loading = useAppSelector(selectVehicleLoading)
  const error = useAppSelector(selectVehicleError)
  const [activeMake, setActiveMake] = useState<VehicleMake | null>(makes[0] ?? null)
  
  // انتخاب پیش‌فرض اولین برند اگر لیست پر شد
  useEffect(() => {
    if (makes.length > 0 && !activeMake) {
      setActiveMake(makes[0])
    }
  }, [makes, activeMake])
  
  // فراخوانی مدل‌ها از Redux هنگام هاور روی برند جدید
  useEffect(() => {
    if (activeMake) {
      dispatch(clearModels()) // پاک کردن قبلی‌ها
      dispatch(getModelsByMakeId(activeMake.vehicleMakeId))
    }
  }, [activeMake, dispatch])
  
  return (
    <div className={styles.megaMenu}>
      {/* ستون اصلی: لیست برندهای ماشین */}
      <div className={styles.main}>
        {makes.map(make => (
          <div
            key={make.vehicleMakeId}
            className={classNames(styles.mainItem, {
              [styles.active]: make.vehicleMakeId === activeMake?.vehicleMakeId
            })}
            onMouseEnter={() => setActiveMake(make)}
          >
            <span className={styles.icon}>
              <Car size={18} />
            </span>
            <span className={styles.label}>{make.name}</span>
          </div>
        ))}
      </div>

      {/* بخش ساب (مدل‌های ماشین) */}
      <div className={styles.sub}>
        {activeMake && (
          <div className={styles.subWrapper}>
            <div className={styles.subHeader}>
              <div className={styles.subTitle}>ماشین های {activeMake.name}</div>
              <Link href={`/vehicles/${activeMake.name}`} className={styles.viewAll}>
                مشاهده همه
              </Link>
            </div>

            {loading ? (
              <div className={styles.stateContainer}>در حال دریافت ماشین‌ها...</div>
            ) : error ? (
              <div className={classNames(styles.stateContainer, styles.errorText)}>{error}</div>
            ) : (
              <div className={styles.modelGrid}>
                {models.map(model => (
                  <Link
                    key={model.vehicleGenerationId || model.name} 
                    href={`/vehicles/${activeMake.name}/${model.name}`}
                    className={styles.modelCard}
                  >
                    <span className={styles.modelName}>{model.name}</span>
                    <div className={styles.carImagePlaceholder}>
                      <Car color="#ffffff" size={24} strokeWidth={1.5} />
                    </div>
                  </Link>
                ))}
                {models.length === 0 && !loading && (
                  <div className={styles.stateContainer}>مدلی یافت نشد.</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default VehicleDropdown
