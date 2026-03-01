'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/lib/store';

export default function AuthPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/';

    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
    });

    const { setUser, setSession } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isLogin) {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });

                if (error) throw error;
                toast.success('Welcome back!');
                router.push(redirectTo);
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.fullName,
                        }
                    }
                });

                if (error) throw error;

                if (data.session) {
                    toast.success('Account created successfully!');
                    router.push(redirectTo);
                } else {
                    toast.success('Verification email sent! Please check your inbox.');
                }
            }
        } catch (error: any) {
            toast.error(error.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center px-4 bg-gradient-to-b from-she-pink-lighter/30 to-white">
            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-she-pink to-she-pink-dark flex items-center justify-center shadow-xl shadow-she-pink/20">
                            <span className="text-white font-bold text-2xl">S</span>
                        </div>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {isLogin ? 'Welcome Back' : 'Join She Loves It'}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {isLogin
                            ? 'Sign in to access your orders and wishlist'
                            : 'Create an account to start your beauty journey'}
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl border shadow-xl shadow-she-pink/5 p-8 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-she-pink to-she-pink-dark" />

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="fullName"
                                        type="text"
                                        placeholder="Enter your name"
                                        className="pl-10 h-12 rounded-xl border-muted focus:ring-she-pink/20"
                                        required
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="hello@example.com"
                                    className="pl-10 h-12 rounded-xl border-muted focus:ring-she-pink/20"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password">Password</Label>
                                {isLogin && (
                                    <Link href="/auth/forgot" className="text-xs text-she-pink font-medium hover:underline">
                                        Forgot Password?
                                    </Link>
                                )}
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10 h-12 rounded-xl border-muted focus:ring-she-pink/20"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-she-pink hover:bg-she-pink-dark text-white rounded-xl h-12 font-bold shadow-lg shadow-she-pink/20 transition-all hover:-translate-y-0.5"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t text-center">
                        <p className="text-sm text-muted-foreground">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="ml-2 text-she-pink font-bold hover:underline"
                            >
                                {isLogin ? 'Join Now' : 'Sign In'}
                            </button>
                        </p>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-she-pink/5 rounded-full blur-2xl group-hover:bg-she-pink/10 transition-colors" />
                    <div className="absolute -top-12 -left-12 w-32 h-32 bg-she-pink/5 rounded-full blur-3xl group-hover:bg-she-pink/10 transition-colors" />
                </div>

                {/* Social Login Options (Visual Only for now) */}
                <div className="mt-8">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#FDFDFD] px-4 text-muted-foreground font-medium">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="h-12 rounded-xl border-muted bg-white hover:bg-muted/50 transition-colors">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 mr-3" alt="Google" />
                            <span className="text-sm font-bold">Google</span>
                        </Button>
                        <Button variant="outline" className="h-12 rounded-xl border-muted bg-white hover:bg-muted/50 transition-colors">
                            <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-5 h-5 mr-3" alt="Facebook" />
                            <span className="text-sm font-bold">Facebook</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
