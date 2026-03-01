'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore, useUIStore } from '@/lib/store';

export default function CartSheet() {
    const { items, updateQuantity, removeItem, getSubtotal, getShipping, getTax, getTotal, getItemCount } = useCartStore();
    const { setCartOpen } = useUIStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const formatPrice = (price: number) => `Rs. ${Math.round(price).toLocaleString()}`;

    if (!mounted) return null;

    if (items.length === 0) {
        return (
            <SheetContent className="w-full sm:max-w-md flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                    <div className="w-24 h-24 rounded-full bg-she-pink-lighter flex items-center justify-center mb-6">
                        <ShoppingBag className="w-10 h-10 text-she-pink" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                        Start shopping and discover amazing beauty products!
                    </p>
                    <Link href="/products" onClick={() => setCartOpen(false)}>
                        <Button className="bg-she-pink hover:bg-she-pink-dark text-white rounded-full px-6">
                            Continue Shopping
                        </Button>
                    </Link>
                </div>
            </SheetContent>
        );
    }

    return (
        <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
            <div className="p-6 border-b">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-she-pink" />
                    Shopping Cart
                    <span className="text-sm text-muted-foreground font-normal">
                        ({getItemCount()} items)
                    </span>
                </h2>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {items.map((item) => {
                    const finalPrice = item.product.discount_percentage
                        ? item.product.selling_price * (1 - item.product.discount_percentage / 100)
                        : item.product.selling_price;

                    return (
                        <div key={item.product.id} className="flex gap-3 p-3 rounded-xl bg-muted/50 group">
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-she-pink-lighter/30">
                                <Image
                                    src={item.product.images[0]?.url || '/placeholder.jpg'}
                                    alt={item.product.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium line-clamp-2 leading-tight">
                                    {item.product.name}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-0.5">{item.product.category}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-1 border rounded-full">
                                        <button
                                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                            className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-full transition-colors"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                            className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-full transition-colors"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <p className="text-sm font-semibold text-she-pink">
                                        {formatPrice(finalPrice * item.quantity)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => removeItem(item.product.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity self-start p-1 hover:bg-destructive/10 rounded"
                            >
                                <Trash2 className="w-4 h-4 text-destructive" />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Cart Summary */}
            <div className="border-t p-6 space-y-3 bg-muted/30">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(getSubtotal())}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{getShipping() === 0 ? <span className="text-she-success font-medium">Free</span> : formatPrice(getShipping())}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (5%)</span>
                    <span>{formatPrice(getTax())}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span className="text-she-pink">{formatPrice(getTotal())}</span>
                </div>

                {getShipping() > 0 && (
                    <p className="text-xs text-center text-muted-foreground">
                        Add {formatPrice(3000 - getSubtotal())} more for free shipping!
                    </p>
                )}

                <div className="space-y-2 pt-2">
                    <Link href="/checkout" onClick={() => setCartOpen(false)}>
                        <Button className="w-full bg-she-pink hover:bg-she-pink-dark text-white rounded-full h-11 font-medium">
                            Checkout
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                    <Link href="/products" onClick={() => setCartOpen(false)}>
                        <Button variant="outline" className="w-full rounded-full h-10 mt-2">
                            Continue Shopping
                        </Button>
                    </Link>
                </div>
            </div>
        </SheetContent>
    );
}
