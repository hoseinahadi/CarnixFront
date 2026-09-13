import axiosClient from '@/services/api/common/axiosClient'
import{getCachedRequest}from'@/services/api/common/requestCache'
export type SiteLink={label:string;href:string}
export type SiteSettings={brandName:string;footerDescription:string;supportPhone:string;supportPhoneDisplay:string;whatsappNumber:string;whatsappMessage:string;linkedinUrl:string;telegramUrl:string;instagramUrl:string;enamadImageUrl:string;categoryLinks:string;vehicleLinks:string;quickLinks:string}
export const siteSettingsApi={get:async()=>(await getCachedRequest('site-settings',()=>axiosClient.get<SiteSettings>('/site-settings'),5*60_000)).data}
export const parseLinks=(value?:string):SiteLink[]=>{try{const rows=JSON.parse(value??'[]');return Array.isArray(rows)?rows.filter(x=>typeof x?.label==='string'&&typeof x?.href==='string'):[]}catch{return[]}}
