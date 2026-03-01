'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    User,
    MapPin,
    ShoppingBag,
    Heart,
    Bell,
    LogOut,
    ChevronRight,
    Settings,
    Mail,
    Phone,
    Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { orders } from '@/lib/data';
import { useWishlistStore } from '@/lib/store';

export default function AccountPage() {
    const wishlistCount = useWishlistStore((s) => s.items.length);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const statusColor = (status: string) => {
        switch (status) {
            case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'shipped': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'confirmed': case 'processing': return 'bg-pink-50 text-she-pink border-she-pink/20';
            case 'awaiting_payment_approval': return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
            case 'pending': return 'bg-gray-50 text-gray-700 border-gray-200';
            case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <>
            <Header />
            <main className="min-h-screen bg-muted/20">
                <div className="bg-gradient-to-r from-she-pink-lighter via-white to-she-pink-lighter/30 border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <h1 className="text-3xl font-bold font-[var(--font-display)]">My Account</h1>
                        <p className="text-muted-foreground mt-1">Manage your profile, orders, and preferences</p>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Tabs defaultValue="profile" className="space-y-6">
                        <TabsList className="bg-white border rounded-full p-1 w-full justify-start overflow-x-auto">
                            <TabsTrigger value="profile" className="rounded-full data-[state=active]:bg-she-pink data-[state=active]:text-white">
                                <User className="w-4 h-4 mr-2" /> Profile
                            </TabsTrigger>
                            <TabsTrigger value="orders" className="rounded-full data-[state=active]:bg-she-pink data-[state=active]:text-white">
                                <ShoppingBag className="w-4 h-4 mr-2" /> Orders
                            </TabsTrigger>
                            <TabsTrigger value="addresses" className="rounded-full data-[state=active]:bg-she-pink data-[state=active]:text-white">
                                <MapPin className="w-4 h-4 mr-2" /> Addresses
                            </TabsTrigger>
                            <TabsTrigger value="notifications" className="rounded-full data-[state=active]:bg-she-pink data-[state=active]:text-white">
                                <Bell className="w-4 h-4 mr-2" /> Notifications
                            </TabsTrigger>
                        </TabsList>

                        {/* Profile Tab */}
                        <TabsContent value="profile">
                            <div className="bg-white rounded-2xl border p-6 sm:p-8">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-she-pink to-she-pink-dark flex items-center justify-center shadow-lg">
                                        <span className="text-white text-2xl font-bold">AK</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Aisha Khan</h2>
                                        <p className="text-muted-foreground text-sm">Member since Jan 2026</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <Badge className="bg-she-pink-lighter text-she-pink-dark border-0 rounded-full">
                                                💎 Premium Member
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Full Name</Label>
                                        <Input defaultValue="Aisha Khan" className="mt-1 rounded-xl" />
                                    </div>
                                    <div>
                                        <Label>Email</Label>
                                        <Input defaultValue="aisha@example.com" type="email" className="mt-1 rounded-xl" />
                                    </div>
                                    <div>
                                        <Label>Phone</Label>
                                        <Input defaultValue="+92 300 1234567" className="mt-1 rounded-xl" />
                                    </div>
                                    <div>
                                        <Label>Date of Birth</Label>
                                        <Input type="date" className="mt-1 rounded-xl" />
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <Button className="bg-she-pink hover:bg-she-pink-dark text-white rounded-full">
                                        Save Changes
                                    </Button>
                                    <Button variant="outline" className="rounded-full">
                                        Change Password
                                    </Button>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                                {[
                                    { label: 'Total Orders', value: orders.length, icon: ShoppingBag },
                                    { label: 'Wishlist', value: wishlistCount, icon: Heart },
                                    { label: 'Addresses', value: 2, icon: MapPin },
                                    { label: 'Reviews', value: 5, icon: Edit },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white rounded-xl border p-4 text-center">
                                        <stat.icon className="w-5 h-5 text-she-pink mx-auto mb-2" />
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        {/* Orders Tab */}
                        <TabsContent value="orders">
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div key={order.id} className="bg-white rounded-2xl border p-5 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between flex-wrap gap-3">
                                            <div>
                                                <p className="font-semibold text-sm">{order.order_number}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(order.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge className={`${statusColor(order.status)} border-0 rounded-full capitalize`}>
                                                    {order.status}
                                                </Badge>
                                                <span className="font-semibold text-she-pink">
                                                    Rs. {order.total_amount.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        <Separator className="my-3" />
                                        <div className="space-y-2">
                                            {order.items.map((item) => (
                                                <p key={item.id} className="text-sm text-muted-foreground">
                                                    {item.product_name} × {item.quantity}
                                                </p>
                                            ))}
                                        </div>
                                        {order.tracking_number && (
                                            <p className="text-xs text-muted-foreground mt-3">
                                                Tracking: <span className="font-medium text-foreground">{order.tracking_number}</span>
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        {/* Addresses Tab */}
                        <TabsContent value="addresses">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="bg-white rounded-2xl border p-5 relative">
                                    <Badge className="absolute top-4 right-4 bg-she-pink text-white border-0 rounded-full text-xs">
                                        Default
                                    </Badge>
                                    <h4 className="font-semibold mb-1">Home</h4>
                                    <p className="text-sm text-muted-foreground">123 Main Street, DHA Phase 5</p>
                                    <p className="text-sm text-muted-foreground">Karachi, 75500</p>
                                    <p className="text-sm text-muted-foreground">+92 300 1234567</p>
                                    <div className="flex gap-2 mt-4">
                                        <Button variant="outline" size="sm" className="rounded-full">Edit</Button>
                                        <Button variant="ghost" size="sm" className="rounded-full text-destructive">Delete</Button>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl border p-5">
                                    <h4 className="font-semibold mb-1">Office</h4>
                                    <p className="text-sm text-muted-foreground">45 Commercial Area, Gulberg III</p>
                                    <p className="text-sm text-muted-foreground">Lahore, 54660</p>
                                    <p className="text-sm text-muted-foreground">+92 321 9876543</p>
                                    <div className="flex gap-2 mt-4">
                                        <Button variant="outline" size="sm" className="rounded-full">Edit</Button>
                                        <Button variant="ghost" size="sm" className="rounded-full text-destructive">Delete</Button>
                                    </div>
                                </div>
                                <button className="border-2 border-dashed rounded-2xl p-8 text-center text-muted-foreground hover:border-she-pink hover:text-she-pink transition-colors">
                                    <MapPin className="w-8 h-8 mx-auto mb-2" />
                                    <p className="font-medium">Add New Address</p>
                                </button>
                            </div>
                        </TabsContent>

                        {/* Notifications Tab */}
                        <TabsContent value="notifications">
                            <div className="bg-white rounded-2xl border p-6">
                                <h3 className="font-semibold mb-6">Notification Preferences</h3>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Order Updates', desc: 'Status updates for your orders' },
                                        { label: 'New Products', desc: 'Be the first to know about launches' },
                                        { label: 'Promotions & Deals', desc: 'Exclusive offers and discounts' },
                                        { label: 'Weekly Newsletter', desc: 'Beauty tips and trend updates' },
                                        { label: 'WhatsApp Notifications', desc: 'Receive updates via WhatsApp' },
                                    ].map((pref, i) => (
                                        <label key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted cursor-pointer">
                                            <div>
                                                <p className="font-medium text-sm">{pref.label}</p>
                                                <p className="text-xs text-muted-foreground">{pref.desc}</p>
                                            </div>
                                            <Checkbox
                                                defaultChecked={i < 3}
                                                className="data-[state=checked]:bg-she-pink data-[state=checked]:border-she-pink"
                                            />
                                        </label>
                                    ))}
                                </div>
                                <Button className="bg-she-pink hover:bg-she-pink-dark text-white rounded-full mt-6">
                                    Save Preferences
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
            <Footer />
        </>
    );
}
