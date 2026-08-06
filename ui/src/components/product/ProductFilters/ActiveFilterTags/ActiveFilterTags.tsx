import type { Category } from '@/models/category/Category';

import type {
  ProductFilterParams,
  VehicleFilterOption,
} from '@/models/product/ProductFilters';

import { IconX } from '@tabler/icons-react';

import styles from './ActiveFilterTags.module.scss';

interface ActiveFilterTagsProps {
  filters: ProductFilterParams;
  categories: Category[];
  vehicles: VehicleFilterOption[];
  onRemove: (key: string) => void;
}

const formatPrice = (price: number): string =>
  new Intl.NumberFormat('fa-IR').format(
    Math.round(price),
  );

const ActiveFilterTags = ({
  filters,
  categories,
  vehicles,
  onRemove,
}: ActiveFilterTagsProps) => {
  const tags: Array<{
    key: string;
    label: string;
  }> = [];

  if (filters.categoryId) {
    const category = categories.find(
      (item) =>
        Number(item.categoryId) ===
        Number(filters.categoryId),
    );

    tags.push({
      key: 'categoryId',
      label:
        category?.name ||
        `دسته ${filters.categoryId}`,
    });
  }

  if (filters.brandId) {
    tags.push({
      key: 'brandId',
      label: `برند ${filters.brandId}`,
    });
  }

  if (filters.makeId && filters.modelId) {
    const vehicle = vehicles.find(
      (item) =>
        item.makeId === filters.makeId &&
        item.modelId === filters.modelId,
    );

    tags.push({
      key: 'vehicle',
      label: vehicle?.name || 'خودروی انتخابی',
    });
  }

  if (filters.inStock) {
    tags.push({
      key: 'inStock',
      label: 'کالاهای موجود',
    });
  }

  if (filters.hasDiscount) {
    tags.push({
      key: 'hasDiscount',
      label: 'تخفیف‌دار',
    });
  }

  if (
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined
  ) {
    const minimum = filters.minPrice ?? 0;
    const maximum = filters.maxPrice;

    tags.push({
      key: 'price',
      label:
        maximum !== undefined
          ? `قیمت: ${formatPrice(minimum)} تا ${formatPrice(maximum)}`
          : `قیمت از ${formatPrice(minimum)}`,
    });
  }

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      {tags.map((tag) => (
        <span
          key={tag.key}
          className={styles.tag}
        >
          {tag.label}

          <button
            type="button"
            onClick={() => onRemove(tag.key)}
            className={styles.removeBtn}
            aria-label={`حذف فیلتر ${tag.label}`}
          >
            <IconX size={12} />
          </button>
        </span>
      ))}
    </div>
  );
};

export default ActiveFilterTags;
