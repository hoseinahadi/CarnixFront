'use client'

import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchProductQuestions, createQuestion } from '@/store/feature/product/productQuestionThunks'
import { 
  selectProductQuestions, 
  selectQuestionsLoading, 
  selectQuestionSubmitting,
  selectQuestionsPagination 
} from '@/store/feature/product/productDetailSelectors'
import { selectProductDetails } from '@/store/feature/product/productSelectors'
import styles from './ProductQuestions.module.scss'
import { IconMessageCircle, IconUser, IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import classNames from 'classnames'

const ProductQuestions = () => {
  const dispatch = useAppDispatch()
  const product = useAppSelector(selectProductDetails)
  const questions = useAppSelector(selectProductQuestions)
  const loading = useAppSelector(selectQuestionsLoading)
  const submitting = useAppSelector(selectQuestionSubmitting)
  const pagination = useAppSelector(selectQuestionsPagination)

  const [showForm, setShowForm] = useState(false)
  const [questionText, setQuestionText] = useState('')
  const [expandedAnswers, setExpandedAnswers] = useState<Record<number, boolean>>({})

  useEffect(() => {
    if (product?.productId) {
      dispatch(fetchProductQuestions({ productId: product.productId }))
    }
  }, [product?.productId, dispatch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!product || !questionText.trim()) return

    dispatch(createQuestion({
      productId: product.productId,
      questionText: questionText.trim(),
    }))

    setQuestionText('')
    setShowForm(false)
  }

  const toggleAnswers = (questionId: number) => {
    setExpandedAnswers(prev => ({
      ...prev,
      [questionId]: !prev[questionId],
    }))
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>در حال دریافت پرسش‌ها...</p>
      </div>
    )
  }

  return (
    <div className={styles.questionsContainer}>
      {/* هدر */}
      <div className={styles.header}>
        <h3 className={styles.title}>پرسش و پاسخ</h3>
        <button 
          className={styles.askBtn}
          onClick={() => setShowForm(!showForm)}
        >
          پرسش جدید
        </button>
      </div>

      {/* فرم پرسش */}
      {showForm && (
        <form onSubmit={handleSubmit} className={styles.questionForm}>
          <h4 className={styles.formTitle}>ثبت پرسش جدید</h4>
          <div className={styles.field}>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="پرسش خود را درباره این محصول بنویسید..."
              rows={4}
              required
            />
          </div>
          <div className={styles.formActions}>
            <button type="button" onClick={() => setShowForm(false)} className={styles.cancelBtn}>
              انصراف
            </button>
            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? 'در حال ثبت...' : 'ثبت پرسش'}
            </button>
          </div>
        </form>
      )}

      {/* لیست پرسش‌ها */}
      <div className={styles.questionsList}>
        {questions.length === 0 ? (
          <div className={styles.empty}>
            <p>هنوز پرسشی برای این محصول ثبت نشده است.</p>
          </div>
        ) : (
          questions.map((question) => (
            <div key={question.productQuestionId} className={styles.questionCard}>
              <div className={styles.questionHeader}>
                <IconMessageCircle size={20} className={styles.questionIcon} />
                <div className={styles.questionContent}>
                  <p className={styles.questionText}>{question.questionText}</p>
                  <span className={styles.questionMeta}>
                    {new Date(question.createdAt).toLocaleDateString('fa-IR')}
                  </span>
                </div>
              </div>

              {/* پاسخ‌ها */}
              {question.answers && question.answers.length > 0 && (
                <div className={styles.answersSection}>
                  <button 
                    className={styles.toggleAnswers}
                    onClick={() => toggleAnswers(question.productQuestionId)}
                  >
                    {expandedAnswers[question.productQuestionId] ? (
                      <IconChevronUp size={16} />
                    ) : (
                      <IconChevronDown size={16} />
                    )}
                    {question.answers.length} پاسخ
                  </button>

                  {expandedAnswers[question.productQuestionId] && (
                    <div className={styles.answersList}>
                      {question.answers.map((answer: any, idx: number) => (
                        <div key={idx} className={classNames(styles.answerCard, {
                          [styles.adminAnswer]: answer.isAdminReply,
                        })}>
                          <div className={styles.answerHeader}>
                            <IconUser size={16} />
                            <span>{answer.isAdminReply ? 'پشتیبانی' : 'کاربر'}</span>
                            {answer.isAdminReply && (
                              <span className={styles.adminBadge}>پاسخ رسمی</span>
                            )}
                          </div>
                          <p className={styles.answerText}>{answer.answerText}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ProductQuestions