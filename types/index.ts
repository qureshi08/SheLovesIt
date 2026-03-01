export interface Product {
  id: number;
  name: string;
  description: string;
  ingredients?: string;
  sku: string;
  category_id: number;
  category: string;
  subcategory?: string;
  cost_price: number;
  selling_price: number;
  discount_percentage?: number;
  stock_quantity: number;
  low_stock_alert: number;
  images: ProductImage[];
  rating: number;
  review_count: number;
  is_active: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  url: string;
  public_id: string;
  is_primary: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  product_count: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface WishlistItem {
  product: Product;
  added_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total_amount: number;
  status: OrderStatus;
  shipping_address: ShippingAddress;
  shipping_method: string;
  tracking_number?: string;
  payment_method: string;
  payment_status: PaymentStatus;
  payment_screenshot_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  quantity: number;
  price_at_purchase: number;
}

export interface ShippingAddress {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  country?: string;
}

export type OrderStatus = 'pending' | 'awaiting_payment_approval' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface User {
  id: string;
  email: string;
  phone?: string;
  full_name: string;
  avatar_url?: string;
  addresses: ShippingAddress[];
  created_at: string;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface AdminStats {
  today_sales: number;
  today_sales_change: number;
  total_orders: number;
  total_orders_change: number;
  visitors: number;
  visitors_change: number;
  low_stock_products: Product[];
  top_products: Product[];
  recent_orders: Order[];
}

export interface Coupon {
  id: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount?: number;
  max_uses?: number;
  used_count: number;
  is_active: boolean;
  expires_at?: string;
}
