// app/faq/page.tsx
'use client'

import React, { useState } from 'react'
import {
    IconChevronDown,
    IconSearch,
    IconHelpCircle,
    IconMessageCircle,
    IconCreditCard,
    IconHeadphones,
    IconPackage,
    IconTruck,
    IconShoppingCart,
    IconShieldCheck,
    IconBuildingStore,
    IconCategory,
    IconStack,
    IconStar
} from '@tabler/icons-react'
import styles from './FaqPage.module.scss'

interface FaqItem {
    id: number
    question: string
    answer: string
    category: 'پرداخت اقساط' | 'پشتیبانی' | 'محصولات' | 'ارسال' | 'خرید'
}

const faqData: FaqItem[] = [
    {
        id: 1,
        category: 'محصولات',
        question: 'در کارنیکس چه محصولاتی فروخته میشه؟',
        answer: 'کارنیکس به عنوان یکی از معتبرترین فروشگاه‌های قطعات یدکی خودرو، طیف گسترده‌ای از محصولات شامل قطعات موتوری، قطعات بدنه، قطعات برقی و الکترونیکی، لوازم جانبی خودرو، روغن و فیلتر، لاستیک و رینگ، و سایر قطعات یدکی انواع خودروهای داخلی و خارجی را عرضه می‌کند. تمامی محصولات موجود در کارنیکس از برندهای معتبر و با ضمانت اصالت کالا عرضه می‌شوند.'
    },
    {
        id: 2,
        category: 'محصولات',
        question: 'چه دسته بندی هایی وجود داره؟',
        answer: 'در کارنیکس محصولات در دسته‌بندی‌های متنوعی سازماندهی شده‌اند تا شما بتوانید به راحتی قطعه مورد نظر خود را پیدا کنید. دسته‌بندی‌های اصلی شامل: قطعات موتوری (پیستون، سوپاپ، واشر سرسیلندر و ...)، قطعات بدنه (سپر، چراغ، آینه و ...)، قطعات برقی (دینام، استارت، سنسورها و ...)، سیستم تعلیق و جلوبندی، لوازم جانبی، روغن و فیلترها، لاستیک و رینگ، و قطعات مربوط به مدل‌های خاص خودرو می‌باشد.'
    },
    {
        id: 3,
        category: 'خرید',
        question: 'آیا به صورت عمده میشه خرید کرد؟',
        answer: 'بله، کارنیکس امکان خرید عمده را برای مشتریان عزیز فراهم کرده است. شما می‌توانید از طریق صفحه "خرید عمده" درخواست خود را ثبت کنید تا کارشناسان فروش ما حداکثر طی ۲۴ ساعت با شما تماس بگیرند و شرایط ویژه خرید عمده، تخفیف‌های حجمی و نحوه ارسال را هماهنگ کنند. همچنین تعمیرگاه‌ها و فروشگاه‌های قطعات یدکی می‌توانند از شرایط ویژه همکاری بهره‌مند شوند.'
    },
    {
        id: 4,
        category: 'محصولات',
        question: 'کیفیت محصولات چجوریه؟',
        answer: 'تمامی محصولات عرضه شده در کارنیکس دارای ضمانت اصالت و کیفیت هستند. ما با همکاری مستقیم با تولیدکنندگان معتبر داخلی و واردکنندگان رسمی، محصولات با کیفیت بالا و استاندارد را عرضه می‌کنیم. هر محصول دارای گارانتی بازگشت وجه در صورت عدم تطابق با مشخصات درج شده می‌باشد. همچنین نظرات و امتیازات کاربران قبلی برای هر محصول قابل مشاهده است تا با اطمینان کامل خرید کنید.'
    },
    {
        id: 5,
        category: 'ارسال',
        question: 'مدت زمان ارسال سفارشات چقدره؟',
        answer: 'مدت زمان ارسال بستگی به موقعیت جغرافیایی شما و روش ارسال انتخابی دارد. سفارشات تهران معمولاً ۱ تا ۲ روز کاری، مراکز استان‌ها ۲ تا ۴ روز کاری و سایر شهرستان‌ها ۳ تا ۷ روز کاری زمان می‌برد. همچنین امکان ارسال سریع (پست پیشتاز) و ارسال فوری (پیک موتوری در تهران) نیز وجود دارد. شماره پیگیری سفارش بلافاصله پس از ارسال برای شما پیامک می‌شود.'
    },
    {
        id: 6,
        category: 'پرداخت اقساط',
        question: 'شرایط پرداخت اقساطی چطوریه؟',
        answer: 'کارنیکس امکان خرید اقساطی را برای سفارشات بالای ۵ میلیون تومان فراهم کرده است. شرایط پرداخت اقساطی شامل: پیش پرداخت ۳۰٪ مبلغ کل، اقساط ۴ تا ۱۲ ماهه بدون بهره (با چک صیادی)، و امکان تسویه زودهنگام می‌باشد. برای اطلاعات بیشتر و درخواست خرید اقساطی می‌توانید با کارشناسان فروش ما تماس بگیرید.'
    },
    {
        id: 7,
        category: 'پشتیبانی',
        question: 'چطور می‌تونم محصول مورد نظرم رو پیدا کنم؟',
        answer: 'شما می‌توانید از چند روش محصول مورد نظر خود را پیدا کنید: ۱- جستجوی مستقیم با نام قطعه یا کد فنی در نوار جستجو ۲- مرور دسته‌بندی‌ها از منوی اصلی ۳- فیلتر کردن بر اساس برند خودرو، مدل و سال ساخت ۴- استفاده از بخش "جستجوی پیشرفته" برای یافتن دقیق‌تر قطعات. همچنین کارشناسان پشتیبانی ما به صورت آنلاین و تلفنی آماده راهنمایی شما هستند.'
    },
    {
        id: 8,
        category: 'پشتیبانی',
        question: 'ساعت کاری و راه‌های ارتباطی چیه؟',
        answer: 'تیم پشتیبانی کارنیکس همه روزه از ساعت ۸ صبح تا ۱۰ شب (حتی روزهای تعطیل) آماده پاسخگویی به شما عزیزان است. راه‌های ارتباطی: تلفن: ۰۲۱-۱۲۳۴۵۶۷۸، واتساپ: ۰۹۱۲۳۴۵۶۷۸۹، ایمیل: support@carnix.com، و چت آنلاین در وبسایت. همچنین می‌توانید از طریق بخش "تماس با ما" پیام خود را ثبت کنید تا کارشناسان در اسرع وقت با شما تماس بگیرند.'
    },
    {
        id: 9,
        category: 'خرید',
        question: 'آیا امکان مرجوع کردن کالا وجود داره؟',
        answer: 'بله، کارنیکس طبق قوانین تجارت الکترونیک، امکان بازگشت کالا را تا ۷ روز پس از دریافت فراهم کرده است. شرایط مرجوعی: کالا باید در بسته‌بندی اصلی و بدون آسیب باشد، از تاریخ دریافت بیشتر از ۷ روز نگذشته باشد، و کالا با مشخصات درج شده در سایت مغایرت داشته باشد. هزینه بازگشت کالا در صورت تایید مغایرت، بر عهده کارنیکس می‌باشد.'
    },
    {
        id: 10,
        category: 'ارسال',
        question: 'هزینه ارسال چقدره و چطور محاسبه میشه؟',
        answer: 'هزینه ارسال بر اساس وزن، ابعاد بسته و مسافت محاسبه می‌شود. ارسال سفارشات بالای ۲ میلیون تومان به سراسر کشور رایگان است. برای سفارشات کمتر از این مبلغ، هزینه ارسال در مرحله پرداخت به صورت شفاف نمایش داده می‌شود. همچنین در تهران امکان ارسال فوری با پیک (هزینه بر اساس مسافت) و تحویل درب منزل وجود دارد.'
    },
    {
        id: 11,
        category: 'پرداخت اقساط',
        question: 'برای خرید اقساطی چه مدارکی لازمه؟',
        answer: 'برای استفاده از طرح خرید اقساطی کارنیکس، مدارک زیر مورد نیاز است: ۱- اصل و کپی کارت ملی ۲- یک فقره چک صیادی به مبلغ اقساط ۳- فیش حقوقی یا گواهی اشتغال به کار ۴- آدرس و کد پستی دقیق. پس از تایید مدارک توسط کارشناسان، سفارش شما در اسرع وقت پردازش و ارسال خواهد شد.'
    },
    {
        id: 12,
        category: 'محصولات',
        question: 'آیا محصولات گارانتی دارن؟',
        answer: 'بله، تمامی محصولات کارنیکس دارای گارانتی اصالت و سلامت کالا هستند. بسته به نوع محصول و برند سازنده، محصولات دارای گارانتی ۶ ماه تا ۲ سال می‌باشند. جزئیات گارانتی هر محصول در صفحه اختصاصی آن درج شده است. در صورت بروز هرگونه مشکل، می‌توانید از طریق بخش پیگیری گارانتی اقدام کنید.'
    },
]

const categoryIcons: Record<string, React.ElementType> = {
    'پرداخت اقساط': IconCreditCard,
    'پشتیبانی': IconHeadphones,
    'محصولات': IconPackage,
    'ارسال': IconTruck,
    'خرید': IconShoppingCart,
}
const handleContactSupport = () => {
  // باز کردن پشتیبانی - می‌تونی FAB رو باز کنی یا مستقیم به تلفن وصل بشی
  window.location.href = 'tel:09188693049'
}


const categories = ['همه', 'پرداخت اقساط', 'پشتیبانی', 'محصولات', 'ارسال', 'خرید']

const FaqPage = () => {
    const [activeId, setActiveId] = useState<number | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState('همه')

    const toggleFaq = (id: number) => {
        setActiveId(activeId === id ? null : id)
    }

    const filteredFaqs = faqData.filter(faq => {
        const matchesSearch =
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesCategory = activeCategory === 'همه' || faq.category === activeCategory

        return matchesSearch && matchesCategory
    })

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                {/* هدر */}
                <div className={styles.header}>
                    <div className={styles.headerIcon}>
                        <IconHelpCircle size={40} stroke={1.5} />
                    </div>
                    <h1 className={styles.title}>سوالات متداول</h1>
                    <p className={styles.subtitle}>
                        لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون
                    </p>
                </div>

                {/* جستجو */}
                <div className={styles.searchWrapper}>
                    <IconSearch size={20} stroke={1.5} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="جستجو در سوالات متداول..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                {/* فیلتر دسته‌بندی */}
                <div className={styles.categories}>
                    {categories.map(cat => {
                        const Icon = cat === 'همه' ? IconShieldCheck : categoryIcons[cat]
                        const count = cat === 'همه'
                            ? faqData.length
                            : faqData.filter(f => f.category === cat).length

                        return (
                            <button
                                key={cat}
                                className={`${styles.categoryButton} ${activeCategory === cat ? styles.activeCategory : ''}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {Icon && <Icon size={18} stroke={1.5} />}
                                <span>{cat}</span>
                                <span className={styles.categoryCount}>{count}</span>
                            </button>
                        )
                    })}
                </div>

                {/* لیست سوالات */}
                <div className={styles.faqList}>
                    {filteredFaqs.length === 0 ? (
                        <div className={styles.emptyState}>
                            <IconMessageCircle size={64} stroke={1} />
                            <h3>نتیجه‌ای یافت نشد</h3>
                            <p>سوالی با این مشخصات پیدا نکردیم. لطفاً عبارت دیگری جستجو کنید.</p>
                        </div>
                    ) : (
                        filteredFaqs.map(faq => {
                            const CategoryIcon = categoryIcons[faq.category]

                            return (
                                <div
                                    key={faq.id}
                                    className={`${styles.faqItem} ${activeId === faq.id ? styles.active : ''}`}
                                >
                                    <button
                                        className={styles.faqQuestion}
                                        onClick={() => toggleFaq(faq.id)}
                                        aria-expanded={activeId === faq.id}
                                    >
                                        <div className={styles.questionContent}>
                                            <div className={styles.questionIcon}>
                                                {CategoryIcon && <CategoryIcon size={20} stroke={1.5} />}
                                            </div>
                                            <div className={styles.questionText}>
                                                <span className={styles.questionCategory}>{faq.category}</span>
                                                <h3 className={styles.questionTitle}>{faq.question}</h3>
                                            </div>
                                        </div>
                                        <IconChevronDown
                                            size={20}
                                            stroke={2}
                                            className={`${styles.chevron} ${activeId === faq.id ? styles.rotated : ''}`}
                                        />
                                    </button>

                                    <div className={`${styles.faqAnswer} ${activeId === faq.id ? styles.expanded : ''}`}>
                                        <div className={styles.answerContent}>
                                            <p>{faq.answer}</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* بخش تماس با ما */}
                <div className={styles.contactBanner}>
                    <div className={styles.contactIcon}>
                        <IconHeadphones size={32} stroke={1.5} />
                    </div>
                    <div className={styles.contactInfo}>
                        <h3>پاسخ سوال خود را پیدا نکردید؟</h3>
                        <p>با کارشناسان ما تماس بگیرید تا راهنماییتون کنند</p>
                    </div>
                    <button className={styles.contactButton} onClick={handleContactSupport}>
                        تماس با پشتیبانی
                    </button>
                </div>
            </div>
        </div>
    )
}

export default FaqPage