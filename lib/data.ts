export type Category = {
  id: string;
  name: string;
  description: string;
  image: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  ingredients: string[];
  allergens: string[];
  price: number;
  badge: string;
  featured: boolean;
  image: string;
  stock: string;
  prepTime: string;
};

export const categories: Category[] = [
  {
    id: 'pan-artesanal',
    name: 'Pan artesanal',
    description: 'Harina, masa madre y tradición en cada pieza.',
    image:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'pasteles',
    name: 'Pasteles',
    description: 'Repostería suave con sabores que enamoran.',
    image:
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'tortas',
    name: 'Tortas personalizadas',
    description: 'Diseños únicos para celebraciones y momentos especiales.',
    image:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'bolleria',
    name: 'Bollería',
    description: 'Texturas doradas y rellenos irresistibles.',
    image:
      'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'galletas',
    name: 'Galletas',
    description: 'Pequeños placeres para compartir en cualquier momento.',
    image:
      'https://images.unsplash.com/photo-1499636136210-6d4ee1b0f4be?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'salados',
    name: 'Productos salados',
    description: 'Opciones para desayuno, brunch y reuniones.',
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'cafe',
    name: 'Cafetería y bebidas',
    description: 'Infusiones y bebidas para acompañar cada bocado.',
    image:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
  },
];

export const products: Product[] = [
  {
    id: '1',
    slug: 'pan-masa-madre',
    name: 'Pan de masa madre',
    category: 'Pan artesanal',
    description: 'Pan casero con miga suave y corteza dorada, horneado con masa madre natural.',
    ingredients: ['Harina de trigo', 'Masa madre', 'Agua', 'Sal'],
    allergens: ['Gluten'],
    price: 3800,
    badge: 'Más vendido',
    featured: true,
    image:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
    stock: 'Disponible hoy',
    prepTime: '2 horas',
  },
  {
    id: '2',
    slug: 'croissant-clasico',
    name: 'Croissant clásico',
    category: 'Bollería',
    description: 'Capas hojaldradas y doradas, ideales para un desayuno gourmet.',
    ingredients: ['Harina', 'Mantequilla', 'Levadura', 'Leche'],
    allergens: ['Gluten', 'Lácteos'],
    price: 2600,
    badge: 'Nuevo',
    featured: true,
    image:
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80',
    stock: '12 unidades',
    prepTime: '90 minutos',
  },
  {
    id: '3',
    slug: 'torta-cumpleanos',
    name: 'Torta de cumpleaños',
    category: 'Tortas personalizadas',
    description: 'Torta de vainilla con capas de crema, decorada a medida para tu celebración.',
    ingredients: ['Huevos', 'Harina', 'Leche', 'Crema', 'Frutas'],
    allergens: ['Gluten', 'Lácteos', 'Huevos'],
    price: 48900,
    badge: 'Oferta',
    featured: true,
    image:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80',
    stock: 'Pedido especial',
    prepTime: '24 horas',
  },
  {
    id: '4',
    slug: 'galletas-avena',
    name: 'Galletas de avena y miel',
    category: 'Galletas',
    description: 'Crujientes por fuera y suaves por dentro, con un toque de miel natural.',
    ingredients: ['Avena', 'Miel', 'Harina', 'Canela'],
    allergens: ['Gluten', 'Sésamo'],
    price: 4200,
    badge: 'Más vendido',
    featured: false,
    image:
      'https://images.unsplash.com/photo-1499636136210-6d4ee1b0f4be?auto=format&fit=crop&w=900&q=80',
    stock: '18 paquetes',
    prepTime: '45 minutos',
  },
  {
    id: '5',
    slug: 'empanada-queso',
    name: 'Empanada de queso',
    category: 'Productos salados',
    description: 'Masa dorada rellena de queso fundido y cebollín.',
    ingredients: ['Harina', 'Queso', 'Cebollín', 'Aceite'],
    allergens: ['Gluten', 'Lácteos'],
    price: 2800,
    badge: 'Nuevo',
    featured: false,
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
    stock: '10 unidades',
    prepTime: '75 minutos',
  },
  {
    id: '6',
    slug: 'cafe-latte',
    name: 'Café latte',
    category: 'Cafetería y bebidas',
    description: 'Café espresso con leche cremosa y espuma suave.',
    ingredients: ['Café', 'Leche', 'Espuma'],
    allergens: ['Lácteos'],
    price: 3200,
    badge: 'Especial',
    featured: true,
    image:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
    stock: 'Disponible',
    prepTime: '15 minutos',
  },
  {
    id: '7',
    slug: 'pastel-queso',
    name: 'Pastel de queso',
    category: 'Pasteles',
    description: 'Un clásico con base de galleta y relleno suave de queso crema.',
    ingredients: ['Queso crema', 'Galleta', 'Crema', 'Frutos'],
    allergens: ['Gluten', 'Lácteos'],
    price: 14500,
    badge: 'Oferta',
    featured: false,
    image:
      'https://images.unsplash.com/photo-1533134242443-d6c0e1eaf3ef?auto=format&fit=crop&w=900&q=80',
    stock: '6 porciones',
    prepTime: '4 horas',
  },
  {
    id: '8',
    slug: 'buñuelo-dulce',
    name: 'Buñuelo dulce',
    category: 'Bollería',
    description: 'Bollería esponjosa con azúcar y canela, ideal para compartir.',
    ingredients: ['Harina', 'Levadura', 'Azúcar', 'Canela'],
    allergens: ['Gluten'],
    price: 2400,
    badge: 'Clásico',
    featured: true,
    image:
      'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=900&q=80',
    stock: '8 unidades',
    prepTime: '60 minutos',
  },
];

export const testimonials = [
  {
    name: 'María G.',
    text: 'La calidad del pan es excelente y el servicio es impecable. Pedimos una torta para cumpleaños y quedó espectacular.',
  },
  {
    name: 'José C.',
    text: 'Siempre nos sorprenden con la variedad y la atención. Todo llega en perfectas condiciones y con mucho cariño.',
  },
  {
    name: 'Ana R.',
    text: 'El lugar tiene un ambiente muy cálido y los productos se sienten hechos con dedicación. Lo recomiendo.',
  },
];

export const promos = [
  'Combo desayuno + café + pan artesanal por $9.990',
  '30% de descuento en pedidos de tortas para este mes',
  'Envío gratis en compras superiores a $25.000',
];

export const dashboardMetrics = [
  { label: 'Ventas del día', value: '$42.300', trend: '+12%' },
  { label: 'Ventas de la semana', value: '$286.500', trend: '+18%' },
  { label: 'Ventas del mes', value: '$1.240.000', trend: '+24%' },
  { label: 'Pedidos pendientes', value: '18', trend: '+4' },
];

export const adminOrders = [
  { id: '#P-1042', client: 'Valentina Silva', state: 'Pago parcial recibido', total: '$48.000' },
  { id: '#P-1043', client: 'Francisco Díaz', state: 'Pedido confirmado', total: '$27.800' },
  { id: '#P-1044', client: 'Andrea López', state: 'En preparación', total: '$64.500' },
  { id: '#P-1045', client: 'Mateo Rojas', state: 'Listo para retirar', total: '$19.900' },
];

export const paymentProviders = ['Stripe', 'Mercado Pago', 'Transbank', 'Webpay', 'Khipu'];
