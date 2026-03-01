'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    BarChart3,
    Package,
    ShoppingCart,
    Users,
    DollarSign,
    Settings,
    LogOut,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Eye,
    Bell,
    Search,
    Menu,
    X,
    ArrowUpRight,
    ChevronRight,
    Edit,
    MoreVertical,
    Plus,
    Truck,
    CheckCircle2,
    Clock,
    Filter,
    Download,
    Banknote,
    CreditCard,
    MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useResourceStore } from '@/lib/store';
import { Product, OrderStatus, Order } from '@/types';
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
    const {
        products,
        categories,
        orders,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        updateOrder,
        settings,
        updateSettings
    } = useResourceStore();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
    const [editingItem, setEditingItem] = useState<any>(null);

    const formatPrice = (price: number) => `Rs. ${Math.round(price).toLocaleString()}`;
    const [selectedPaymentRecord, setSelectedPaymentRecord] = useState<any>(null);

    // Export Orders to CSV
    const handleExport = () => {
        if (orders.length === 0) {
            toast.error("No orders to export!");
            return;
        }
        const headers = ["Order No", "Customer", "Email", "Amount", "Payment Status", "Order Status", "Date"];
        const csvContent = [
            headers.join(","),
            ...orders.map(o => [
                o.order_number,
                o.customer_name,
                o.customer_email,
                o.total_amount,
                o.payment_status,
                o.status,
                new Date(o.created_at).toLocaleDateString()
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `orders_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Orders exported successfully!");
    };

    // Download Invoice Simulation
    const handleDownloadInvoice = (order: Order) => {
        toast.loading(`Generating invoice for ${order.order_number}...`, { duration: 1500 });
        setTimeout(() => {
            const invoiceContent = `
                INVOICE: ${order.order_number}
                Customer: ${order.customer_name}
                Email: ${order.customer_email}
                Amount: Rs. ${order.total_amount}
                Date: ${new Date(order.created_at).toLocaleString()}
                Items:
                ${order.items.map(i => `- ${i.product_name} x ${i.quantity} (Rs. ${i.price_at_purchase})`).join("\n")}
            `;
            const blob = new Blob([invoiceContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `invoice_${order.order_number}.txt`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("Invoice downloaded!");
        }, 1500);
    };

    const notifications = [
        { id: 1, title: "New Order", message: "Order SLI-2026-88219 placed", time: "2 min ago", unread: true },
        { id: 2, title: "Payment Pending", message: "Payment verification needed for SLI-2026-1123", time: "10 min ago", unread: true },
        { id: 3, title: "Stock Low", message: "Velvet Matte Lipstick is low on stock", time: "1 hour ago", unread: false },
    ];

    // Derived stats
    const lowStockProducts = products.filter((p) => p.stock_quantity <= p.low_stock_alert);
    const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
    const pendingOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'awaiting_payment_approval').length;
    const deliveredOrdersCount = orders.filter((o) => o.status === 'delivered').length;

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

    const paymentColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-emerald-50 text-emerald-700';
            case 'pending': return 'bg-amber-50 text-amber-700';
            case 'failed': return 'bg-red-50 text-red-700';
            default: return 'bg-gray-50 text-gray-700';
        }
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'categories', label: 'Categories', icon: Filter },
        { id: 'orders', label: 'Orders', icon: ShoppingCart },
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#F8F9FC] flex">
            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r flex flex-col z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                <div className="p-5 flex items-center justify-between border-b">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-she-pink to-she-pink-dark flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">S</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-base gradient-text leading-none">She Loves It</h1>
                            <p className="text-[10px] text-muted-foreground tracking-[0.2em] font-medium">ADMIN PANEL</p>
                        </div>
                    </Link>
                    <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 p-3 space-y-0.5">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === item.id
                                ? 'bg-she-pink text-white shadow-md shadow-she-pink/20'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                            {item.id === 'orders' && pendingOrdersCount > 0 && (
                                <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === item.id ? 'bg-white/20 text-white' : 'bg-she-pink text-white'
                                    }`}>
                                    {pendingOrdersCount}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-3 border-t">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-she-pink to-she-pink-dark flex items-center justify-center">
                            <span className="text-white text-xs font-bold">A</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">Aisha Manager</p>
                            <p className="text-[10px] text-muted-foreground">admin@she.com</p>
                        </div>
                    </div>
                    <Link href="/">
                        <Button variant="ghost" className="w-full justify-start text-muted-foreground mt-1 rounded-xl text-sm">
                            <LogOut className="w-4 h-4 mr-2" />
                            Back to Store
                        </Button>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Bar */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b h-14 flex items-center px-4 sm:px-6 gap-4">
                    <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                        <Menu className="w-5 h-5" />
                    </button>
                    <h2 className="font-semibold text-lg capitalize font-[var(--font-display)]">
                        {activeTab}
                    </h2>
                    <div className="flex-1" />
                    <div className="relative hidden sm:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            placeholder="Search..."
                            className="h-9 w-48 pl-9 pr-3 text-sm border rounded-full bg-muted/50 focus:outline-none focus:ring-2 focus:ring-she-pink/20"
                        />
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
                                <Bell className="w-5 h-5 text-muted-foreground" />
                                {notifications.filter(n => n.unread).length > 0 && (
                                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-she-pink rounded-full border-2 border-white" />
                                )}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0 rounded-2xl border shadow-xl mr-4" align="end">
                            <div className="p-4 border-b flex items-center justify-between">
                                <h3 className="font-bold">Notifications</h3>
                                <Button variant="ghost" size="sm" className="text-[10px] uppercase font-bold text-muted-foreground">Mark all as read</Button>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {notifications.map(n => (
                                    <button key={n.id} className="w-full text-left p-4 border-b hover:bg-muted/30 transition-colors group">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-semibold text-sm">{n.title}</span>
                                            <span className="text-[10px] text-muted-foreground">{n.time}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                                        {n.unread && <div className="mt-2 w-1.5 h-1.5 bg-she-pink rounded-full" />}
                                    </button>
                                ))}
                            </div>
                            <button className="w-full p-3 text-center text-xs font-bold text-she-pink hover:bg-she-pink-lighter/20 transition-colors uppercase">
                                View All Notifications
                            </button>
                        </PopoverContent>
                    </Popover>
                </header>

                {/* Content Area */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
                    {/* Dashboard Tab */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6">
                            {/* Metric Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                                {[
                                    { label: "Today's Orders", value: orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length.toString(), change: '+12%', up: true, icon: DollarSign, color: 'from-pink-500 to-rose-600' },
                                    { label: 'Total Orders', value: orders.length.toString(), change: '+5%', up: true, icon: ShoppingCart, color: 'from-violet-500 to-purple-600' },
                                    { label: 'Active Products', value: products.filter(p => p.is_active).length.toString(), change: '0%', up: true, icon: Package, color: 'from-blue-500 to-cyan-600' },
                                    { label: 'Total Revenue', value: formatPrice(totalRevenue), change: '+8%', up: true, icon: TrendingUp, color: 'from-emerald-500 to-teal-600' },
                                ].map((metric, i) => (
                                    <div key={i} className="bg-white rounded-2xl border p-5 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center shadow-lg`}>
                                                <metric.icon className="w-5 h-5 text-white" />
                                            </div>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${metric.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                                }`}>
                                                {metric.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                {metric.change}
                                            </span>
                                        </div>
                                        <p className="text-2xl font-bold">{metric.value}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{metric.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Low Stock Alert */}
                            {lowStockProducts.length > 0 && (
                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                                        <h3 className="font-semibold text-amber-800 text-sm">Low Stock Alert</h3>
                                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs ml-auto">
                                            {lowStockProducts.length} items
                                        </Badge>
                                    </div>
                                    <div className="space-y-2">
                                        {lowStockProducts.map((p) => (
                                            <div key={p.id} className="flex items-center justify-between text-sm">
                                                <span className="text-amber-800">{p.name}</span>
                                                <span className="font-semibold text-amber-700">{p.stock_quantity} left</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid xl:grid-cols-2 gap-6">
                                {/* Recent Orders */}
                                <div className="bg-white rounded-2xl border p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold">Recent Orders</h3>
                                        <button
                                            onClick={() => setActiveTab('orders')}
                                            className="text-xs text-she-pink font-medium flex items-center gap-1 hover:underline"
                                        >
                                            View All <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {orders.slice(0, 4).map((order) => (
                                            <div key={order.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                                                <div className="w-9 h-9 rounded-full bg-she-pink-lighter flex items-center justify-center flex-shrink-0">
                                                    <span className="text-she-pink text-xs font-bold">
                                                        {order.customer_name.split(' ').map(n => n[0]).join('')}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{order.customer_name}</p>
                                                    <p className="text-xs text-muted-foreground">{order.order_number}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold">{formatPrice(order.total_amount)}</p>
                                                    <Badge className={`${statusColor(order.status)} text-[10px] capitalize rounded-full border`}>
                                                        {order.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Top Products */}
                                <div className="bg-white rounded-2xl border p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold">Top Products</h3>
                                        <button
                                            onClick={() => setActiveTab('products')}
                                            className="text-xs text-she-pink font-medium flex items-center gap-1 hover:underline"
                                        >
                                            View All <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {[...products]
                                            .sort((a, b) => b.review_count - a.review_count)
                                            .slice(0, 5)
                                            .map((product, i) => (
                                                <div key={product.id} className="flex items-center gap-3 p-2 rounded-xl">
                                                    <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                                                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                                        <Image
                                                            src={product.images[0]?.url || ''}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{product.name}</p>
                                                        <p className="text-xs text-muted-foreground">{product.review_count} reviews</p>
                                                    </div>
                                                    <p className="text-sm font-semibold text-she-pink">{formatPrice(product.selling_price)}</p>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>

                            {/* Sales Chart Placeholder */}
                            <div className="bg-white rounded-2xl border p-6">
                                <h3 className="font-semibold mb-4">Sales Overview (Last 30 Days)</h3>
                                <div className="h-48 flex items-end gap-1.5">
                                    {Array.from({ length: 30 }, (_, i) => {
                                        const h = 20 + Math.random() * 80;
                                        return (
                                            <div
                                                key={i}
                                                className="flex-1 bg-gradient-to-t from-she-pink to-she-pink-light rounded-t-sm hover:from-she-pink-dark hover:to-she-pink transition-all cursor-pointer"
                                                style={{ height: `${h}%` }}
                                                title={`Day ${i + 1}`}
                                            />
                                        );
                                    })}
                                </div>
                                <div className="flex justify-between mt-3 text-xs text-muted-foreground">
                                    <span>Feb 1</span>
                                    <span>Feb 15</span>
                                    <span>Mar 1</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Products Tab */}
                    {activeTab === 'products' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        placeholder="Search products..."
                                        className="h-10 w-64 pl-9 pr-3 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-she-pink/20"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="rounded-xl">
                                        <Download className="w-4 h-4 mr-2" /> Export
                                    </Button>
                                    <Button
                                        className="bg-she-pink hover:bg-she-pink-dark text-white rounded-xl"
                                        onClick={() => { setEditingItem(null); setIsProductModalOpen(true); }}
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Add Product
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/30">
                                            <TableHead className="font-semibold">Product</TableHead>
                                            <TableHead className="font-semibold">Category</TableHead>
                                            <TableHead className="font-semibold">Price</TableHead>
                                            <TableHead className="font-semibold">Stock</TableHead>
                                            <TableHead className="font-semibold">Rating</TableHead>
                                            <TableHead className="font-semibold">Status</TableHead>
                                            <TableHead className="font-semibold w-10"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products.map((product) => (
                                            <TableRow key={product.id} className="hover:bg-muted/30">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                                            <Image
                                                                src={product.images[0]?.url || ''}
                                                                alt={product.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm truncate max-w-[200px]">{product.name}</p>
                                                            <p className="text-xs text-muted-foreground">{product.sku}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">{product.category}</TableCell>
                                                <TableCell className="text-sm font-medium">{formatPrice(product.selling_price)}</TableCell>
                                                <TableCell>
                                                    <span className={`text-sm font-medium ${product.stock_quantity <= product.low_stock_alert ? 'text-amber-600' : 'text-foreground'
                                                        }`}>
                                                        {product.stock_quantity}
                                                        {product.stock_quantity <= product.low_stock_alert && (
                                                            <AlertTriangle className="w-3 h-3 inline ml-1 text-amber-500" />
                                                        )}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    ⭐ {product.rating}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={`${product.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-500'} border-0 rounded-full text-xs`}>
                                                        {product.is_active ? 'Active' : 'Draft'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreVertical className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem><Eye className="w-4 h-4 mr-2" /> View</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => { setEditingItem(product); setIsProductModalOpen(true); }}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                                                            <DropdownMenuItem className="text-destructive" onClick={() => deleteProduct(product.id)}>Delete</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {/* Categories Tab */}
                    {activeTab === 'categories' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Store Categories</h3>
                                <Button
                                    className="bg-she-pink hover:bg-she-pink-dark text-white rounded-xl"
                                    onClick={() => { setEditingItem(null); setIsCategoryModalOpen(true); }}
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Add Category
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {categories.map((cat) => (
                                    <div key={cat.id} className="bg-white border rounded-2xl p-6 relative group overflow-hidden hover:shadow-lg transition-all">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="text-4xl w-14 h-14 bg-she-pink-lighter rounded-2xl flex items-center justify-center">
                                                {cat.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg">{cat.name}</h4>
                                                <p className="text-xs text-muted-foreground">{cat.product_count || 0} Products</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-6">
                                            {cat.description || 'No description available for this category.'}
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-xl flex-1"
                                                onClick={() => { setEditingItem(cat); setIsCategoryModalOpen(true); }}
                                            >
                                                <Edit className="w-4 h-4 mr-2" /> Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="rounded-xl text-destructive hover:bg-red-50"
                                                onClick={() => deleteCategory(cat.id)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-she-pink/5 rounded-bl-full -mr-12 -mt-12 transition-all group-hover:w-32 group-hover:h-32" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="flex gap-2 flex-wrap">
                                    {['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered'].map((status) => (
                                        <Button
                                            key={status}
                                            variant="outline"
                                            size="sm"
                                            className="rounded-full text-xs"
                                        >
                                            {status}
                                        </Button>
                                    ))}
                                </div>
                                <Button variant="outline" className="rounded-xl h-9 text-sm" onClick={handleExport}>
                                    <Download className="w-4 h-4 mr-2" /> Export Orders
                                </Button>
                            </div>

                            <div className="bg-white rounded-2xl border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/30">
                                            <TableHead className="font-semibold">Order</TableHead>
                                            <TableHead className="font-semibold">Customer</TableHead>
                                            <TableHead className="font-semibold">Amount</TableHead>
                                            <TableHead className="font-semibold">Payment</TableHead>
                                            <TableHead className="font-semibold">Status</TableHead>
                                            <TableHead className="font-semibold">Date</TableHead>
                                            <TableHead className="font-semibold w-10"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.map((order) => (
                                            <TableRow key={order.id} className="hover:bg-muted/30">
                                                <TableCell className="font-medium text-sm">{order.order_number}</TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="text-sm font-medium">{order.customer_name}</p>
                                                        <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm font-semibold">{formatPrice(order.total_amount)}</TableCell>
                                                <TableCell>
                                                    <Badge className={`${paymentColor(order.payment_status)} border-0 rounded-full text-xs capitalize`}>
                                                        {order.payment_status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={`${statusColor(order.status)} rounded-full text-xs capitalize border`}>
                                                        {order.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {new Date(order.created_at).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreVertical className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="rounded-xl w-56">
                                                            <DropdownMenuLabel className="text-[10px] font-bold uppercase text-muted-foreground px-3 py-1.5">Order Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem className="cursor-pointer" onClick={() => { setSelectedOrderDetails(order); setIsOrderDetailsModalOpen(true); }}>
                                                                <Eye className="w-4 h-4 mr-2" /> View Details
                                                            </DropdownMenuItem>
                                                            {order.status === 'awaiting_payment_approval' && (
                                                                <DropdownMenuItem
                                                                    className="text-she-pink font-semibold bg-she-pink-lighter/20 cursor-pointer"
                                                                    onClick={() => setSelectedPaymentRecord(order)}
                                                                >
                                                                    <DollarSign className="w-4 h-4 mr-2" /> Review Payment
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuSub>
                                                                <DropdownMenuSubTrigger className="cursor-pointer">
                                                                    <Truck className="w-4 h-4 mr-2" /> Delivery Status
                                                                </DropdownMenuSubTrigger>
                                                                <DropdownMenuSubContent className="rounded-xl">
                                                                    {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                                                                        <DropdownMenuItem
                                                                            key={s}
                                                                            className="capitalize cursor-pointer"
                                                                            onClick={() => {
                                                                                updateOrder(order.id, { status: s as any });
                                                                                toast.success(`Order status updated to ${s}`);
                                                                            }}
                                                                        >
                                                                            {s}
                                                                        </DropdownMenuItem>
                                                                    ))}
                                                                </DropdownMenuSubContent>
                                                            </DropdownMenuSub>

                                                            <DropdownMenuSub>
                                                                <DropdownMenuSubTrigger className="cursor-pointer">
                                                                    <CreditCard className="w-4 h-4 mr-2" /> Payment Status
                                                                </DropdownMenuSubTrigger>
                                                                <DropdownMenuSubContent className="rounded-xl">
                                                                    {['pending', 'paid', 'failed', 'refunded'].map((s) => (
                                                                        <DropdownMenuItem
                                                                            key={s}
                                                                            className="capitalize cursor-pointer"
                                                                            onClick={() => {
                                                                                updateOrder(order.id, { payment_status: s as any });
                                                                                toast.success(`Payment status updated to ${s}`);
                                                                            }}
                                                                        >
                                                                            {s}
                                                                        </DropdownMenuItem>
                                                                    ))}
                                                                </DropdownMenuSubContent>
                                                            </DropdownMenuSub>

                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="cursor-pointer" onClick={() => handleDownloadInvoice(order)}>
                                                                <Download className="w-4 h-4 mr-2" /> Download Invoice
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {/* Customers Tab */}
                    {activeTab === 'customers' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        placeholder="Search customers..."
                                        className="h-10 w-64 pl-9 pr-3 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-she-pink/20"
                                    />
                                </div>
                                <Button variant="outline" className="rounded-xl">
                                    <Download className="w-4 h-4 mr-2" /> Export
                                </Button>
                            </div>

                            <div className="bg-white rounded-2xl border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/30">
                                            <TableHead className="font-semibold">Customer</TableHead>
                                            <TableHead className="font-semibold">Phone</TableHead>
                                            <TableHead className="font-semibold">Orders</TableHead>
                                            <TableHead className="font-semibold">Total Spent</TableHead>
                                            <TableHead className="font-semibold">Last Order</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {Object.values(orders.reduce((acc, order) => {
                                            const email = order.customer_email.toLowerCase();
                                            if (!acc[email]) {
                                                acc[email] = {
                                                    name: order.customer_name,
                                                    email: order.customer_email,
                                                    phone: order.customer_phone,
                                                    orders: 0,
                                                    totalSpent: 0,
                                                    lastOrder: order.created_at,
                                                };
                                            }
                                            acc[email].orders += 1;
                                            acc[email].totalSpent += order.total_amount;
                                            if (new Date(order.created_at) > new Date(acc[email].lastOrder)) {
                                                acc[email].lastOrder = order.created_at;
                                            }
                                            return acc;
                                        }, {} as Record<string, any>)).map((customer: any) => (
                                            <TableRow key={customer.email} className="hover:bg-muted/30">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-she-pink-lighter flex items-center justify-center flex-shrink-0">
                                                            <span className="text-she-pink text-xs font-bold">
                                                                {customer.name.split(' ').map((n: string) => n[0]).join('')}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm">{customer.name}</p>
                                                            <p className="text-xs text-muted-foreground">{customer.email}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">{customer.phone}</TableCell>
                                                <TableCell className="text-sm">{customer.orders}</TableCell>
                                                <TableCell className="text-sm font-medium">{formatPrice(customer.totalSpent)}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {new Date(customer.lastOrder).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="max-w-2xl space-y-6 pb-20">
                            <form onSubmit={(e: any) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                const data: any = Object.fromEntries(formData.entries());
                                updateSettings({
                                    storeName: data.storeName,
                                    email: data.email,
                                    phone: data.phone,
                                    whatsapp: data.whatsapp,
                                    bankName: data.bankName,
                                    accountName: data.accountName,
                                    accountNumber: data.accountNumber,
                                    jazzcash: data.jazzcash,
                                    shippingStandard: Number(data.shippingStandard),
                                    shippingExpress: Number(data.shippingExpress),
                                    freeShippingThreshold: Number(data.freeShippingThreshold),
                                    taxRate: Number(data.taxRate) / 100
                                });
                                toast.success('Settings updated successfully!');
                            }}>
                                <div className="bg-white rounded-2xl border p-6 mb-6">
                                    <h3 className="font-semibold mb-4">Store Information</h3>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold uppercase text-muted-foreground">Store Name</label>
                                            <Input name="storeName" defaultValue={settings.storeName} className="mt-1 rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase text-muted-foreground">Email</label>
                                            <Input name="email" defaultValue={settings.email} className="mt-1 rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase text-muted-foreground">Phone</label>
                                            <Input name="phone" defaultValue={settings.phone} className="mt-1 rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase text-muted-foreground">WhatsApp</label>
                                            <Input name="whatsapp" defaultValue={settings.whatsapp} className="mt-1 rounded-xl" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border p-6 mb-6">
                                    <h3 className="font-semibold mb-4">Bank Transfer Details</h3>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold uppercase text-muted-foreground">Bank Name</label>
                                            <Input name="bankName" defaultValue={settings.bankName} className="mt-1 rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase text-muted-foreground">Account Name</label>
                                            <Input name="accountName" defaultValue={settings.accountName} className="mt-1 rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase text-muted-foreground">Account Number</label>
                                            <Input name="accountNumber" defaultValue={settings.accountNumber} className="mt-1 rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase text-muted-foreground">JazzCash/EasyPaisa</label>
                                            <Input name="jazzcash" defaultValue={settings.jazzcash} className="mt-1 rounded-xl" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border p-6 mb-6">
                                    <h3 className="font-semibold mb-4">Shipping & Tax</h3>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold uppercase text-muted-foreground">Standard Rate (Rs.)</label>
                                            <Input name="shippingStandard" type="number" defaultValue={settings.shippingStandard} className="mt-1 rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase text-muted-foreground">Express Rate (Rs.)</label>
                                            <Input name="shippingExpress" type="number" defaultValue={settings.shippingExpress} className="mt-1 rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase text-muted-foreground">Free Shipping Above (Rs.)</label>
                                            <Input name="freeShippingThreshold" type="number" defaultValue={settings.freeShippingThreshold} className="mt-1 rounded-xl" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase text-muted-foreground">Tax Rate (%)</label>
                                            <Input name="taxRate" type="number" defaultValue={settings.taxRate * 100} className="mt-1 rounded-xl" />
                                        </div>
                                    </div>
                                </div>

                                <Button type="submit" className="bg-she-pink hover:bg-she-pink-dark text-white rounded-xl px-10 h-12 shadow-lg shadow-she-pink/20">
                                    Save All Settings
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
            {/* Payment Verification Modal */}
            {selectedPaymentRecord && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in transition-all">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b flex items-center justify-between bg-she-pink/5">
                            <div>
                                <h3 className="text-xl font-bold font-[var(--font-display)]">Verify Payment</h3>
                                <p className="text-sm text-muted-foreground">{selectedPaymentRecord.order_number} — {selectedPaymentRecord.customer_name}</p>
                            </div>
                            <button
                                onClick={() => setSelectedPaymentRecord(null)}
                                className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center text-muted-foreground transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-0">
                            <div className="p-6 bg-muted/20 border-r">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Transfer Screenshot</h4>
                                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border shadow-inner bg-white group cursor-zoom-in">
                                    <Image
                                        src={selectedPaymentRecord.payment_screenshot_url || ''}
                                        alt="Payment Receipt"
                                        fill
                                        className="object-contain"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <Eye className="text-white w-8 h-8" />
                                    </div>
                                </div>
                                <p className="text-[10px] text-center text-muted-foreground mt-3 italic">Click image to expand</p>
                            </div>

                            <div className="p-8 flex flex-col">
                                <div className="flex-1">
                                    <div className="space-y-4 mb-8">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Order Total</p>
                                            <p className="text-2xl font-black text-she-pink">{formatPrice(selectedPaymentRecord.total_amount)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Payment Method</p>
                                            <p className="text-sm font-semibold capitalize flex items-center gap-1.5">
                                                <Banknote className="w-4 h-4 text-emerald-600" />
                                                {selectedPaymentRecord.payment_method.replace('_', ' ')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Customer WhatsApp</p>
                                            <p className="text-sm font-medium">{selectedPaymentRecord.customer_phone}</p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-xs text-amber-800 mb-6 flex gap-3">
                                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                        <p>Please cross-verify the <b>Transaction ID</b> and <b>Amount</b> in your bank statement before approving.</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Button
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-12 shadow-lg shadow-emerald-200"
                                        onClick={() => {
                                            updateOrder(selectedPaymentRecord.id, {
                                                status: 'confirmed',
                                                payment_status: 'paid',
                                                updated_at: new Date().toISOString()
                                            });
                                            toast.success('Payment approved successfully!');
                                            setSelectedPaymentRecord(null);
                                        }}
                                    >
                                        <CheckCircle2 className="w-5 h-5 mr-2" /> Approve Payment
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full border-red-200 text-red-600 hover:bg-red-50 rounded-2xl h-12"
                                        onClick={() => {
                                            const reason = prompt('Reason for rejection:');
                                            if (reason) {
                                                updateOrder(selectedPaymentRecord.id, {
                                                    status: 'cancelled',
                                                    updated_at: new Date().toISOString()
                                                });
                                                toast.error(`Order rejected: ${reason}`);
                                                setSelectedPaymentRecord(null);
                                            }
                                        }}
                                    >
                                        <X className="w-5 h-5 mr-2" /> Reject & Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Product Modal */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-2xl overflow-y-auto">
                    <div className="bg-white rounded-3xl w-full max-w-2xl my-8 animate-in zoom-in-95">
                        <form onSubmit={(e: any) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const data: any = Object.fromEntries(formData.entries());
                            const categoryObj = categories.find(c => c.name === data.category);
                            const productData: Partial<Product> = {
                                name: data.name,
                                description: data.description,
                                selling_price: Number(data.price),
                                stock_quantity: Number(data.stock),
                                category: data.category,
                                category_id: categoryObj ? categoryObj.id : 1,
                                sku: data.sku || `PROD-${Date.now()}`,
                                images: [{
                                    id: Date.now(),
                                    product_id: editingItem?.id || 0,
                                    url: data.imageUrl || 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&q=80&w=800',
                                    public_id: `img-${Date.now()}`,
                                    is_primary: true
                                }],
                                is_active: true,
                                rating: editingItem?.rating || 4.5,
                                review_count: editingItem?.review_count || 0,
                                low_stock_alert: 10,
                                discount_percentage: Number(data.discount || 0),
                            };

                            if (editingItem) {
                                updateProduct(editingItem.id, productData);
                                toast.success('Product updated!');
                            } else {
                                addProduct(productData as any);
                                toast.success('Product added!');
                            }
                            setIsProductModalOpen(false);
                        }}>
                            <div className="p-6 border-b flex items-center justify-between">
                                <h3 className="text-xl font-bold">{editingItem ? 'Edit Product' : 'Add New Product'}</h3>
                                <button type="button" onClick={() => setIsProductModalOpen(false)}><X className="w-6 h-6" /></button>
                            </div>
                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-muted-foreground">Name</label>
                                        <Input name="name" defaultValue={editingItem?.name} required className="rounded-xl" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-muted-foreground">Category</label>
                                        <select name="category" defaultValue={editingItem?.category} className="w-full h-10 px-3 bg-white border rounded-xl text-sm outline-none focus:ring-2 focus:ring-she-pink/20">
                                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Description</label>
                                    <textarea name="description" defaultValue={editingItem?.description} required className="w-full p-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-she-pink/20 min-h-[100px]" />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-muted-foreground">Price (Rs.)</label>
                                        <Input name="price" type="number" defaultValue={editingItem?.selling_price} required className="rounded-xl" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-muted-foreground">Stock</label>
                                        <Input name="stock" type="number" defaultValue={editingItem?.stock_quantity} required className="rounded-xl" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-muted-foreground">Discount %</label>
                                        <Input name="discount" type="number" defaultValue={editingItem?.discount_percentage} className="rounded-xl" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Image URL (Optional)</label>
                                    <Input name="imageUrl" placeholder="https://..." defaultValue={editingItem?.images[0]?.url} className="rounded-xl" />
                                </div>
                            </div>
                            <div className="p-6 border-t flex gap-3">
                                <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setIsProductModalOpen(false)}>Cancel</Button>
                                <Button type="submit" className="flex-1 bg-she-pink hover:bg-she-pink-dark text-white rounded-xl">
                                    {editingItem ? 'Update Product' : 'Save Product'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Category Modal */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md animate-in zoom-in-95">
                        <form onSubmit={(e: any) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const data: any = Object.fromEntries(formData.entries());
                            const catData = {
                                name: data.name,
                                icon: data.icon,
                                description: data.description,
                                slug: data.name.toLowerCase().replace(/\s+/g, '-'),
                                product_count: 0,
                            };

                            if (editingItem) {
                                updateCategory(editingItem.id, catData);
                                toast.success('Category updated!');
                            } else {
                                addCategory(catData);
                                toast.success('Category added!');
                            }
                            setIsCategoryModalOpen(false);
                        }}>
                            <div className="p-6 border-b flex items-center justify-between">
                                <h3 className="text-xl font-bold">{editingItem ? 'Edit Category' : 'Add Category'}</h3>
                                <button type="button" onClick={() => setIsCategoryModalOpen(false)}><X className="w-6 h-6" /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Category Name</label>
                                    <Input name="name" defaultValue={editingItem?.name} required className="rounded-xl" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Icon (Emoji)</label>
                                    <Input name="icon" defaultValue={editingItem?.icon} placeholder="✨" required className="rounded-xl text-2xl h-14 text-center" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Description</label>
                                    <Input name="description" defaultValue={editingItem?.description} className="rounded-xl" />
                                </div>
                            </div>
                            <div className="p-6 border-t flex gap-3">
                                <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setIsCategoryModalOpen(false)}>Cancel</Button>
                                <Button type="submit" className="flex-1 bg-she-pink hover:bg-she-pink-dark text-white rounded-xl">
                                    Save Category
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Order Details Modal */}
            <Dialog open={isOrderDetailsModalOpen} onOpenChange={setIsOrderDetailsModalOpen}>
                <DialogContent className="max-w-[800px] max-h-[90vh] overflow-y-auto rounded-3xl p-0 border-none bg-white shadow-2xl">
                    {selectedOrderDetails && (
                        <div>
                            <div className="bg-gradient-to-r from-she-pink to-pink-600 p-8 text-white relative">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-4 right-4 text-white hover:bg-white/20"
                                    onClick={() => setIsOrderDetailsModalOpen(false)}
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <p className="text-xs uppercase font-bold tracking-widest opacity-80 mb-1">Order Details</p>
                                        <h2 className="text-4xl font-bold tracking-tight">{selectedOrderDetails.order_number}</h2>
                                    </div>
                                    <Badge className={`${paymentColor(selectedOrderDetails.payment_status)} px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg`}>
                                        {selectedOrderDetails.payment_status}
                                    </Badge>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="grid md:grid-cols-3 gap-8">
                                    <div className="md:col-span-2 space-y-8">
                                        <section>
                                            <h3 className="text-sm uppercase font-bold text-muted-foreground tracking-widest mb-4 flex items-center gap-2">
                                                <Package className="w-4 h-4" /> Order Items
                                            </h3>
                                            <div className="space-y-4">
                                                {selectedOrderDetails.items.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-4 bg-muted/20 p-4 rounded-2xl group transition-all hover:bg-muted/40 border border-transparent hover:border-she-pink/10">
                                                        <div className="w-16 h-16 rounded-xl bg-white border flex-shrink-0 relative overflow-hidden ring-1 ring-black/5">
                                                            {item.product_image ? (
                                                                <Image src={item.product_image} alt={item.product_name} fill className="object-cover" />
                                                            ) : (
                                                                <Package className="w-8 h-8 m-auto text-muted-foreground/30" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-foreground text-sm leading-tight h-10 line-clamp-2">{item.product_name}</p>
                                                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                                                <span className="font-semibold text-she-pink">{formatPrice(item.price_at_purchase)}</span>
                                                                <span className="opacity-40">×</span>
                                                                <span className="bg-muted px-1.5 py-0.5 rounded-md font-medium text-[10px]">{item.quantity} units</span>
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-sm">{formatPrice(item.price_at_purchase * item.quantity)}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>

                                        <section className="bg-muted/30 p-6 rounded-3xl grid grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Subtotal</p>
                                                <p className="text-lg font-bold">{formatPrice(selectedOrderDetails.total_amount * 0.9)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Shipping</p>
                                                <p className="text-lg font-bold">Rs. 200</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Tax</p>
                                                <p className="text-lg font-bold">Rs. 125</p>
                                            </div>
                                            <div className="border-l pl-6 border-muted-foreground/20">
                                                <p className="text-[10px] uppercase font-bold text-she-pink tracking-widest mb-1">Grand Total</p>
                                                <p className="text-3xl font-black text-she-pink">{formatPrice(selectedOrderDetails.total_amount)}</p>
                                            </div>
                                        </section>
                                    </div>

                                    <div className="space-y-8 border-l pl-8">
                                        <section>
                                            <h3 className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-4 flex items-center gap-2">
                                                <Users className="w-3 h-3" /> Customer Information
                                            </h3>
                                            <div className="bg-muted/10 p-4 rounded-2xl space-y-3">
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground mb-0.5">Full Name</p>
                                                    <p className="text-xs font-bold">{selectedOrderDetails.customer_name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground mb-0.5">Email Address</p>
                                                    <p className="text-xs font-medium hover:underline cursor-pointer">{selectedOrderDetails.customer_email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground mb-0.5">Phone Number</p>
                                                    <p className="text-xs font-semibold">{selectedOrderDetails.customer_phone}</p>
                                                </div>
                                            </div>
                                        </section>

                                        <section>
                                            <h3 className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-4 flex items-center gap-2">
                                                <MapPin className="w-3 h-3" /> Shipping Address
                                            </h3>
                                            <div className="bg-pink-50/50 p-4 rounded-2xl border border-she-pink/5">
                                                <p className="text-xs text-foreground leading-relaxed">
                                                    Pakistan, Karachi<br />
                                                    Main Gulshan-e-Iqbal, Block 13-C<br />
                                                    Apartment 402, Royal Residency<br />
                                                    <span className="inline-block mt-2 text-she-pink font-bold">75300</span>
                                                </p>
                                            </div>
                                        </section>

                                        <section>
                                            <h3 className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-4 flex items-center gap-2">
                                                <CreditCard className="w-3 h-3" /> Payment Method
                                            </h3>
                                            <div className="flex items-center gap-3 bg-muted/10 p-3 rounded-xl">
                                                <div className="w-8 h-8 rounded-full bg-she-pink/10 flex items-center justify-center">
                                                    <Banknote className="w-4 h-4 text-she-pink" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase">{selectedOrderDetails.payment_method.replace('_', ' ')}</p>
                                                    <p className="text-[9px] text-muted-foreground">ID: #PX-8821933</p>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t bg-muted/10 flex justify-between gap-4 rounded-b-3xl">
                                <Button variant="outline" className="rounded-xl px-6 h-11 text-xs font-bold uppercase tracking-wider" onClick={() => handleDownloadInvoice(selectedOrderDetails)}>
                                    <Download className="w-4 h-4 mr-2" /> Download Invoice
                                </Button>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="rounded-xl px-6 h-11 text-xs font-bold uppercase tracking-wider" onClick={() => setIsOrderDetailsModalOpen(false)}>
                                        Close Details
                                    </Button>
                                    <Button className="bg-she-pink hover:bg-she-pink-dark text-white rounded-xl px-10 h-11 text-xs font-bold uppercase tracking-wider shadow-lg shadow-she-pink/20">
                                        Ship Order Now
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
