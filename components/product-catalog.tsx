'use client';

import { useMemo, useState } from 'react';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/lib/data';

export function ProductCatalog({ products }: { products: Product[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todas');
  const [sort, setSort] = useState('featured');
  const categories = useMemo(() => ['Todas', ...new Set(products.map((product) => product.category))], [products]);

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('es');
    return products
      .filter((product) => category === 'Todas' || product.category === category)
      .filter((product) => !normalizedQuery || `${product.name} ${product.category} ${product.description}`.toLocaleLowerCase('es').includes(normalizedQuery))
      .sort((a, b) => {
        if (sort === 'price-asc') return a.price - b.price;
        if (sort === 'price-desc') return b.price - a.price;
        return Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name, 'es');
      });
  }, [category, products, query, sort]);

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              category === item
                ? 'border-[#b7653e] bg-[#b7653e] text-white'
                : 'border-[#e6d3b9] bg-white text-[#5b4337] hover:border-[#b7653e] hover:text-[#b7653e]'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-10 rounded-[28px] border border-[#f1e3d0] bg-[#fff8f0] p-4 sm:p-6">
        <div className="grid gap-4 md:grid-cols-[1.4fr_0.6fr]">
          <label className="sr-only" htmlFor="catalog-search">Buscar productos</label>
          <input
            id="catalog-search"
            className="form-field"
            placeholder="Buscar por producto o categoría"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <label className="sr-only" htmlFor="catalog-sort">Ordenar productos</label>
          <select id="catalog-sort" className="form-field" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="featured">Destacados</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
          </select>
        </div>
        <p className="mt-3 text-sm text-[#765b4a]" aria-live="polite">
          {visibleProducts.length} {visibleProducts.length === 1 ? 'producto' : 'productos'}
        </p>
      </div>

      {visibleProducts.length > 0 ? (
        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <p className="mt-10 rounded-[24px] border border-[#f1e3d0] bg-white p-8 text-center text-[#5b4337]">
          No encontramos productos con esos filtros.
        </p>
      )}
    </>
  );
}
