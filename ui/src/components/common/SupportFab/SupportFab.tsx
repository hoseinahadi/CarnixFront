'use client'
import{useEffect,useState}from'react'
import{IconHeadphones,IconBrandWhatsapp,IconMessageCircle,IconX}from'@tabler/icons-react'
import{useSiteSettings}from'@/features/settings/useSiteSettings'
import styles from'./SupportFab.module.scss'
export default function SupportFab(){const settings=useSiteSettings();const[open,setOpen]=useState(false),[visible,setVisible]=useState(true)
 useEffect(()=>{const hide=()=>setVisible(false),show=()=>setVisible(true);window.addEventListener('modalOpened',hide);window.addEventListener('modalClosed',show);return()=>{window.removeEventListener('modalOpened',hide);window.removeEventListener('modalClosed',show)}},[])
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false)};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key)},[])
 if(!settings?.whatsappNumber)return null
 const launch=(message='')=>{window.open(`https://wa.me/${settings.whatsappNumber}${message?`?text=${encodeURIComponent(message)}`:''}`,'_blank','noopener,noreferrer');setOpen(false)}
 return <div className={`${styles.fabContainer} ${!visible&&!open?styles.hidden:''}`}>{open&&<div className={styles.overlay} onClick={()=>setOpen(false)}/>}<div className={`${styles.menu} ${open?styles.menuOpen:''}`}><button className={`${styles.menuItem} ${styles.whatsappButton}`} onClick={()=>launch()} aria-label="پشتیبانی واتساپ"><div className={styles.menuItemContent}><IconBrandWhatsapp size={20}/><span>واتساپ</span></div><span className={styles.menuItemSub}>پاسخ‌گویی سریع</span></button><button className={`${styles.menuItem} ${styles.chatButton}`} onClick={()=>launch(settings.whatsappMessage)} aria-label="گفت‌وگوی پشتیبانی"><div className={styles.menuItemContent}><IconMessageCircle size={20}/><span>گفت‌وگو</span></div><span className={styles.menuItemSub}>ارسال پیام به پشتیبانی</span></button></div><button className={`${styles.fabButton} ${open?styles.fabActive:''}`} onClick={()=>setOpen(x=>!x)} aria-label="پشتیبانی">{open?<IconX size={24}/>:<IconHeadphones size={24}/>}</button></div>}
