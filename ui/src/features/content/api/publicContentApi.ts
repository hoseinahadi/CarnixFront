import axiosClient from '@/services/api/common/axiosClient'
export type ContentSection={title:string;body:string}
export type SitePage={sitePageContentId:number;slug:string;title:string;lead:string;sectionsJson:string;updatedAt?:string}
export type FaqItem={id:number;question:string;answer:string;category:string}
export const publicContentApi={
 page:async(slug:string)=>(await axiosClient.get<SitePage>(`/public-content/pages/${encodeURIComponent(slug)}`)).data,
 faqs:async(q='',category='همه')=>{
  const payload=await axiosClient.get<unknown>('/public-content/faqs',{params:{q,category}}).then(response=>response.data)
  if(Array.isArray(payload)) return payload as FaqItem[]
  if(payload&&typeof payload==='object'){
   const value=payload as {data?:unknown;items?:unknown;result?:unknown}
   const nested=value.data&&typeof value.data==='object'?value.data as {items?:unknown;data?:unknown}:null
   const candidates=[value.data,value.items,value.result,nested?.items,nested?.data]
   const list=candidates.find(Array.isArray)
   if(list) return list as FaqItem[]
  }
  return []
 },
}
export const parseSections=(value:string):ContentSection[]=>{try{const data=JSON.parse(value)as Array<{title?:string;body?:string;Title?:string;Body?:string}>;return Array.isArray(data)?data.map(x=>({title:x.title??x.Title??'',body:x.body??x.Body??''})).filter(x=>x.title&&x.body):[]}catch{return[]}}
