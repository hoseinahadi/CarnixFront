'use client';

import Image from 'next/image';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from 'react';
import {
  ImagePlus,
  Loader2,
  Star,
  ThumbsUp,
  User,
  X,
} from 'lucide-react';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  createReview,
  fetchProductReviews,
  markReviewHelpful,
} from '@/store/feature/product/productReviewThunks';
import {
  selectAverageRating,
  selectProductReviews,
  selectReviewsLoading,
  selectReviewsPagination,
  selectReviewSubmitting,
} from '@/store/feature/product/productDetailSelectors';

import styles from './ProductReviews.module.scss';

interface ProductReviewsProps {
  productId: number;
}

interface ReviewFormState {
  title: string;
  content: string;
  rating: number;
}

interface ImagePreview {
  file: File;
  url: string;
}

export default function ProductReviews({
  productId,
}: ProductReviewsProps) {
  const dispatch = useAppDispatch();
  const reviews = useAppSelector(
    selectProductReviews,
  );
  const loading = useAppSelector(
    selectReviewsLoading,
  );
  const submitting = useAppSelector(
    selectReviewSubmitting,
  );
  const averageRating = useAppSelector(
    selectAverageRating,
  );
  const pagination = useAppSelector(
    selectReviewsPagination,
  );

  const [showForm, setShowForm] =
    useState(false);
  const [formData, setFormData] =
    useState<ReviewFormState>({
      title: '',
      content: '',
      rating: 5,
    });
  const [selectedImages, setSelectedImages] =
    useState<File[]>([]);
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const imagePreviews = useMemo<
    ImagePreview[]
  >(
    () =>
      selectedImages.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    [selectedImages],
  );

  useEffect(() => {
    return () => {
      imagePreviews.forEach(({ url }) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [imagePreviews]);

  useEffect(() => {
    void dispatch(
      fetchProductReviews({ productId }),
    );
  }, [dispatch, productId]);

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const newFiles = Array.from(
      event.target.files || [],
    );

    if (newFiles.length === 0) {
      return;
    }

    if (
      selectedImages.length +
        newFiles.length >
      5
    ) {
      window.alert(
        'شما حداکثر می‌توانید ۵ عکس انتخاب کنید.',
      );
      event.target.value = '';
      return;
    }

    setSelectedImages((current) => [
      ...current,
      ...newFiles,
    ]);
    event.target.value = '';
  };

  const removeImage = (
    indexToRemove: number,
  ) => {
    setSelectedImages((current) =>
      current.filter(
        (_, index) =>
          index !== indexToRemove,
      ),
    );
  };

  const handleSubmitReview = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const content = formData.content.trim();

    if (!content || submitting) {
      return;
    }

    const action = await dispatch(
      createReview({
        productId,
        title: formData.title.trim(),
        content,
        rating: formData.rating,
      }),
    );

    if (!createReview.fulfilled.match(action)) {
      return;
    }

    setFormData({
      title: '',
      content: '',
      rating: 5,
    });
    setSelectedImages([]);
    setShowForm(false);
  };

  const handleMarkHelpful = (
    reviewId: number,
  ) => {
    void dispatch(
      markReviewHelpful({ reviewId }),
    );
  };

  const renderStars = (
    rating: number,
    interactive = false,
  ): ReactNode => {
    return Array.from(
      { length: 5 },
      (_, index) => {
        const starValue = index + 1;
        const star = (
          <Star
            size={interactive ? 24 : 16}
            fill={
              starValue <= rating
                ? '#f59e0b'
                : 'transparent'
            }
            color={
              starValue <= rating
                ? '#f59e0b'
                : '#cbd5e1'
            }
          />
        );

        if (!interactive) {
          return (
            <span
              key={starValue}
              className={styles.starBtn}
              aria-hidden="true"
            >
              {star}
            </span>
          );
        }

        return (
          <button
            key={starValue}
            type="button"
            onClick={() => {
              setFormData((current) => ({
                ...current,
                rating: starValue,
              }));
            }}
            className={styles.starBtn}
            aria-label={`امتیاز ${starValue} از ۵`}
          >
            {star}
          </button>
        );
      },
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <div className={styles.loadingWrapper}>
        <Loader2
          className={styles.spinner}
          size={32}
        />
      </div>
    );
  }

  return (
    <div className={styles.reviewsContainer}>
      <div className={styles.summarySection}>
        <div className={styles.ratingBox}>
          <span className={styles.averageScore}>
            {averageRating > 0
              ? averageRating.toFixed(1)
              : '۰.۰'}
          </span>
          <span className={styles.outOf}>
            از ۵
          </span>
          <div className={styles.starsRow}>
            {renderStars(
              Math.round(averageRating),
            )}
          </div>
          <span className={styles.totalReviews}>
            ({pagination.totalCount} نظر)
          </span>
        </div>

        <button
          type="button"
          className={styles.addReviewBtn}
          onClick={() => {
            setShowForm((current) => !current);
          }}
        >
          ثبت نظر جدید
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmitReview}
          className={styles.reviewForm}
        >
          <h4 className={styles.formTitle}>
            دیدگاه خود را بنویسید
          </h4>

          <div className={styles.ratingSelect}>
            <label>
              امتیاز شما به این محصول:
            </label>
            <div className={styles.starsSelect}>
              {renderStars(
                formData.rating,
                true,
              )}
            </div>
          </div>

          <div className={styles.field}>
            <input
              type="text"
              value={formData.title}
              onChange={(event) => {
                setFormData((current) => ({
                  ...current,
                  title: event.target.value,
                }));
              }}
              placeholder="عنوان نظر (اختیاری)"
            />
          </div>

          <div className={styles.field}>
            <textarea
              value={formData.content}
              onChange={(event) => {
                setFormData((current) => ({
                  ...current,
                  content: event.target.value,
                }));
              }}
              placeholder="نقاط قوت، ضعف و تجربه استفاده خود را بنویسید..."
              rows={4}
              required
            />
          </div>

          <div
            className={
              styles.imageUploadSection
            }
          >
            <label
              className={styles.uploadLabel}
            >
              انتخاب عکس محصول (اختیاری)
            </label>

            <div className={styles.uploadArea}>
              <input
                type="file"
                multiple
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className={styles.hiddenInput}
              />

              <button
                type="button"
                className={
                  styles.uploadTriggerBtn
                }
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >
                <ImagePlus size={24} />
                <span>افزودن عکس</span>
              </button>

              <div
                className={styles.imagePreviews}
              >
                {imagePreviews.map(
                  ({ file, url }, index) => (
                    <div
                      key={`${file.name}-${file.lastModified}`}
                      className={
                        styles.previewItem
                      }
                    >
                      <Image
                        src={url}
                        alt={`پیش‌نمایش ${
                          index + 1
                        }`}
                        fill
                        unoptimized
                        className={
                          styles.previewImg
                        }
                      />

                      <button
                        type="button"
                        className={
                          styles.removeImgBtn
                        }
                        onClick={() =>
                          removeImage(index)
                        }
                        aria-label="حذف تصویر"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() =>
                setShowForm(false)
              }
              className={styles.cancelBtn}
            >
              انصراف
            </button>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2
                  className={styles.spinner}
                  size={20}
                />
              ) : (
                'ثبت دیدگاه'
              )}
            </button>
          </div>
        </form>
      )}

      <div className={styles.reviewsList}>
        {reviews.length === 0 ? (
          <div className={styles.empty}>
            هنوز نظری برای این محصول ثبت نشده
            است. اولین نفری باشید که نظر
            می‌دهد!
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.productReviewId}
              className={styles.reviewCard}
            >
              <div
                className={styles.reviewHeader}
              >
                <div className={styles.userInfo}>
                  <div
                    className={styles.userAvatar}
                  >
                    <User size={16} />
                  </div>
                  <span
                    className={styles.userName}
                  >
                    {review.userName ||
                      'کاربر سایت'}
                  </span>
                </div>

                <div
                  className={
                    styles.reviewRating
                  }
                >
                  {renderStars(review.rating)}
                </div>
              </div>

              {review.title && (
                <h4
                  className={styles.reviewTitle}
                >
                  {review.title}
                </h4>
              )}

              <p
                className={styles.reviewContent}
              >
                {review.content}
              </p>

              <div
                className={styles.reviewFooter}
              >
                <span
                  className={styles.reviewDate}
                >
                  {new Date(
                    review.createdAt,
                  ).toLocaleDateString('fa-IR')}
                </span>

                <button
                  type="button"
                  className={styles.helpfulBtn}
                  onClick={() =>
                    handleMarkHelpful(
                      review.productReviewId,
                    )
                  }
                >
                  <ThumbsUp size={14} />
                  مفید بود؟ (
                  {review.helpfulCount || 0})
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
