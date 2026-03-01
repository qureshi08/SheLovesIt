import Link from 'next/link';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, Heart } from 'lucide-react';
import { categories } from '@/lib/data';

export default function Footer() {
    return (
        <footer className="bg-she-neutral text-white">
            {/* Newsletter */}
            <div className="bg-gradient-to-r from-she-pink-dark via-she-pink to-she-pink-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                    <h3 className="text-2xl font-bold mb-2 font-[var(--font-display)]">Stay Beautiful ✨</h3>
                    <p className="text-white/80 text-sm mb-6 max-w-md mx-auto">
                        Subscribe to get exclusive offers, beauty tips, and early access to new collections.
                    </p>
                    <form className="flex gap-2 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 h-11 px-5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder:text-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                        />
                        <button className="h-11 px-6 bg-white text-she-pink font-semibold rounded-full text-sm hover:bg-white/90 transition-colors shadow-lg">
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>

            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-she-pink to-she-pink-dark flex items-center justify-center">
                                <span className="text-white font-bold text-lg">S</span>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold">She Loves It</h4>
                                <p className="text-[10px] text-white/60 tracking-[0.2em] uppercase text-xs">Premium Beauty</p>
                            </div>
                        </div>
                        <p className="text-white/60 text-sm leading-relaxed mb-4">
                            Your destination for premium beauty products. She Loves It empowers your natural beauty with 100% authentic cosmetics.
                        </p>
                        <div className="flex items-center gap-3">
                            <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-she-pink flex items-center justify-center transition-colors">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-she-pink flex items-center justify-center transition-colors">
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-she-pink flex items-center justify-center transition-colors">
                                <Twitter className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Shop */}
                    <div>
                        <h4 className="font-semibold mb-4 text-sm tracking-wider uppercase">Shop</h4>
                        <ul className="space-y-2.5">
                            {categories.slice(0, 6).map((cat) => (
                                <li key={cat.id}>
                                    <Link href={`/products?category=${cat.slug}`} className="text-white/60 hover:text-she-pink-light text-sm transition-colors">
                                        {cat.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-semibold mb-4 text-sm tracking-wider uppercase">Company</h4>
                        <ul className="space-y-2.5">
                            <li><Link href="/about" className="text-white/60 hover:text-she-pink-light text-sm transition-colors">About Us</Link></li>
                            <li><Link href="/contact" className="text-white/60 hover:text-she-pink-light text-sm transition-colors">Contact</Link></li>
                            <li><Link href="/shipping" className="text-white/60 hover:text-she-pink-light text-sm transition-colors">Shipping Policy</Link></li>
                            <li><Link href="/returns" className="text-white/60 hover:text-she-pink-light text-sm transition-colors">Returns & Exchanges</Link></li>
                            <li><Link href="/privacy" className="text-white/60 hover:text-she-pink-light text-sm transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-white/60 hover:text-she-pink-light text-sm transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold mb-4 text-sm tracking-wider uppercase">Contact Us</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-white/60 text-sm">
                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-she-pink-light" />
                                <span>DHA Phase 5, Karachi, Pakistan</span>
                            </li>
                            <li className="flex items-center gap-3 text-white/60 text-sm">
                                <Phone className="w-4 h-4 flex-shrink-0 text-she-pink-light" />
                                <span>+92 300 1234567</span>
                            </li>
                            <li className="flex items-center gap-3 text-white/60 text-sm">
                                <Mail className="w-4 h-4 flex-shrink-0 text-she-pink-light" />
                                <span>hello@shelovesit.com</span>
                            </li>
                        </ul>
                        <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-xs text-white/40">Working Hours</p>
                            <p className="text-sm text-white/70 mt-1">Mon - Sat: 10 AM - 8 PM</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-white/40 text-xs">
                        © {new Date().getFullYear()} She Loves It. All rights reserved.
                    </p>
                    <p className="text-white/40 text-xs flex items-center gap-1">
                        Made with <Heart className="w-3 h-3 fill-she-pink text-she-pink" /> in Pakistan
                    </p>
                </div>
            </div>
        </footer>
    );
}
