'use client';

import React from 'react';
import styles from './CartStepper.module.scss';

interface CartStepperProps {
  currentStep: 1 | 2 | 3;
}

const CartStepper: React.FC<CartStepperProps> = ({ currentStep }) => {
  const steps = [
    { id: 1, label: 'سبد خرید' },
    { id: 2, label: 'اطلاعات ارسال' },
    { id: 3, label: 'پرداخت' },
  ];

  return (
    <div className={styles.stepperContainer}>
      <div className={styles.stepper}>
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const isConnector = index < steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div className={`${styles.step} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}>
                <div className={styles.stepBox}>
                  {isCompleted ? (
                    <span className={styles.checkmark}>✓</span>
                  ) : (
                    <span className={styles.stepNumber}>{step.id}</span>
                  )}
                </div>
                <span className={styles.stepLabel}>{step.label}</span>
              </div>
              {isConnector && (
                <div className={`${styles.connector} ${isCompleted ? styles.connectorCompleted : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default CartStepper;