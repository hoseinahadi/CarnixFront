// src/app/(shop)/cart/page.tsx

import { Suspense } from "react";

import CartPage from "@/views/Cart/CartPage";




export default function CartRoute() {
  return (
    <Suspense fallback={null}>
      <CartPage />
    </Suspense>
  );
}
