'use client'
import{useEffect,useState}from'react'
import{siteSettingsApi,type SiteSettings}from'./siteSettingsApi'
export function useSiteSettings(){const[data,setData]=useState<SiteSettings>();useEffect(()=>{void siteSettingsApi.get().then(setData)},[]);return data}
