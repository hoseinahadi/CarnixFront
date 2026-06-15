import axiosInstance from '@/services/api/common/axiosInstance';

export const commentApi = {
  // دریافت دیدگاه‌های کاربر
  getMyComments: async (page: number = 1, pageSize: number = 10) =>
    await axiosInstance.get('/UserComments/my-comments', {
      params: { page, pageSize }
    }),

  // ویرایش دیدگاه
  updateComment: async (id: number, data: { content: string; rating: number }) =>
    await axiosInstance.put(`/UserComments/my-comments/${id}`, data),

  // حذف دیدگاه
  deleteComment: async (id: number) =>
    await axiosInstance.delete(`/UserComments/my-comments/${id}`),
};