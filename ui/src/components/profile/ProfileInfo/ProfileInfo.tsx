'use client'

import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchMyProfile, updateProfile } from '@/store/feature/profile/profileThunks'
import { 
  selectProfile, 
  selectProfileUpdating, 
  selectProfileError, 
  selectProfileSuccessMessage 
} from '@/store/feature/profile/profileSelectors'
import { clearProfileMessages } from '@/store/feature/profile/profileSlice'
import styles from './ProfileInfo.module.scss'
import { IconCheck } from '@tabler/icons-react'
import BackToSidebar from '../BackToSidebar/BackToSidebar'

const ProfileInfo = () => {
  const dispatch = useAppDispatch()
  const profile = useAppSelector(selectProfile)
  const updating = useAppSelector(selectProfileUpdating)
  const error = useAppSelector(selectProfileError)
  const successMessage = useAppSelector(selectProfileSuccessMessage)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    birthDate: '',
    bio: '',
  })

  // دریافت پروفایل هنگام mount
  useEffect(() => {
    dispatch(fetchMyProfile())
  }, [dispatch])

  // پر کردن فرم بعد از دریافت داده
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || profile.userProfile?.firstName || '',
        lastName: profile.lastName || profile.userProfile?.lastName || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || '',
        gender: profile.gender || profile.userProfile?.gender || '',
        birthDate: profile.birthDate || profile.userProfile?.birthDate?.split('T')[0] || '',
        bio: profile.bio || profile.userProfile?.bio || '',
      })
    }
  }, [profile])

  // پاک کردن پیام‌ها بعد از ۳ ثانیه
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        dispatch(clearProfileMessages())
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage, error, dispatch])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(updateProfile(formData))
  }

  return (
    <div className={styles.container}>
       
      
      
      <h2 className={styles.title}>
        <BackToSidebar />
         حساب کاربری
         </h2>
      
    

      {/* Messages */}
      {successMessage && (
        <div className={styles.successMessage}>
          <IconCheck size={18} />
          {successMessage}
        </div>
      )}
      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label>نام</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="نام خود را وارد کنید"
            />
          </div>
          <div className={styles.field}>
            <label>نام خانوادگی</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="نام خانوادگی خود را وارد کنید"
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>ایمیل</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              dir="ltr"
            />
          </div>
          <div className={styles.field}>
            <label>شماره موبایل</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              dir="ltr"
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>جنسیت</label>
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="">انتخاب کنید</option>
              <option value="male">مرد</option>
              <option value="female">زن</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>تاریخ تولد</label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>بیوگرافی</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="درباره خودتان بنویسید..."
            rows={4}
          />
        </div>

        <button type="submit" className={styles.submitButton} disabled={updating}>
          {updating ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
        </button>
      </form>
    </div>
  )
}

export default ProfileInfo