'use server';

import { revalidatePath } from 'next/cache';
import { requireTenantContext } from '@/lib/tenant/context';
import { ProductService } from '@/modules/product/service';

export async function createProductAction(formData: FormData) {
  const context = await requireTenantContext();
  const { tenant } = context;

  const name = formData.get('name')?.toString() || '';
  const description = formData.get('description')?.toString() || '';
  const priceDollars = parseFloat(formData.get('price')?.toString() || '0');
  const compareAtDollars = parseFloat(formData.get('compareAtPrice')?.toString() || '0');
  const category = formData.get('category')?.toString() || 'General';
  const stock = parseInt(formData.get('stock')?.toString() || '10', 10);
  let imageUrl = formData.get('imageUrl')?.toString() || '';
  const isFeatured = formData.get('isFeatured') === 'on' || formData.get('isFeatured') === 'true';

  if (!name.trim()) {
    throw new Error('El nombre del producto es requerido');
  }

  if (priceDollars <= 0) {
    throw new Error('El precio debe ser mayor a 0');
  }

  // Fallback elegant placeholder image if not provided
  if (!imageUrl.trim()) {
    imageUrl = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
  }

  await ProductService.createProduct(tenant.id, {
    name,
    description,
    price: Math.round(priceDollars * 100), // convert to cents
    compareAtPrice: compareAtDollars > 0 ? Math.round(compareAtDollars * 100) : undefined,
    imageUrl,
    category,
    stock,
    isFeatured,
  });

  revalidatePath('/dashboard');
  revalidatePath(`/store/${tenant.slug}`);
}

export async function deleteProductAction(formData: FormData) {
  const context = await requireTenantContext();
  const { tenant } = context;
  const productId = formData.get('productId')?.toString() || '';

  if (productId) {
    await ProductService.deleteProduct(tenant.id, productId);
    revalidatePath('/dashboard');
    revalidatePath(`/store/${tenant.slug}`);
  }
}
