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
  id?: string;
  name: string;
  email: string;
  role?: string;
  isSeller?: boolean;
  avatar?: string;
}

export interface Address {
  id: string;
  title: string;
  fullName: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

export interface StoreState {
  products: Product[];
  cart: CartItem[];
  user: User | null;
  isAdminAuth: boolean;
  isSellerAuth: boolean;
  productsLoaded: boolean;
  fetchProducts: (force?: boolean) => Promise<void>;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  addProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  updateProduct: (product: Product) => void;
  login: (userData: User) => void;
  logout: () => void;
  adminLogin: () => void;
  adminLogout: () => void;
  sellerLogin: () => void;
  sellerLogout: () => void;
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  addresses: Address[];
  addAddress: (address: Address) => void;
  removeAddress: (id: string) => void;
  updateAddress: (address: Address) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      products: [],
      cart: [],
      user: null,
      isAdminAuth: false,
      isSellerAuth: false,
      productsLoaded: false,
      wishlist: [],
      addresses: [
        {
          id: "addr-1",
          title: "Home Address",
          fullName: "John Doe",
          street: "123 Commerce Blvd, Suite 400",
          city: "New York",
          zip: "10001",
          country: "United States",
          isDefault: true
        }
      ],

      fetchProducts: async (force = false) => {
        // Don't refetch if already loaded, unless forced
        if (get().productsLoaded && !force) return;
        try {
          const res = await fetch('/api/products');
          const data = await res.json();
          if (res.ok && data.products) {
            set({ products: data.products, productsLoaded: true });
          }
        } catch (err) {
          console.error('Failed to fetch products:', err);
        }
      },

      login: (userData) => set({ user: userData }),
      logout: () => set({ user: null }),
      adminLogin: () => set({ isAdminAuth: true }),
      adminLogout: () => set({ isAdminAuth: false }),
      sellerLogin: () => set({ isSellerAuth: true }),
      sellerLogout: () => set({ isSellerAuth: false }),

      addProduct: (product) => set((state) => ({
        products: [...state.products, product],
        productsLoaded: false, // Force refetch next time
      })),

      deleteProduct: (id) => set((state) => ({
        products: state.products.filter(p => p.id !== id),
      })),

      updateProduct: (product) => set((state) => ({
        products: state.products.map(p => p.id === product.id ? product : p),
      })),

      addToCart: (product) => set((state) => {
        const existing = state.cart.find(item => item.id === product.id);
        if (existing) {
          return {
            cart: state.cart.map(item =>
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            )
          };
        }
        return { cart: [...state.cart, { ...product, quantity: 1 }] };
      }),

      removeFromCart: (id) => set((state) => ({
        cart: state.cart.filter(item => item.id !== id),
      })),

      updateQuantity: (id, delta) => set((state) => ({
        cart: state.cart.map(item =>
          item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        ),
      })),

      clearCart: () => set({ cart: [] }),

      toggleWishlist: (product) => set((state) => {
        const exists = state.wishlist.some(p => p.id === product.id);
        if (exists) {
          return { wishlist: state.wishlist.filter(p => p.id !== product.id) };
        } else {
          return { wishlist: [...state.wishlist, product] };
        }
      }),

      addAddress: (address) => set((state) => {
        const addresses = address.isDefault
          ? state.addresses.map(a => ({ ...a, isDefault: false }))
          : state.addresses;
        return { addresses: [...addresses, address] };
      }),

      removeAddress: (id) => set((state) => ({
        addresses: state.addresses.filter(a => a.id !== id)
      })),

      updateAddress: (updated) => set((state) => {
        const addresses = updated.isDefault
          ? state.addresses.map(a => a.id === updated.id ? updated : { ...a, isDefault: false })
          : state.addresses.map(a => a.id === updated.id ? updated : a);
        return { addresses };
      }),
    }),
    {
      name: 'enterprise-commerce-storage',
      // Don't persist products and productsLoaded to always refetch on new session
      partialize: (state) => ({
        cart: state.cart,
        user: state.user,
        isAdminAuth: state.isAdminAuth,
        isSellerAuth: state.isSellerAuth,
        wishlist: state.wishlist,
        addresses: state.addresses,
      }),
    }
  )
);
