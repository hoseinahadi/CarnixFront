// features/address/api/AddressApi.ts

import axiosInstance from '@/services/api/common/axiosInstance';
import type { AddressResponseDto } from '@/models/address/AddressResponseDto';
import type { CreateAddressDto } from '@/models/address/CreateAddressDto';
import type { UpdateAddressDto } from '@/models/address/UpdateAddressDto';
import { OperationResult } from '@/models/common/OperationResult';

export const AddressApi = {
  // دریافت همه آدرس‌های کاربر
  getAll: async () =>
    await axiosInstance.get<OperationResult<AddressResponseDto[]>>('/addresses/GetAll'),

  // دریافت یک آدرس با شناسه
  getById: async (id: number) =>
    await axiosInstance.get<OperationResult<AddressResponseDto>>(`/addresses/GetById/${id}`),

  // ایجاد آدرس جدید
  create: async (data: CreateAddressDto) =>
    await axiosInstance.post<OperationResult<AddressResponseDto>>('/addresses/create', data),

  // ویرایش آدرس
  update: async (id: number, data: UpdateAddressDto) =>
    await axiosInstance.put<OperationResult<AddressResponseDto>>(`/addresses/update/${id}`, data),

  // حذف آدرس
  delete: async (id: number) =>
    await axiosInstance.delete<OperationResult<boolean>>(`/addresses/delete/${id}`),

  // تنظیم آدرس پیش‌فرض
  setDefault: async (id: number) =>
    await axiosInstance.put<OperationResult<boolean>>(`/addresses/SetDefault/${id}`, {}),
};