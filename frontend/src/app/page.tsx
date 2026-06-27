"use client";

import Link from "next/link";
import Header from "./components/Header";
import { useStore } from "@/store/useStore";
import { ArrowRight, Zap, Shield, Truck } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const products = useStore((state) => state.products);

  const features = [
    { icon: Zap, title: "Lightning Fast", desc: "Same day delivery on express items" },
    { icon: Shield, title: "Secure Payment", desc: "100% secure payment processing" },
    { icon: Truck, title: "Free Shipping", desc: "On orders over $200" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Header />

      <main className="flex-1 w-full max-w-[1500px] mx-auto pb-20">
         {/* Hero Section */}
         <section className="px-4 md:px-8 py-12">
            <div className="bg-[#1A233A] rounded-[2rem] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF7A00] opacity-20 blur-[100px] rounded-full"></div>
               
               <div className="z-10 max-w-2xl space-y-6">
                  <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
                     Shop the Best,<br/>
                     <span className="text-[#FF7A00]">Delivered Fast.</span>
                  </h1>
                  <p className="text-gray-300 text-lg max-w-lg">
                     ZAYED EXPRESS brings you premium products with unparalleled speed and customer service. Start your journey today.
                  </p>
                  <div className="pt-4 flex gap-4">
                     <Link href="/products" className="bg-[#FF7A00] hover:bg-[#FF9900] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-transform hover:scale-105 shadow-lg shadow-[#FF7A00]/20">
                        Shop Now <ArrowRight className="w-5 h-5" />
                     </Link>
                  </div>
               </div>

               <div className="z-10 hidden md:grid grid-cols-2 gap-4">
                  {products.slice(0, 2).map(product => (
                     <div key={product.id} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex flex-col items-center justify-center text-white aspect-square w-48 shadow-xl">
                        <div className="text-6xl mb-4">{product.image.startsWith('data:') ? <img src={product.image} className="w-24 h-24 object-contain rounded" /> : product.image}</div>
                        <p className="font-bold text-center line-clamp-1">{product.name}</p>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* Features */}
         <section className="px-4 md:px-8 py-8 grid md:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
               <div key={idx} className="bg-white p-6 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100">
                  <div className="w-12 h-12 rounded-xl bg-[#FF7A00]/10 flex items-center justify-center text-[#FF7A00]">
                     <feature.icon className="w-6 h-6" />
                  </div>
                  <div>
                     <h3 className="font-bold text-[#1A233A]">{feature.title}</h3>
                     <p className="text-sm text-gray-500">{feature.desc}</p>
                  </div>
               </div>
            ))}
         </section>

         {/* Trending Products */}
         <section className="px-4 md:px-8 py-12">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-3xl font-bold text-[#1A233A]">Trending Now</h2>
               <Link href="/products" className="text-[#FF7A00] font-bold hover:underline flex items-center gap-1">
                  View All <ArrowRight className="w-4 h-4" />
               </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {products.slice(0, 8).map((product, idx) => (
                  <motion.div 
                     initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: idx * 0.1}}
                     key={product.id} 
                     className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#FF7A00]/30 transition-all group flex flex-col"
                  >
                     <div className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center text-7xl mb-4 overflow-hidden p-4">
                        {product.image.startsWith('data:') ? (
                           <img src={product.image} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" />
                        ) : (
                           <span className="group-hover:scale-110 transition-transform">{product.image}</span>
                        )}
                     </div>
                     <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">{product.category}</span>
                     <h3 className="font-bold text-[#1A233A] line-clamp-1 mb-2">{product.name}</h3>
                     <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                        <span className="text-xl font-extrabold text-[#1A233A]">${product.price.toFixed(2)}</span>
                        <Link href="/products" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#1A233A] group-hover:bg-[#FF7A00] group-hover:text-white transition-colors">
                           <ArrowRight className="w-4 h-4" />
                        </Link>
                     </div>
                  </motion.div>
               ))}
            </div>
         </section>
      </main>
    </div>
  );
}
