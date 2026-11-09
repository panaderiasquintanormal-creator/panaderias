import type { Product } from '@/lib/data';

export type CartItem = {
  product: Product;
  quantity: number;
};

const CART_STORAGE_KEY = 'panaderia-cart-v1';
const CART_UPDATED_EVENT = 'panaderia-cart-updated';

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isCartItem(value: unknown): value is CartItem {
  if (
    typeof value !== 'object'
    || value === null
    || !('product' in value)
    || !('quantity' in value)
    || typeof value.quantity !== 'number'
    || !Number.isInteger(value.quantity)
    || value.quantity < 1
    || typeof value.product !== 'object'
    || value.product === null
  ) {
    return false;
  }

  const product = value.product;
  return 'id' in product
    && typeof product.id === 'string'
    && 'slug' in product
    && typeof product.slug === 'string'
    && 'name' in product
    && typeof product.name === 'string'
    && 'category' in product
    && typeof product.category === 'string'
    && 'description' in product
    && typeof product.description === 'string'
    && 'ingredients' in product
    && isStringArray(product.ingredients)
    && 'allergens' in product
    && isStringArray(product.allergens)
    && 'price' in product
    && typeof product.price === 'number'
    && Number.isFinite(product.price)
    && product.price >= 0
    && 'badge' in product
    && typeof product.badge === 'string'
    && 'featured' in product
    && typeof product.featured === 'boolean'
    && 'image' in product
    && typeof product.image === 'string'
    && 'stock' in product
    && typeof product.stock === 'string'
    && 'prepTime' in product
    && typeof product.prepTime === 'string';
}

export function getCartSnapshot() {
  try {
    return window.localStorage.getItem(CART_STORAGE_KEY) ?? '';
  } catch {
    return '!unavailable';
  }
}

export function parseCartSnapshot(raw: string): CartItem[] {
  if (!raw) return [];
  if (raw === '!unavailable') throw new Error('El almacenamiento local no está disponible en este navegador.');
  const value: unknown = JSON.parse(raw);
  if (!Array.isArray(value)) throw new Error('El carrito guardado está dañado; límpialo para continuar.');
  if (!value.every(isCartItem)) throw new Error('El carrito guardado contiene datos inválidos; límpialo para continuar.');
  return value;
}

export function readCart(): CartItem[] {
  return parseCartSnapshot(getCartSnapshot());
}

export function writeCart(items: CartItem[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function subscribeToCart(callback: () => void) {
  window.addEventListener(CART_UPDATED_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(CART_UPDATED_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}
