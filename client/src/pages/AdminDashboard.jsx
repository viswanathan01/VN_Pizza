import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '@clerk/clerk-react';
import {
    ShoppingBag,
    Box,
    TrendingUp,
    AlertTriangle,
    Loader2,
    RefreshCcw,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const [stats, setStats] = useState({
        activeOrders: 0,
        outOfStock: 0,
        revenue: 0,
        totalItems: 0,
        recentOrders: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const [statsRes, ordersRes] = await Promise.all([
                axios.get('/analytics/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/orders/admin/all?limit=10', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            setStats({
                ...statsRes.data,
                recentOrders: ordersRes.data || []
            });
            setLoading(false);
        } catch (err) {
            console.error("Dashboard Sync Failed", err);
            setError("Failed to synchronize operational data.");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            fetchDashboardData();
        }
    }, [isLoaded, isSignedIn]);

    const metrics = [
        { label: 'Pending Orders', value: stats.activeOrders, icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Today\'s Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Low Stock Items', value: stats.outOfStock, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Total Ingredients', value: stats.totalItems, icon: Box, color: 'text-blue-600', bg: 'bg-blue-50' },
    ];

    if (loading) return (
        <div className="space-y-8 animate-pulse">
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <div className="h-8 w-48 bg-gray-200 rounded" />
                    <div className="h-4 w-32 bg-gray-100 rounded" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-32 bg-gray-100 rounded-2xl border" />
                ))}
            </div>
            <div className="h-96 bg-gray-50 rounded-2xl border" />
        </div>
    );

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Executive Dashboard</h1>
                    <p className="text-gray-500 text-sm font-medium mt-1">Real-time overview of your pizza empire.</p>
                </div>
                <button
                    onClick={fetchDashboardData}
                    className="flex items-center gap-2 px-4 py-2 bg-white border rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                >
                    <RefreshCcw className="w-4 h-4" />
                    Refresh Data
                </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((m, idx) => (
                    <div key={idx} className="card group hover:shadow-xl hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn("p-3 rounded-xl", m.bg)}>
                                <m.icon className={cn("w-6 h-6", m.color)} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live</span>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-bold text-gray-900">{m.value}</h3>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{m.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders */}
                <div className="lg:col-span-2 card p-0 overflow-hidden">
                    <div className="p-6 border-b flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">Recent Orders</h3>
                        <Link to="/admin/orders" className="text-xs font-bold text-orange-600 flex items-center gap-1 hover:underline">
                            View All <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="app-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Status</th>
                                    <th>Total</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50/50">
                                        <td className="font-mono text-xs font-bold text-gray-400">#{order._id.slice(-6).toUpperCase()}</td>
                                        <td>
                                            <div className="font-semibold text-gray-900">{order.userId?.split('_')[1] || 'Guest'}</div>
                                            <div className="text-[10px] text-gray-400">{format(new Date(order.createdAt), 'h:mm a')}</div>
                                        </td>
                                        <td>
                                            <span className={cn("status-pill",
                                                order.status === 'ORDER_RECEIVED' ? 'status-received' :
                                                    order.status === 'IN_KITCHEN' ? 'status-kitchen' :
                                                        order.status === 'DELIVERED' ? 'status-delivered' : 'status-delivery'
                                            )}>
                                                {order.status.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="font-bold text-gray-900">₹{order.totalPrice}</td>
                                        <td>
                                            <Link to="/admin/orders" className="p-2 text-gray-400 hover:text-orange-500 transition-colors">
                                                <ArrowUpRight className="w-4 h-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Inventory Alerts */}
                <div className="space-y-6">
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-gray-900">Critical Alerts</h3>
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        </div>
                        <div className="space-y-4">
                            {stats.outOfStock > 0 ? (
                                <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex gap-4">
                                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                                    <div>
                                        <div className="text-sm font-bold text-red-900">{stats.outOfStock} Items Low on Stock</div>
                                        <p className="text-[11px] text-red-700 mt-1">Order ingredients immediately to prevent kitchen shutdown.</p>
                                        <Link to="/admin/inventory#alert" className="mt-3 inline-block text-[10px] font-black uppercase text-red-600 hover:underline">Restock Depot</Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No Alerts</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card bg-orange-600 border-none relative overflow-hidden">
                        <div className="relative z-10 space-y-4">
                            <h3 className="text-white font-bold">Pizza Builder Pro</h3>
                            <p className="text-orange-100 text-xs font-medium leading-relaxed">
                                Our AI-powered builder saw 24% higher engagement today. Consider adding more "Premium" category ingredients.
                            </p>
                            <button className="px-4 py-2 bg-white text-orange-600 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-xl">
                                Marketing Lab
                            </button>
                        </div>
                        <ShoppingBag className="absolute -bottom-6 -right-6 w-32 h-32 text-orange-500/30 -rotate-12" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
