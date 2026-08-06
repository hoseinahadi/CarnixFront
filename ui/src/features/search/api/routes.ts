import { SearchSuggestion } from "@/models/search/SearchSuggestion";
import axiosClient from "@/services/api/common/axiosClient"; // 🟢 جایگزین شد

export const searchApi = {
  // 🟢 پارامتر signal اضافه شد تا کامپوننت بتواند مستقیماً درخواست را کنترل کند
  getSuggestions: async (query: string, signal?: AbortSignal, limit: number = 5) => {
    try {
      const response = await axiosClient.get<SearchSuggestion[]>('/search/suggestions', {
        params: { q: query, limit },
        signal: signal, // 🟢 سیگنال اختصاصیِ هر رندر به Axios پاس داده می‌شود
      });
      
      // توجه: اگر بک‌اند شما دیتا را داخل یک آبجکت data برمی‌گرداند، این خط را به response.data.data تغییر دهید
      return response.data; 
      
    } catch (error: any) {
      // 🟢 اگر خطا به خاطر لغو درخواست (Abort) بود، آرایه خالی برگردان تا استیت خراب نشود
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED' || error.name === 'AbortError') {
        return [];
      }
      
      // در غیر این صورت خطا را به کامپوننت پاس بده (یا لاگ کن)
      console.error('getSuggestions error:', error);
      throw error;
    }
  }
};