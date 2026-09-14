import axiosClient from '@/services/api/common/axiosClient'
import{getCachedRequest}from'@/services/api/common/requestCache'
export type SiteLink={label:string;href:string}
export type SiteSettings={brandName:string;footerDescription:string;supportPhone:string;supportPhoneDisplay:string;whatsappNumber:string;whatsappMessage:string;linkedinUrl:string;telegramUrl:string;instagramUrl:string;enamadImageUrl:string;categoryLinks:string;vehicleLinks:string;quickLinks:string}
export const siteSettingsApi={get:async()=>(await getCachedRequest('site-settings',()=>axiosClient.get<SiteSettings>('/site-settings'),5*60_000)).data}
const normalizeSiteHref = (href: string): string => {
  const value = href.trim();

  if (!value) return '#';
  if (/^(?:https?:|mailto:|tel:|#|\/)/i.test(value)) return value;

  // Admin-entered internal paths are often saved without the leading slash.
  return `/${value.replace(/^\/+/, '')}`;
};

export const parseLinks = (value?: string): SiteLink[] => {
  try {
    const rows = JSON.parse(value ?? '[]');
    if (!Array.isArray(rows)) return [];

    return rows
      .filter((row): row is SiteLink =>
        typeof row?.label === 'string' && typeof row?.href === 'string',
      )
      .map((row) => ({
        label: row.label.trim(),
        href: normalizeSiteHref(row.href),
      }))
      .filter((row) => row.label.length > 0 && row.href !== '#');
  } catch {
    return [];
  }
};
