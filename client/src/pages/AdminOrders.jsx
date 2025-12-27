import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from "@clerk/clerk-react";
import { Loader2, Package, Truck, CheckCircle2, Clock, Receipt, User as UserIcon, Filter, RefreshCcw } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { getToken, isLoaded, isSignedIn } = useAuth();

    const fetchOrders = async (retryCount = 0) => {
        try {
            setError(null);

            if (!isLoaded || !isSignedIn) {
                console.log("Waiting for auth...");
                return;
            }

            const token = await getToken();

            if (!token) {
                if (retryCount < 3) {
                    console.log(`Token missing, retrying (${retryCount + 1}/3)...`);
                    setTimeout(() => fetchOrders(retryCount + 1), 1000);
                    return;
                }
                throw new Error("Authentication failed: No token available.");
            }

            const res = await axios.get('/orders/admin/all', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setOrders(res.data);
            setLoading(false);

        } catch (err) {
            console.error("Fetch error:", err);
            // Handle 401/403 explicitly
            if (err.response?.status === 401 || err.response?.status === 403) {
                setError("Access Denied: You do not have permission to view these records.");
            } else {
                setError("Connection Error: Failed to secure uplink.");
            }
            toast.error(err.message || "Failed to load orders");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            fetchOrders();
        }
    }, [isLoaded, isSignedIn]);

    const handleStatusUpdate = async (id, newStatus) => {
        const loadingToast = toast.loading("Updating status...");
        try {
            const token = await getToken();
            await axios.patch(`/orders/admin/${id}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(orders.map(o => o._id === id ? { ...o, status: newStatus } : o));
            toast.success(`Order moved to ${newStatus.replace(/_/g, ' ')}`, { id: loadingToast });
        } catch (err) {
            toast.error("Update failed. Check role permissions.", { id: loadingToast });
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 animate-pulse text-neon-purple h-[60vh]">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="font-mono text-xs uppercase tracking-widest">Retrieving Logistics Data...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center p-20 text-center h-[60vh]">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                <Filter className="w-8 h-8 text-signal-red" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">System Uplink Failed</h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <Button onClick={() => { setLoading(true); fetchOrders(); }} className="bg-signal-red hover:bg-red-600">
                <RefreshCcw className="w-4 h-4 mr-2" /> Retry Connection
            </Button>
        </div>
    );

    const statusOptions = ['ORDER_RECEIVED', 'IN_KITCHEN', 'OUT_FOR_DELIVERY', 'DELIVERED'];

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-display font-black text-white leading-tight tracking-tight">Active Fleet</h1>
                    <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">Manage Delivery Pipeline</p>
                </div>
                <div className="glass-panel px-6 py-3 rounded-2xl flex flex-col items-end border-luxury-gold/20">
                    <span className="text-[10px] font-black uppercase tracking-widest text-luxury-gold mb-1">Total Pipeline Value</span>
                    <div className="text-2xl font-mono font-bold text-white">₹{orders.reduce((acc, o) => acc + o.totalPrice, 0).toLocaleString()}</div>
                </div>
            </header>

            {/* Filter Bar */}
            <div className="flex glass-panel p-3 rounded-xl items-center justify-between border-white/5">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="text-gray-400 font-bold text-xs hover:text-white hover:bg-white/5"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex gap-2">
                        {['All', 'Active', 'Completed'].map(f => (
                            <button key={f} className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", f === 'All' ? 'bg-neon-purple text-midnight-950' : 'hover:bg-white/5 text-gray-400')}>{f}</button>
                        ))}
                    </div>
                </div>
                <span className="text-[10px] font-mono text-gray-500 hidden md:block">INDEXING {orders.length} RECORDS</span>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <AnimatePresence>
                    {orders.length === 0 && (
                        <div className="p-12 text-center text-gray-500 font-mono text-sm uppercase tracking-widest">
                            No Active Orders in Pipeline
                        </div>
                    )}
                    {orders.map((order, idx) => (
                        <motion.div
                            key={order._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="glass-panel rounded-2xl overflow-hidden group hover:border-white/10 transition-colors"
                        >
                            <div className="flex flex-col lg:flex-row items-stretch">
                                {/* Info Panel */}
                                <div className="p-6 lg:w-1/3 bg-black/20 border-r border-white/5 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-luxury-gold">
                                                <Receipt className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black uppercase text-gray-500">Order ID</div>
                                                <div className="font-mono text-xs font-bold text-white">#{order._id.slice(-8)}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-black uppercase text-gray-500">Timestamp</div>
                                            <div className="text-xs font-mono text-gray-400">{format(new Date(order.createdAt), 'MMM d, HH:mm')}</div>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                                        <div className="w-8 h-8 bg-neon-purple rounded-full flex items-center justify-center text-white">
                                            <UserIcon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="text-[10px] font-black uppercase text-gray-500">Customer Profile</div>
                                            <div className="text-sm font-bold truncate text-white">{order.userId}</div>
                                            <div className="text-[10px] text-gray-400 font-mono mt-0.5 tracking-wider">{order.contactNumber || 'NO CONTACT DATA'}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Panel */}
                                <div className="p-6 lg:flex-1 flex flex-col justify-between">
                                    <div className="flex flex-wrap gap-3">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3 bg-white/5 border border-white/5 p-2 rounded-xl">
                                                <div className="text-lg">🍕</div>
                                                <div>
                                                    <div className="text-xs font-bold text-white leading-none mb-1">Custom Build</div>
                                                    <div className="text-[9px] text-gray-500 font-mono uppercase tracking-tighter truncate max-w-[100px]">{item.base} • {item.sauce}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-8 flex items-center justify-between">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-[10px] font-black uppercase text-gray-500">Total Value</span>
                                            <span className="text-2xl font-mono font-bold text-luxury-gold">₹{order.totalPrice}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <StatusBadge status={order.status} />
                                            <select
                                                className="bg-black/40 border border-white/10 rounded-lg text-xs font-bold p-2 text-white outline-none focus:border-neon-purple transition-all"
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                            >
                                                {statusOptions.map(s => <option key={s} value={s} className="bg-midnight-900 text-white">{s.replace(/_/g, ' ')}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const styles = {
        'ORDER_RECEIVED': 'text-blue-400 border-blue-500/30 bg-blue-500/10',
        'IN_KITCHEN': 'text-orange-400 border-orange-500/30 bg-orange-500/10',
        'OUT_FOR_DELIVERY': 'text-purple-400 border-purple-500/30 bg-purple-500/10',
        'DELIVERED': 'text-green-400 border-green-500/30 bg-green-500/10',
        'PAYMENT_FAILED': 'text-red-400 border-red-500/30 bg-red-500/10'
    };
    return (
        <span className={cn("px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase border", styles[status] || 'bg-white/5')}>
            {status.replace(/_/g, ' ')}
        </span>
    );
};

export default AdminOrders;
