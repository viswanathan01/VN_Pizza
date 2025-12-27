import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { ShoppingBag, ChevronRight, Clock, Star, Zap, MapPin, Package, ArrowRight, Flame } from 'lucide-react';
import { Button } from '../components/ui/Button';
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

    const firstName = user?.firstName || 'Connoisseur';

    return (
        <div className="space-y-8 pb-20 pt-4">
            {/* --- HERO SECTION --- */}
            <section className="relative h-[500px] rounded-[40px] overflow-hidden flex items-end p-8 md:p-16 group">
                {/* Background Image with Zoom Effect */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1574126154517-d1e0d89e7344?q=80&w=2600&auto=format&fit=crop"
                        alt="Artisan Pizza"
                        className="w-full h-full object-cover transition-transform duration-[20s] ease-linear group-hover:scale-110"
                    />
                    {/* Cinematic Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-midnight-950/90 to-transparent" />
                </div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 max-w-2xl space-y-6"
                >
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full glass-panel border-luxury-gold/30 gold-glow">
                        <Flame className="w-3 h-3 text-luxury-gold animate-pulse" />
                        <span className="text-luxury-gold text-[10px] font-black uppercase tracking-[0.2em] font-display">Premium Selection</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-display font-black text-white leading-[0.9] tracking-tight">
                        Culinary <br />
                        <span className="text-gradient-gold">Perfection.</span>
                    </h1>

                    <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-lg">
                        Welcome back, {firstName}. Your personalized chef's table awaits.
                        Experience the art of pizza making with our global ingredient catalog.
                    </p>

                    <Link to="/pizza/create">
                        <Button className="h-14 px-8 rounded-full bg-luxury-gold hover:bg-white hover:text-black text-midnight-950 font-black tracking-wide text-sm transition-all shadow-glow mt-4">
                            START CREATING <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                </motion.div>
            </section>

            {/* --- INFO GRID --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Active Order Card */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-display font-bold text-white">Live Operations</h3>
                        <Link to="/orders" className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
                            View History <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {activeOrder ? (
                        <div className="glass-panel p-8 rounded-[32px] flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
                            {/* Ambient Glow */}
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-neon-purple/20 rounded-full blur-[100px] group-hover:bg-neon-purple/30 transition-all" />

                            <div className="w-24 h-24 rounded-2xl bg-midnight-900 border border-white/5 flex items-center justify-center relative shadow-2xl">
                                <Package className="w-10 h-10 text-white" />
                                <div className="absolute -top-3 -right-3 bg-signal-green text-midnight-950 text-[10px] font-black px-3 py-1 rounded-full animate-bounce shadow-glow">LIVE</div>
                            </div>

                            <div className="flex-1 space-y-3 z-10 text-center md:text-left">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Status</span>
                                    <h4 className="text-2xl font-display font-bold text-white">{activeOrder.status.replace(/_/g, ' ')}</h4>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-midnight-950 h-2 rounded-full overflow-hidden border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: activeOrder.status === 'ORDER_RECEIVED' ? '25%' : activeOrder.status === 'IN_KITCHEN' ? '50%' : '75%' }}
                                        className="bg-gradient-to-r from-neon-purple to-neon-blue h-full rounded-full shadow-glow-blue"
                                    />
                                </div>
                            </div>

                            <Link to="/orders" className="z-10">
                                <Button variant="outline" className="border-white/10 text-white hover:bg-white hover:text-black rounded-xl">Track Status</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="glass-panel p-10 rounded-[32px] flex flex-col items-center justify-center text-center space-y-4 border-dashed border-white/10 opacity-70 hover:opacity-100 transition-opacity">
                            <ShoppingBag className="w-8 h-8 text-gray-600" />
                            <p className="font-medium text-gray-400 text-sm">No culinary projects in progress.</p>
                        </div>
                    )}

                    {/* Quick Access Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <QuickAction icon={Star} label="Curated" />
                        <QuickAction icon={Clock} label="Fast Track" />
                        <QuickAction icon={MapPin} label="Concierge" />
                        <QuickAction icon={Package} label="Catering" />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Membership Card */}
                    <div className="relative p-8 rounded-[32px] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-luxury-gold to-yellow-600" />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />

                        <div className="relative z-10 text-midnight-950">
                            <div className="flex justify-between items-start mb-8">
                                <Zap className="w-8 h-8" />
                                <span className="text-[10px] font-black uppercase tracking-widest border border-midnight-950/20 px-2 py-1 rounded-lg">Elite</span>
                            </div>
                            <h4 className="text-3xl font-display font-black leading-none mb-2">Plaza<br />Club</h4>
                            <p className="font-medium opacity-80 text-sm mb-6">Unlock exclusive tastings and priority delivery.</p>
                            <Button className="w-full h-12 bg-black/10 hover:bg-black/20 text-midnight-950 font-bold border-none">Access Benefits</Button>
                        </div>
                    </div>

                    {/* Ingredient Showcase */}
                    <div className="glass-panel p-8 rounded-[32px]">
                        <h4 className="font-bold text-white mb-6 flex items-center gap-2 font-display">
                            <Star className="w-4 h-4 text-luxury-gold" /> Trending
                        </h4>
                        <div className="space-y-4">
                            {['Truffle Oil Infusion', 'San Marzano Tomatoes', 'Buffalo Mozzarella'].map(i => (
                                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-luxury-gold group-hover:text-midnight-950 transition-colors">
                                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">{i}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const QuickAction = ({ icon: Icon, label }) => (
    <div className="flex flex-col items-center gap-3 p-6 glass-panel rounded-3xl hover:bg-white/5 hover:border-luxury-gold/30 transition-all cursor-pointer group">
        <Icon className="w-6 h-6 text-gray-400 group-hover:text-luxury-gold transition-colors" />
        <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest group-hover:text-white transition-colors">{label}</span>
    </div>
)

export default Dashboard;
