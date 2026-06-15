// features/heroSearch/useHeroSearch.ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store'; // مسیر استور خود را جایگزین کنید

// Thunks
import { fetchCategories } from '@/store/feature/Category/categoryThunks';
import { getAllMakes, getModelsByMakeId } from '@/store/feature/vehicle/VehicleThunks'; // مسیر دقیق را چک کنید
import { clearModels } from '@/store/feature/vehicle/VehicleSlice';

export const useHeroSearch = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const categories = useSelector((state: RootState) => state.category?.categories || []);
  const makes = useSelector((state: RootState) => state.vehicle?.makes || []);
  const models = useSelector((state: RootState) => state.vehicle?.models || []);

  // Local States
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');

  // Initial Fetch: دریافت دسته‌بندی‌ها و برندهای خودرو در زمان لود کامپوننت
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(getAllMakes());
  }, [dispatch]);

  // Handle Make Change: وقتی برند خودرو عوض می‌شود، مدل‌های آن دریافت شود
  useEffect(() => {
    if (selectedMake) {
      dispatch(getModelsByMakeId(Number(selectedMake)));
      setSelectedModel(''); // پاک کردن مدل انتخابی قبلی
    } else {
      dispatch(clearModels()); // اگر برندی انتخاب نشد، لیست مدل‌ها خالی شود
    }
  }, [selectedMake, dispatch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // ساخت کوئری استرینگ بر اساس مقادیر انتخاب شده
    const params = new URLSearchParams();
    if (selectedCategory) params.append('category', selectedCategory);
    if (selectedMake) params.append('make', selectedMake);
    if (selectedModel) params.append('model', selectedModel);

    // انتقال کاربر به صفحه نتایج جستجو (مثلاً /products یا /search)
    router.push(`/products?${params.toString()}`);
  };

  return {
    categories,
    makes,
    models,
    selectedCategory,
    setSelectedCategory,
    selectedMake,
    setSelectedMake,
    selectedModel,
    setSelectedModel,
    handleSearch
  };
};
