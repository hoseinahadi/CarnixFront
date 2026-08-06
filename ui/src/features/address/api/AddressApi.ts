// features/address/api/AddressApi.ts

import axiosClient from '@/services/api/common/axiosClient';
import type { AddressResponseDto } from '@/models/address/AddressResponseDto';
import type { CreateAddressDto } from '@/models/address/CreateAddressDto';
import type { UpdateAddressDto } from '@/models/address/UpdateAddressDto';
import { OperationResult } from '@/models/common/OperationResult';

export const AddressApi = {
  // دریافت همه آدرس‌های کاربر
  getAll: async () =>
    await axiosClient.get<OperationResult<AddressResponseDto[]>>('/addresses/GetAll'),

  // دریافت یک آدرس با شناسه
  getById: async (id: number) =>
    await axiosClient.get<OperationResult<AddressResponseDto>>(`/addresses/GetById/${id}`),

  // ایجاد آدرس جدید
  create: async (data: CreateAddressDto) =>
    await axiosClient.post<OperationResult<AddressResponseDto>>('/addresses/create', data),

  // ویرایش آدرس
  update: async (id: number, data: UpdateAddressDto) =>
    await axiosClient.put<OperationResult<AddressResponseDto>>(`/addresses/update/${id}`, data),

  // حذف آدرس
  delete: async (id: number) =>
    await axiosClient.delete<OperationResult<boolean>>(`/addresses/delete/${id}`),

  // تنظیم آدرس پیش‌فرض
  setDefault: async (id: number) =>
    await axiosClient.put<OperationResult<boolean>>(`/addresses/SetDefault/${id}`, {}),
};