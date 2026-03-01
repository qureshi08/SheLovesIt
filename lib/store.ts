import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, WishlistItem, Category, Order, User } from '@/types';
import { products as initialProducts, categories as initialCategories, orders as initialOrders } from './data';

interface CartStore {
    items: CartItem[];
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    getTotal: () => number;
    getSubtotal: () => number;
    getShipping: () => number;
    getTax: () => number;
    getItemCount: () => number;
}

interface WishlistStore {
    items: WishlistItem[];
    addItem: (product: Product) => void;
    removeItem: (productId: number) => void;
    isInWishlist: (productId: number) => boolean;
    clearWishlist: () => void;
}

interface UIStore {
    isCartOpen: boolean;
    isMobileMenuOpen: boolean;
    searchQuery: string;
    setCartOpen: (open: boolean) => void;
    setMobileMenuOpen: (open: boolean) => void;
    setSearchQuery: (query: string) => void;
}

interface ResourceStore {
    products: Product[];
    categories: Category[];
    orders: Order[];

    // Product Actions
    addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => void;
    updateProduct: (id: number, product: Partial<Product>) => void;
    deleteProduct: (id: number) => void;

    // Category Actions
    addCategory: (category: Omit<Category, 'id'>) => void;
    updateCategory: (id: number, category: Partial<Category>) => void;
    deleteCategory: (id: number) => void;

    // Order Actions
    addOrder: (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => void;
    updateOrder: (id: number, order: Partial<Order>) => void;
    deleteOrder: (id: number) => void;

    // Settings
    settings: StoreSettings;
    updateSettings: (settings: Partial<StoreSettings>) => void;

    // Customer Actions
    customers: User[];
    updateCustomer: (id: string, customer: Partial<User>) => void;

    // Supabase Sync
    refreshFromSupabase: () => Promise<void>;
}

interface AuthStore {
    user: User | null;
    session: any | null;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setSession: (session: any | null) => void;
    setLoading: (loading: boolean) => void;
    signOut: () => Promise<void>;
}

export interface StoreSettings {
    storeName: string;
    email: string;
    phone: string;
    whatsapp: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    jazzcash: string;
    shippingStandard: number;
    shippingExpress: number;
    freeShippingThreshold: number;
    taxRate: number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product, quantity = 1) => {
                set((state) => {
                    const existing = state.items.find((i) => i.product.id === product.id);
                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                i.product.id === product.id
                                    ? { ...i, quantity: i.quantity + quantity }
                                    : i
                            ),
                        };
                    }
                    return { items: [...state.items, { product, quantity }] };
                });
            },
            removeItem: (productId) => {
                set((state) => ({
                    items: state.items.filter((i) => i.product.id !== productId),
                }));
            },
            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }
                set((state) => ({
                    items: state.items.map((i) =>
                        i.product.id === productId ? { ...i, quantity } : i
                    ),
                }));
            },
            clearCart: () => set({ items: [] }),
            getSubtotal: () => {
                return get().items.reduce((sum, item) => {
                    const price = item.product.discount_percentage
                        ? item.product.selling_price * (1 - item.product.discount_percentage / 100)
                        : item.product.selling_price;
                    return sum + price * item.quantity;
                }, 0);
            },
            getShipping: () => {
                const subtotal = get().getSubtotal();
                const settings = useResourceStore.getState().settings;
                return subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingStandard;
            },
            getTax: () => {
                const settings = useResourceStore.getState().settings;
                return Math.round(get().getSubtotal() * settings.taxRate);
            },
            getTotal: () => {
                return get().getSubtotal() + get().getShipping() + get().getTax();
            },
            getItemCount: () => {
                return get().items.reduce((sum, item) => sum + item.quantity, 0);
            },
        }),
        { name: 'she-beauty-cart' }
    )
);

export const useWishlistStore = create<WishlistStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product) => {
                set((state) => {
                    if (state.items.find((i) => i.product.id === product.id)) return state;
                    return {
                        items: [
                            ...state.items,
                            { product, added_at: new Date().toISOString() },
                        ],
                    };
                });
            },
            removeItem: (productId) => {
                set((state) => ({
                    items: state.items.filter((i) => i.product.id !== productId),
                }));
            },
            isInWishlist: (productId) => {
                return get().items.some((i) => i.product.id === productId);
            },
            clearWishlist: () => set({ items: [] }),
        }),
        { name: 'she-beauty-wishlist' }
    )
);

export const useUIStore = create<UIStore>()((set) => ({
    isCartOpen: false,
    isMobileMenuOpen: false,
    searchQuery: '',
    setCartOpen: (open) => set({ isCartOpen: open }),
    setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
    setSearchQuery: (query) => set({ searchQuery: query }),
}));

import { supabase } from './supabase';

export const useAuthStore = create<AuthStore>()((set) => ({
    user: null,
    session: null,
    isLoading: true,
    setUser: (user) => set({ user }),
    setSession: (session) => set({ session }),
    setLoading: (loading) => set({ isLoading: loading }),
    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null });
    },
}));

export const useResourceStore = create<ResourceStore>()(
    persist(
        (set) => ({
            products: initialProducts,
            categories: initialCategories,
            orders: initialOrders,
            customers: [],
            settings: {
                storeName: 'She Loves It',
                email: 'hello@shelovesit.com',
                phone: '+92 300 1234567',
                whatsapp: '+92 300 1234567',
                bankName: 'Meezan Bank Ltd.',
                accountName: 'SHE LOVES IT',
                accountNumber: '0101-0202-0303-0404',
                jazzcash: '0300-1234567',
                shippingStandard: 200,
                shippingExpress: 500,
                freeShippingThreshold: 3000,
                taxRate: 0.05
            },

            // Product Actions
            addProduct: (product) => set((state) => ({
                products: [{
                    ...product,
                    id: Math.max(...state.products.map(p => p.id), 0) + 1,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                } as Product, ...state.products]
            })),
            updateProduct: (id, updatedProduct) => set((state) => ({
                products: state.products.map((p) =>
                    p.id === id ? { ...p, ...updatedProduct, updated_at: new Date().toISOString() } : p
                )
            })),
            deleteProduct: (id) => set((state) => ({
                products: state.products.filter((p) => p.id !== id)
            })),

            // Category Actions
            addCategory: (category) => set((state) => ({
                categories: [...state.categories, {
                    ...category,
                    id: Math.max(...state.categories.map(c => c.id), 0) + 1,
                }]
            })),
            updateCategory: (id, updatedCategory) => set((state) => ({
                categories: state.categories.map((c) =>
                    c.id === id ? { ...c, ...updatedCategory } : c
                )
            })),
            deleteCategory: (id) => set((state) => ({
                categories: state.categories.filter((c) => c.id !== id)
            })),

            // Order Actions
            addOrder: (order) => set((state) => ({
                orders: [{
                    ...order,
                    id: Math.max(...state.orders.map(o => o.id), 0) + 1,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                } as Order, ...state.orders]
            })),
            updateOrder: (id, updatedOrder) => set((state) => ({
                orders: state.orders.map((o) =>
                    o.id === id ? { ...o, ...updatedOrder, updated_at: new Date().toISOString() } : o
                )
            })),
            deleteOrder: (id) => set((state) => ({
                orders: state.orders.filter((o) => o.id !== id)
            })),

            // Settings Actions
            updateSettings: (newSettings) => set((state) => ({
                settings: { ...state.settings, ...newSettings }
            })),

            // Customer Actions
            updateCustomer: (id, updatedCustomer) => set((state) => ({
                customers: state.customers.map((c) =>
                    c.id === id ? { ...c, ...updatedCustomer } : c
                )
            })),

            // Sync
            refreshFromSupabase: async () => {
                try {
                    const { data: products } = await supabase.from('products').select('*, images:product_images(*)');
                    const { data: categories } = await supabase.from('categories').select('*').order('order_index');
                    const { data: settings } = await supabase.from('store_settings').select('*').eq('id', 1).single();
                    const { data: profiles } = await supabase.from('profiles').select('*');

                    if (products) set({ products: products as any[] });
                    if (categories) set({ categories: categories as any[] });
                    if (profiles) set({ customers: profiles as User[] });
                    if (settings) {
                        set({
                            settings: {
                                storeName: settings.store_name,
                                email: settings.email,
                                phone: settings.phone,
                                whatsapp: settings.whatsapp,
                                bankName: settings.bank_name,
                                accountName: settings.account_name,
                                accountNumber: settings.account_number,
                                jazzcash: settings.jazzcash,
                                shippingStandard: Number(settings.shipping_standard),
                                shippingExpress: Number(settings.shipping_express),
                                freeShippingThreshold: Number(settings.free_shipping_threshold),
                                taxRate: Number(settings.tax_rate)
                            }
                        });
                    }
                } catch (e) {
                    console.error("Error refreshing from Supabase:", e);
                }
            }
        }),
        { name: 'she-beauty-resources' }
    )
);
