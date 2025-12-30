import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from "@clerk/clerk-react";
import { Loader2, RefreshCcw, Search, Eye, Box } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { getToken, isLoaded, isSignedIn } = useAuth();

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const res = await axios.get('/orders/admin/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data || []);
            setLoading(false);
        } catch (err) {
            console.error("Order Fetch Failed", err);
            toast.error("Failed to load active fleet data.");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded && isSignedIn) fetchOrders();
    }, [isLoaded, isSignedIn]);

    const handleStatusUpdate = async (id, newStatus) => {
        const tid = toast.loading("Updating mission status...");
        try {
            const token = await getToken();
            await axios.patch(`/orders/admin/${id}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(orders.map(o => o._id === id ? { ...o, status: newStatus } : o));
            toast.success("Order status updated", { id: tid });
        } catch (err) {
            toast.error("Status update failed", { id: tid });
        }
    };

    const statusOptions = ['ORDER_RECEIVED', 'IN_KITCHEN', 'OUT_FOR_DELIVERY', 'DELIVERED'];

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 h-[60vh] text-orange-500">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Syncing Fleet Data...</p>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Orders Management</h1>
                    <p className="text-gray-500 text-sm font-medium mt-1">Manage active delivery routes and status updates.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            className="pl-10 pr-4 py-2 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none w-64 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={fetchOrders} className="p-2.5 bg-white border rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                        <RefreshCcw className="w-4 h-4 text-gray-600" />
                    </button>
                </div>
            </div>

            <div className="card p-0 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="app-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th className="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="font-mono text-xs font-bold text-gray-400">
                                        #{order._id.slice(-8).toUpperCase()}
                                    </td>
                                    <td>
                                        <div className="font-semibold text-gray-900">{order.customer?.name || order.userId?.slice(0, 8) || 'Guest'}</div>
                                        <div className="text-[10px] text-gray-500 font-mono uppercase mt-0.5">{order.customer?.contactNumber || 'No Contact'}</div>
                                    </td>
                                    <td>
                                        <div className="flex -space-x-2">
                                            {order.items.map((it, idx) => (
                                                <div key={idx} className="w-7 h-7 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-[10px]" title={it.name}>
                                                    🍕
                                                </div>
                                            ))}
                                            {order.items.length > 3 && (
                                                <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500">
                                                    +{order.items.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="font-bold text-gray-900">₹{order.totalPrice}</span>
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
                                    <td className="text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <select
                                                className="bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-bold py-1.5 px-2 outline-none focus:ring-2 focus:ring-orange-500"
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                            >
                                                {statusOptions.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                                            </select>
                                            <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-orange-500 transition-colors">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {orders.length === 0 && (
                        <div className="p-20 text-center text-gray-400">
                            <Box className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="text-sm font-bold uppercase tracking-widest">No active orders found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminOrders;
