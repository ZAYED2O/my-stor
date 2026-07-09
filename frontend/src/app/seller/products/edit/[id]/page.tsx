"use client";

import { Upload } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, use } from "react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";

export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(false);
  const products = useStore((state) => state.products);
  const productsLoaded = useStore((state) => state.productsLoaded);
  const fetchProducts = useStore((state) => state.fetchProducts);
  const updateProduct = useStore((state) => state.updateProduct);
  const router = useRouter();

  const product = products.find(p => p.id === id);

  useEffect(() => {
     if (productsLoaded && !product) {
        fetchProducts(true);
     }
  }, [product, productsLoaded, fetchProducts]);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Electronics',
    image: '',
    acceptedPayments: ['card', 'cod', 'wallet'] as ('card' | 'cod' | 'wallet')[],
  });

  useEffect(() => {
     if (product) {
        setFormData({
           name: product.name,
           price: product.price.toString(),
           category: product.category,
           image: product.image,
           acceptedPayments: product.acceptedPayments || ['card', 'cod', 'wallet']
        });
     }
  }, [product]);

  if (!productsLoaded) {
     return <div className="p-12 text-center text-gray-500 font-bold">Loading product details...</div>;
  }

  if (!product) {
     return (
        <div className="p-12 max-w-md mx-auto text-center space-y-4">
           <div className="text-red-500 font-bold text-xl">Product not found.</div>
           <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-left text-xs font-mono space-y-2">
              <p><strong>Requested ID:</strong> "{id}"</p>
              <p><strong>Products Loaded:</strong> {productsLoaded ? "Yes" : "No"}</p>
              <p><strong>Available IDs in Store:</strong></p>
              <ul className="list-disc pl-4 max-h-40 overflow-y-auto">
                 {products.map(p => (
                    <li key={p.id}>"{p.id}" - {p.name}</li>
                 ))}
              </ul>
           </div>
           <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold">
              Force Reload Page
           </button>
        </div>
     );
  }

  const togglePayment = (method: 'card' | 'cod' | 'wallet') => {
     setFormData(prev => ({
        ...prev,
        acceptedPayments: prev.acceptedPayments.includes(method)
           ? prev.acceptedPayments.filter(p => p !== method)
           : [...prev.acceptedPayments, method]
     }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedProduct = {
        id: product.id,
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        image: formData.image || "📦",
        acceptedPayments: (formData.acceptedPayments.length > 0 ? formData.acceptedPayments : ['card', 'cod', 'wallet']) as ('card' | 'cod' | 'wallet')[]
      };

      const res = await fetch("/api/products", {
         method: "PATCH",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(updatedProduct)
      });
      const data = await res.json();
      if (res.ok) {
         updateProduct({
            ...product,
            ...updatedProduct
         });
         toast.success("Product updated successfully!");
         router.push('/seller/products');
      } else {
         toast.error(data.error || "Failed to update product");
      }
    } catch (err) {
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
        <p className="text-muted-foreground mt-2">Update information for {product.name}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="p-6 rounded-xl bg-card border border-border shadow-sm space-y-6">
          <h3 className="font-bold text-lg border-b border-border pb-4">Basic Information</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">Product Title</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Wireless Noise Cancelling Headphones" className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Price ($)</label>
              <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="299.99" className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary">
                 <option>Electronics</option>
                 <option>Accessories</option>
                 <option>Furniture</option>
                 <option>Fashion</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-card border border-border shadow-sm space-y-6">
          <h3 className="font-bold text-lg border-b border-border pb-4">Product Image</h3>
          <label className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition cursor-pointer group relative overflow-hidden h-64">
             <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
             {formData.image ? (
                (() => {
                   const isUrl = formData.image.startsWith('data:') || formData.image.startsWith('http') || formData.image.startsWith('/');
                   return isUrl ? (
                      <img src={formData.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover bg-background" />
                   ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-8xl bg-background">{formData.image}</div>
                   );
                })()
             ) : (
               <>
                 <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8" />
                 </div>
                 <p className="font-medium">Click to upload image</p>
                 <p className="text-sm text-muted-foreground mt-1">SVG, PNG, JPG or GIF</p>
               </>
             )}
          </label>
        </div>

        <div className="p-6 rounded-xl bg-card border border-border shadow-sm space-y-6">
           <h3 className="font-bold text-lg border-b border-border pb-4">Payment Options</h3>
           <p className="text-sm text-muted-foreground mb-4">Select the payment methods you accept for this product. (At least one must be selected)</p>
           
           <div className="flex flex-col sm:flex-row gap-4">
              <label className={`flex-1 border-2 rounded-xl p-4 flex gap-4 items-center cursor-pointer transition-colors ${formData.acceptedPayments.includes('card') ? 'border-[#FF7A00] bg-[#FF7A00]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                 <input type="checkbox" checked={formData.acceptedPayments.includes('card')} onChange={() => togglePayment('card')} className="accent-[#FF7A00] w-5 h-5" />
                 <span className="font-bold text-[#1A233A]">Credit / Debit Card</span>
              </label>
              
              <label className={`flex-1 border-2 rounded-xl p-4 flex gap-4 items-center cursor-pointer transition-colors ${formData.acceptedPayments.includes('cod') ? 'border-[#FF7A00] bg-[#FF7A00]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                 <input type="checkbox" checked={formData.acceptedPayments.includes('cod')} onChange={() => togglePayment('cod')} className="accent-[#FF7A00] w-5 h-5" />
                 <span className="font-bold text-[#1A233A]">Cash on Delivery</span>
              </label>

              <label className={`flex-1 border-2 rounded-xl p-4 flex gap-4 items-center cursor-pointer transition-colors ${formData.acceptedPayments.includes('wallet') ? 'border-[#FF7A00] bg-[#FF7A00]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                 <input type="checkbox" checked={formData.acceptedPayments.includes('wallet')} onChange={() => togglePayment('wallet')} className="accent-[#FF7A00] w-5 h-5" />
                 <span className="font-bold text-[#1A233A]">E-Wallet</span>
              </label>
           </div>
        </div>

        <div className="flex justify-end gap-4">
           <button type="submit" disabled={loading} className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition shadow-lg shadow-primary/20 disabled:opacity-50">
             {loading ? "Saving..." : "Save Changes"}
           </button>
        </div>
      </form>
    </div>
  );
}
