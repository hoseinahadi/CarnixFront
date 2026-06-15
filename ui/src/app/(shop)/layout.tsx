// src/app/(shop)/layout.tsx
import Footer from "@/components/layouts/Footer/Footer";
import Header from "@/components/layouts/Header/Header"; // مسیر هدر خود را چک کنید

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {/* برای جلوگیری از تو در تو شدن تگ main، در اینجا از div استفاده می‌کنیم یا تگ main را از داخل page.tsx حذف می‌کنیم */}
      <div className="shop-content">{children}</div> 
      <Footer/>
    </>
  );
}
