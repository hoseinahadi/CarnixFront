import './globals.css';import {AuthProvider} from '@/components/AuthProvider';import {ToastProvider} from '@/components/Toast';
export const metadata={title:'Carnix Admin',description:'پنل مدیریت یکپارچه Carnix'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fa" dir="rtl"><body><ToastProvider><AuthProvider>{children}</AuthProvider></ToastProvider></body></html>}
