import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useAuthStore } from '../hooks/useAuthStore';
import { Loader2, Truck, MapPin, CheckCircle, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const DeliveryDashboard = () => {
    const { getToken, isLoaded, isSignedIn } = useAuthStore();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const token = await getToken();
            const res = await axios.get('/orders/delivery', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
            setLoading(false);
        } catch (err) {
            toast.error("Failed to sync Delivery Grid");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded && isSignedIn) fetchOrders();
        const interval = setInterval(fetchOrders, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [isLoaded, isSignedIn]);

    const markDelivered = async (orderId) => {
        if (!confirm("Confirm delivery completion?")) return;

        const tId = toast.loading("Updating System...");
        try {
            const token = await getToken();
            await axios.patch(`/orders/${orderId}/status`, { status: 'DELIVERED' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Delivery Recorded", { id: tId });
            fetchOrders();
        } catch (err) {
            toast.error("Handshake Protocol Failed", { id: tId });
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-gray-900">
            <Loader2 className="w-12 h-12 animate-spin text-green-500" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <h1 className="text-4xl font-black text-white flex items-center gap-4">
                    <Truck className="w-10 h-10 text-green-500" /> DISPATCH COMMAND
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.length === 0 && (
                        <div className="col-span-full text-center py-20 bg-gray-800 rounded-3xl border-2 border-dashed border-gray-700">
                            <p className="text-gray-500 font-bold text-xl uppercase tracking-widest">All Units Idle</p>
                        </div>
                    )}

                    {orders.map(order => (
                        <div key={order._id} className="bg-gray-800 rounded-3xl p-6 border border-gray-700 flex flex-col justify-between shadow-2xl">
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-bold uppercase tracking-widest rounded-full">
                                        #{order._id.slice(-6)}
                                    </span>
                                    <span className="text-xs font-bold text-gray-500">
                                        {new Date(order.createdAt).toLocaleTimeString()}
                                    </span>
                                </div>

                                <div className="space-y-6">
                                    {/* Customer Info */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-bold">
                                                {order.customer?.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">{order.customer?.name || 'Unknown'}</p>
                                                {order.customer?.contactNumber && (
                                                    <a href={`tel:${order.customer.contactNumber}`} className="text-xs text-gray-400 hover:text-green-400 flex items-center gap-1">
                                                        <Phone className="w-3 h-3" /> {order.customer.contactNumber}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 space-y-3">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-orange-500 shrink-0 mt-1" />
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{order.deliveryAddress?.label || 'Destination'}</p>
                                                <p className="text-sm text-gray-200 font-medium leading-relaxed">{order.deliveryAddress?.addressLine || 'No address provided'}</p>
                                            </div>
                                        </div>
                                        {order.deliveryAddress?.latitude && (
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${order.deliveryAddress.latitude},${order.deliveryAddress.longitude}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="block w-full text-center py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-bold uppercase tracking-widest text-white transition-colors"
                                            >
                                                Open Navigation
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => markDelivered(order._id)}
                                className="w-full h-16 mt-8 bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-lg shadow-green-900/20"
                            >
                                <CheckCircle className="w-6 h-6" /> Confirm Delivery
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DeliveryDashboard;
