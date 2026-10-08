import { notFound } from 'next/navigation';
import { ProductService } from '@/modules/product/service';
import { StorefrontClient } from '@/components/storefront/StorefrontClient';

interface StorefrontPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function StorefrontPage({ params }: StorefrontPageProps) {
  const { slug } = await params;

  const data = await ProductService.getStorefrontProductsBySlug(slug);

  if (!data) {
    notFound();
  }

  return <StorefrontClient tenant={data.tenant} products={data.products} />;
}
