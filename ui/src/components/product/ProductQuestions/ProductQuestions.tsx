'use client';

import {
  useEffect,
  useState,
  type FormEvent,
} from 'react';
import {
  CornerDownLeft,
  Loader2,
  MessageCircleQuestion,
  ShieldCheck,
  User,
} from 'lucide-react';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  createQuestion,
  fetchProductQuestions,
} from '@/store/feature/product/productQuestionThunks';
import {
  selectProductQuestions,
  selectQuestionsLoading,
  selectQuestionSubmitting,
} from '@/store/feature/product/productDetailSelectors';

import styles from './ProductQuestions.module.scss';

interface ProductQuestionsProps {
  productId: number;
}

export default function ProductQuestions({
  productId,
}: ProductQuestionsProps) {
  const dispatch = useAppDispatch();
  const questions = useAppSelector(
    selectProductQuestions,
  );
  const loading = useAppSelector(
    selectQuestionsLoading,
  );
  const submitting = useAppSelector(
    selectQuestionSubmitting,
  );
  const [questionText, setQuestionText] =
    useState('');

  useEffect(() => {
    void dispatch(
      fetchProductQuestions({ productId }),
    );
  }, [dispatch, productId]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const normalizedQuestion =
      questionText.trim();

    if (!normalizedQuestion || submitting) {
      return;
    }

    const action = await dispatch(
      createQuestion({
        productId,
        questionText: normalizedQuestion,
      }),
    );

    if (createQuestion.fulfilled.match(action)) {
      setQuestionText('');
    }
  };

  if (loading && questions.length === 0) {
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
    <div className={styles.questionsContainer}>
      <div className={styles.askSection}>
        <h3 className={styles.sectionTitle}>
          پرسش خود را درباره محصول مطرح کنید
        </h3>

        <form
          onSubmit={handleSubmit}
          className={styles.askForm}
        >
          <textarea
            value={questionText}
            onChange={(event) =>
              setQuestionText(
                event.target.value,
              )
            }
            placeholder="سؤال شما چیست؟"
            rows={3}
            required
            className={styles.textarea}
          />

          <div className={styles.formFooter}>
            <span className={styles.hint}>
              پس از ثبت، پشتیبانان یا کاربران
              به شما پاسخ خواهند داد.
            </span>

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
                'ثبت پرسش'
              )}
            </button>
          </div>
        </form>
      </div>

      <div className={styles.questionsList}>
        {questions.length === 0 ? (
          <div className={styles.empty}>
            پرسشی ثبت نشده است. اولین نفری
            باشید که سؤال می‌پرسد!
          </div>
        ) : (
          questions.map((question) => (
            <div
              key={question.productQuestionId}
              className={styles.questionCard}
            >
              <div
                className={styles.questionBody}
              >
                <div
                  className={styles.iconWrapper}
                >
                  <MessageCircleQuestion
                    size={20}
                  />
                </div>

                <div className={styles.content}>
                  <p className={styles.text}>
                    {question.questionText}
                  </p>
                  <span className={styles.date}>
                    {new Date(
                      question.createdAt,
                    ).toLocaleDateString(
                      'fa-IR',
                    )}
                  </span>
                </div>
              </div>

              {question.answers &&
                question.answers.length > 0 && (
                  <div
                    className={
                      styles.answersContainer
                    }
                  >
                    {question.answers.map(
                      (answer, index) => (
                        <div
                          key={
                            answer.productQuestionAnswerId ||
                            `${question.productQuestionId}-${index}`
                          }
                          className={`${
                            styles.answerCard
                          } ${
                            answer.isAdminReply
                              ? styles.adminAnswer
                              : ''
                          }`}
                        >
                          <CornerDownLeft
                            size={16}
                            className={
                              styles.replyIcon
                            }
                          />

                          <div
                            className={
                              styles.answerContent
                            }
                          >
                            <div
                              className={
                                styles.answerHeader
                              }
                            >
                              {answer.isAdminReply ? (
                                <span
                                  className={
                                    styles.adminBadge
                                  }
                                >
                                  <ShieldCheck
                                    size={14}
                                  />
                                  پشتیبانی سایت
                                </span>
                              ) : (
                                <span
                                  className={
                                    styles.userBadge
                                  }
                                >
                                  <User size={14} />
                                  کاربر سایت
                                </span>
                              )}
                            </div>

                            <p
                              className={styles.text}
                            >
                              {answer.answerText}
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
