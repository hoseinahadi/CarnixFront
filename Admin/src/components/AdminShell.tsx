"use client";
import Link from 'next/link'; import {usePathname} from 'next/navigation'; import {navGroups} from '@/lib/resources'; import {useAuth} from './AuthProvider'; import {useMemo,useState} from 'react';
const icons:Record<string,string>={dashboard:'⌂',products:'◈',categories:'⌘',brands:'◆',tags:'#',features:'⚙',featureOptions:'☷',featureValues:'≡',categoryFeatures:'⇄',skus:'SKU',media:'▧',images:'▨',productTools:'⌁',priceHistory:'↕',shippingMethods:'⇢',paymentMethods:'₿',videos:'▶',views360:'360',warranties:'✓',orders:'▣',orderStatuses:'◉',carts:'🛒',productDiscounts:'٪',bundles:'⊞',warehouses:'▤',inventory:'▥',users:'♙',roles:'♜',permissions:'🔐',contents:'✎',reviews:'★',vehiclesMakes:'◫',vehiclesModels:'▱','api-center':'API'};
export function AdminShell({children}:{children:React.ReactNode}){
 const path=usePathname(); const {user,logout}=useAuth(); const [open,setOpen]=useState(false); const [q,setQ]=useState('');
 const groups=useMemo(()=>navGroups.map(g=>({...g,items:g.items.filter(i=>!q||i[1].includes(q)||i[0].includes(q))})).filter(g=>g.items.length),[q]);
 return <div className="admin-shell">
  <aside className={'sidebar '+(open?'open':'')}>
   <div className="brand"><div className="brand-mark">C</div><div><strong>Carnix</strong><span>Admin Console</span></div><button className="mobile-close" onClick={()=>setOpen(false)}>×</button></div>
   <div className="sidebar-search"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="جستجو در منو..."/></div>
   <nav>{groups.map(g=><section key={g.title}><h6>{g.title}</h6>{g.items.map(([key,label])=>{const href=key==='dashboard'?'/admin/dashboard':key==='api-center'?'/admin/api-center':`/admin/${key}`; const active=path===href; return <Link onClick={()=>setOpen(false)} className={active?'active':''} key={key} href={href}><i>{icons[key]||'•'}</i><span>{label}</span></Link>})}</section>)}</nav>
   <div className="sidebar-foot"><div className="user-mini"><div className="avatar">{String(user?.name||user?.firstName||user?.userName||'A').slice(0,1)}</div><div><strong>{user?.name||user?.firstName||user?.userName||'مدیر سیستم'}</strong><small>{user?.email||user?.phoneNumber||'Authenticated'}</small></div></div><button onClick={logout}>خروج</button></div>
  </aside>
  {open&&<button className="overlay" aria-label="close" onClick={()=>setOpen(false)}/>} 
  <main className="workspace"><header className="topbar"><button className="hamb" onClick={()=>setOpen(true)}>☰</button><div><strong>پنل مدیریت Carnix</strong><span>مدیریت یکپارچه فروشگاه و API</span></div><div className="top-actions"><a href={process.env.NEXT_PUBLIC_STORE_URL||'http://localhost:3000'} target="_blank">مشاهده سایت ↗</a><span className="connection-dot" title="API Token authentication"/></div></header><div className="page">{children}</div></main>
 </div>
}
