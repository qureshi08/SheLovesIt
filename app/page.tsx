'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Sparkles,
  Truck,
  RefreshCw,
  Shield,
  Star,
  TrendingUp,
  Gift,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useResourceStore } from '@/lib/store';

export default function HomePage() {
  const { products, categories } = useResourceStore();
  const trendingProducts = products.filter((p) =>
    p.tags?.includes('bestseller') || p.tags?.includes('trending')
  );
  const newArrivals = products.slice(0, 8);

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-she-pink-lighter via-white to-she-pink-lighter/30">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-she-pink/10 rounded-full blur-3xl animate-float" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-she-pink-light/20 rounded-full blur-3xl" style={{ animationDelay: '1.5s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-she-pink/5 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-she-pink-dark font-medium mb-6 shadow-sm border border-she-pink/10">
                  <Sparkles className="w-4 h-4" />
                  New Collection 2026
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 font-[var(--font-display)]">
                  Discover Your{' '}
                  <span className="gradient-text">Perfect</span>
                  <br />
                  Beauty Essentials
                </h1>
                <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
                  Premium cosmetics and skincare that celebrate your unique beauty.
                  Cruelty-free, high-performance formulas designed for every skin tone.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Link href="/products">
                    <Button className="bg-she-pink hover:bg-she-pink-dark text-white rounded-full h-12 px-8 text-base shadow-xl shadow-she-pink/20 hover:shadow-she-pink/30 transition-all">
                      Shop Now
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/products?category=skincare">
                    <Button variant="outline" className="rounded-full h-12 px-8 text-base border-she-pink/30 text-she-pink-dark hover:bg-she-pink-lighter">
                      Explore Skincare
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Hero Image Collage - Updated with relevant luxury assets */}
              <div className="relative hidden lg:block">
                <div className="relative w-full h-[550px]">
                  <div className="absolute top-0 right-0 w-80 h-80 rounded-3xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-all duration-700 z-10 border-4 border-white/50 backdrop-blur-sm">
                    <Image
                      src="/hero1.png"
                      alt="Luxury Cosmetics"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute bottom-4 left-0 w-72 h-72 rounded-3xl overflow-hidden shadow-2xl -rotate-3 hover:rotate-0 transition-all duration-700 border-4 border-white/50 backdrop-blur-sm">
                    <Image
                      src="/hero2.png"
                      alt="Premium Skincare"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full overflow-hidden shadow-2xl border-8 border-white z-20 hover:scale-105 transition-transform duration-500">
                    <Image
                      src="/hero3.png"
                      alt="Beauty Palette"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold mb-3 font-[var(--font-display)] tracking-tight text-she-neutral">Shop by Category</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-she-pink-dark to-she-pink mx-auto rounded-full" />
              <p className="text-muted-foreground mt-4 italic">Find exactly what you need</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat, i) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="group animate-fade-in-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="relative bg-white rounded-2xl p-6 text-center border border-border/50 hover:border-she-pink/40 hover:shadow-2xl hover:shadow-she-pink/10 transition-all duration-500 group-hover:-translate-y-2 group-hover:scale-[1.02]">
                    <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-500">{cat.icon}</div>
                    <h3 className="font-bold text-sm mb-1 group-hover:text-she-pink transition-colors tracking-tight">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500">{cat.product_count} Products</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Trending Products */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2 lg:justify-start justify-center">
                  <TrendingUp className="w-5 h-5 text-she-pink font-bold" />
                  <span className="text-xs text-she-pink font-bold uppercase tracking-[0.2em]">Trending</span>
                </div>
                <h2 className="text-4xl font-bold font-[var(--font-display)] tracking-tight text-she-neutral">Best Sellers</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-she-pink-dark to-she-pink mt-3 rounded-full lg:mx-0 mx-auto" />
              </div>
              <Link href="/products">
                <Button variant="outline" className="rounded-full border-she-pink/30 text-she-pink-dark hover:bg-she-pink-lighter">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingProducts.slice(0, 4).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>



        {/* New Arrivals */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2 lg:justify-start justify-center">
                  <Sparkles className="w-5 h-5 text-she-pink font-bold" />
                  <span className="text-xs text-she-pink font-bold uppercase tracking-[0.2em]">Just In</span>
                </div>
                <h2 className="text-4xl font-bold font-[var(--font-display)] tracking-tight text-she-neutral">New Arrivals</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-she-pink-dark to-she-pink mt-3 rounded-full lg:mx-0 mx-auto" />
              </div>
              <Link href="/products">
                <Button variant="outline" className="rounded-full border-she-pink/30 text-she-pink-dark hover:bg-she-pink-lighter">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
