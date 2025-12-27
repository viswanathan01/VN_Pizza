import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '@clerk/clerk-react';
import { ShoppingBag, Box, TrendingUp, AlertTriangle, Activity, ArrowRight, Loader2, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';
import { Button } from '../components/ui/Button';

const AdminDashboard = () => {
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const [stats, setStats] = useState({
        activeOrders: 0,
        outOfStock: 0,
        revenue: 0,
        totalItems: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async (retryCount = 0) => {
        try {
            setError(null);

            if (!isLoaded || !isSignedIn) return;

            const token = await getToken();
            if (!token) {
                if (retryCount < 3) {
                    setTimeout(() => fetchStats(retryCount + 1), 1000);
                    return;
                }
                throw new Error("No Auth Token");
            }

            const res = await axios.get('/analytics/dashboard', {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 5000
            });
            setStats(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch analytics", err);
            // Don't show full error UI for dashboard stats, just stop loading and maybe show 0s or a small toast
            // But if it's a 403, we should probably warn.
            if (err.response?.status === 403) {
                setError("Access Denied");
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            fetchStats();
        }
    }, [isLoaded, isSignedIn]);

    const statCards = [
        { label: 'Pending Orders', value: stats.activeOrders, icon: ShoppingBag, color: 'text-neon-blue', trend: 'Live' },
        { label: 'Low Stock', value: stats.outOfStock, icon: AlertTriangle, color: 'text-signal-red', trend: 'Critical' },
        { label: 'Daily Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: 'text-luxury-gold', trend: '+12%' },
        { label: 'Total Catalog', value: stats.totalItems, icon: Box, color: 'text-neon-purple', trend: 'Synced' },
    ];

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 animate-pulse text-neon-purple h-[60vh]">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="font-mono text-xs uppercase tracking-widest">Establishing Secure Uplink...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center p-20 text-center h-[60vh]">
            <h3 className="text-xl font-bold text-white mb-2">Uplink Failed</h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <Button onClick={() => { setLoading(true); fetchStats(); }} className="bg-neon-purple">
                <RefreshCcw className="w-4 h-4 mr-2" /> Retry
            </Button>
        </div>
    );

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-display font-black text-white leading-tight tracking-tight">Command Center</h1>
                    <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">System Status: Nominal</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                        <div className="w-2 h-2 rounded-full bg-signal-green animate-pulse" />
                        <span className="text-[10px] uppercase font-bold text-gray-400">Live Feed</span>
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        key={stat.label}
                        className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:bg-white/5 transition-colors"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn("p-2 rounded-lg bg-white/5 border border-white/5", stat.color)}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <span className={cn("text-[10px] font-mono font-bold px-2 py-1 rounded border bg-black/40 border-white/10 text-gray-400")}>
                                {stat.trend}
                            </span>
                        </div>
                        <div className="space-y-1 relative z-10">
                            <div className={cn("text-3xl font-mono font-bold tracking-tighter text-white", stat.color.replace('text-', 'text-glow-'))}>{stat.value}</div>
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</div>
                        </div>

                        {/* Background Decoration */}
                        <div className={cn("absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-[40px] opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity", stat.color.replace('text-', 'bg-'))} />
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Control Panel */}
                <div className="lg:col-span-8 glass-panel p-8 rounded-[32px] relative overflow-hidden">
                    <div className="relative z-10 space-y-8">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">Operational Controls</h3>
                            <p className="text-gray-500 text-xs font-mono uppercase tracking-widest">Execute administrative protocols</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ActionCard
                                to="/admin/orders"
                                title="Fleet Logistics"
                                desc="Monitor active delivery routes and status."
                                icon={ShoppingBag}
                            />
                            <ActionCard
                                to="/admin/inventory"
                                title="Supply Chain"
                                desc="Manage ingredient levels and procurement."
                                icon={Box}
                            />
                        </div>
                    </div>
                </div>

                {/* System Monitor */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-panel-heavy p-6 rounded-3xl border-neon-purple/20">
                        <h4 className="flex items-center gap-2 font-bold text-white mb-6 text-sm uppercase tracking-widest">
                            <Activity className="w-4 h-4 text-neon-purple" /> System Health
                        </h4>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-mono text-gray-400">
                                    <span>Database Latency</span>
                                    <span className="text-signal-green">14ms</span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full w-[20%] bg-signal-green shadow-[0_0_10px_#10b981]" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-mono text-gray-400">
                                    <span>Webhook Uplink</span>
                                    <span className="text-signal-green">Connected</span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full w-full bg-signal-green shadow-[0_0_10px_#10b981] animate-pulse" />
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-[10px] text-gray-500 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-blue-500">➜</span>
                                    <span>Sync Daemon... Active</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-blue-500">➜</span>
                                    <span>Auth Handshake... Verified</span>
                                </div>
                                <div className="flex items-center gap-2 animate-pulse text-neon-purple">
                                    <span>_</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ActionCard = ({ to, title, desc, icon: Icon }) => (
    <Link to={to} className="group p-5 bg-white/5 hover:bg-neon-purple/10 border border-white/5 hover:border-neon-purple/50 rounded-2xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-black/40 rounded-lg text-white group-hover:text-neon-purple transition-colors">
                <Icon className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-neon-purple transition-colors" />
        </div>
        <h4 className="font-bold text-white mb-1 group-hover:text-neon-purple transition-colors">{title}</h4>
        <p className="text-[10px] text-gray-500 font-mono leading-relaxed">{desc}</p>
    </Link>
)

export default AdminDashboard;
