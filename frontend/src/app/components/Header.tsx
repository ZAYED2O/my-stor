"use client";

import { Search, ShoppingCart, User, Menu, X, Home, Package, LogIn, UserPlus, Shield, Store, LogOut } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const cart = useStore((state) => state.cart);
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);
  const lang = useStore((state) => state.lang);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const router = useRouter();
  
  useEffect(() => setIsMounted(true), []);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const term = searchQuery.trim();
    if (term) {
      router.push(`/products?q=${term}`);
    } else {
      router.push(`/products`);
    }
    setMobileSearchOpen(false);
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1500px] mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between gap-4 md:gap-8">
          
          {/* Logo */}
          <Link href="/" className="flex items-center group shrink-0">
            <img src="/logo.png" alt="ZAYED EXPRESS" className="h-10 md:h-12 w-auto group-hover:scale-105 transition-transform" />
          </Link>

          {/* Search Bar - Desktop */}
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
          <div className="flex items-center gap-1 md:gap-6">
            {/* Mobile Search Toggle */}
            <button 
              onClick={() => { setMobileSearchOpen(!mobileSearchOpen); setMobileMenuOpen(false); }}
              className="md:hidden p-2 text-[#1A233A] hover:text-[#FF7A00] transition-colors rounded-xl hover:bg-gray-50"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Account - Desktop only */}
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
                  <div className="w-8 h-8 rounded-full bg-[#FF7A00]/10 flex items-center justify-center text-[#FF7A00] font-bold text-sm overflow-hidden">
                     {user.avatar ? (
                        <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
                     ) : (
                        user.name.charAt(0).toUpperCase()
                     )}
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[10px] text-gray-500 font-medium leading-tight">Account</span>
                     <span className="text-[14px] font-bold leading-tight line-clamp-1 max-w-[100px]">{user.name}</span>
                  </div>
               </Link>
            )}

            {/* Cart */}
            <Link href="/cart" className="flex items-center p-2 rounded-xl bg-gray-50 hover:bg-[#FF7A00]/10 text-[#1A233A] hover:text-[#FF7A00] transition-all group relative">
               <div className="relative">
                  <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                  {isMounted && cartItemCount > 0 && (
                     <span className="absolute -top-2 -right-2 bg-[#FF7A00] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm group-hover:scale-110 transition-transform">
                       {cartItemCount}
                     </span>
                  )}
               </div>
               <span className="hidden md:block ml-3 font-bold text-sm">Cart</span>
            </Link>

            {/* Hamburger Menu Toggle - Mobile only */}
            <button 
              onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setMobileSearchOpen(false); }}
              className="md:hidden p-2 text-[#1A233A] hover:text-[#FF7A00] transition-colors rounded-xl hover:bg-gray-50"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar - Slide Down */}
        {mobileSearchOpen && (
          <div className="md:hidden px-4 pb-4 bg-white border-t border-gray-50 animate-in fade-in slide-in-from-top-2">
            <form onSubmit={handleSearch} className="flex relative">
               <input 
                 type="text" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="Search products..." 
                 autoFocus
                 className="w-full h-11 bg-gray-50 border border-gray-200 rounded-full pl-10 pr-24 outline-none focus:bg-white focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] transition-all text-sm"
               />
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#FF7A00] hover:bg-[#FF9900] text-white px-5 py-1.5 rounded-full text-xs font-bold shadow-sm transition-colors">
                 Search
               </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={closeMobileMenu}>
          <div 
            className="absolute right-0 top-0 h-full w-[280px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menu Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#1A233A] to-[#2a3759]">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FF7A00] flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                     {user.avatar ? (
                        <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
                     ) : (
                        user.name.charAt(0).toUpperCase()
                     )}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm leading-tight">{user.name}</p>
                    <p className="text-gray-300 text-xs leading-tight">{user.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-white font-bold">Menu</p>
              )}
              <button onClick={closeMobileMenu} className="p-1 text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Links */}
            <nav className="flex-1 overflow-y-auto py-2">
              <Link href="/" onClick={closeMobileMenu} className="flex items-center gap-3 px-5 py-3.5 text-[#1A233A] hover:bg-gray-50 transition-colors font-medium text-sm">
                <Home className="w-5 h-5 text-gray-400" />
                Home
              </Link>
              <Link href="/products" onClick={closeMobileMenu} className="flex items-center gap-3 px-5 py-3.5 text-[#1A233A] hover:bg-gray-50 transition-colors font-medium text-sm">
                <Package className="w-5 h-5 text-gray-400" />
                All Products
              </Link>
              <Link href="/cart" onClick={closeMobileMenu} className="flex items-center gap-3 px-5 py-3.5 text-[#1A233A] hover:bg-gray-50 transition-colors font-medium text-sm">
                <ShoppingCart className="w-5 h-5 text-gray-400" />
                Cart
                {isMounted && cartItemCount > 0 && (
                  <span className="ml-auto bg-[#FF7A00] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{cartItemCount}</span>
                )}
              </Link>

              <div className="h-px bg-gray-100 my-2 mx-5" />

              {user ? (
                <>
                  <Link href="/profile" onClick={closeMobileMenu} className="flex items-center gap-3 px-5 py-3.5 text-[#1A233A] hover:bg-gray-50 transition-colors font-medium text-sm">
                    <User className="w-5 h-5 text-gray-400" />
                    My Account
                  </Link>
                  {(user as any).role === 'super_admin' && (
                    <Link href="/admin" onClick={closeMobileMenu} className="flex items-center gap-3 px-5 py-3.5 text-[#1A233A] hover:bg-gray-50 transition-colors font-medium text-sm">
                      <Shield className="w-5 h-5 text-red-400" />
                      Admin Dashboard
                    </Link>
                  )}
                  {((user as any).role === 'seller' || (user as any).role === 'super_admin') && (
                    <Link href="/seller" onClick={closeMobileMenu} className="flex items-center gap-3 px-5 py-3.5 text-[#1A233A] hover:bg-gray-50 transition-colors font-medium text-sm">
                      <Store className="w-5 h-5 text-blue-400" />
                      Seller Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                      router.push("/");
                    }}
                    className={`w-full flex items-center gap-3 px-5 py-3.5 text-red-600 hover:bg-red-50 transition-colors font-medium text-sm ${lang === 'ar' ? 'text-right flex-row-reverse justify-end' : 'text-left'}`}
                  >
                    <LogOut className="w-5 h-5 text-red-500" />
                    {lang === 'ar' ? "تسجيل الخروج" : "Sign Out"}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={closeMobileMenu} className="flex items-center gap-3 px-5 py-3.5 text-[#1A233A] hover:bg-gray-50 transition-colors font-medium text-sm">
                    <LogIn className="w-5 h-5 text-gray-400" />
                    Sign In
                  </Link>
                  <Link href="/register" onClick={closeMobileMenu} className="flex items-center gap-3 px-5 py-3.5 text-[#1A233A] hover:bg-gray-50 transition-colors font-medium text-sm">
                    <UserPlus className="w-5 h-5 text-gray-400" />
                    Create Account
                  </Link>
                </>
              )}
            </nav>

            {/* Menu Footer */}
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
              <p className="text-[10px] text-gray-400 text-center font-medium">© 2026 ZAYED EXPRESS. All rights reserved.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
