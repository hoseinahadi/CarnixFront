'use client'

import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchProductReviews, createReview, markReviewHelpful } from '@/store/feature/product/productReviewThunks'
import { 
  selectProductReviews, 
  selectReviewsLoading, 
  selectReviewSubmitting,
  selectAverageRating,
  selectReviewsPagination 
} from '@/store/feature/product/productDetailSelectors'
import { selectProductDetails } from '@/store/feature/product/productSelectors'
import styles from './ProductReviews.module.scss'
import { IconStar, IconStarFilled, IconThumbUp, IconUser, IconCheck } from '@tabler/icons-react'
import classNames from 'classnames'

const ProductReviews = () => {
  const dispatch = useAppDispatch()
  const product = useAppSelector(selectProductDetails)
  const reviews = useAppSelector(selectProductReviews)
  const loading = useAppSelector(selectReviewsLoading)
  const submitting = useAppSelector(selectReviewSubmitting)
  const averageRating = useAppSelector(selectAverageRating)
  const pagination = useAppSelector(selectReviewsPagination)

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    rating: 5,
  })

  useEffect(() => {
    if (product?.productId) {
      dispatch(fetchProductReviews({ productId: product.productId }))
    }
  }, [product?.productId, dispatch])

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    dispatch(createReview({
      productId: product.productId,
      title: formData.title,
      content: formData.content,
      rating: formData.rating,
    }))

    setFormData({ title: '', content: '', rating: 5 })
    setShowForm(false)
  }

  const handleMarkHelpful = (reviewId: number) => {
    if (!product) return
    dispatch(markReviewHelpful({ reviewId, productId: product.productId }))
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={styles.star}>
        {i < rating ? <IconStarFilled size={14} /> : <IconStar size={14} />}
      </span>
    ))
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>در حال دریافت نظرات...</p>
      </div>
    )
  }

  return (
    <div className={styles.reviewsContainer}>
      {/* هدر بخش نظرات */}
      <div className={styles.reviewsHeader}>
        <div className={styles.ratingSummary}>
          <h3 className={styles.title}>امتیاز و نظرات کاربران</h3>
          <div className={styles.ratingBox}>
            <span className={styles.averageScore}>{averageRating}</span>
            <span className={styles.outOf}>از ۵</span>
            <div className={styles.starsRow}>{renderStars(Math.round(averageRating))}</div>
            <span className={styles.totalReviews}>({pagination.totalCount} نظر)</span>
          </div>
        </div>

        <button 
          className={styles.addReviewBtn}
          onClick={() => setShowForm(!showForm)}
        >
          افزودن نظر جدید
        </button>
      </div>

      {/* فرم ثبت نظر */}
      {showForm && (
        <form onSubmit={handleSubmitReview} className={styles.reviewForm}>
          <h4 className={styles.formTitle}>ثبت نظر جدید</h4>
          
          <div className={styles.ratingSelect}>
            <label>امتیاز شما:</label>
            <div className={styles.starsSelect}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={classNames(styles.starBtn, {
                    [styles.selected]: star <= formData.rating,
                  })}
                  onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                >
                  {star <= formData.rating ? <IconStarFilled size={24} /> : <IconStar size={24} />}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label>عنوان نظر (اختیاری)</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="خلاصه نظر خود را بنویسید..."
            />
          </div>

          <div className={styles.field}>
            <label>متن نظر</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="نظر خود را درباره این محصول بنویسید..."
              rows={5}
              required
            />
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={() => setShowForm(false)} className={styles.cancelBtn}>
              انصراف
            </button>
            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? 'در حال ثبت...' : 'ثبت نظر'}
            </button>
          </div>
        </form>
      )}

      {/* لیست نظرات */}
      <div className={styles.reviewsList}>
        {reviews.length === 0 ? (
          <div className={styles.empty}>
            <p>هنوز نظری برای این محصول ثبت نشده است.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.productReviewId} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <div className={styles.userInfo}>
                  <IconUser size={20} />
                  <span className={styles.userName}>{review.userName || 'کاربر'}</span>
                  {review.isVerifiedPurchase && (
                    <span className={styles.verifiedBadge}>
                      <IconCheck size={12} />
                      خریدار
                    </span>
                  )}
                </div>
                <div className={styles.reviewRating}>
                  {renderStars(review.rating)}
                </div>
              </div>

              {review.title && (
                <h4 className={styles.reviewTitle}>{review.title}</h4>
              )}

              <p className={styles.reviewContent}>{review.content}</p>

              <div className={styles.reviewFooter}>
                <span className={styles.reviewDate}>
                  {new Date(review.createdAt).toLocaleDateString('fa-IR')}
                </span>
                <button
                  className={styles.helpfulBtn}
                  onClick={() => handleMarkHelpful(review.productReviewId)}
                >
                  <IconThumbUp size={16} />
                  مفید بود؟ {review.helpfulCount || 0}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* صفحه‌بندی */}
      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={classNames(styles.pageBtn, {
                [styles.activePage]: page === pagination.currentPage,
              })}
              onClick={() => product && dispatch(fetchProductReviews({ 
                productId: product.productId, 
                page 
              }))}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductReviews