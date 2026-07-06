"use client";

import { useStore } from "@/store/useStore";
import { toast } from "sonner";
import { useState, useEffect, Suspense } from "react";
import Header from "../components/Header";
import { Filter, Star, ShoppingCart, SearchX, Heart } from "lucide-react";
import { useSearchParams } from "next/navigation";

function ProductGrid({ categoryFilter, maxPrice }: { categoryFilter: string, maxPrice: number }) {
  const products = useStore((state) => state.products);
  const addToCart = useStore((state) => state.addToCart);
  const wishlist = useStore((state) => state.wishlist || []);
  const toggleWishlist = useStore((state) => state.toggleWishlist);
  const isInWishlist = (id: string) => wishlist.some(p => p.id === id);
  const searchParams = useSearchParams();
  let query = searchParams.get('q');
  if (query) {
     try {
        query = decodeURIComponent(query);
     } catch (e) {}
  }
  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const handleAddToCart = (product: any) => {
     addToCart(product);
     toast.success(`${product.name} added to cart`);
  };

  let filteredProducts = products || [];

  // 1. Search Query Filter
  if (query) {
     filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase()));
  }

  // 2. Category Filter
  if (categoryFilter !== 'All Products') {
     filteredProducts = filteredProducts.filter(p => p.category === categoryFilter);
  }

  // 3. Price Filter
  filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);

  if (!isMounted) {
    return (
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-2xl h-[300px] shadow-sm animate-pulse"></div>)}
      </div>
    );
  }

  return (
    <div className="flex-1">
           <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-[#1A233A]">
                {query ? `Search results for "${query}"` : 'All Products'} 
                <span className="text-gray-400 font-normal text-lg ml-2">({filteredProducts.length})</span>
              </h1>
              <select className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]">
                 <option>Sort by: Featured</option>
                 <option>Price: Low to High</option>
                 <option>Price: High to Low</option>
              </select>
           </div>

           {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
                 <SearchX className="w-16 h-16 text-gray-300 mb-4" />
                 <h2 className="text-xl font-bold text-[#1A233A] mb-2">No products found</h2>
                 <p className="text-gray-500">We couldn't find anything matching "{query}". Try adjusting your search.</p>
              </div>
           ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#FF7A00]/30 transition-all group flex flex-col">
                  {/* Image Area */}
                  <div className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center text-7xl mb-4 relative overflow-hidden p-4 group-hover:bg-gray-100 transition-colors">
                     {product.image.startsWith('data:') ? (
                        <img src={product.image} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
                     ) : (
                        <span className="group-hover:scale-110 transition-transform duration-300">{product.image}</span>
                     )}
                     
                     {/* Wishlist Button */}
                     <button onClick={() => toggleWishlist(product)} className="absolute top-3 right-3 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition-all z-10">
                        <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                     </button>
                     
                     {/* Floating Quick Action */}
                     <div className="absolute bottom-4 right-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <button onClick={() => handleAddToCart(product)} className="bg-[#FF7A00] text-white p-3 rounded-full shadow-lg hover:bg-[#FF9900] hover:scale-110 transition-all">
                           <ShoppingCart className="w-5 h-5" />
                        </button>
                     </div>
                  </div>
                  
                  {/* Content Area */}
                  <div className="flex flex-col flex-1">
                     <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">{product.category}</span>
                     <h3 className="font-bold text-[#1A233A] text-lg leading-tight mb-2 line-clamp-2">{product.name}</h3>
                     
                     <div className="flex items-center gap-1 mb-3">
                        <Star className="w-4 h-4 fill-[#FF7A00] text-[#FF7A00]" />
                        <span className="text-sm font-bold text-[#1A233A]">{product.rating}</span>
                        <span className="text-sm text-gray-400 ml-1">({Math.floor(Math.random() * 500)})</span>
                     </div>

                     <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-2xl font-extrabold text-[#1A233A]">${product.price.toFixed(2)}</span>
                        
                        {/* Mobile Add to cart (visible only on small screens without hover) */}
                        <button onClick={() => handleAddToCart(product)} className="lg:hidden text-[#FF7A00] font-bold text-sm bg-[#FF7A00]/10 px-4 py-2 rounded-lg">
                           Add
                        </button>
                     </div>
                  </div>
                </div>
              ))}
           </div>
           )}
        </div>
  );
}

export default function ProductCatalog() {
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [maxPrice, setMaxPrice] = useState(1000);

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <Header />
      <main className="flex-1 max-w-[1500px] w-full mx-auto px-4 md:px-8 py-8 flex gap-8">
        <aside className="w-64 hidden lg:block flex-shrink-0">
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <div className="flex items-center gap-2 font-bold text-[#1A233A] mb-6 border-b border-gray-100 pb-4">
                 <Filter className="w-5 h-5 text-[#FF7A00]" /> Filters
              </div>
              <div className="space-y-6">
                  <div>
                     <h4 className="font-bold text-[#1A233A] mb-3 text-sm">Categories</h4>
                     <div className="space-y-2">
                        {['All Products', 'Electronics', 'Accessories', 'Furniture', 'Fashion', 'Home & Living'].map((cat) => (
                           <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                              <input 
                                 type="radio" 
                                 name="cat" 
                                 checked={selectedCategory === cat}
                                 onChange={() => setSelectedCategory(cat)}
                                 className="w-4 h-4 text-[#FF7A00] focus:ring-[#FF7A00] accent-[#FF7A00]" 
                              />
                              <span className="text-gray-600 text-sm group-hover:text-[#FF7A00] transition-colors">{cat}</span>
                           </label>
                        ))}
                     </div>
                  </div>
                  <div>
                     <h4 className="font-bold text-[#1A233A] mb-3 text-sm">Max Price: ${maxPrice}</h4>
                     <input 
                        type="range" 
                        min="0" 
                        max="1000" 
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                        className="w-full accent-[#FF7A00]" 
                     />
                     <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>$0</span>
                        <span>$1000</span>
                     </div>
                  </div>
              </div>
           </div>
        </aside>
        
        <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
          <ProductGrid categoryFilter={selectedCategory} maxPrice={maxPrice} />
        </Suspense>
      </main>
    </div>
  );
}
