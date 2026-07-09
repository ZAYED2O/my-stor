"use client";

import { useStore } from "@/store/useStore";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, ShoppingCart } from "lucide-react";

export default function CartPage() {
  const cart = useStore((state) => state.cart);
  const updateQuantity = useStore((state) => state.updateQuantity);
  const removeItem = useStore((state) => state.removeFromCart);
  const user = useStore((state) => state.user);
  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 md:px-8 py-8 md:py-12">
         <h1 className="text-3xl font-extrabold text-[#1A233A] mb-8">Your Shopping Cart</h1>

         <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Cart Items */}
            <div className="flex-1 w-full">
               {cart.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center">
                     <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <ShoppingCart className="w-10 h-10 text-gray-300" />
                     </div>
                     <h2 className="text-2xl font-bold text-[#1A233A] mb-4">Your cart is empty</h2>
                     <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added anything to your cart yet. Discover our premium products now.</p>
                     <Link href="/products" className="bg-[#1A233A] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#2a3759] transition-colors">
                        Start Shopping
                     </Link>
                  </div>
               ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                     {cart.map((item) => (
                        <div key={item.id} className="p-6 flex flex-col sm:flex-row items-center gap-6 group">
                           {/* Image */}
                           <div className="w-28 h-28 bg-gray-50 rounded-xl flex items-center justify-center text-5xl overflow-hidden p-2">
                              {(item.image.startsWith('data:') || item.image.startsWith('http') || item.image.startsWith('/')) ? (
                                 <img src={item.image} className="w-full h-full object-contain mix-blend-multiply" />
                              ) : (
                                 item.image
                              )}
                           </div>
                           
                           {/* Info */}
                           <div className="flex-1 text-center sm:text-left">
                              <h3 className="text-lg font-bold text-[#1A233A] line-clamp-1">{item.name}</h3>
                              <p className="text-sm text-gray-500 mt-1">Category: {item.category}</p>
                              <p className="text-xl font-extrabold text-[#1A233A] mt-3">${item.price.toFixed(2)}</p>
                           </div>

                           {/* Controls */}
                           <div className="flex items-center gap-4">
                              <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                                 <button onClick={() => updateQuantity(item.id, -1)} className="p-2 text-gray-500 hover:text-[#1A233A] hover:bg-gray-200 rounded-l-lg transition-colors"><Minus className="w-4 h-4" /></button>
                                 <span className="w-10 text-center font-bold text-[#1A233A]">{item.quantity}</span>
                                 <button onClick={() => updateQuantity(item.id, 1)} className="p-2 text-gray-500 hover:text-[#1A233A] hover:bg-gray-200 rounded-r-lg transition-colors"><Plus className="w-4 h-4" /></button>
                              </div>
                              <button onClick={() => removeItem(item.id)} className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                                 <Trash2 className="w-5 h-5" />
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>

            {/* Order Summary Sidebar */}
            {cart.length > 0 && (
               <div className="w-full lg:w-[380px] bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                  <h3 className="text-xl font-bold text-[#1A233A] mb-6">Order Summary</h3>
                  
                  <div className="space-y-4 text-sm text-gray-600 mb-6 border-b border-gray-100 pb-6">
                     <div className="flex justify-between">
                        <span>Subtotal ({totalItems} items)</span>
                        <span className="font-bold text-[#1A233A]">${subtotal.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between">
                        <span>Shipping Estimate</span>
                        <span className="font-bold text-emerald-600">Free</span>
                     </div>
                  </div>

                  <div className="flex justify-between items-center mb-8">
                     <span className="text-lg font-bold text-[#1A233A]">Total</span>
                     <span className="text-3xl font-extrabold text-[#1A233A]">${subtotal.toFixed(2)}</span>
                  </div>

                  {user ? (
                    <Link href="/checkout" className="w-full flex items-center justify-center gap-2 bg-[#FF7A00] hover:bg-[#FF9900] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-[#FF7A00]/20 transition-all hover:scale-[1.02]">
                      Proceed to Checkout <ArrowRight className="w-5 h-5" />
                    </Link>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-center text-sm text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        🔒 Please sign in to complete your purchase
                      </p>
                      <Link href="/login?returnTo=/checkout" className="w-full flex items-center justify-center gap-2 bg-[#FF7A00] hover:bg-[#FF9900] text-white py-3 rounded-xl font-bold text-base transition-all block text-center">
                        Sign In to Checkout
                      </Link>
                      <Link href="/register" className="w-full flex items-center justify-center gap-2 bg-[#1A233A] hover:bg-[#2a3759] text-white py-3 rounded-xl font-bold text-base transition-all block text-center">
                        Create Free Account
                      </Link>
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                     <ShieldCheck className="w-4 h-4 text-emerald-600" /> Secure SSL Encrypted Payment
                  </div>
               </div>
            )}
         </div>
      </main>
    </div>
  );
}
