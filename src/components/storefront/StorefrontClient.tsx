'use client';

import { useState } from 'react';
import Link from 'next/link';
import { VitrinaLogo } from '@/components/brand/VitrinaLogo';
import type { Product } from '@/lib/db/schema';

interface CartItem {
  product: Product;
  quantity: number;
}

interface StorefrontProps {
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
  products: Product[];
}

export function StorefrontClient({ tenant, products }: StorefrontProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#3F44CD');

  // Derive unique categories
  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts =
    selectedCategory === 'ALL'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const featuredProduct = products.find((p) => p.isFeatured) || products[0];

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Generate WhatsApp Order Message
  const generateWhatsAppLink = () => {
    if (cart.length === 0) return '#';
    const lines = cart.map(
      (item) => `• ${item.quantity}x ${item.product.name} - $${(item.product.price / 100).toFixed(2)} USD`
    );
    const message = encodeURIComponent(
      `Hola *${tenant.name}*, deseo realizar el siguiente pedido desde su Vitrina:\n\n` +
        lines.join('\n') +
        `\n\n*Total a pagar:* $${(totalAmount / 100).toFixed(2)} USD\n\n¿Cuáles son los métodos de pago disponibles?`
    );
    return `https://wa.me/?text=${message}`;
  };

  return (
    <div className="min-h-screen bg-[#070815] text-slate-100 selection:bg-[#3F44CD] selection:text-white relative">
      {/* Ambient background glows (Apple Keynote style) */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-[#3F44CD]/20 via-[#18193F]/10 to-transparent blur-[160px] pointer-events-none -z-10" />

      {/* Floating Header */}
      <header className="sticky top-0 z-40 bg-[#070815]/80 backdrop-blur-2xl border-b border-white/[0.06] transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href={`/store/${tenant.slug}`} className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-2xl bg-[#3F44CD]/20 border border-[#3F44CD]/40 flex items-center justify-center font-serif font-bold text-white text-base shadow-glow group-hover:scale-105 transition">
                {tenant.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="font-serif font-bold text-lg text-white group-hover:text-[#DCE7FD] transition">
                  {tenant.name}
                </h1>
                <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Vitrina Oficial Verificada
                </div>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex px-4 py-2 rounded-full border border-white/10 hover:border-white/20 text-xs text-slate-300 hover:text-white transition"
            >
              Panel del Comerciante
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative px-5 py-2.5 rounded-full bg-white text-[#18193F] font-semibold text-xs uppercase tracking-wider hover:bg-[#E5DEC9] transition shadow-md flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Bolsa</span>
              {totalItems > 0 && (
                <span className="ml-1 w-5 h-5 rounded-full bg-[#3F44CD] text-white text-[11px] font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section Minimalista (Apple / Samsung Flagship) */}
      {featuredProduct && (
        <section className="relative pt-12 pb-20 px-6 max-w-7xl mx-auto w-full">
          <div className="relative rounded-[2.5rem] border border-white/10 bg-[#141638]/60 backdrop-blur-2xl p-8 md:p-14 shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Product Visual */}
              <div className="lg:col-span-6 relative aspect-square max-h-[500px] mx-auto w-full rounded-3xl overflow-hidden bg-gradient-to-br from-[#18193F] to-[#0A0B1A] border border-white/10 flex items-center justify-center group shadow-2xl">
                <img
                  src={featuredProduct.imageUrl}
                  alt={featuredProduct.name}
                  className="object-cover w-full h-full transform group-hover:scale-105 transition duration-700"
                />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#070815]/70 backdrop-blur-md border border-white/10 text-[10px] font-mono uppercase tracking-widest text-white">
                  Producto Insignia
                </div>
              </div>

              {/* Product Editorial Details */}
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#3F44CD] font-semibold">
                    {featuredProduct.category} • Colección Exclusiva
                  </span>
                  <h2 className="text-4xl sm:text-5xl font-serif font-bold text-white mt-2 leading-tight">
                    {featuredProduct.name}
                  </h2>
                  <p className="text-slate-300 text-sm sm:text-base mt-4 leading-relaxed font-light">
                    {featuredProduct.description ||
                      'Diseño arquitectónico con materiales nobles y acabados de alta precisión. Experiencia de compra fluida y entrega prioritaria.'}
                  </p>
                </div>

                {/* Color Variants (Apple style selector) */}
                <div>
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2.5">
                    Variantes de Color
                  </div>
                  <div className="flex items-center gap-3">
                    {[
                      { hex: '#3F44CD', name: 'Cobalt Blue' },
                      { hex: '#18193F', name: 'Midnight Navy' },
                      { hex: '#E5DEC9', name: 'Linen Cream' },
                      { hex: '#1A1A1A', name: 'Space Black' },
                    ].map((col) => (
                      <button
                        key={col.hex}
                        onClick={() => setSelectedColor(col.hex)}
                        title={col.name}
                        className={`w-9 h-9 rounded-full transition transform hover:scale-110 ${
                          selectedColor === col.hex
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-[#141638]'
                            : 'border border-white/20'
                        }`}
                        style={{ backgroundColor: col.hex }}
                      />
                    ))}
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    {featuredProduct.compareAtPrice && (
                      <div className="text-xs text-slate-400 line-through font-mono">
                        ${(featuredProduct.compareAtPrice / 100).toFixed(2)} USD
                      </div>
                    )}
                    <div className="text-4xl font-serif font-bold text-white">
                      ${(featuredProduct.price / 100).toFixed(2)}{' '}
                      <span className="text-sm font-sans font-normal text-slate-400">USD</span>
                    </div>
                  </div>

                  <button
                    onClick={() => addToCart(featuredProduct)}
                    className="px-8 py-4 rounded-full bg-[#3F44CD] hover:bg-[#4D52DE] text-white font-semibold text-xs uppercase tracking-wider transition-all duration-300 shadow-glow flex items-center justify-center gap-2 group"
                  >
                    <span>Agregar a mi Bolsa</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Catalog Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-white/[0.08] gap-4 mb-10">
          <div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Catálogo de la Tienda
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Explora todas las colecciones disponibles de {tenant.name}.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition ${
                  selectedCategory === cat
                    ? 'bg-white text-[#18193F] font-bold'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                {cat === 'ALL' ? 'Todos' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-[#141638]/50 border border-white/[0.08] backdrop-blur-xl rounded-3xl p-5 flex flex-col justify-between hover:border-[#3F44CD]/40 transition-all duration-300 group shadow-lg"
            >
              <div>
                {/* Product Image */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/40 mb-4">
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#070815]/75 backdrop-blur-md text-slate-200 border border-white/10">
                      {prod.category}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <h4 className="font-serif font-bold text-lg text-white group-hover:text-[#DCE7FD] transition leading-snug">
                  {prod.name}
                </h4>
                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {prod.description || 'Producto original con garantía de autenticidad.'}
                </p>
              </div>

              {/* Price & Add Action */}
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <div>
                  {prod.compareAtPrice && (
                    <div className="text-[10px] text-slate-400 line-through font-mono">
                      ${(prod.compareAtPrice / 100).toFixed(2)}
                    </div>
                  )}
                  <div className="font-serif font-bold text-xl text-white">
                    ${(prod.price / 100).toFixed(2)}
                  </div>
                </div>

                <button
                  onClick={() => addToCart(prod)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-[#3F44CD] text-white text-xs font-semibold uppercase tracking-wider border border-white/10 hover:border-transparent transition duration-200 shadow"
                >
                  + Añadir
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Slide-over Shopping Cart (Bolsa de Compras) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-md w-full bg-[#0E1029] border-l border-white/10 shadow-2xl flex flex-col justify-between p-6 sm:p-8 z-50">
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-[#3F44CD]/20 border border-[#3F44CD]/40 flex items-center justify-center font-serif font-bold text-white text-xs">
                  {tenant.name.substring(0, 2).toUpperCase()}
                </div>
                <h3 className="font-serif font-bold text-xl text-white">Tu Bolsa de Compras</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto py-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20 text-slate-400 space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-white/5 flex items-center justify-center text-2xl">
                    🛍️
                  </div>
                  <p className="text-sm">Tu bolsa de compras está vacía.</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-4 py-2 rounded-full bg-white/10 text-white text-xs font-semibold uppercase"
                  >
                    Ver Productos
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] items-center"
                  >
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-xl object-cover bg-black/40 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif font-bold text-sm text-white truncate">
                        {item.product.name}
                      </h4>
                      <div className="text-xs font-mono text-[#DCE7FD] mt-0.5">
                        ${(item.product.price / 100).toFixed(2)} USD
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 text-xs flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="text-xs font-mono px-2 text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 text-xs flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-500 hover:text-rose-400 text-xs p-1"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer & WhatsApp Checkout */}
            {cart.length > 0 && (
              <div className="pt-6 border-t border-white/[0.08] space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="font-mono text-white text-base">
                    ${(totalAmount / 100).toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Envío & Impuestos</span>
                  <span className="text-emerald-400 font-mono">Calculado al coordinar</span>
                </div>
                <div className="flex justify-between items-center text-lg font-serif font-bold text-white pt-2 border-t border-white/[0.04]">
                  <span>Total Estimado</span>
                  <span className="text-2xl">${(totalAmount / 100).toFixed(2)} USD</span>
                </div>

                <a
                  href={generateWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
                >
                  <span>💬 Finalizar Pedido por WhatsApp</span>
                </a>

                <p className="text-[11px] text-center text-slate-500">
                  Atención directa y segura con el equipo de {tenant.name}.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#05050F] py-12 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <VitrinaLogo size="sm" theme="color" />
            <span>&copy; {new Date().getFullYear()} {tenant.name}. Todos los derechos reservados.</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-slate-400">Vitrina White-Label by BrayLabs</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
