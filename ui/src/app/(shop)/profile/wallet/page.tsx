"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Plus,
  RefreshCw,
  WalletCards,
} from "lucide-react";
import { WalletApi, type WalletData } from "@/features/wallet/walletApi";
import { formatPrice } from "@/utils/price";
import styles from "./WalletPage.module.scss";

const quickAmounts = [500_000, 1_000_000, 2_000_000];

function WalletContent() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const params = useSearchParams();
  const router = useRouter();

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setWallet((await WalletApi.get()).data);
    } catch {
      setError("دریافت اطلاعات کیف پول ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    const token = params.get("walletToken");
    if (!token || params.get("walletStatus") !== "success") return;
    setBusy(true);
    WalletApi.verifyTopUp(token)
      .then(() => {
        router.replace("/profile/wallet");
        return load();
      })
      .catch(() => setError("تأیید شارژ ناموفق بود."))
      .finally(() => setBusy(false));
  }, [params, router, load]);

  const topUp = async () => {
    const value = Number(amount);
    if (value < 10_000) {
      setError("حداقل مبلغ شارژ ۱۰٬۰۰۰ تومان است.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await WalletApi.initiateTopUp(
        value,
        `${location.origin}/profile/wallet`,
      );
      location.assign(response.data.paymentUrl);
    } catch {
      setError("ایجاد پرداخت شارژ ناموفق بود.");
      setBusy(false);
    }
  };

  return (
    <main className={styles.page} dir="rtl">
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>حساب کاربری</span>
          <h1>کیف پول</h1>
          <p>موجودی و تراکنش‌های مالی خود را اینجا مدیریت کنید.</p>
        </div>
        <button
          type="button"
          className={styles.refresh}
          onClick={() => void load()}
          disabled={loading}
        >
          <RefreshCw size={18} />
          <span>به‌روزرسانی</span>
        </button>
      </header>
      {error && <div className={styles.error}>{error}</div>}
      <section className={styles.heroGrid}>
        <article className={styles.balanceCard}>
          <div className={styles.balanceIcon}>
            <WalletCards size={25} />
          </div>
          <span>موجودی قابل استفاده</span>
          <strong>
            {loading ? "—" : formatPrice(wallet?.currentBalance ?? 0)}{" "}
            <small>تومان</small>
          </strong>
          <div className={styles.balanceMeta}>
            <span>کل واریز: {formatPrice(wallet?.totalDeposits ?? 0)}</span>
            <span>کل برداشت: {formatPrice(wallet?.totalWithdrawals ?? 0)}</span>
          </div>
        </article>
        <article className={styles.chargeCard}>
          <div className={styles.cardTitle}>
            <div>
              <h2>شارژ کیف پول</h2>
              <p>مبلغ موردنظر را انتخاب یا وارد کنید.</p>
            </div>
            <CreditCard size={23} />
          </div>
          <div className={styles.quickAmounts}>
            {quickAmounts.map((value) => (
              <button
                type="button"
                key={value}
                className={
                  Number(amount) === value ? styles.selectedAmount : ""
                }
                onClick={() => setAmount(String(value))}
              >
                {formatPrice(value)}
              </button>
            ))}
          </div>
          <label>
            <span>مبلغ شارژ</span>
            <div className={styles.amountInput}>
              <input
                value={amount ? Number(amount).toLocaleString("fa-IR") : ""}
                onChange={(event) =>
                  setAmount(
                    event.target.value
                      .replace(/[^۰-۹0-9]/g, "")
                      .replace(/[۰-۹]/g, (digit) =>
                        String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)),
                      ),
                  )
                }
                inputMode="numeric"
                placeholder="مبلغ به تومان"
              />
              <span>تومان</span>
            </div>
          </label>
          <button
            className={styles.payButton}
            disabled={busy}
            onClick={() => void topUp()}
          >
            <Plus size={18} />
            {busy ? "در حال انتقال…" : "پرداخت و شارژ"}
          </button>
        </article>
      </section>
      <section className={styles.transactions}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>تراکنش‌ها</h2>
            <p>تاریخچهٔ واریزها و پرداخت‌های کیف پول</p>
          </div>
          <span>
            {(wallet?.transactions.length ?? 0).toLocaleString("fa-IR")} تراکنش
          </span>
        </div>
        {loading ? (
          <div className={styles.empty}>در حال دریافت تراکنش‌ها…</div>
        ) : wallet?.transactions.length ? (
          <div className={styles.transactionList}>
            {wallet.transactions.map((transaction) => {
              const deposit = transaction.amount >= 0;
              return (
                <article key={transaction.id} className={styles.transaction}>
                  <div
                    className={`${styles.transactionIcon} ${deposit ? styles.deposit : styles.withdraw}`}
                  >
                    {deposit ? (
                      <ArrowDownLeft size={20} />
                    ) : (
                      <ArrowUpRight size={20} />
                    )}
                  </div>
                  <div className={styles.transactionInfo}>
                    <strong>
                      {transaction.transactionType === "Deposit"
                        ? "شارژ کیف پول"
                        : "پرداخت سفارش"}
                    </strong>
                    <span>
                      {transaction.description.startsWith("TOPUP:")
                        ? "شارژ آنلاین کیف پول"
                        : transaction.description}
                    </span>
                    <time>
                      {new Date(transaction.transactionDate).toLocaleDateString(
                        "fa-IR",
                      )}
                    </time>
                  </div>
                  <div
                    className={`${styles.transactionAmount} ${deposit ? styles.positive : styles.negative}`}
                  >
                    {deposit ? "+" : "−"}
                    {formatPrice(Math.abs(transaction.amount))}{" "}
                    <small>تومان</small>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className={styles.empty}>
            <WalletCards size={42} />
            <h3>هنوز تراکنشی ثبت نشده</h3>
            <p>
              بعد از اولین شارژ یا پرداخت، تراکنش‌های شما اینجا نمایش داده
              می‌شوند.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

export default function WalletPage() {
  return (
    <Suspense
      fallback={
        <main className={styles.page} dir="rtl">
          <div className={styles.empty}>در حال بارگذاری کیف پول…</div>
        </main>
      }
    >
      <WalletContent />
    </Suspense>
  );
}
