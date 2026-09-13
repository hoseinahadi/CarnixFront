import { Suspense } from 'react';
import BlogDetailContent from './BlogDetailContent';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const { ContentManagerApi } = await import('@/features/content/api/ContentManagerApi');
    const response = await ContentManagerApi.getAllContents();
    
    if (response.data?.isSuccess && Array.isArray(response.data.data)) {
      return response.data.data.map((article: any) => ({
        slug: String(article.slug || article.id),
      }));
    }
  } catch (error) {
    if (process.env.STRICT_SSG_DATA === 'true') {
      throw new Error('Blog data is required for strict static generation', { cause: error });
    }
    console.warn('Could not fetch blog posts for static generation; paths will be generated on demand.', error);
  }
  return [];
}

export const dynamicParams = true;

export default function BlogDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div>در حال بارگذاری مقاله...</div>}>
      <BlogDetailContent params={params} />
    </Suspense>
  );
}
