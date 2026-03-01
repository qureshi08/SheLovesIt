'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Search,
    ShoppingBag,
    Heart,
    User,
    Menu,
    X,
    ChevronDown,
    LogOut,
    LayoutDashboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCartStore, useWishlistStore, useUIStore, useResourceStore, useAuthStore } from '@/lib/store';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CartSheet from '@/components/CartSheet';

export default function Header() {
    const { categories } = useResourceStore();
    const [scrolled, setScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchRef = useRef<HTMLInputElement>(null);
    const [mounted, setMounted] = useState(false);

    const itemCount = useCartStore((s) => s.getItemCount());
    const wishlistCount = useWishlistStore((s) => s.items.length);
    const { isCartOpen, setCartOpen } = useUIStore();
    const { user, signOut } = useAuthStore();

    useEffect(() => {
        setMounted(true);
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (searchOpen && searchRef.current) searchRef.current.focus();
    }, [searchOpen]);

    const navCategories = categories.slice(0, 6);

    return (
        <header
            className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-white/90 backdrop-blur-xl shadow-md border-b border-she-gray/30'
                : 'bg-white border-b border-she-gray/20'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Mobile Menu */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="lg:hidden">
                                <Menu className="w-5 h-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-72 p-0">
                            <div className="p-6">
                                <Link href="/" className="block mb-8">
                                    <h2 className="text-2xl font-bold font-[var(--font-display)]">
                                        She Loves It
                                    </h2>
                                    <p className="text-xs text-muted-foreground tracking-widest uppercase">Premium Beauty</p>
                                </Link>
                                <nav className="space-y-1">
                                    <Link href="/products" className="block py-3 px-3 rounded-lg hover:bg-she-pink-lighter text-sm font-medium transition-colors">
                                        All Products
                                    </Link>
                                    {navCategories.map((cat) => (
                                        <Link
                                            key={cat.id}
                                            href={`/products?category=${cat.slug}`}
                                            className="block py-3 px-3 rounded-lg hover:bg-she-pink-lighter text-sm transition-colors"
                                        >
                                            <span className="mr-2">{cat.icon}</span>
                                            {cat.name}
                                        </Link>
                                    ))}
                                    <div className="pt-4 mt-4 border-t">
                                        <Link href="/account" className="block py-3 px-3 rounded-lg hover:bg-she-pink-lighter text-sm transition-colors">
                                            My Account
                                        </Link>
                                        <Link href="/wishlist" className="block py-3 px-3 rounded-lg hover:bg-she-pink-lighter text-sm transition-colors">
                                            Wishlist {mounted && wishlistCount > 0 && `(${wishlistCount})`}
                                        </Link>
                                        <Link href="/orders" className="block py-3 px-3 rounded-lg hover:bg-she-pink-lighter text-sm transition-colors">
                                            My Orders
                                        </Link>
                                    </div>
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Logo - Text Version Reverted */}
                    <Link href="/" className="flex items-center gap-2 group transition-all duration-300 hover:scale-[1.02]">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-she-pink to-she-pink-dark flex items-center justify-center shadow-lg group-hover:shadow-she-pink/20 transition-all duration-300">
                            <span className="text-white font-bold text-lg">S</span>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="font-bold text-lg gradient-text leading-none">She Loves It</h1>
                            <p className="text-[10px] text-muted-foreground tracking-[0.2em] font-medium uppercase">Premium Beauty</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        <Link
                            href="/products"
                            className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-she-pink transition-colors rounded-lg hover:bg-she-pink-lighter/50"
                        >
                            All Products
                        </Link>
                        {navCategories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/products?category=${cat.slug}`}
                                className="px-3 py-2 text-sm text-foreground/70 hover:text-she-pink transition-colors rounded-lg hover:bg-she-pink-lighter/50"
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Search + Actions */}
                    <div className="flex items-center gap-1">
                        {/* Search */}
                        <div className="relative">
                            {searchOpen ? (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center animate-in slide-in-from-right">
                                    <input
                                        ref={searchRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search products..."
                                        className="w-48 sm:w-64 h-9 pl-3 pr-8 text-sm border border-she-pink/30 rounded-full focus:outline-none focus:ring-2 focus:ring-she-pink/20 focus:border-she-pink bg-white"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && searchQuery.trim()) {
                                                window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                                        className="absolute right-2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSearchOpen(true)}
                                    className="hover:bg-she-pink-lighter/50"
                                >
                                    <Search className="w-5 h-5" />
                                </Button>
                            )}
                        </div>

                        {/* User Account */}
                        {mounted && (
                            user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-she-pink-lighter/50">
                                            <Avatar className="w-7 h-7 ring-2 ring-she-pink/20">
                                                <AvatarImage src={user.avatar_url} />
                                                <AvatarFallback className="bg-she-pink text-white text-[10px] font-bold">
                                                    {user.full_name?.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border shadow-xl">
                                        <DropdownMenuLabel className="px-3 py-2">
                                            <p className="text-sm font-bold truncate">{user.full_name}</p>
                                            <p className="text-[10px] text-muted-foreground truncate font-medium">{user.email}</p>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <Link href="/account">
                                            <DropdownMenuItem className="cursor-pointer rounded-xl py-2.5">
                                                <User className="w-4 h-4 mr-2" /> My Profile
                                            </DropdownMenuItem>
                                        </Link>
                                        <Link href="/orders">
                                            <DropdownMenuItem className="cursor-pointer rounded-xl py-2.5">
                                                <ShoppingBag className="w-4 h-4 mr-2" /> Track Orders
                                            </DropdownMenuItem>
                                        </Link>
                                        <Link href="/wishlist">
                                            <DropdownMenuItem className="cursor-pointer rounded-xl py-2.5">
                                                <Heart className="w-4 h-4 mr-2" /> My Wishlist
                                            </DropdownMenuItem>
                                        </Link>
                                        {/* Simple admin check - check if email is admin email */}
                                        {user.role === 'admin' && (
                                            <Link href="/admin">
                                                <DropdownMenuItem className="cursor-pointer rounded-xl py-2.5 text-she-pink font-bold">
                                                    <LayoutDashboard className="w-4 h-4 mr-2" /> Admin Dashboard
                                                </DropdownMenuItem>
                                            </Link>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="cursor-pointer rounded-xl py-2.5 text-destructive focus:bg-destructive/5 focus:text-destructive"
                                            onClick={() => signOut()}
                                        >
                                            <LogOut className="w-4 h-4 mr-2" /> Sign Out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Link href="/auth">
                                    <Button variant="ghost" size="icon" className="hover:bg-she-pink-lighter/50">
                                        <User className="w-5 h-5" />
                                    </Button>
                                </Link>
                            )
                        )}

                        {/* Wishlist */}
                        <Link href="/wishlist">
                            <Button variant="ghost" size="icon" className="relative hover:bg-she-pink-lighter/50 hidden sm:flex">
                                <Heart className="w-5 h-5" />
                                {mounted && wishlistCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-she-pink text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-badge">
                                        {wishlistCount}
                                    </span>
                                )}
                            </Button>
                        </Link>

                        {/* Cart */}
                        <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative hover:bg-she-pink-lighter/50">
                                    <ShoppingBag className="w-5 h-5" />
                                    {mounted && itemCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-she-pink text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-badge">
                                            {itemCount}
                                        </span>
                                    )}
                                </Button>
                            </SheetTrigger>
                            <CartSheet />
                        </Sheet>

                    </div>
                </div>
            </div>
        </header>
    );
}
