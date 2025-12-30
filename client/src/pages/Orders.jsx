import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { Loader2, Package, Truck, CheckCircle2, Clock, Receipt, RefreshCcw, ChefHat, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../utils/cn';
import { motion } from 'framer-motion';

import { useAuthStore } from '../hooks/useAuthStore';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { getToken, isLoaded, isSignedIn } = useAuthStore();
    const navigate = useNavigate();

    const fetchOrders = async (silent = false) => {
        if (!isLoaded || !isSignedIn) return;
        if (!silent) setLoading(true);
        try {
            const token = await getToken();
            const res = await axios.get('/orders/my', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            fetchOrders();
            const interval = setInterval(() => fetchOrders(true), 15000);
            return () => clearInterval(interval);
        }
    }, [isLoaded, isSignedIn]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-orange-500 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin" />
            <p className="font-bold tracking-widest text-xs uppercase text-gray-400">Syncing with Kitchen...</p>
        </div>
    );

    if (orders.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6">
            <div className="w-32 h-32 bg-gray-50 rounded-[40px] flex items-center justify-center border-2 border-dashed border-gray-200">
                <Package className="w-12 h-12 text-gray-300" />
            </div>
            <div>
                <h2 className="text-3xl font-bold text-gray-900">No active orders</h2>
                <p className="text-gray-500 font-medium max-w-sm mx-auto mt-2 text-sm">Your pizza journey hasn't started yet. Create your first masterpiece!</p>
            </div>
            <button
                className="px-10 h-16 bg-orange-500 text-white font-bold rounded-2xl shadow-xl shadow-orange-500/20"
                onClick={() => navigate('/menu')}
            >
                Start Designing
            </button>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
            <div className="flex items-center justify-between border-b pb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Active Orders</h1>
                    <p className="text-gray-500 text-sm font-medium mt-1">Track your designs from kitchen to doorstep.</p>
                </div>
                <button onClick={() => fetchOrders()} className="p-3 border rounded-xl hover:bg-gray-50 transition-colors">
                    <RefreshCcw className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            <div className="space-y-8">
                {orders.map((order) => (
                    <motion.div
                        key={order._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card p-0 overflow-hidden shadow-sm"
                    >
                        {/* Header Section */}
                        <div className="p-8 border-b">
                            <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border">
                                        <Receipt className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Reference</div>
                                        <div className="font-mono text-sm font-bold text-gray-900">#{order._id.slice(-8).toUpperCase()}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Value</div>
                                        <div className="text-2xl font-bold text-orange-600 italic">₹{order.totalPrice}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline Stepper */}
                            <div className="grid grid-cols-4 relative">
                                <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-100 -z-0" />
                                <TimelineStep status="ORDER_RECEIVED" current={order.status} label="Received" icon={Package} />
                                <TimelineStep status="IN_KITCHEN" current={order.status} label="In Kitchen" icon={ChefHat} />
                                <TimelineStep status="OUT_FOR_DELIVERY" current={order.status} label="Out for Delivery" icon={Truck} />
                                <TimelineStep status="DELIVERED" current={order.status} label="Delivered" icon={CheckCircle2} />
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-gray-50/50 p-6 space-y-3">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="text-2xl w-10 h-10 flex items-center justify-center bg-gray-50 rounded-lg">
                                        {item.packId ? '📦' : '🍕'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-gray-900">{item.name}</div>
                                        <div className="text-[10px] text-gray-500 font-medium line-clamp-1">{item.description || 'Custom hand-crafted build'}</div>
                                    </div>
                                    <div className="text-xs font-bold text-gray-900 font-mono">x{item.quantity}</div>
                                    <div className="text-sm font-bold text-gray-900">₹{item.price * item.quantity}</div>
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
    const statusMap = { 'ORDER_RECEIVED': 1, 'IN_KITCHEN': 2, 'OUT_FOR_DELIVERY': 3, 'DELIVERED': 4, 'PAYMENT_FAILED': 0 };
    const isDone = statusMap[current] > statusMap[status];
    const isActive = current === status;

    return (
        <div className="flex flex-col items-center gap-3 relative z-10">
            <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-4",
                isDone ? "bg-green-500 border-green-50 text-white" :
                    isActive ? "bg-orange-500 border-orange-50 text-white scale-110 shadow-lg shadow-orange-500/20" :
                        "bg-white border-gray-100 text-gray-300"
            )}>
                <Icon className="w-5 h-5" />
            </div>
            <span className={cn("text-[9px] font-bold uppercase tracking-widest",
                isActive ? "text-orange-600" : isDone ? "text-green-600" : "text-gray-400"
            )}>
                {label}
            </span>
        </div>
    );
}

export default Orders;
