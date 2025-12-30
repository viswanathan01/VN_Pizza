import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useAuthStore } from '../hooks/useAuthStore';
import { Loader2, Flame, Truck, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ChefDashboard = () => {
    const { getToken, isLoaded, isSignedIn } = useAuthStore();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const token = await getToken();
            const res = await axios.get('/orders/kitchen', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
            setLoading(false);
        } catch (err) {
            toast.error("Failed to sync Kitchen Display System");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded && isSignedIn) fetchOrders();
        const interval = setInterval(fetchOrders, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [isLoaded, isSignedIn]);

    const updateStatus = async (orderId, newStatus) => {
        const tId = toast.loading("Updating Order...");
        try {
            const token = await getToken();
            await axios.patch(`/orders/${orderId}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Status Updated", { id: tId });
            fetchOrders();
        } catch (err) {
            toast.error(err.response?.data?.error || "Update Failed", { id: tId });
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="w-12 h-12 animate-spin text-orange-600" />
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <h1 className="text-4xl font-black text-gray-900 flex items-center gap-4">
                <Flame className="w-10 h-10 text-orange-600" /> KITCHEN DISPLAY SYSTEM
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed">
                        <p className="text-gray-400 font-bold text-xl uppercase tracking-widest">No Active Orders</p>
                    </div>
                )}

                {orders.map(order => (
                    <div key={order._id} className="card p-6 border-l-8 border-l-orange-500 flex flex-col justify-between min-h-[300px]">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                                    #{order._id.slice(-6)}
                                </span>
                                <span className="text-xs font-bold text-gray-500">
                                    {new Date(order.createdAt).toLocaleTimeString()}
                                </span>
                            </div>

                            <div className="space-y-4 mb-6">
                                {order.items.map((item, i) => (
                                    <div key={i} className="border-b pb-4 last:border-0">
                                        <div className="flex gap-2 items-baseline mb-2">
                                            <span className="w-6 h-6 bg-gray-900 text-white rounded flex items-center justify-center text-xs font-bold shrink-0">
                                                {item.quantity}x
                                            </span>
                                            <span className="font-black text-xl text-gray-900 leading-none">{item.name}</span>
                                        </div>

                                        <p className="text-xs text-gray-400 font-medium mb-3 italic">
                                            {item.description}
                                        </p>

                                        {item.snapshot && (
                                            <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-xs">
                                                {/* BASE */}
                                                {item.snapshot.base && (
                                                    <div className="flex justify-between items-center border-b border-dashed border-gray-200 pb-1">
                                                        <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Base</span>
                                                        <span className="font-semibold text-gray-800">
                                                            {item.snapshot.base.name} <span className="text-gray-400">({item.snapshot.base.qty}g)</span>
                                                        </span>
                                                    </div>
                                                )}

                                                {/* SAUCE */}
                                                {item.snapshot.sauce && (
                                                    <div className="flex justify-between items-center border-b border-dashed border-gray-200 pb-1">
                                                        <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Sauce</span>
                                                        <span className="font-semibold text-gray-800">
                                                            {item.snapshot.sauce.name} <span className="text-gray-400">({item.snapshot.sauce.qty}ml)</span>
                                                        </span>
                                                    </div>
                                                )}

                                                {/* CHEESES */}
                                                {item.snapshot.cheeses?.length > 0 && (
                                                    <div className="border-b border-dashed border-gray-200 pb-1">
                                                        <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block mb-1">Cheeses</span>
                                                        <div className="space-y-1">
                                                            {item.snapshot.cheeses.map((c, idx) => (
                                                                <div key={idx} className="flex justify-between pl-2">
                                                                    <span className="font-medium text-gray-800">• {c.name}</span>
                                                                    <span className="text-gray-400">{c.qty}g</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* TOPPINGS */}
                                                {item.snapshot.toppings?.length > 0 && (
                                                    <div>
                                                        <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block mb-1">Toppings</span>
                                                        <div className="space-y-1">
                                                            {item.snapshot.toppings.map((t, idx) => (
                                                                <div key={idx} className="flex justify-between pl-2">
                                                                    <span className="font-medium text-gray-800">• {t.name}</span>
                                                                    <span className="text-gray-400">{t.qty}u</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                            {order.status === 'ORDER_RECEIVED' ? (
                                <button
                                    onClick={() => updateStatus(order._id, 'IN_KITCHEN')}
                                    className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Flame className="w-5 h-5 animate-pulse" /> Start Cooking
                                </button>
                            ) : (
                                <button
                                    onClick={() => updateStatus(order._id, 'OUT_FOR_DELIVERY')}
                                    className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Truck className="w-5 h-5" /> Ready for Delivery
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChefDashboard;
