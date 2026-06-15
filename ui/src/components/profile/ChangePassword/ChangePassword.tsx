'use client'

import React, { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { changePassword } from '@/store/feature/profile/profileThunks'
import { 
  selectProfileChangingPassword, 
  selectProfileError, 
  selectProfileSuccessMessage 
} from '@/store/feature/profile/profileSelectors'
import { clearProfileMessages } from '@/store/feature/profile/profileSlice'
import styles from './ChangePassword.module.scss'
import { IconCheck } from '@tabler/icons-react'

const ChangePassword = () => {
  const dispatch = useAppDispatch()
  const changingPassword = useAppSelector(selectProfileChangingPassword)
  const error = useAppSelector(selectProfileError)
  const successMessage = useAppSelector(selectProfileSuccessMessage)

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  })

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        dispatch(clearProfileMessages())
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage, error, dispatch])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.newPassword !== formData.confirmNewPassword) {
      alert('رمز عبور جدید با تکرار آن مطابقت ندارد')
      return
    }
    dispatch(changePassword(formData))
    setFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>تغییر رمز عبور</h2>

      {successMessage && (
        <div className={styles.successMessage}>
          <IconCheck size={18} />
          {successMessage}
        </div>
      )}
      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label>رمز عبور فعلی</label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            placeholder="رمز عبور فعلی را وارد کنید"
            required
          />
        </div>

        <div className={styles.field}>
          <label>رمز عبور جدید</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="حداقل ۶ کاراکتر"
            required
            minLength={6}
          />
        </div>

        <div className={styles.field}>
          <label>تکرار رمز عبور جدید</label>
          <input
            type="password"
            name="confirmNewPassword"
            value={formData.confirmNewPassword}
            onChange={handleChange}
            placeholder="رمز عبور جدید را مجدداً وارد کنید"
            required
          />
        </div>

        <button type="submit" className={styles.submitButton} disabled={changingPassword}>
          {changingPassword ? 'در حال تغییر...' : 'تغییر رمز عبور'}
        </button>
      </form>
    </div>
  )
}

export default ChangePassword