'use client'

import OptimizedImage from '@/components/common/OptimizedImage/OptimizedImage'
import { IconBrandInstagram, IconBrandLinkedin, IconBrandTelegram, IconPhone } from '@tabler/icons-react'
import { useAppSelector } from '@/store/hooks'
import { flattenCategoryTree } from '@/utils/categoryTree'
import { parseLinks, type SiteLink } from '@/features/settings/siteSettingsApi'
import { useSiteSettings } from '@/features/settings/useSiteSettings'
import styles from './Footer.module.scss'

const isExternalHref = (href: string): boolean => /^(?:https?:|mailto:|tel:|\/\/)/i.test(href)

const normalizeText = (value: string): string =>
  value.toLocaleLowerCase().replace(/[\u200c\s،،-]+/g, '')

const resolveFooterHref = (link: SiteLink, categoryData: unknown): string => {
  // The old vehicle links used the dynamic category route "all" and a legacy
  // `vehicle` query that the current product filters no longer understand.
  if (link.href.startsWith('/products/all?')) {
    return '/vehicles'
  }

  const match = link.href.match(/^\/products\/([^/?#]+)(.*)$/i)
  if (!match || /^\d+$/.test(match[1])) return link.href

  const categories = flattenCategoryTree(Array.isArray(categoryData) ? categoryData : [])
  if (categories.length === 0) return '/categories'

  const routePart = decodeURIComponent(match[1]).toLocaleLowerCase()
  const label = normalizeText(link.label)
  const candidates = categories.filter((category) => {
    const name = normalizeText(category.name || '')
    const slug = normalizeText(category.slug || '')
    return slug === routePart || name === routePart || name === label || name.includes(label)
  })

  const category = candidates.sort((a, b) => {
    const aIsRoot = !a.parentCategoryId ? 0 : 1
    const bIsRoot = !b.parentCategoryId ? 0 : 1
    return aIsRoot - bIsRoot || (a.displayOrder || 0) - (b.displayOrder || 0)
  })[0]

  return category ? `/products/${category.categoryId}${match[2]}` : '/categories'
}

export default function Footer() {
  const settings = useSiteSettings()
  const categories = useAppSelector((state) => state.category.categories)

  if (!settings) return <footer className={styles.footer} />

  const group = (title: string, value: string) => (
    <div className={styles.linksCol}>
      <h4 className={styles.listTitle}>{title}</h4>
      <ul>
        {parseLinks(value).map((link) => {
          const href = resolveFooterHref(link, categories)
          const external = isExternalHref(href)

          return (
            <li key={`${link.label}-${href}`}>
              <a
                href={href}
                {...(external && /^https?:/i.test(href)
                  ? { target: '_blank', rel: 'noreferrer' }
                  : {})}
              >
                {link.label}
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.aboutCol}>
            <h3 className={styles.brandName}>{settings.brandName}</h3>
            <p className={styles.description}>{settings.footerDescription}</p>
            {settings.enamadImageUrl && (
              <div className={styles.enamad}>
                <OptimizedImage src={settings.enamadImageUrl} alt="نماد اعتماد الکترونیکی" width={75} height={75} sizes="75px" />
              </div>
            )}
          </div>

          <div className={styles.linksGroup}>
            {group('دسته‌بندی‌ها', settings.categoryLinks)}
            {group('خودروها', settings.vehicleLinks)}
            {group('دسترسی سریع', settings.quickLinks)}
          </div>
        </div>

        <div className={styles.bottomSection}>
          <div className={styles.phoneBox}>
            <IconPhone size={20} />
            <span>تلفن پشتیبانی:</span>
            <a href={`tel:${settings.supportPhone}`} dir="ltr" className={styles.phoneNumber}>{settings.supportPhoneDisplay}</a>
          </div>

          <div className={styles.socials}>
            {settings.linkedinUrl && <a href={settings.linkedinUrl} target="_blank" rel="noreferrer" aria-label="لینکدین"><IconBrandLinkedin size={22} /></a>}
            {settings.telegramUrl && <a href={settings.telegramUrl} target="_blank" rel="noreferrer" aria-label="تلگرام"><IconBrandTelegram size={22} /></a>}
            {settings.instagramUrl && <a href={settings.instagramUrl} target="_blank" rel="noreferrer" aria-label="اینستاگرام"><IconBrandInstagram size={22} /></a>}
          </div>
        </div>
      </div>
    </footer>
  )
}
