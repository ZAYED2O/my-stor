import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  seller: string;
  rating: number;
  acceptedPayments: ('card' | 'cod' | 'wallet')[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  name: string;
  email: string;
  isSeller?: boolean;
}

export interface StoreState {
  products: Product[];
  cart: CartItem[];
  user: { name: string; email: string } | null;
  isAdminAuth: boolean;
  isSellerAuth: boolean;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  addProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  updateProduct: (product: Product) => void;
  login: (userData: { name: string; email: string }) => void;
  logout: () => void;
  adminLogin: () => void;
  adminLogout: () => void;
  sellerLogin: () => void;
  sellerLogout: () => void;
}

const initialProducts: Product[] = [
  { id: '1', name: "Premium Wireless Headphones", price: 299.99, rating: 4.8, image: "🎧", category: "Electronics", seller: "Tech Store", acceptedPayments: ['card', 'cod', 'wallet'] },
  { id: '2', name: "Minimalist Smartwatch", price: 199.50, rating: 4.5, image: "⌚", category: "Accessories", seller: "Watch Co.", acceptedPayments: ['card', 'cod', 'wallet'] },
  { id: '3', name: "Ergonomic Office Chair", price: 450.00, rating: 4.9, image: "🪑", category: "Furniture", seller: "FurnishNow", acceptedPayments: ['card'] }, // Chair is Card Only for testing
];

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      products: initialProducts,
      cart: [],
      user: null,
      isAdminAuth: false,
      isSellerAuth: false,

      login: (userData) => set({ user: userData }),
      logout: () => set({ user: null }),
      adminLogin: () => set({ isAdminAuth: true }),
      adminLogout: () => set({ isAdminAuth: false }),
      sellerLogin: () => set({ isSellerAuth: true }),
      sellerLogout: () => set({ isSellerAuth: false }),
      
      addProduct: (product) => set((state) => ({
        products: [...state.products, { ...product, id: Math.random().toString(36).substr(2, 9) }]
      })),

      deleteProduct: (id) => set((state) => ({
        products: state.products.filter(p => p.id !== id)
      })),

      updateProduct: (product) => set((state) => ({
        products: state.products.map(p => p.id === product.id ? product : p)
      })),
      
      addToCart: (product) => set((state) => {
        const existing = state.cart.find(item => item.id === product.id);
        if (existing) {
          return {
            cart: state.cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
          };
        }
        return { cart: [...state.cart, { ...product, quantity: 1 }] };
      }),
      
      removeFromCart: (id) => set((state) => ({
        cart: state.cart.filter(item => item.id !== id)
      })),
      
      updateQuantity: (id, delta) => set((state) => ({
        cart: state.cart.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item)
      })),
      
      clearCart: () => set({ cart: [] }),
    }),
    { name: 'enterprise-commerce-storage' }
  )
);
