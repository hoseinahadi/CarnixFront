import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import ProductDetailPageClient from '@/views/ProductDetail/ProductDetail';
import { getProductBySlugServer } from '@/services/api/product/productServerApi';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

function decodeRouteSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeRouteSlug(slug);

  try {
    const product = await getProductBySlugServer(decodedSlug);

    if (!product) {
      return {
        title: 'محصول یافت نشد | کارنیکس',
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const description =
      product.shortDescription?.trim() ||
      `خرید ${product.productName} با تضمین اصالت کالا از فروشگاه کارنیکس`;

    const mainImage =
      product.images?.find((image) => image.isMain)?.imageUrl ||
      product.images?.[0]?.imageUrl ||
      product.imageUrl;

    return {
      title: `${product.productName} | فروشگاه کارنیکس`,
      description,
      openGraph: {
        type: 'website',
        title: product.productName,
        description,
        images: mainImage
          ? [
              {
                url: mainImage,
                alt: product.productName,
              },
            ]
          : undefined,
      },
    };
  } catch {
    return {
      title: 'فروشگاه کارنیکس',
    };
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeRouteSlug(slug);

  let product = null;

  try {
    product = await getProductBySlugServer(decodedSlug);
  } catch {
    product = null;
  }

  if (!product?.productId) {
    notFound();
  }

  return (
    <main>
      <ProductDetailPageClient initialProduct={product} />
    </main>
  );
}
