import { cache } from 'react';

import type { OperationResult } from '@/models/common/OperationResult';
import type { ProductDetails } from '@/models/product/ProductDetails';
import axiosServer from '@/services/api/common/axiosServer';

interface ProductOperationResult extends OperationResult<ProductDetails> {
  mainResults?: ProductDetails;
}

function getProductFromResponse(
  response: ProductOperationResult,
): ProductDetails | null {
  if (!response.isSuccess) {
    return null;
  }

  return response.data ?? response.mainResults ?? null;
}

/**
 * یک درخواست محصول در طول Render همان Request سرور.
 *
 * چون پروژه برای درخواست سروری از Axios استفاده می‌کند، Next.js نمی‌تواند
 * مثل fetch آن را خودکار Memoize کند. React cache باعث می‌شود فراخوانی یکسان
 * در generateMetadata و Page فقط یک بار به بک‌اند برسد.
 */
export const getProductBySlugServer = cache(
  async (slug: string): Promise<ProductDetails | null> => {
    const normalizedSlug = slug.trim();

    if (!normalizedSlug) {
      return null;
    }

    const response = await axiosServer.get<ProductOperationResult>(
      `/Product/${encodeURIComponent(normalizedSlug)}`,
    );

    if (response.status >= 400) {
      return null;
    }

    return getProductFromResponse(response.data);
  },
);

