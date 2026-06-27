"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { toast } from "sonner";
import Link from "next/link";
import { Lock, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod' | 'wallet'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [walletNumber, setWalletNumber] = useState('');
  
  const cart = useStore((state) => state.cart);
  const clearCart = useStore((state) => state.clearCart);
  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  // Calculate intersection of accepted payment methods for all items in cart
  const availableMethods = cart.reduce((methods, item) => {
     const itemMethods = item.acceptedPayments || ['card', 'cod', 'wallet'];
     return methods.filter(m => itemMethods.includes(m as 'card'|'cod'|'wallet'));
  }, ['card', 'cod', 'wallet'] as ('card' | 'cod' | 'wallet')[]);

  // Automatically select the first available method if the current one is not available
  useEffect(() => {
     if (availableMethods.length > 0 && !availableMethods.includes(paymentMethod)) {
        setPaymentMethod(availableMethods[0]);
     }
  }, [availableMethods, paymentMethod]);

  if (!isMounted) return null;

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;


  const handlePlaceOrder = async () => {
    if (paymentMethod === 'card') {
       if (cardNumber.replace(/\s/g, '').length < 16) {
          return toast.error("Invalid Card Number: Must be 16 digits");
       }
       if (!/^\d{2}\/\d{2}$/.test(expiry)) {
          return toast.error("Invalid Expiry Date: Must be MM/YY format");
       }
       if (cvc.length < 3) {
          return toast.error("Invalid CVC: Must be 3 digits");
       }
    } else if (paymentMethod === 'wallet') {
       if (walletNumber.length < 10) {
          return toast.error("Invalid Wallet Number: Must be at least 10 digits");
       }
    }

    setLoading(true);
    try {
      const currentUser = useStore.getState().user;
      const res = await fetch("/api/orders", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            customerName: currentUser?.name || "Guest User",
            customerEmail: currentUser?.email || "guest@zayed.com",
            customerAddress: "123 Commerce Blvd", // In a real app we'd collect this from step 1
            items: cart,
            total: total
         })
      });

      if (!res.ok) throw new Error("Order failed");

      setStep(3);
      clearCart();
      toast.success("Order confirmed successfully!");
    } catch (error) {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
     return (
       <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-8 md:p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center">
             <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10" />
             </div>
             <h1 className="text-3xl font-extrabold text-[#1A233A] mb-4">Order Confirmed!</h1>
             <p className="text-gray-500 mb-8 leading-relaxed">Thank you for shopping with ZAYED EXPRESS. Your order is being processed and will be shipped shortly. A confirmation email has been sent.</p>
             <Link href="/profile" className="w-full bg-[#1A233A] hover:bg-[#2a3759] text-white py-4 rounded-xl font-bold transition-colors mb-4 block">
                Track Your Order
             </Link>
             <Link href="/" className="text-[#FF7A00] font-bold hover:underline">Return to Home</Link>
          </div>
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Checkout Header */}
      <header className="bg-white border-b border-gray-100 py-4 px-4 md:px-8 flex items-center justify-between sticky top-0 z-50">
         <Link href="/" className="flex items-center gap-1 group">
            <div className="w-8 h-8 bg-gradient-to-br from-[#1A233A] to-[#2a3759] rounded-lg flex items-center justify-center text-white font-extrabold text-xl group-hover:shadow-lg transition-shadow">Z</div>
            <div className="flex flex-col ml-1">
               <span className="font-extrabold text-lg tracking-tight text-[#1A233A] leading-tight">ZAYED</span>
               <span className="font-bold text-[9px] tracking-[0.2em] text-[#FF7A00] leading-none uppercase">Express</span>
            </div>
         </Link>
         <div className="flex items-center gap-2 text-gray-500">
            <Lock className="w-5 h-5" /> <span className="hidden sm:inline font-medium">Secure Checkout</span>
         </div>
      </header>

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col lg:flex-row gap-8">
         {/* Checkout Steps */}
         <div className="flex-1 space-y-6">
            
            {/* Step 1: Address */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-[#1A233A] flex items-center gap-3">
                     <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 1 ? 'bg-[#FF7A00] text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                        {step > 1 ? '✓' : '1'}
                     </span>
                     Shipping Address
                  </h2>
                  {step > 1 && <button onClick={() => setStep(1)} className="text-[#FF7A00] text-sm font-bold hover:underline">Edit</button>}
               </div>
               
               {step === 1 ? (
                  <div className="space-y-4">
                     <div className="grid md:grid-cols-2 gap-4">
                        <input type="text" placeholder="First Name" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 transition-all" />
                        <input type="text" placeholder="Last Name" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 transition-all" />
                     </div>
                     <input type="text" placeholder="Full Address" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 transition-all" />
                     <button onClick={() => setStep(2)} className="bg-[#1A233A] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#2a3759] transition-colors mt-4">
                        Continue to Payment
                     </button>
                  </div>
               ) : (
                  <div className="ml-11 text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                     <p className="font-bold text-[#1A233A]">John Doe</p>
                     <p>123 Commerce Blvd, Suite 400<br/>New York, NY 10001</p>
                  </div>
               )}
            </div>

            {/* Step 2: Payment */}
            <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 ${step < 2 ? 'opacity-50' : ''}`}>
               <h2 className="text-xl font-bold text-[#1A233A] flex items-center gap-3 mb-6">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 2 ? 'bg-[#FF7A00] text-white' : 'bg-gray-100 text-gray-400'}`}>2</span>
                  Payment Method
               </h2>
               
               {step === 2 && (
                  <div className="space-y-4">
                     {availableMethods.length === 0 && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-start gap-3">
                           <ShieldCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />
                           <p className="font-bold text-sm">Cannot proceed: The items in your cart have conflicting payment requirements. Please split your order.</p>
                        </div>
                     )}

                     {/* Credit Card Option */}
                     {availableMethods.includes('card') && (
                        <label className={`border-2 rounded-xl p-4 flex gap-4 items-center cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-[#FF7A00] bg-[#FF7A00]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                           <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="accent-[#FF7A00] w-5 h-5" />
                           <span className="font-bold text-[#1A233A]">Credit / Debit Card</span>
                        </label>
                     )}
                     
                     {paymentMethod === 'card' && availableMethods.includes('card') && (
                        <div className="space-y-4 pl-9 animate-in fade-in slide-in-from-top-2">
                           <input type="text" value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="Card Number (16 digits)" maxLength={16} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 transition-all" />
                           <div className="grid grid-cols-2 gap-4">
                              <input type="text" value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="MM/YY" maxLength={5} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 transition-all" />
                              <input type="text" value={cvc} onChange={e => setCvc(e.target.value)} placeholder="CVC" maxLength={3} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 transition-all" />
                           </div>
                           <p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Your payment information is encrypted and secure.</p>
                        </div>
                     )}

                     {/* Cash on Delivery Option */}
                     {availableMethods.includes('cod') && (
                        <label className={`border-2 rounded-xl p-4 flex gap-4 items-center cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-[#FF7A00] bg-[#FF7A00]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                           <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-[#FF7A00] w-5 h-5" />
                           <div>
                              <span className="font-bold text-[#1A233A] block">Cash on Delivery (COD)</span>
                              <span className="text-sm text-gray-500">Pay with cash when your order is delivered</span>
                           </div>
                        </label>
                     )}

                     {/* E-Wallet Option */}
                     {availableMethods.includes('wallet') && (
                        <label className={`border-2 rounded-xl p-4 flex gap-4 items-center cursor-pointer transition-colors ${paymentMethod === 'wallet' ? 'border-[#FF7A00] bg-[#FF7A00]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                           <input type="radio" name="payment" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} className="accent-[#FF7A00] w-5 h-5" />
                           <span className="font-bold text-[#1A233A]">Electronic Wallet (E-Wallet)</span>
                        </label>
                     )}

                     {paymentMethod === 'wallet' && availableMethods.includes('wallet') && (
                        <div className="space-y-4 pl-9 animate-in fade-in slide-in-from-top-2">
                           <input type="text" value={walletNumber} onChange={e => setWalletNumber(e.target.value.replace(/\D/g, ''))} placeholder="Enter Mobile Wallet Number (e.g. 01012345678)" maxLength={15} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 transition-all" />
                           <p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Payment request will be sent to this number instantly.</p>
                        </div>
                     )}
                     
                     {availableMethods.length > 0 && availableMethods.length < 2 && (
                        <p className="text-xs text-[#FF7A00] mt-4 font-bold bg-[#FF7A00]/10 p-3 rounded-lg">
                           Note: Some items in your cart restrict the available payment methods.
                        </p>
                     )}
                  </div>
               )}
            </div>
         </div>

         {/* Order Summary Sidebar */}
         <div className="w-full lg:w-[400px]">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 sticky top-24">
               <h3 className="text-xl font-extrabold text-[#1A233A] mb-6">Order Summary</h3>
               
               {/* Cart Preview */}
               <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {cart.map(item => (
                     <div key={item.id} className="flex gap-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center text-3xl overflow-hidden p-1 flex-shrink-0">
                           {item.image.startsWith('data:') ? <img src={item.image} className="w-full h-full object-contain mix-blend-multiply" /> : item.image}
                        </div>
                        <div className="flex-1">
                           <p className="font-bold text-[#1A233A] text-sm line-clamp-2">{item.name}</p>
                           <p className="text-gray-500 text-xs mt-1">Qty: {item.quantity}</p>
                           <p className="font-bold text-[#FF7A00] mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                     </div>
                  ))}
               </div>
               
               <div className="space-y-3 text-sm text-gray-600 mb-6 border-y border-gray-100 py-6">
                  <div className="flex justify-between"><span>Subtotal ({totalItems} items)</span> <span>${subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Shipping</span> <span className="text-emerald-600 font-bold">Free</span></div>
                  <div className="flex justify-between"><span>Taxes (8%)</span> <span>${tax.toFixed(2)}</span></div>
               </div>
               
               <div className="flex justify-between items-end mb-8">
                  <span className="text-lg font-bold text-[#1A233A]">Total</span>
                  <span className="text-3xl font-extrabold text-[#1A233A]">${total.toFixed(2)}</span>
               </div>
               
               <button 
                 onClick={handlePlaceOrder} 
                 disabled={loading || step !== 2 || availableMethods.length === 0} 
                 className="w-full flex items-center justify-center bg-[#FF7A00] hover:bg-[#FF9900] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-[#FF7A00]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  {loading ? "Processing Securely..." : "Place Order Now"}
               </button>
            </div>
         </div>
      </main>
    </div>
  );
}
