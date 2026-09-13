'use client'
import{useEffect,useState}from'react'
import{publicContentApi,parseSections,type SitePage}from'@/features/content/api/publicContentApi'
import ContentPage from'./ContentPage'
export default function DynamicContentPage({slug}:{slug:string}){const[page,setPage]=useState<SitePage>(),[error,setError]=useState('');useEffect(()=>{publicContentApi.page(slug).then(setPage).catch(()=>setError('دریافت محتوا انجام نشد.'))},[slug]);if(error)return <ContentPage title="خطا" lead={error}>{null}</ContentPage>;if(!page)return <ContentPage title="در حال دریافت…" lead="محتوای صفحه از سرور دریافت می‌شود.">{null}</ContentPage>;return <ContentPage title={page.title} lead={page.lead}>{parseSections(page.sectionsJson).map(x=><section key={x.title}><h2>{x.title}</h2><p>{x.body}</p></section>)}</ContentPage>}
