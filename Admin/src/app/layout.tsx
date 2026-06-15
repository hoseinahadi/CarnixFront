// src/app/layout.tsx
'use client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import { prefixer } from 'stylis'
import rtlPlugin from 'stylis-plugin-rtl'
import ReduxProvider from '../redux/providers/ReduxProvider'
import '../styles/main.scss'

const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'yekan, Arial, sans-serif',
  },
})

const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <CacheProvider value={cacheRtl}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <ReduxProvider>
              {children}
            </ReduxProvider>
          </ThemeProvider>
        </CacheProvider>
      </body>
    </html>
  )
}
