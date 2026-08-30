// components/ProductReviews/ProductReviews.tsx
'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import styles from './ProductReviews.module.scss'
import { 
  IconMessageCircle, 
  IconStar, 
  IconStarFilled, 
  IconChevronLeft, 
  IconChevronRight, 
  IconThumbUp,
  IconFlag,
  IconEdit,
  IconTrash
} from '@tabler/icons-react'
import { toast, Toaster } from 'react-hot-toast'
import { useAppSelector } from '@/store/hooks'
import { selectProductDetails } from '@/store/feature/product/productSelectors'
import { productReviewApi } from '@/features/product/api/productReviewApi'
import type { Review } from '@/features/product/api/productReviewApi'
import BackToSidebar from '@/components/profile/BackToSidebar/BackToSidebar'

interface ProductReviewsProps {
  productId?: number // اگه مستقیم productId داری
}

export default function ProductReviews({ productId: propsProductId }: ProductReviewsProps = {}) {
  // product رو از Redux بگیر یا از props استفاده کن
  const productFromRedux = useAppSelector(selectProductDetails)
  const productId = propsProductId || productFromRedux?.productId


  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [averageRating, setAverageRating] = useState(0)

  // Form states
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newRating, setNewRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  // Edit states
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editRating, setEditRating] = useState(0)

  const reviewRequestRef = useRef(0)

  const loadReviews = useCallback(async (page: number = 1) => {
    if (!productId) {
      setLoading(false)
      return
    }

    const requestId = ++reviewRequestRef.current

    try {
      setLoading(true)
      const response = await productReviewApi.getProductReviews(productId, page, 10)

      // پاسخ صفحه قدیمی نباید نتایج صفحه جدیدتر را overwrite کند.
      if (reviewRequestRef.current !== requestId) return

      if (response.data?.isSuccess) {
        const data = response.data.data
        setReviews(data.reviews || [])
        setCurrentPage(data.currentPage || 1)
        setTotalPages(data.totalPages || 0)
        setTotalCount(data.totalCount || 0)
        setAverageRating(data.averageRating || 0)
      } else {
        throw new Error(response.data?.message || 'خطا در دریافت نظرات')
      }
    } catch (error: any) {
      if (reviewRequestRef.current !== requestId) return
      toast.error(error.message || 'خطا در دریافت نظرات')
      setReviews([])
    } finally {
      if (reviewRequestRef.current === requestId) {
        setLoading(false)
      }
    }
  }, [productId])

  // Load reviews when productId changes
  useEffect(() => {
    if (productId) {
      void loadReviews(1)
    } else {
      setLoading(false)
    }

    return () => {
      reviewRequestRef.current += 1
    }
  }, [loadReviews, productId])

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!productId) {
      toast.error('محصول یافت نشد')
      return
    }

    if (!newContent.trim()) {
      toast.error('متن نظر نمی‌تواند خالی باشد')
      return
    }
    if (newRating === 0) {
      toast.error('لطفاً یک امتیاز انتخاب کنید')
      return
    }

    try {
      setSubmitting(true)
      
      const response = await productReviewApi.createReview({
        productId,
        title: newTitle || undefined,
        content: newContent.trim(),
        rating: newRating
      })

      if (response.data?.isSuccess) {
        toast.success('نظر شما با موفقیت ثبت شد')
        setNewTitle('')
        setNewContent('')
        setNewRating(0)
        await loadReviews(1)
      } else {
        throw new Error(response.data?.message || 'خطا در ثبت نظر')
      }
    } catch (error: any) {
      console.error('❌ Error:', error)
      toast.error(error.response?.data?.message || error.message || 'خطا در ثبت نظر')
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkHelpful = async (reviewId: number) => {
    try {
      const response = await productReviewApi.markHelpful(reviewId)
      
      if (response.data?.isSuccess) {
        toast.success('بازخورد شما ثبت شد')
        setReviews(prev => prev.map(r => 
          r.productReviewId === reviewId 
            ? { ...r, helpfulCount: r.helpfulCount + 1 } 
            : r
        ))
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'خطا در ثبت بازخورد')
    }
  }

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('آیا از حذف این نظر اطمینان دارید؟')) return

    const deletedReview = reviews.find((review) => review.productReviewId === reviewId)

    try {
      const response = await productReviewApi.deleteReview(reviewId)

      if (response.data?.isSuccess) {
        toast.success('نظر با موفقیت حذف شد')

        const nextTotalCount = Math.max(0, totalCount - 1)
        const nextTotalPages = Math.ceil(nextTotalCount / 10)

        if (reviews.length === 1 && currentPage > 1) {
          await loadReviews(currentPage - 1)
          return
        }

        setReviews((prev) => prev.filter((review) => review.productReviewId !== reviewId))
        setTotalCount(nextTotalCount)
        setTotalPages(nextTotalPages)

        if (deletedReview && totalCount > 1) {
          setAverageRating(
            Math.max(0, ((averageRating * totalCount) - deletedReview.rating) / (totalCount - 1)),
          )
        } else if (nextTotalCount === 0) {
          setAverageRating(0)
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'خطا در حذف نظر')
    }
  }

  const handleUpdateReview = async (reviewId: number) => {
    if (!editContent.trim()) {
      toast.error('متن نظر نمی‌تواند خالی باشد')
      return
    }

    const previousReview = reviews.find((review) => review.productReviewId === reviewId)

    try {
      const response = await productReviewApi.updateReview(reviewId, {
        content: editContent.trim(),
        rating: editRating
      })

      if (response.data?.isSuccess) {
        toast.success('نظر با موفقیت ویرایش شد')
        setEditingReviewId(null)

        const serverReview = response.data.data
        setReviews((prev) => prev.map((review) =>
          review.productReviewId === reviewId
            ? (serverReview || { ...review, content: editContent.trim(), rating: editRating })
            : review,
        ))

        if (previousReview && totalCount > 0 && editRating > 0) {
          setAverageRating(
            Math.max(0, ((averageRating * totalCount) - previousReview.rating + editRating) / totalCount),
          )
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'خطا در ویرایش نظر')
    }
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    void loadReviews(page)
    document.querySelector(`.${styles.container}`)?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    })
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'تاریخ نامعتبر'
    }
  }

  const renderStars = (rating: number, interactive: boolean = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        onClick={() => {
          if (interactive) {
            if (editingReviewId) {
              setEditRating(i + 1)
            } else {
              setNewRating(i + 1)
            }
          }
        }}
        className={interactive ? styles.starInteractive : ''}
        style={{ cursor: interactive ? 'pointer' : 'default' }}
      >
        {i < rating ? (
          <IconStarFilled size={18} className={styles.starFilled} />
        ) : (
          <IconStar size={18} className={styles.starEmpty} />
        )}
      </span>
    ))
  }

  const getPaginationNumbers = () => {
    const pages = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i)
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i)
      }
    }
    
    return pages
  }

  // Loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          {[1, 2, 3].map(i => (
            <div key={i} className={styles.skeleton}>
              <div className={styles.skeletonHeader} />
              <div className={styles.skeletonBody} />
              <div className={styles.skeletonFooter} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Toaster position="top-center" />

      

      

      {/* Reviews Header */}
      <div className={styles.header}>
        <div>
          <h3 className={styles.sectionTitle}>
            <BackToSidebar />
            نظرات 
          </h3>
          {averageRating > 0 && (
            <div className={styles.averageRating}>
              <IconStarFilled size={20} className={styles.starFilled} />
              <span>{averageRating.toFixed(1)}</span>
              <span className={styles.ratingCount}>({totalCount} نظر)</span>
            </div>
          )}
        </div>
        <span className={styles.count}>{totalCount} نظر</span>
      </div>

      {/* Empty State */}
      {reviews.length === 0 ? (
        <div className={styles.emptyState}>
          <IconMessageCircle size={64} stroke={1} className={styles.emptyIcon} />
          <p>هنوز نظری برای این محصول ثبت نشده است.</p>
          <p>اولین نفری باشید که نظر می‌دهد!</p>
        </div>
      ) : (
        <>
          {/* Reviews List */}
          <div className={styles.commentsList}>
            {reviews.map(review => (
              <div key={review.productReviewId} className={styles.commentCard}>
                {editingReviewId === review.productReviewId ? (
                  // Edit Mode
                  <div className={styles.editMode}>
                    <div className={styles.stars}>
                      {renderStars(editRating, true)}
                    </div>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className={styles.textareaField}
                      rows={3}
                    />
                    <div className={styles.editActions}>
                      <button
                        onClick={() => handleUpdateReview(review.productReviewId)}
                        className={styles.submitBtn}
                      >
                        ذخیره
                      </button>
                      <button
                        onClick={() => setEditingReviewId(null)}
                        className={styles.cancelBtn}
                      >
                        انصراف
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display Mode
                  <>
                    <div className={styles.commentHeader}>
                      <div className={styles.commentMeta}>
                        <div className={styles.stars}>
                          {renderStars(review.rating)}
                        </div>
                        {review.isVerifiedPurchase && (
                          <span className={styles.verifiedBadge}>خریدار</span>
                        )}
                        {review.userName && (
                          <span className={styles.userName}>{review.userName}</span>
                        )}
                      </div>
                      <span className={styles.date}>{formatDate(review.createdAt)}</span>
                    </div>

                    {review.title && (
                      <h4 className={styles.reviewTitle}>{review.title}</h4>
                    )}
                    
                    <p className={styles.commentContent}>{review.content}</p>

                    <div className={styles.commentFooter}>
                      <button
                        onClick={() => handleMarkHelpful(review.productReviewId)}
                        className={styles.helpfulBtn}
                      >
                        <IconThumbUp size={16} />
                        <span>مفید بود؟ ({review.helpfulCount})</span>
                      </button>
                      
                      <div className={styles.actionButtons}>
                        <button
                          onClick={() => {
                            setEditingReviewId(review.productReviewId)
                            setEditContent(review.content)
                            setEditRating(review.rating)
                          }}
                          className={styles.iconBtn}
                          title="ویرایش"
                        >
                          <IconEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.productReviewId)}
                          className={styles.iconBtn}
                          title="حذف"
                        >
                          <IconTrash size={16} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={styles.pageBtn}
              >
                <IconChevronRight size={18} />
              </button>

              {getPaginationNumbers().map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`${styles.pageBtn} ${page === currentPage ? styles.activePage : ''}`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={styles.pageBtn}
              >
                <IconChevronLeft size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}