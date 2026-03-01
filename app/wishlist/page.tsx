'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useWishlistStore } from '@/lib/store';

export default function WishlistPage() {
    const { items, clearWishlist } = useWishlistStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <>
            <Header />
            <main className="min-h-screen bg-muted/20">
                <div className="bg-gradient-to-r from-she-pink-lighter via-white to-she-pink-lighter/30 border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <h1 className="text-3xl font-bold font-[var(--font-display)] flex items-center gap-3">
                            <Heart className="w-8 h-8 text-she-pink" />
                            My Wishlist
                        </h1>
                        <p className="text-muted-foreground mt-1">{items.length} items saved</p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {items.length > 0 ? (
                        <>
                            <div className="flex justify-end mb-6">
                                <Button variant="outline" onClick={clearWishlist} className="rounded-full text-sm">
                                    Clear Wishlist
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {items.map((item, i) => (
                                    <ProductCard key={item.product.id} product={item.product} index={i} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-20">
                            <div className="w-24 h-24 rounded-full bg-she-pink-lighter flex items-center justify-center mx-auto mb-6">
                                <Heart className="w-10 h-10 text-she-pink" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
                            <p className="text-muted-foreground text-sm mb-6">
                                Start saving your favorite beauty products!
                            </p>
                            <Link href="/products">
                                <Button className="bg-she-pink hover:bg-she-pink-dark text-white rounded-full px-8">
                                    Explore Products
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
