import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Loader2, Package, Truck, CheckCircle2, Clock, MapPin, Receipt, RefreshCcw, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../utils/cn';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import { useAuth } from '@clerk/clerk-react';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { getToken } = useAuth();

    const fetchOrders = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const token = await getToken();
            const res = await axios.get('/orders/my', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(() => fetchOrders(true), 15000); // Polling every 15s
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className="container mx-auto p-8 space-y-6">
            <Skeleton className="h-12 w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Skeleton className="h-64 rounded-3xl" />
                <Skeleton className="h-64 rounded-3xl" />
            </div>
        </div>
    );

    if (orders.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
                <Package className="w-16 h-16 text-gray-300" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-gray-900">No orders yet</h2>
                <p className="text-gray-500 max-w-sm mx-auto mt-2">Your pizza journey hasn't started. Create your first masterpiece now!</p>
            </div>
            <Button size="lg" className="bg-brand-red hover:bg-red-700 h-14 px-12 rounded-2xl" onClick={() => window.location.href = '/pizza/create'}>
                Start Building
            </Button>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-4xl font-black text-gray-900">Track Orders</h1>
                    <p className="text-gray-500 font-medium">Real-time snapshots of your pizza progress.</p>
                </div>
                <Button variant="outline" size="icon" onClick={() => fetchOrders()} className="rounded-xl">
                    <RefreshCcw className="w-4 h-4" />
                </Button>
            </div>

            <div className="space-y-12">
                {orders.map((order) => (
                    <motion.div
                        key={order._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[32px] overflow-hidden shadow-2xl shadow-gray-200/50 border border-gray-100"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-12">
                            {/* Status Timeline (5 col) */}
                            <div className="lg:col-span-12 p-8 lg:p-12 bg-gray-50/50 border-b lg:border-b-0 lg:border-r border-gray-100">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-brand-gold/10 p-3 rounded-2xl">
                                            <Receipt className="w-6 h-6 text-brand-gold" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Order ID</div>
                                            <div className="font-mono text-sm">#{order._id.slice(-8).toUpperCase()}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 px-6 py-2 bg-white rounded-full border border-gray-200 shadow-sm text-sm font-bold">
                                        <Clock className="w-4 h-4 text-brand-gold" />
                                        {format(new Date(order.createdAt), 'MMM d, h:mm a')}
                                    </div>
                                    <div className="text-2xl font-black text-brand-red">₹{order.totalPrice}</div>
                                </div>

                                <div className="relative flex flex-col md:flex-row justify-between gap-4">
                                    <TimelineStep status="ORDER_RECEIVED" current={order.status} label="Received" icon={Package} />
                                    <TimelineStep status="IN_KITCHEN" current={order.status} label="Preparation" icon={ChefHat} />
                                    <TimelineStep status="OUT_FOR_DELIVERY" current={order.status} label="On the way" icon={Truck} />
                                    <TimelineStep status="DELIVERED" current={order.status} label="Ready" icon={CheckCircle2} />
                                </div>
                            </div>
                        </div>

                        {/* Order Details Accordion? No, let's keep it clean */}
                        <div className="p-8 border-t border-gray-100 flex flex-wrap gap-8 items-center bg-white">
                            {order.items.map((pizza, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-xl">🍕</div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-900">Custom Pizza</div>
                                        <div className="text-[10px] text-gray-400 font-medium">{pizza.base}, {pizza.sauce}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const TimelineStep = ({ status, current, label, icon: Icon }) => {
    const statusMap = {
        'ORDER_RECEIVED': 1,
        'IN_KITCHEN': 2,
        'OUT_FOR_DELIVERY': 3,
        'DELIVERED': 4,
        'PAYMENT_FAILED': 0
    };

    const isDone = statusMap[current] > statusMap[status];
    const isActive = current === status;
    const isPending = statusMap[current] < statusMap[status];

    return (
        <div className="flex-1 flex flex-col items-center gap-3 relative z-10">
            <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500",
                isDone ? "bg-green-600 text-white shadow-lg shadow-green-900/20" :
                    isActive ? "bg-brand-red text-white shadow-xl shadow-red-900/30 scale-110 animate-pulse" :
                        "bg-white text-gray-300 border-2 border-dashed border-gray-200"
            )}>
                <Icon className="w-6 h-6" />
                {isDone && <CheckCircle2 className="w-4 h-4 absolute -top-1 -right-1 text-green-500 bg-white rounded-full" />}
            </div>
            <div className="flex flex-col items-center">
                <span className={cn("text-[10px] font-black uppercase tracking-widest", isActive ? "text-brand-red" : isDone ? "text-green-600" : "text-gray-400")}>
                    {label}
                </span>
                {isActive && <span className="text-[9px] text-brand-gold font-bold italic">Processing...</span>}
            </div>
        </div>
    );
}

const ChefHat = ({ className }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M6 13.8V10a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3.8" />
            <path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V10Z" />
            <path d="M9 18h6" />
            <path d="M10 22h4" />
        </svg>
    )
}

export default Orders;
