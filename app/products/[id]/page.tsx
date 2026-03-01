'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
    Star,
    Heart,
    ShoppingBag,
    Zap,
    Truck,
    RefreshCw,
    Shield,
    Minus,
    Plus,
    ChevronRight,
    Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { reviews } from '@/lib/data';
import { useCartStore, useWishlistStore, useUIStore, useResourceStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
    const { products } = useResourceStore();
    const params = useParams();
    const productId = Number(params.id);
    const product = products.find((p) => p.id === productId);

    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);

    const addItem = useCartStore((s) => s.addItem);
    const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlistStore();
    const { setCartOpen } = useUIStore();
    const [wishlisted, setWishlisted] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (product) {
            setWishlisted(isInWishlist(product.id));
        }
    }, [product, isInWishlist]);

    if (!product) {
        return (
            <>
                <Header />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
                        <Link href="/products">
                            <Button className="bg-she-pink hover:bg-she-pink-dark text-white rounded-full">
                                Back to Products
                            </Button>
                        </Link>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    // const wishlisted = isInWishlist(product.id); (redefined in useEffect)
    const finalPrice = product.discount_percentage
        ? product.selling_price * (1 - product.discount_percentage / 100)
        : product.selling_price;
    const productReviews = reviews.filter((r) => r.product_id === product.id);
    const relatedProducts = products
        .filter((p) => p.category_id === product.category_id && p.id !== product.id)
        .slice(0, 4);

    const handleAddToCart = () => {
        addItem(product, quantity);
        setCartOpen(true);
        toast.success(`${product.name} added to cart!`, {
            style: { borderRadius: '50px', background: '#1A1A1A', color: '#fff', fontSize: '14px' },
            iconTheme: { primary: '#E91E63', secondary: '#fff' },
        });
    };

    const handleBuyNow = () => {
        addItem(product, quantity);
        window.location.href = '/checkout';
    };

    const handleWishlist = () => {
        if (wishlisted) {
            removeWishlist(product.id);
            toast('Removed from wishlist', { icon: '💔', style: { borderRadius: '50px', fontSize: '14px' } });
        } else {
            addWishlist(product);
            toast('Added to wishlist!', { icon: '❤️', style: { borderRadius: '50px', fontSize: '14px' } });
        }
    };

    return (
        <>
            <Header />
            <main className="min-h-screen">
                {/* Breadcrumb */}
                <div className="bg-muted/30 border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Link href="/" className="hover:text-she-pink transition-colors">Home</Link>
                            <ChevronRight className="w-3 h-3" />
                            <Link href="/products" className="hover:text-she-pink transition-colors">Products</Link>
                            <ChevronRight className="w-3 h-3" />
                            <Link href={`/products?category=${product.category.toLowerCase().replace(' ', '-')}`} className="hover:text-she-pink transition-colors">
                                {product.category}
                            </Link>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
                        </nav>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid lg:grid-cols-2 gap-10">
                        {/* Image Gallery */}
                        <div className="space-y-4">
                            <div className="relative aspect-square rounded-2xl overflow-hidden bg-she-pink-lighter/20 border">
                                <Image
                                    src={product.images[selectedImage]?.url || product.images[0]?.url}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                {product.discount_percentage && product.discount_percentage > 0 && (
                                    <Badge className="absolute top-4 left-4 bg-she-pink text-white border-0 text-sm rounded-full px-3 py-1 shadow-lg">
                                        -{product.discount_percentage}% OFF
                                    </Badge>
                                )}
                            </div>
                            {product.images.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {product.images.map((img, i) => (
                                        <button
                                            key={img.id}
                                            onClick={() => setSelectedImage(i)}
                                            className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${selectedImage === i ? 'border-she-pink shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                                                }`}
                                        >
                                            <Image src={img.url} alt="" fill className="object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div>
                            <div className="mb-2">
                                <span className="text-sm text-she-pink font-medium">{product.category}</span>
                                {product.subcategory && (
                                    <span className="text-sm text-muted-foreground"> / {product.subcategory}</span>
                                )}
                            </div>

                            <h1 className="text-3xl font-bold mb-4 font-[var(--font-display)]">{product.name}</h1>

                            {/* Rating */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-5 h-5 ${i < Math.floor(product.rating)
                                                ? 'fill-amber-400 text-amber-400'
                                                : 'text-gray-200'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-medium">{product.rating}</span>
                                <span className="text-sm text-muted-foreground">({product.review_count} reviews)</span>
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline gap-3 mb-6">
                                <span className="text-3xl font-bold text-she-pink">
                                    Rs. {Math.round(finalPrice).toLocaleString()}
                                </span>
                                {Number(product.discount_percentage || 0) > 0 && (
                                    <>
                                        <span className="text-lg text-muted-foreground line-through">
                                            Rs. {product.selling_price.toLocaleString()}
                                        </span>
                                        <Badge className="bg-she-pink-lighter text-she-pink-dark border-0 rounded-full">
                                            Save Rs. {Math.round(product.selling_price - finalPrice).toLocaleString()}
                                        </Badge>
                                    </>
                                )}
                            </div>

                            <Separator className="mb-6" />

                            <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>

                            {/* Quantity + Actions */}
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium">Quantity:</span>
                                    <div className="flex items-center gap-1 border rounded-full">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-9 h-9 flex items-center justify-center hover:bg-muted rounded-full transition-colors"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-10 text-center font-medium">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-9 h-9 flex items-center justify-center hover:bg-muted rounded-full transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleAddToCart}
                                        className="flex-1 bg-she-pink hover:bg-she-pink-dark text-white rounded-full h-12 font-medium shadow-lg shadow-she-pink/20"
                                    >
                                        <ShoppingBag className="w-5 h-5 mr-2" />
                                        Add to Cart
                                    </Button>
                                    <Button
                                        onClick={handleBuyNow}
                                        variant="outline"
                                        className="flex-1 rounded-full h-12 font-medium border-she-pink text-she-pink-dark hover:bg-she-pink-lighter"
                                    >
                                        <Zap className="w-5 h-5 mr-2" />
                                        Buy Now
                                    </Button>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="ghost"
                                        onClick={handleWishlist}
                                        className="flex-1 rounded-full h-10"
                                    >
                                        <Heart className={`w-4 h-4 mr-2 ${mounted && wishlisted ? 'fill-she-pink text-she-pink' : ''}`} />
                                        {mounted && wishlisted ? 'Saved' : 'Save to Wishlist'}
                                    </Button>
                                    <Button variant="ghost" className="flex-1 rounded-full h-10">
                                        <Share2 className="w-4 h-4 mr-2" />
                                        Share
                                    </Button>
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { icon: Truck, text: product.selling_price >= 3000 ? 'Free Shipping' : 'Rs. 200 Shipping' },
                                    { icon: RefreshCw, text: '30-Day Returns' },
                                    { icon: Shield, text: '100% Authentic' },
                                ].map((badge, i) => (
                                    <div key={i} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50 text-center">
                                        <badge.icon className="w-5 h-5 text-she-pink" />
                                        <span className="text-xs text-muted-foreground">{badge.text}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Stock Status */}
                            <div className="mt-4 p-3 rounded-xl bg-muted/50">
                                {product.stock_quantity > product.low_stock_alert ? (
                                    <p className="text-sm text-she-success font-medium flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-she-success" />
                                        In Stock
                                    </p>
                                ) : product.stock_quantity > 0 ? (
                                    <p className="text-sm text-she-warning font-medium flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-she-warning animate-pulse" />
                                        Low Stock - Only {product.stock_quantity} left!
                                    </p>
                                ) : (
                                    <p className="text-sm text-she-error font-medium flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-she-error" />
                                        Out of Stock
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabs: Details, Ingredients, Reviews */}
                    <div className="mt-16">
                        <Tabs defaultValue="reviews">
                            <TabsList className="bg-muted/50 rounded-full p-1">
                                <TabsTrigger value="details" className="rounded-full data-[state=active]:bg-she-pink data-[state=active]:text-white">
                                    Details
                                </TabsTrigger>
                                {product.ingredients && (
                                    <TabsTrigger value="ingredients" className="rounded-full data-[state=active]:bg-she-pink data-[state=active]:text-white">
                                        Ingredients
                                    </TabsTrigger>
                                )}
                                <TabsTrigger value="reviews" className="rounded-full data-[state=active]:bg-she-pink data-[state=active]:text-white">
                                    Reviews ({productReviews.length})
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="details" className="mt-6">
                                <div className="max-w-3xl bg-white rounded-2xl border p-6">
                                    <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="p-3 rounded-xl bg-muted/50">
                                            <p className="text-xs text-muted-foreground">SKU</p>
                                            <p className="text-sm font-medium">{product.sku}</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-muted/50">
                                            <p className="text-xs text-muted-foreground">Category</p>
                                            <p className="text-sm font-medium">{product.category}</p>
                                        </div>
                                        {product.tags && (
                                            <div className="p-3 rounded-xl bg-muted/50 col-span-2">
                                                <p className="text-xs text-muted-foreground mb-2">Tags</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {product.tags.map((tag) => (
                                                        <Badge key={tag} variant="secondary" className="rounded-full text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                            {product.ingredients && (
                                <TabsContent value="ingredients" className="mt-6">
                                    <div className="max-w-3xl bg-white rounded-2xl border p-6">
                                        <p className="text-muted-foreground leading-relaxed">{product.ingredients}</p>
                                    </div>
                                </TabsContent>
                            )}
                            <TabsContent value="reviews" className="mt-6">
                                <div className="max-w-3xl space-y-4">
                                    {productReviews.length > 0 ? (
                                        productReviews.map((review) => (
                                            <div key={review.id} className="bg-white rounded-2xl border p-5">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-she-pink-lighter flex items-center justify-center">
                                                            <span className="text-she-pink font-semibold text-sm">
                                                                {review.user_name.split(' ').map((n) => n[0]).join('')}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm">{review.user_name}</p>
                                                            <div className="flex items-center gap-1">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                                                                            }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(review.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 bg-white rounded-2xl border">
                                            <Star className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                                            <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <div className="mt-16">
                            <h2 className="text-2xl font-bold mb-6 font-[var(--font-display)]">You May Also Like</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {relatedProducts.map((p, i) => (
                                    <ProductCard key={p.id} product={p} index={i} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
