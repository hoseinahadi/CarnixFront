import axiosClient from '@/services/api/common/axiosClient'
export type ContentSection={title:string;body:string}
export type SitePage={sitePageContentId:number;slug:string;title:string;lead:string;sectionsJson:string;updatedAt?:string}
export type FaqItem={id:number;question:string;answer:string;category:string}
export const publicContentApi={
 page:async(slug:string)=>(await axiosClient.get<SitePage>(`/public-content/pages/${encodeURIComponent(slug)}`)).data,
 faqs:async(q='',category='همه')=>(await axiosClient.get<FaqItem[]>('/public-content/faqs',{params:{q,category}})).data,
}
export const parseSections=(value:string):ContentSection[]=>{try{const data=JSON.parse(value)as Array<{title?:string;body?:string;Title?:string;Body?:string}>;return Array.isArray(data)?data.map(x=>({title:x.title??x.Title??'',body:x.body??x.Body??''})).filter(x=>x.title&&x.body):[]}catch{return[]}}
