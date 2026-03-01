'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';
import { useCartStore, useWishlistStore, useUIStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface ProductCardProps {
    product: Product;
    index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
    const addItem = useCartStore((s) => s.addItem);
    const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlistStore();
    const { setCartOpen } = useUIStore();
    const [wishlisted, setWishlisted] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setWishlisted(isInWishlist(product.id));
    }, [product.id, isInWishlist]);

    const primaryImage = product.images.find((i) => i.is_primary) || product.images[0];
    const hasDiscount = product.discount_percentage != null && product.discount_percentage > 0;
    const finalPrice = hasDiscount
        ? product.selling_price * (1 - product.discount_percentage! / 100)
        : product.selling_price;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product);
        setCartOpen(true);
        toast.success(`${product.name} added to cart!`, {
            style: {
                borderRadius: '50px',
                background: '#1A1A1A',
                color: '#fff',
                fontSize: '14px',
            },
            iconTheme: { primary: '#E91E63', secondary: '#fff' },
        });
    };

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (wishlisted) {
            removeWishlist(product.id);
            toast('Removed from wishlist', {
                icon: '💔',
                style: { borderRadius: '50px', fontSize: '14px' },
            });
        } else {
            addWishlist(product);
            toast('Added to wishlist!', {
                icon: '❤️',
                style: { borderRadius: '50px', fontSize: '14px' },
            });
        }
    };

    return (
        <Link href={`/products/${product.id}`}>
            <div
                className="group relative bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border/50 animate-fade-in-up"
                style={{ animationDelay: `${index * 80}ms` }}
            >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-she-pink-lighter/20">
                    <Image
                        src={primaryImage?.url || '/placeholder.jpg'}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        {hasDiscount && (
                            <Badge className="bg-she-pink text-white border-0 text-xs rounded-full px-2.5 shadow-lg">
                                -{product.discount_percentage}%
                            </Badge>
                        )}
                        {product.stock_quantity <= product.low_stock_alert && (
                            <Badge className="bg-she-warning text-white border-0 text-xs rounded-full px-2.5 shadow-lg">
                                Low Stock
                            </Badge>
                        )}
                        {product.tags?.includes('bestseller') && (
                            <Badge className="bg-she-pink-dark text-white border-0 text-xs rounded-full px-2.5 shadow-lg">
                                Bestseller
                            </Badge>
                        )}
                    </div>

                    {/* Wishlist Button */}
                    <button
                        onClick={handleWishlist}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-all hover:scale-110"
                    >
                        <Heart
                            className={`w-4 h-4 transition-colors ${mounted && wishlisted ? 'fill-she-pink text-she-pink' : 'text-gray-500'
                                }`}
                        />
                    </button>

                    {/* Quick Add */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <Button
                            onClick={handleAddToCart}
                            className="w-full bg-she-pink hover:bg-she-pink-dark text-white rounded-full h-10 shadow-xl font-medium text-sm"
                        >
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            Add to Cart
                        </Button>
                    </div>
                </div>

                {/* Info */}
                <div className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
                    <h3 className="font-medium text-sm line-clamp-2 group-hover:text-she-pink transition-colors min-h-[2.5rem]">
                        {product.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-2">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < Math.floor(product.rating)
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-gray-200'
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-muted-foreground">({product.review_count})</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="font-semibold text-base text-she-pink">
                            Rs. {Math.round(finalPrice).toLocaleString()}
                        </span>
                        {hasDiscount && (
                            <span className="text-xs text-muted-foreground line-through">
                                Rs. {product.selling_price.toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
