import { SearchSuggestion } from "@/models/search/SearchSuggestion";
import axiosInstance from "@/services/api/common/axiosInstance";

// در صورت تمایل می‌توانید این اینترفیس را به پوشه models منتقل کنید


// نگهداری کنترلر در سطح ماژول برای لغو درخواست‌های قبلی همین متد
let searchAbortController: AbortController | null = null;

export const searchApi = {
  // دریافت پیشنهادات جستجو
  getSuggestions: async (query: string, limit: number = 5) => {
    // اگر درخواست قبلی هنوز در جریان است، آن را لغو کن
    if (searchAbortController) {
      searchAbortController.abort();
    }
    searchAbortController = new AbortController();

    try {
      const response = await axiosInstance.get<SearchSuggestion[]>('/search/suggestions', {
        params: { q: query, limit },
        signal: searchAbortController.signal,
      });
      return response.data;
    } catch (error: any) {
      // اگر خطا به خاطر لغو درخواست (Abort) بود، خطای خالی برگردان تا استیت خراب نشود
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        return [];
      }
      // در غیر این صورت خطا را به کامپوننت پاس بده (یا لاگ کن)
      console.error('getSuggestions error:', error);
      throw error;
    }
  }
};
