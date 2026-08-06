// utils/slug.ts
export function createProductSlug(productName: string): string {
  return productName
    .replace(/\s+/g, '-')           // فاصله به dash
    .replace(/\(/g, '-')            // پرانتز باز به dash
    .replace(/\)/g, '')             // حذف پرانتز بسته
    .replace(/--+/g, '-')           // حذف dash های تکراری
    .trim()
}

// نتیجه: "کارتر-روغن-موتور-با-پیچ-تخلیه-EF7-EFD"