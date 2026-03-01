'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowLeft,
    ArrowRight,
    CreditCard,
    Truck,
    CheckCircle2,
    Lock,
    MapPin,
    Wallet,
    Banknote,
    Package,
    Image as ImageIcon,
    Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCartStore, useResourceStore } from '@/lib/store';

type Step = 'shipping' | 'delivery' | 'payment' | 'confirmation';

export default function CheckoutPage() {
    const { items, getSubtotal, getShipping, getTax, getTotal, clearCart } = useCartStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [currentStep, setCurrentStep] = useState<Step>('shipping');
    const [shippingMethod, setShippingMethod] = useState('standard');
    const [paymentMethod, setPaymentMethod] = useState('bank');
    const [receiptImage, setReceiptImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [placedOrderNumber, setPlacedOrderNumber] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        saveAddress: false,
    });

    const formatPrice = (price: number) => `Rs. ${Math.round(price).toLocaleString()}`;

    const steps = [
        { id: 'shipping', label: 'Address', icon: MapPin },
        { id: 'delivery', label: 'Delivery', icon: Truck },
        { id: 'payment', label: 'Payment', icon: CreditCard },
        { id: 'confirmation', label: 'Done', icon: CheckCircle2 },
    ];

    const stepIndex = steps.findIndex((s) => s.id === currentStep);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceiptImage(reader.result as string);
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const { addOrder, settings } = useResourceStore();

    const handlePlaceOrder = () => {
        if (paymentMethod === 'bank' && !receiptImage) {
            alert('Please upload a screenshot of your payment receipt.');
            return;
        }

        const orderNum = `SLI-2026-${Math.floor(Math.random() * 900000 + 100000)}`;
        const newOrder = {
            order_number: orderNum,
            customer_name: formData.fullName,
            customer_email: formData.email,
            customer_phone: formData.phone,
            total_amount: getTotal(),
            status: paymentMethod === 'bank' ? 'awaiting_payment_approval' : 'pending',
            payment_status: 'pending',
            payment_method: paymentMethod === 'bank' ? 'bank_transfer' : paymentMethod,
            payment_screenshot_url: receiptImage || undefined,
            items: items.map(i => ({
                id: i.product.id,
                name: i.product.name,
                price: i.product.selling_price,
                quantity: i.quantity,
                image: i.product.images[0]?.url
            }))
        };

        addOrder(newOrder as any);
        setPlacedOrderNumber(orderNum);
        setCurrentStep('confirmation');
        clearCart();
    };

    if (!mounted) return null;

    if (items.length === 0 && currentStep !== 'confirmation') {
        return (
            <>
                <Header />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
                        <p className="text-muted-foreground mb-6">Add some products to checkout</p>
                        <Link href="/products">
                            <Button className="bg-she-pink hover:bg-she-pink-dark text-white rounded-full">
                                Continue Shopping
                            </Button>
                        </Link>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="min-h-screen bg-muted/20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Step Indicators */}
                    <div className="flex items-center justify-center mb-10">
                        {steps.map((step, i) => (
                            <div key={step.id} className="flex items-center">
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${i <= stepIndex
                                            ? 'bg-she-pink text-white shadow-lg shadow-she-pink/30'
                                            : 'bg-muted text-muted-foreground'
                                            }`}
                                    >
                                        {i < stepIndex ? (
                                            <CheckCircle2 className="w-5 h-5" />
                                        ) : (
                                            <step.icon className="w-5 h-5" />
                                        )}
                                    </div>
                                    <span className="text-xs mt-2 font-medium text-muted-foreground">{step.label}</span>
                                </div>
                                {i < steps.length - 1 && (
                                    <div className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 ${i < stepIndex ? 'bg-she-pink' : 'bg-muted'}`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {currentStep === 'confirmation' ? (
                        /* Confirmation */
                        <div className="max-w-lg mx-auto text-center py-12">
                            <div className="w-24 h-24 rounded-full bg-she-success/10 flex items-center justify-center mx-auto mb-6 animate-fade-in-up">
                                <CheckCircle2 className="w-12 h-12 text-she-success" />
                            </div>
                            <h2 className="text-3xl font-bold mb-3 font-[var(--font-display)] animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                                Order Confirmed! 🎉
                            </h2>
                            <p className="text-muted-foreground mb-2 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                                Thank you for your purchase!
                            </p>
                            <p className="text-sm text-muted-foreground mb-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                                Order ID: <span className="font-semibold text-foreground">{placedOrderNumber}</span>
                                <br />
                                {paymentMethod === 'bank'
                                    ? "Our team is verifying your payment screenshot. You'll receive a confirmation via WhatsApp once approved."
                                    : "You'll receive a confirmation via email and WhatsApp shortly."}
                            </p>
                            <div className="flex gap-3 justify-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                                <Link href="/products">
                                    <Button className="bg-she-pink hover:bg-she-pink-dark text-white rounded-full px-6">
                                        Continue Shopping
                                    </Button>
                                </Link>
                                <Link href="/orders">
                                    <Button variant="outline" className="rounded-full px-6">
                                        View Orders
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Form */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-2xl border p-6 sm:p-8">
                                    {currentStep === 'shipping' && (
                                        <div>
                                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 font-[var(--font-display)]">
                                                <MapPin className="w-5 h-5 text-she-pink" />
                                                Delivery Address
                                            </h2>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="sm:col-span-2">
                                                    <Label htmlFor="fullName">Full Name *</Label>
                                                    <Input
                                                        id="fullName"
                                                        value={formData.fullName}
                                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                        placeholder="Enter your full name"
                                                        className="mt-1 rounded-xl focus-visible:ring-she-pink"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="email">Email *</Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        placeholder="your@email.com"
                                                        className="mt-1 rounded-xl focus-visible:ring-she-pink"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="phone">Phone *</Label>
                                                    <Input
                                                        id="phone"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        placeholder="+92 300 1234567"
                                                        className="mt-1 rounded-xl focus-visible:ring-she-pink"
                                                    />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <Label htmlFor="address">Address *</Label>
                                                    <Input
                                                        id="address"
                                                        value={formData.address}
                                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                        placeholder="Street, building, apartment"
                                                        className="mt-1 rounded-xl focus-visible:ring-she-pink"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="city">City *</Label>
                                                    <Input
                                                        id="city"
                                                        value={formData.city}
                                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                        placeholder="Karachi"
                                                        className="mt-1 rounded-xl focus-visible:ring-she-pink"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="postalCode">Postal Code</Label>
                                                    <Input
                                                        id="postalCode"
                                                        value={formData.postalCode}
                                                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                                        placeholder="75500"
                                                        className="mt-1 rounded-xl focus-visible:ring-she-pink"
                                                    />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <Checkbox
                                                            checked={formData.saveAddress}
                                                            onCheckedChange={(v) => setFormData({ ...formData, saveAddress: v as boolean })}
                                                            className="data-[state=checked]:bg-she-pink data-[state=checked]:border-she-pink"
                                                        />
                                                        <span className="text-sm">Save this address for future orders</span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="flex justify-end mt-8">
                                                <Button
                                                    onClick={() => setCurrentStep('delivery')}
                                                    className="bg-she-pink hover:bg-she-pink-dark text-white rounded-full px-8 h-11"
                                                >
                                                    Continue
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 'delivery' && (
                                        <div>
                                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 font-[var(--font-display)]">
                                                <Truck className="w-5 h-5 text-she-pink" />
                                                Shipping Method
                                            </h2>
                                            <RadioGroup value={shippingMethod} onValueChange={setShippingMethod} className="space-y-3">
                                                {[
                                                    { value: 'standard', label: 'Standard Delivery', time: '3-5 business days', price: 'Rs. 200', free: getSubtotal() >= 3000 },
                                                    { value: 'express', label: 'Express Delivery', time: '1-2 business days', price: 'Rs. 500', free: false },
                                                    { value: 'overnight', label: 'Overnight Delivery', time: 'Next business day', price: 'Rs. 800', free: false },
                                                ].map((option) => (
                                                    <label
                                                        key={option.value}
                                                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${shippingMethod === option.value
                                                            ? 'border-she-pink bg-she-pink-lighter/30'
                                                            : 'border-border hover:border-she-pink/30'
                                                            }`}
                                                    >
                                                        <RadioGroupItem value={option.value} className="text-she-pink" />
                                                        <div className="flex-1">
                                                            <p className="font-medium text-sm">{option.label}</p>
                                                            <p className="text-xs text-muted-foreground">{option.time}</p>
                                                        </div>
                                                        <span className="font-semibold text-sm">
                                                            {option.free ? (
                                                                <span className="text-she-success">Free</span>
                                                            ) : (
                                                                option.price
                                                            )}
                                                        </span>
                                                    </label>
                                                ))}
                                            </RadioGroup>
                                            <div className="flex justify-between mt-8">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setCurrentStep('shipping')}
                                                    className="rounded-full px-6"
                                                >
                                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                                    Back
                                                </Button>
                                                <Button
                                                    onClick={() => setCurrentStep('payment')}
                                                    className="bg-she-pink hover:bg-she-pink-dark text-white rounded-full px-8 h-11"
                                                >
                                                    Continue
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 'payment' && (
                                        <div>
                                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 font-[var(--font-display)]">
                                                <CreditCard className="w-5 h-5 text-she-pink" />
                                                Payment Method
                                            </h2>
                                            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                                                {[
                                                    { value: 'bank', label: 'Bank Transfer / JazzCash / EasyPaisa', desc: 'Transfer to our account & upload receipt', icon: Banknote },
                                                    { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive (Rs. 200 extra)', icon: Package },
                                                    { value: 'card', label: 'Credit/Debit Card', desc: 'Visa, Mastercard, etc.', icon: CreditCard },
                                                ].map((option) => (
                                                    <label
                                                        key={option.value}
                                                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === option.value
                                                            ? 'border-she-pink bg-she-pink-lighter/30'
                                                            : 'border-border hover:border-she-pink/30'
                                                            }`}
                                                    >
                                                        <RadioGroupItem value={option.value} className="text-she-pink" />
                                                        <option.icon className="w-5 h-5 text-muted-foreground" />
                                                        <div className="flex-1">
                                                            <p className="font-medium text-sm">{option.label}</p>
                                                            <p className="text-xs text-muted-foreground">{option.desc}</p>
                                                        </div>
                                                    </label>
                                                ))}
                                            </RadioGroup>

                                            {paymentMethod === 'bank' && (
                                                <div className="mt-6 space-y-4 animate-fade-in">
                                                    <div className="p-5 rounded-2xl bg-she-pink-lighter/20 border-2 border-she-pink/20">
                                                        <h3 className="font-bold text-she-pink-dark mb-3 flex items-center gap-2">
                                                            <Banknote className="w-5 h-5" />
                                                            Our Bank Details
                                                        </h3>
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Bank:</span>
                                                                <span className="font-semibold text-foreground">{settings.bankName}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Account Name:</span>
                                                                <span className="font-semibold text-foreground italic uppercase">{settings.accountName}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Account Number:</span>
                                                                <span className="font-semibold text-foreground select-all">{settings.accountNumber}</span>
                                                            </div>
                                                            <div className="pt-2 border-t mt-2 flex justify-between">
                                                                <span className="text-muted-foreground">JazzCash/EasyPaisa:</span>
                                                                <span className="font-semibold text-foreground font-mono">{settings.jazzcash}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-semibold">Upload Payment Screenshot *</Label>
                                                        <div className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${receiptImage ? 'border-she-success bg-she-success/5' : 'border-border hover:border-she-pink/50'}`}>
                                                            {receiptImage ? (
                                                                <div className="relative w-full max-w-[240px] mx-auto aspect-[3/4] rounded-lg overflow-hidden border-2 border-white shadow-xl">
                                                                    <Image src={receiptImage} alt="Receipt" fill className="object-cover" />
                                                                    <button
                                                                        onClick={() => setReceiptImage(null)}
                                                                        className="absolute top-2 right-2 w-7 h-7 bg-destructive text-white rounded-full flex items-center justify-center text-lg shadow-lg hover:scale-110 transition-transform"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <label className="cursor-pointer group">
                                                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                                                    <div className="flex flex-col items-center">
                                                                        <div className="w-14 h-14 rounded-full bg-she-pink-lighter group-hover:bg-she-pink transition-colors flex items-center justify-center mb-3">
                                                                            <Upload className="w-6 h-6 text-she-pink group-hover:text-white transition-colors" />
                                                                        </div>
                                                                        <p className="text-sm font-semibold text-foreground">Click to upload transfer screenshot</p>
                                                                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                                                                    </div>
                                                                </label>
                                                            )}
                                                            {isUploading && (
                                                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
                                                                    <div className="w-8 h-8 border-3 border-she-pink border-t-transparent rounded-full animate-spin" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        {receiptImage && (
                                                            <p className="text-xs text-she-success font-medium flex items-center justify-center gap-1 mt-2">
                                                                <CheckCircle2 className="w-3 h-3" />
                                                                Screenshot attached successfully!
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {paymentMethod === 'card' && (
                                                <div className="mt-6 p-6 rounded-2xl bg-muted/50 border border-dashed text-center">
                                                    <CreditCard className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                                                    <p className="text-sm font-medium text-muted-foreground">Online card payments are currently disabled.</p>
                                                    <p className="text-xs text-muted-foreground mt-1">Please use Bank Transfer or JazzCash for faster processing.</p>
                                                </div>
                                            )}

                                            <div className="flex justify-between mt-8">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setCurrentStep('delivery')}
                                                    className="rounded-full px-6"
                                                >
                                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                                    Back
                                                </Button>
                                                <Button
                                                    onClick={handlePlaceOrder}
                                                    className="bg-she-pink hover:bg-she-pink-dark text-white rounded-full px-8 h-11 shadow-lg shadow-she-pink/20"
                                                >
                                                    <Lock className="w-4 h-4 mr-2" />
                                                    Place Order — {formatPrice(getTotal())}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <div className="sticky top-28 bg-white rounded-2xl border p-6">
                                    <h3 className="font-semibold mb-4">Order Summary</h3>
                                    <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                                        {items.map((item) => {
                                            const price = item.product.discount_percentage
                                                ? item.product.selling_price * (1 - item.product.discount_percentage / 100)
                                                : item.product.selling_price;
                                            return (
                                                <div key={item.product.id} className="flex gap-3">
                                                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                                        <Image
                                                            src={item.product.images[0]?.url || ''}
                                                            alt={item.product.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-she-pink text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                                                            {item.quantity}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                                                        <p className="text-xs text-muted-foreground">{item.product.category}</p>
                                                    </div>
                                                    <p className="text-sm font-medium whitespace-nowrap">
                                                        {formatPrice(price * item.quantity)}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <Separator className="my-4" />
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span>{formatPrice(getSubtotal())}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Shipping</span>
                                            <span>{getShipping() === 0 ? <span className="text-she-success">Free</span> : formatPrice(getShipping())}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Tax (5%)</span>
                                            <span>{formatPrice(getTax())}</span>
                                        </div>
                                    </div>
                                    <Separator className="my-4" />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span className="text-she-pink">{formatPrice(getTotal())}</span>
                                    </div>
                                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                        <Lock className="w-3 h-3" />
                                        Secure checkout powered by Stripe
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
