"use client";

import { Search, ShoppingCart, User, Menu } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const cart = useStore((state) => state.cart);
  const user = useStore((state) => state.user);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  
  useEffect(() => setIsMounted(true), []);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push(`/products`);
    }
  };

  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between gap-8">
        
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <img src="/logo.png" alt="ZAYED EXPRESS" className="h-12 w-auto group-hover:scale-105 transition-transform" />
        </Link>

        {/* Search Bar - Simplified */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl relative group">
           <input 
             type="text" 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder="Search for products, brands and more..." 
             className="w-full h-12 bg-gray-50 border border-gray-200 rounded-full pl-12 pr-4 outline-none focus:bg-white focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] transition-all text-sm"
           />
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#FF7A00] transition-colors" />
           <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#FF7A00] hover:bg-[#FF9900] text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-sm transition-colors">
             Search
           </button>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-6">
          {!user ? (
             <Link href="/login" className="hidden md:flex items-center gap-2 text-[#1A233A] hover:text-[#FF7A00] transition-colors p-2 rounded-xl hover:bg-gray-50 group">
                <User className="w-5 h-5 text-gray-400 group-hover:text-[#FF7A00]" />
                <div className="flex flex-col">
                   <span className="text-[10px] text-gray-500 font-medium leading-tight">Welcome</span>
                   <span className="text-[14px] font-bold leading-tight">Sign In / Register</span>
                </div>
             </Link>
          ) : (
             <Link href="/profile" className="hidden md:flex items-center gap-2 text-[#1A233A] hover:text-[#FF7A00] transition-colors p-2 rounded-xl hover:bg-gray-50 group">
                <div className="w-8 h-8 rounded-full bg-[#FF7A00]/10 flex items-center justify-center text-[#FF7A00] font-bold text-sm">
                   {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] text-gray-500 font-medium leading-tight">Account</span>
                   <span className="text-[14px] font-bold leading-tight line-clamp-1 max-w-[100px]">{user.name}</span>
                </div>
             </Link>
          )}

          <Link href="/cart" className="flex items-center p-2 rounded-xl bg-gray-50 hover:bg-[#FF7A00]/10 text-[#1A233A] hover:text-[#FF7A00] transition-all group relative">
             <div className="relative">
                <ShoppingCart className="w-6 h-6" />
                {isMounted && cartItemCount > 0 && (
                   <span className="absolute -top-2 -right-2 bg-[#FF7A00] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm group-hover:scale-110 transition-transform">
                     {cartItemCount}
                   </span>
                )}
             </div>
             <span className="hidden md:block ml-3 font-bold text-sm">Cart</span>
          </Link>

          <button className="md:hidden p-2 text-[#1A233A]">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
