'use client'
import{useEffect,useMemo,useState}from'react'
import Link from'next/link'
import{IconChevronDown,IconSearch,IconHelpCircle,IconMessageCircle,IconHeadphones,IconShieldCheck}from'@tabler/icons-react'
import{publicContentApi,type FaqItem}from'@/features/content/api/publicContentApi'
import styles from'./FaqPage.module.scss'
export default function FaqPage(){
 const[data,setData]=useState<FaqItem[]>([]),[activeId,setActiveId]=useState<number|null>(null),[query,setQuery]=useState(''),[category,setCategory]=useState('همه'),[loading,setLoading]=useState(true),[error,setError]=useState('')
 useEffect(()=>{publicContentApi.faqs().then(setData).catch(()=>setError('دریافت سؤال‌ها انجام نشد.')).finally(()=>setLoading(false))},[])
 const categories=useMemo(()=>['همه',...new Set(data.map(x=>x.category))],[data])
 const visible=useMemo(()=>data.filter(x=>(category==='همه'||x.category===category)&&(!query.trim()||x.question.includes(query.trim())||x.answer.includes(query.trim()))),[data,query,category])
 return <main className={styles.page}><div className={styles.container}><header className={styles.header}><div className={styles.headerIcon}><IconHelpCircle size={40}/></div><h1 className={styles.title}>سؤالات متداول</h1><p className={styles.subtitle}>پاسخ پرسش‌های رایج درباره خرید، محصولات، ارسال و پشتیبانی</p></header>
 <div className={styles.searchWrapper}><IconSearch size={20} className={styles.searchIcon}/><input className={styles.searchInput} value={query} onChange={e=>setQuery(e.target.value)} placeholder="جست‌وجو در سؤال‌ها..."/></div>
 <div className={styles.categories}>{categories.map(x=><button key={x} className={`${styles.categoryButton} ${category===x?styles.activeCategory:''}`} onClick={()=>setCategory(x)}><IconShieldCheck size={18}/><span>{x}</span><span className={styles.categoryCount}>{(x==='همه'?data:data.filter(f=>f.category===x)).length.toLocaleString('fa-IR')}</span></button>)}</div>
 <div className={styles.faqList}>{loading&&<div className={styles.emptyState}>در حال دریافت…</div>}{error&&<div className={styles.emptyState}>{error}</div>}{!loading&&!error&&!visible.length&&<div className={styles.emptyState}><IconMessageCircle size={64}/><h3>نتیجه‌ای پیدا نشد</h3><p>عبارت دیگری را جست‌وجو کنید.</p></div>}{!loading&&visible.map(item=><article key={item.id} className={`${styles.faqItem} ${activeId===item.id?styles.active:''}`}><button className={styles.faqQuestion} onClick={()=>setActiveId(activeId===item.id?null:item.id)} aria-expanded={activeId===item.id}><div className={styles.questionContent}><div className={styles.questionText}><span className={styles.questionCategory}>{item.category}</span><h2 className={styles.questionTitle}>{item.question}</h2></div></div><IconChevronDown className={`${styles.chevron} ${activeId===item.id?styles.rotated:''}`} size={20}/></button><div className={`${styles.faqAnswer} ${activeId===item.id?styles.expanded:''}`}><div className={styles.answerContent}><p>{item.answer}</p></div></div></article>)}</div>
 <div className={styles.contactBanner}><div className={styles.contactIcon}><IconHeadphones size={32}/></div><div className={styles.contactInfo}><h3>پاسخ سؤال خود را پیدا نکردید؟</h3><p>از بخش تیکت‌های پشتیبانی با کارشناسان ما در ارتباط باشید.</p></div><Link className={styles.contactButton} href="/profile/tickets">ثبت تیکت</Link></div></div></main>
}
