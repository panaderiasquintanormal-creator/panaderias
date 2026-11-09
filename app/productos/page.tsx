import { ProductCatalog } from '@/components/product-catalog';
import { getCatalogProducts } from '@/lib/catalog';

export default async function ProductsPage() {
  const products = await getCatalogProducts();

  return (
    <div className="page-shell py-16 text-[#2a1d18]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="section-tag">Catálogo</p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">Nuestros productos favoritos</h1>
        </div>
      </div>

      <ProductCatalog products={products} />
    </div>
  );
}
