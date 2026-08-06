
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import {
  useDispatch,
  useSelector,
} from 'react-redux';

import type {
  AppDispatch,
  RootState,
} from '@/store';

import {
  fetchCategories,
} from '@/store/feature/Category/categoryThunks';

import {
  clearModels,
} from '@/store/feature/vehicle/VehicleSlice';

import {
  getAllMakes,
  getModelsByMakeId,
} from '@/store/feature/vehicle/VehicleThunks';

export const useHeroSearch = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const rawCategories = useSelector(
    (state: RootState) =>
      state.category.categories,
  );

  const categoryStatus = useSelector(
    (state: RootState) =>
      state.category.fetchStatus ??
      'idle',
  );

  const rawMakes = useSelector(
    (state: RootState) =>
      state.vehicle.makes,
  );

  const makesStatus = useSelector(
    (state: RootState) =>
      state.vehicle.makesStatus ??
      'idle',
  );

  const rawModels = useSelector(
    (state: RootState) =>
      state.vehicle.models,
  );

  const categories = useMemo(
    () =>
      Array.isArray(rawCategories)
        ? rawCategories
        : [],
    [rawCategories],
  );

  const makes = useMemo(
    () =>
      Array.isArray(rawMakes)
        ? rawMakes
        : [],
    [rawMakes],
  );

  const models = useMemo(
    () =>
      Array.isArray(rawModels)
        ? rawModels
        : [],
    [rawModels],
  );

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState('');

  const [
    selectedMake,
    setSelectedMake,
  ] = useState('');

  const [
    selectedModel,
    setSelectedModel,
  ] = useState('');

  /*
   * فقط idle به معنی «هنوز تلاش نشده» است.
   * failed دیگر باعث Retry خودکار نمی‌شود.
   */
  useEffect(() => {
    if (categoryStatus === 'idle') {
      void dispatch(fetchCategories());
    }

    if (makesStatus === 'idle') {
      void dispatch(getAllMakes());
    }
  }, [
    dispatch,
    categoryStatus,
    makesStatus,
  ]);

  useEffect(() => {
    setSelectedModel('');

    if (!selectedMake) {
      dispatch(clearModels());
      return;
    }

    void dispatch(
      getModelsByMakeId(
        Number(selectedMake),
      ),
    );
  }, [
    selectedMake,
    dispatch,
  ]);

  const handleSearch = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const basePath =
      selectedCategory
        ? `/products/${selectedCategory}`
        : '/products';

    const params =
      new URLSearchParams();

    if (selectedMake) {
      params.set(
        'make',
        selectedMake,
      );
    }

    if (selectedModel) {
      params.set(
        'model',
        selectedModel,
      );
    }

    const queryString =
      params.toString();

    router.push(
      queryString
        ? `${basePath}?${queryString}`
        : basePath,
    );
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

    handleSearch,
  };
};
