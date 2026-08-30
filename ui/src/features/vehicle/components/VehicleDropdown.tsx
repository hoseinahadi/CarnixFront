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
import { resolveVehicleMakeId, resolveVehicleModelId } from '@/utils/vehicleIds'

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
  
  // Hover بین برندها سریع اتفاق می‌افتد؛ 150ms مکث از چند درخواست بیهوده جلوگیری می‌کند.
  useEffect(() => {
    if (!activeMake) return

    dispatch(clearModels())
    const timerId = window.setTimeout(() => {
      const makeId = resolveVehicleMakeId(activeMake)
      if (makeId) {
        void dispatch(getModelsByMakeId(makeId))
      }
    }, 150)

    return () => window.clearTimeout(timerId)
  }, [activeMake, dispatch])
  
  return (
    <div className={styles.megaMenu}>
      {/* ستون اصلی: لیست برندهای ماشین */}
      <div className={styles.main}>
        {makes.map(make => (
          <div
            key={resolveVehicleMakeId(make) ?? make.name}
            className={classNames(styles.mainItem, {
              [styles.active]: resolveVehicleMakeId(make) === resolveVehicleMakeId(activeMake)
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
              <Link href="/vehicles" className={styles.viewAll}>
                مشاهده همه
              </Link>
            </div>

            {loading ? (
              <div className={styles.stateContainer}>در حال دریافت ماشین‌ها...</div>
            ) : error ? (
              <div className={classNames(styles.stateContainer, styles.errorText)}>{error}</div>
            ) : (
              <div className={styles.modelGrid}>
                {models.map((model) => {
                  const makeId = resolveVehicleMakeId(activeMake)
                  const modelId = resolveVehicleModelId(model)

                  if (!makeId || !modelId) {
                    return null
                  }

                  return (
                    <Link
                      key={modelId}
                      href={`/products?makeId=${makeId}&modelId=${modelId}`}
                      className={styles.modelCard}
                    >
                      <span className={styles.modelName}>{model.name}</span>
                      <div className={styles.carImagePlaceholder}>
                        <Car color="#ffffff" size={24} strokeWidth={1.5} />
                      </div>
                    </Link>
                  )
                })}
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
