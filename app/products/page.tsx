'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, Grid3X3, LayoutGrid, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useResourceStore } from '@/lib/store';

function ProductsContent() {
    const { products, categories } = useResourceStore();
    const searchParams = useSearchParams();
    const categorySlug = searchParams.get('category');
    const searchQuery = searchParams.get('search');

    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        categorySlug ? [categorySlug] : []
    );
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
    const [ratingFilter, setRatingFilter] = useState<number>(0);
    const [sortBy, setSortBy] = useState('featured');
    const [gridCols, setGridCols] = useState(4);
    const [localSearch, setLocalSearch] = useState(searchQuery || '');

    useEffect(() => {
        if (categorySlug) setSelectedCategories([categorySlug]);
    }, [categorySlug]);

    const filteredProducts = useMemo(() => {
        let filtered = [...products];

        // Search
        if (localSearch) {
            const q = localSearch.toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.category.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q) ||
                    p.tags?.some((t) => t.toLowerCase().includes(q))
            );
        }

        // Category
        if (selectedCategories.length > 0) {
            filtered = filtered.filter((p) => {
                const cat = categories.find((c) => c.id === p.category_id);
                return cat && selectedCategories.includes(cat.slug);
            });
        }

        // Price
        filtered = filtered.filter(
            (p) => p.selling_price >= priceRange[0] && p.selling_price <= priceRange[1]
        );

        // Rating
        if (ratingFilter > 0) {
            filtered = filtered.filter((p) => p.rating >= ratingFilter);
        }

        // Sort
        switch (sortBy) {
            case 'price-asc':
                filtered.sort((a, b) => a.selling_price - b.selling_price);
                break;
            case 'price-desc':
                filtered.sort((a, b) => b.selling_price - a.selling_price);
                break;
            case 'rating':
                filtered.sort((a, b) => b.rating - a.rating);
                break;
            case 'newest':
                filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                break;
            case 'name':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }

        return filtered;
    }, [selectedCategories, priceRange, ratingFilter, sortBy, localSearch]);

    const toggleCategory = (slug: string) => {
        setSelectedCategories((prev) =>
            prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
        );
    };

    const clearFilters = () => {
        setSelectedCategories([]);
        setPriceRange([0, 5000]);
        setRatingFilter(0);
        setLocalSearch('');
    };

    const activeFilterCount =
        selectedCategories.length +
        (priceRange[0] > 0 || priceRange[1] < 5000 ? 1 : 0) +
        (ratingFilter > 0 ? 1 : 0);

    const FilterPanel = () => (
        <div className="space-y-6">
            {/* Search */}
            <div>
                <Label className="text-sm font-semibold mb-2 block">Search</Label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        placeholder="Search products..."
                        className="w-full h-10 pl-9 pr-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-she-pink/20 focus:border-she-pink"
                    />
                </div>
            </div>

            {/* Categories */}
            <div>
                <Label className="text-sm font-semibold mb-3 block">Categories</Label>
                <div className="space-y-2">
                    {categories.map((cat) => (
                        <label
                            key={cat.id}
                            className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                        >
                            <Checkbox
                                checked={selectedCategories.includes(cat.slug)}
                                onCheckedChange={() => toggleCategory(cat.slug)}
                                className="data-[state=checked]:bg-she-pink data-[state=checked]:border-she-pink"
                            />
                            <span className="text-sm">{cat.icon} {cat.name}</span>
                            <span className="text-xs text-muted-foreground ml-auto">({cat.product_count})</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <Label className="text-sm font-semibold mb-3 block">
                    Price Range
                </Label>
                <Slider
                    value={priceRange}
                    onValueChange={(val) => setPriceRange(val as [number, number])}
                    min={0}
                    max={5000}
                    step={100}
                    className="mb-3"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Rs. {priceRange[0].toLocaleString()}</span>
                    <span>Rs. {priceRange[1].toLocaleString()}</span>
                </div>
            </div>

            {/* Rating */}
            <div>
                <Label className="text-sm font-semibold mb-3 block">Minimum Rating</Label>
                <div className="space-y-1.5">
                    {[4, 3, 2, 1].map((rating) => (
                        <button
                            key={rating}
                            onClick={() => setRatingFilter(ratingFilter === rating ? 0 : rating)}
                            className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors ${ratingFilter === rating
                                ? 'bg-she-pink-lighter text-she-pink-dark'
                                : 'hover:bg-muted'
                                }`}
                        >
                            <span className="text-amber-400">{'★'.repeat(rating)}</span>
                            <span className="text-gray-300">{'★'.repeat(5 - rating)}</span>
                            <span className="text-xs text-muted-foreground ml-auto">& up</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Clear */}
            {activeFilterCount > 0 && (
                <Button
                    variant="outline"
                    className="w-full rounded-full"
                    onClick={clearFilters}
                >
                    <X className="w-4 h-4 mr-2" />
                    Clear All Filters
                </Button>
            )}
        </div>
    );

    return (
        <>
            <Header />
            <main className="min-h-screen bg-muted/20">
                {/* Page Header */}
                <div className="bg-gradient-to-r from-she-pink-lighter via-white to-she-pink-lighter/30 border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <h1 className="text-3xl font-bold font-[var(--font-display)]">
                            {categorySlug
                                ? categories.find((c) => c.slug === categorySlug)?.name || 'Products'
                                : searchQuery
                                    ? `Results for "${searchQuery}"`
                                    : 'All Products'}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {filteredProducts.length} products found
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex gap-8">
                        {/* Desktop Sidebar */}
                        <aside className="hidden lg:block w-64 flex-shrink-0">
                            <div className="sticky top-28 bg-white rounded-2xl border p-5">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <SlidersHorizontal className="w-4 h-4 text-she-pink" />
                                    Filters
                                    {activeFilterCount > 0 && (
                                        <Badge className="bg-she-pink text-white text-xs ml-auto">
                                            {activeFilterCount}
                                        </Badge>
                                    )}
                                </h3>
                                <FilterPanel />
                            </div>
                        </aside>

                        {/* Products Grid */}
                        <div className="flex-1">
                            {/* Toolbar */}
                            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                                <div className="flex items-center gap-2">
                                    {/* Mobile Filter Button */}
                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <Button variant="outline" className="lg:hidden rounded-full">
                                                <SlidersHorizontal className="w-4 h-4 mr-2" />
                                                Filters
                                                {activeFilterCount > 0 && (
                                                    <Badge className="bg-she-pink text-white text-xs ml-2">
                                                        {activeFilterCount}
                                                    </Badge>
                                                )}
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent side="left" className="w-80 p-6 overflow-y-auto">
                                            <h3 className="font-semibold mb-6 flex items-center gap-2 text-lg">
                                                <SlidersHorizontal className="w-5 h-5 text-she-pink" />
                                                Filters
                                            </h3>
                                            <FilterPanel />
                                        </SheetContent>
                                    </Sheet>

                                    {/* Active Filters */}
                                    {selectedCategories.map((slug) => {
                                        const cat = categories.find((c) => c.slug === slug);
                                        return cat ? (
                                            <Badge
                                                key={slug}
                                                className="bg-she-pink-lighter text-she-pink-dark border-0 rounded-full cursor-pointer"
                                                onClick={() => toggleCategory(slug)}
                                            >
                                                {cat.name}
                                                <X className="w-3 h-3 ml-1" />
                                            </Badge>
                                        ) : null;
                                    })}
                                </div>

                                <div className="flex items-center gap-3">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="h-9 px-3 text-sm border rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-she-pink/20"
                                    >
                                        <option value="featured">Featured</option>
                                        <option value="newest">Newest</option>
                                        <option value="price-asc">Price: Low to High</option>
                                        <option value="price-desc">Price: High to Low</option>
                                        <option value="rating">Highest Rated</option>
                                        <option value="name">Name A-Z</option>
                                    </select>

                                    <div className="hidden sm:flex items-center gap-1 border rounded-full p-0.5">
                                        <button
                                            onClick={() => setGridCols(3)}
                                            className={`p-1.5 rounded-full ${gridCols === 3 ? 'bg-she-pink text-white' : 'text-muted-foreground'}`}
                                        >
                                            <Grid3X3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setGridCols(4)}
                                            className={`p-1.5 rounded-full ${gridCols === 4 ? 'bg-she-pink text-white' : 'text-muted-foreground'}`}
                                        >
                                            <LayoutGrid className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Product Grid */}
                            {filteredProducts.length > 0 ? (
                                <div
                                    className={`grid gap-5 ${gridCols === 3
                                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                                        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                                        }`}
                                >
                                    {filteredProducts.map((product, i) => (
                                        <ProductCard key={product.id} product={product} index={i} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <div className="w-20 h-20 rounded-full bg-she-pink-lighter flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-8 h-8 text-she-pink" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">No products found</h3>
                                    <p className="text-muted-foreground text-sm mb-6">
                                        Try adjusting your filters or search terms
                                    </p>
                                    <Button onClick={clearFilters} className="bg-she-pink hover:bg-she-pink-dark text-white rounded-full">
                                        Clear All Filters
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-she-pink border-t-transparent rounded-full" />
            </div>
        }>
            <ProductsContent />
        </Suspense>
    );
}
