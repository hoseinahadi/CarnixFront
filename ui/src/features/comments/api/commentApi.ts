import axiosServer from '@/services/api/common/axiosServer';

export const commentApi = {
  // دریافت دیدگاه‌های کاربر
  getMyComments: async (page: number = 1, pageSize: number = 10) =>
    await axiosServer.get('/UserComments/my-comments', {
      params: { page, pageSize }
    }),

  // ویرایش دیدگاه
  updateComment: async (id: number, data: { content: string; rating: number }) =>
    await axiosServer.put(`/UserComments/my-comments/${id}`, data),

  // حذف دیدگاه
  deleteComment: async (id: number) =>
    await axiosServer.delete(`/UserComments/my-comments/${id}`),
};