"use client";

import { motion } from "framer-motion";
import { Package, Plus, Search, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { useState, useEffect } from "react";

export default function SellerProducts() {
  const products = useStore((state) => state.products);
  const deleteProduct = useStore((state) => state.deleteProduct);
  
  // Hydration fix for Zustand persist
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  // Filter products that belong to this seller (Mocking for now, we'll just show all since it's local state MVP)
  // In a real app we'd filter: products.filter(p => p.seller === currentUser.id)
  const myProducts = products;

  const handleDelete = (id: string, name: string) => {
     if (confirm(`Are you sure you want to delete "${name}"?`)) {
        deleteProduct(id);
     }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Products</h2>
          <p className="text-muted-foreground mt-2">Manage your catalog, inventory, and pricing.</p>
        </div>
        <Link href="/seller/products/add" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition shadow-md shadow-primary/20">
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
         <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
            <div className="relative w-72">
              <input type="text" placeholder="Search products..." className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary outline-none text-sm" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
         </div>

         {myProducts.length === 0 ? (
           <div className="p-12 flex flex-col items-center justify-center text-center">
              <Package className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
              <p className="text-lg font-medium text-muted-foreground">No products found.</p>
              <Link href="/seller/products/add" className="text-primary font-medium mt-2">Start adding products</Link>
           </div>
         ) : (
           <table className="w-full text-left text-sm">
             <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
               <tr>
                 <th className="px-6 py-4">Product</th>
                 <th className="px-6 py-4">Category</th>
                 <th className="px-6 py-4">Price</th>
                 <th className="px-6 py-4">Rating</th>
                 <th className="px-6 py-4 text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-border">
                {myProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-2xl overflow-hidden shrink-0">
                              {product.image.startsWith('data:') ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                product.image
                              )}
                           </div>
                           <span className="font-semibold line-clamp-1">{product.name}</span>
                        </div>
                     </td>
                     <td className="px-6 py-4"><span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-semibold uppercase">{product.category}</span></td>
                     <td className="px-6 py-4 font-bold">${product.price.toFixed(2)}</td>
                     <td className="px-6 py-4 text-amber-500 font-bold">{product.rating} ★</td>
                     <td className="px-6 py-4 text-right space-x-2">
                        <Link href={`/seller/products/edit/${product.id}`} className="inline-block p-2 hover:bg-muted rounded text-muted-foreground transition"><Edit className="w-4 h-4" /></Link>
                        <button onClick={() => handleDelete(product.id, product.name)} className="p-2 hover:bg-destructive/10 text-destructive rounded transition"><Trash2 className="w-4 h-4" /></button>
                     </td>
                  </tr>
                ))}
             </tbody>
           </table>
         )}
      </div>
    </div>
  );
}
