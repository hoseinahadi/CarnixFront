// components/product/ProductFilters/PriceRangeSlider/PriceRangeSlider.tsx
import React, { useState, useEffect } from 'react'
import styles from './PriceRangeSlider.module.scss'

interface PriceRangeSliderProps {
  min: number
  max: number
  currentMin: number
  currentMax: number
  onChange: (min: number, max: number) => void
}

const PriceRangeSlider = ({ min, max, currentMin, currentMax, onChange }: PriceRangeSliderProps) => {
  const [localMin, setLocalMin] = useState(currentMin)
  const [localMax, setLocalMax] = useState(currentMax)

  useEffect(() => {
    setLocalMin(currentMin)
    setLocalMax(currentMax)
  }, [currentMin, currentMax])

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('fa-IR').format(Math.round(price))

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    if (value <= localMax) {
      setLocalMin(value)
    }
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    if (value >= localMin) {
      setLocalMax(value)
    }
  }

  const handleApply = () => {
    onChange(localMin, localMax)
  }

  // ✅ جلوگیری از تقسیم بر صفر در صورتی که کمترین و بیشترین قیمت یکی باشد
  const rangeDiff = max - min === 0 ? 1 : max - min;
  const minPercent = ((localMin - min) / rangeDiff) * 100
  const maxPercent = ((localMax - min) / rangeDiff) * 100

  // استپ داینامیک برای راحتی حرکت اسلایدر روی مبالغ بالا
  const stepAmount = rangeDiff > 1000000 ? 10000 : 1000;

  return (
    <div className={styles.container}>
      <div className={styles.labels}>
        <span>{formatPrice(localMin)} تومان</span>
        <span>{formatPrice(localMax)} تومان</span>
      </div>

      <div className={styles.sliderTrack}>
        <div className={styles.sliderFill} style={{
          right: `${minPercent}%`,
          left: `${100 - maxPercent}%`
        }} />
        <input
          type="range"
          min={min}
          max={max}
          step={stepAmount}
          value={localMin}
          onChange={handleMinChange}
          className={`${styles.slider} ${styles.sliderMin}`}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={stepAmount}
          value={localMax}
          onChange={handleMaxChange}
          className={`${styles.slider} ${styles.sliderMax}`}
        />
      </div>

      <button onClick={handleApply} className={styles.applyBtn}>
        اعمال بازه قیمت
      </button>
    </div>
  )
}

export default PriceRangeSlider