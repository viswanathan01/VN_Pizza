import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { ShoppingBag, ChevronRight, Clock, Star, Zap, MapPin, Package, ArrowRight, Flame, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';
import { useAuth } from '@clerk/clerk-react';

const Dashboard = () => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const [activeOrder, setActiveOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActiveOrder = async () => {
            try {
                const token = await getToken();
                const res = await axios.get('/orders/my', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const active = res.data.find(o => o.status !== 'DELIVERED');
                setActiveOrder(active);
            } catch (err) {
                console.error("Dashboard error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchActiveOrder();
    }, []);

    const firstName = user?.firstName || 'Guest';

    return (
        <div className="space-y-10 pb-20">
            {/* Hero Section */}
            <section className="relative h-[480px] rounded-[3rem] overflow-hidden flex items-center p-12 lg:p-20 group shadow-2xl">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1574126154517-d1e0d89e7344?q=80&w=2600&auto=format&fit=crop"
                        alt="Artisan Pizza"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/40 to-transparent" />
                </div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative z-10 max-w-xl space-y-6"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-orange-500/20">
                        <Flame className="w-4 h-4" /> Perfecting the Craft
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tighter leading-none">
                        Welcome, <br />
                        <span className="text-orange-500 italic">{firstName}.</span>
                    </h1>
                    <p className="text-gray-300 text-lg font-medium max-w-md">
                        Your personalized pizza studio is ready. Ready to design your next masterpiece?
                    </p>
                    <Link to="/builder">
                        <button className="mt-4 px-10 h-16 bg-white text-gray-900 rounded-2xl font-bold uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-xl flex items-center gap-3">
                            Design Now <ArrowRight className="w-5 h-5" />
                        </button>
                    </Link>
                </motion.div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Active Tracking */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Current Status</h3>
                        <Link to="/orders" className="text-xs font-bold text-orange-600 hover:underline uppercase tracking-widest">View History</Link>
                    </div>

                    {activeOrder ? (
                        <div className="card p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm group border-orange-100 bg-orange-50/20">
                            <div className="w-20 h-20 rounded-2xl bg-white border border-orange-100 flex items-center justify-center shadow-sm relative shrink-0">
                                <Package className="w-10 h-10 text-orange-500" />
                                <div className="absolute -top-2 -right-2 w-4 h-4 bg-orange-500 rounded-full animate-ping" />
                            </div>
                            <div className="flex-1 space-y-4 w-full">
                                <div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">In Transit</div>
                                    <h4 className="text-2xl font-bold text-gray-900">{activeOrder.status.replace(/_/g, ' ')}</h4>
                                </div>
                                <div className="w-full h-2 bg-white rounded-full border overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: activeOrder.status === 'ORDER_RECEIVED' ? '25%' : activeOrder.status === 'IN_KITCHEN' ? '50%' : '75%' }}
                                        className="h-full bg-orange-500 rounded-full"
                                    />
                                </div>
                            </div>
                            <Link to="/orders">
                                <button className="px-6 h-12 border rounded-xl font-bold text-xs hover:bg-white transition-colors">Details</button>
                            </Link>
                        </div>
                    ) : (
                        <div className="card h-48 flex flex-col items-center justify-center p-12 border-dashed bg-gray-50/50">
                            <ShoppingBag className="w-8 h-8 text-gray-300 mb-4" />
                            <p className="text-gray-500 font-medium">No active orders found.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                        <QuickAction icon={Star} label="Best Sellers" />
                        <QuickAction icon={Heart} label="Last Ordered" />
                        <QuickAction icon={MapPin} label="Saved Address" />
                        <QuickAction icon={Package} label="Catering" />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="card bg-gray-900 border-none p-10 space-y-6 text-white text-center">
                        <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20 mb-4">
                            <Zap className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="text-2xl font-bold tracking-tight">Plaza Priority</h4>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed">
                            Join our elite circle for priority kitchen queue and exclusive tastings.
                        </p>
                        <button className="w-full h-14 bg-white text-gray-900 rounded-2xl font-bold uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all">
                            Learn More
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const QuickAction = ({ icon: Icon, label }) => (
    <div className="card p-6 flex flex-col items-center gap-3 hover:border-orange-200 transition-all cursor-pointer group">
        <Icon className="w-6 h-6 text-gray-400 group-hover:text-orange-500 transition-colors" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-900 transition-colors">{label}</span>
    </div>
);

export default Dashboard;
