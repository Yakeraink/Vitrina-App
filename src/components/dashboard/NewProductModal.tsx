'use client';

import { useState } from 'react';
import { createProductAction } from '@/app/actions/product';

const PRESET_IMAGES = [
  { label: 'Bolso de Lujo', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80' },
  { label: 'Reloj Cronógrafo', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80' },
  { label: 'Sneakers Minimalistas', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80' },
  { label: 'Gafas de Sol', url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80' },
  { label: 'Perfume Noir', url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80' },
  { label: 'Audífonos Titanium', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' },
];

export function NewProductModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(PRESET_IMAGES[0].url);
  const [customImage, setCustomImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-5 py-2.5 rounded-xl bg-[#3F44CD] hover:bg-[#4D52DE] text-white text-xs font-semibold uppercase tracking-wider transition shadow-glow flex items-center gap-2"
      >
        <span>+ Nuevo Producto</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          <div className="relative bg-[#0E1029] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl z-50 text-slate-100">
            <div className="flex justify-between items-center pb-4 border-b border-white/[0.08] mb-6">
              <div>
                <h3 className="font-serif font-bold text-xl text-white">Publicar Nuevo Producto</h3>
                <p className="text-xs text-slate-400 mt-0.5">Se mostrará de inmediato en tu vitrina pública.</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form
              action={async (formData) => {
                setIsSubmitting(true);
                formData.set('imageUrl', customImage.trim() || selectedImage);
                await createProductAction(formData);
                setIsSubmitting(false);
                setIsOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nombre del Producto *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Ej: Cartera Minimalista Obsidian"
                  className="w-full bg-[#141638] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#3F44CD]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Precio ($ USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    required
                    placeholder="120.00"
                    className="w-full bg-[#141638] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#3F44CD]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Precio Anterior / Oferta</label>
                  <input
                    type="number"
                    step="0.01"
                    name="compareAtPrice"
                    placeholder="150.00"
                    className="w-full bg-[#141638] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#3F44CD]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Categoría</label>
                  <select
                    name="category"
                    className="w-full bg-[#141638] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#3F44CD]"
                  >
                    <option value="General">General</option>
                    <option value="Bolsos">Bolsos</option>
                    <option value="Relojes">Relojes</option>
                    <option value="Calzado">Calzado</option>
                    <option value="Ropa">Ropa</option>
                    <option value="Accesorios">Accesorios</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Stock Disponible</label>
                  <input
                    type="number"
                    name="stock"
                    defaultValue="10"
                    className="w-full bg-[#141638] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#3F44CD]"
                  />
                </div>
              </div>

              {/* Preset Image Chooser */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Selecciona Imagen de Lujo</label>
                <div className="grid grid-cols-6 gap-2 mb-2">
                  {PRESET_IMAGES.map((img, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => {
                        setSelectedImage(img.url);
                        setCustomImage('');
                      }}
                      className={`relative aspect-square rounded-xl overflow-hidden border transition ${
                        selectedImage === img.url && !customImage
                          ? 'ring-2 ring-[#3F44CD] border-transparent scale-105'
                          : 'border-white/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  placeholder="O pega una URL de imagen personalizada..."
                  value={customImage}
                  onChange={(e) => setCustomImage(e.target.value)}
                  className="w-full bg-[#141638] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#3F44CD]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Descripción Corta</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Materiales de confección, corte o garantía de la prenda..."
                  className="w-full bg-[#141638] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#3F44CD]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  name="isFeatured"
                  className="rounded bg-[#141638] border-white/20 text-[#3F44CD] focus:ring-0"
                />
                <label htmlFor="isFeatured" className="text-xs text-slate-300 cursor-pointer">
                  Destacar como Producto Insignia en el Hero Principal
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-[#3F44CD] hover:bg-[#4D52DE] text-white text-xs font-semibold uppercase tracking-wider transition shadow-glow disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Publicar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
