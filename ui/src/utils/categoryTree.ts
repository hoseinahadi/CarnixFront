import type { Category } from '@/models/category/Category';

/**
 * Category/menu API returns a tree. Product routes and active filter tags,
 * however, may point to any nested category. These helpers resolve a node
 * from the entire tree instead of looking only at root categories.
 */
export const flattenCategoryTree = (
  categories: Category[],
): Category[] => {
  const result: Category[] = [];
  const visited = new Set<number>();

  const walk = (nodes: Category[] | undefined) => {
    if (!Array.isArray(nodes)) {
      return;
    }

    for (const category of nodes) {
      if (!category) {
        continue;
      }

      const id = Number(category.categoryId);

      // Defensive protection against malformed/cyclic API trees.
      if (Number.isFinite(id) && visited.has(id)) {
        continue;
      }

      if (Number.isFinite(id)) {
        visited.add(id);
      }

      result.push(category);
      walk(category.subCategories);
    }
  };

  walk(categories);
  return result;
};

export const findCategoryById = (
  categories: Category[],
  categoryId: number | string,
): Category | undefined => {
  const targetId = Number(categoryId);

  if (!Number.isFinite(targetId)) {
    return undefined;
  }

  return flattenCategoryTree(categories).find(
    (category) => Number(category.categoryId) === targetId,
  );
};

export const findCategoryBySlugOrName = (
  categories: Category[],
  value: string,
): Category | undefined => {
  const target = value.trim();

  if (!target) {
    return undefined;
  }

  return flattenCategoryTree(categories).find((category) => {
    const slug = category.slug?.trim();
    const name = category.name?.trim();

    return slug === target || name === target;
  });
};
