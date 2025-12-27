import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from "@clerk/clerk-react";
import { Loader2, Plus, RefreshCw, AlertTriangle, Image as ImageIcon, Box, ArrowUpRight, RefreshCcw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';

const AdminInventory = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { getToken, isLoaded, isSignedIn } = useAuth();

    const [newItem, setNewItem] = useState({
        name: '',
        category: 'BASE',
        quantity: 500,
        unit: 'grams',
        price: 0,
        threshold: 50,
        imageUrl: ''
    });

    const fetchData = async (retryCount = 0) => {
        try {
            setError(null);

            if (!isLoaded || !isSignedIn) return;

            // Token Fetch
            const token = await getToken();
            if (!token) {
                if (retryCount < 3) {
                    setTimeout(() => fetchData(retryCount + 1), 1000);
                    return;
                }
                throw new Error("Unable to authenticate with supply depot.");
            }

            const res = await axios.get('/inventory', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInventory(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load inventory", err);
            setError("Supply Chain Database Offline");
            setLoading(false);
            if (retryCount === 0) toast.error("Inventory sync failed");
        }
    };

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            fetchData();
        }
    }, [isLoaded, isSignedIn]);

    const handleAddItem = async (e) => {
        e.preventDefault();
        const toastId = toast.loading("Registering new asset...");
        try {
            const token = await getToken();
            await axios.post('/inventory', newItem, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchData();
            setNewItem({ name: '', category: 'BASE', quantity: 500, unit: 'grams', price: 0, threshold: 50, imageUrl: '' });
            toast.success("Asset registered successfully", { id: toastId });
        } catch (err) {
            toast.error("Registration failed: " + (err.response?.data?.details || err.message), { id: toastId });
        }
    };

    const handleUpdateStock = async (id, newQty, newThreshold) => {
        try {
            const token = await getToken();
            await axios.patch(`/inventory/${id}`, { quantity: newQty, threshold: newThreshold }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInventory(inventory.map(i => i._id === id ? { ...i, quantity: newQty, threshold: newThreshold } : i));
            toast.success("Stock count updated");
        } catch (err) {
            toast.error("Failed to update stock ledger");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 animate-pulse text-neon-purple h-[60vh]">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="font-mono text-xs uppercase tracking-widest">Accessing Supply Chain Node...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center p-20 text-center h-[60vh]">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                <Box className="w-8 h-8 text-signal-red" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{error}</h3>
            <Button onClick={() => { setLoading(true); fetchData(); }} className="bg-signal-red hover:bg-red-600">
                <RefreshCcw className="w-4 h-4 mr-2" /> Reconnect
            </Button>
        </div>
    );

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-display font-black text-white leading-tight tracking-tight">Supply Depot</h1>
                    <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">Global Inventory Management</p>
                </div>
                <div className="flex gap-4">
                    <Button onClick={() => fetchData()} variant="outline" className="border-white/10 text-gray-400 hover:text-white hover:bg-white/5">
                        <RefreshCw className="w-4 h-4 mr-2" /> Sync Ledger
                    </Button>
                </div>
            </header>

            {/* Inventory Table */}
            <div className="glass-panel rounded-3xl overflow-hidden border-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-black/20 text-gray-500 font-mono font-bold text-[10px] uppercase tracking-widest border-b border-white/5">
                            <tr>
                                <th className="p-5">Asset</th>
                                <th className="p-5">Category</th>
                                <th className="p-5">Unit Cost</th>
                                <th className="p-5">Stock Level</th>
                                <th className="p-5">Status</th>
                                <th className="p-5">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {inventory.map(item => (
                                <tr key={item._id} className="hover:bg-white/5 transition group">
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-black/40 overflow-hidden flex items-center justify-center border border-white/10">
                                                {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-gray-600" />}
                                            </div>
                                            <div className="font-bold text-white text-sm tracking-tight">{item.name}</div>
                                        </div>
                                    </td>
                                    <td className="p-5"><span className="px-2 py-1 bg-white/5 rounded text-[10px] font-mono font-bold text-gray-400 uppercase border border-white/5">{item.category}</span></td>
                                    <td className="p-5 text-sm font-bold text-luxury-gold font-mono">₹{item.price}</td>
                                    <td className="p-5">
                                        <div className="text-sm font-medium text-gray-300">{item.quantity} <span className="text-gray-600 text-xs">{item.unit}</span></div>
                                        <div className="text-[10px] text-gray-600 font-mono mt-0.5">MIN: {item.threshold}</div>
                                    </td>
                                    <td className="p-5">
                                        {item.quantity < item.threshold ? (
                                            <span className="flex items-center gap-1.5 text-signal-red text-[10px] font-black uppercase tracking-wider bg-red-500/10 border border-red-500/20 px-2 py-1 rounded w-fit">
                                                <AlertTriangle className="w-3 h-3" /> Critical
                                            </span>
                                        ) : (
                                            <span className="text-signal-green text-[10px] font-black uppercase tracking-wider bg-green-500/10 border border-green-500/20 px-2 py-1 rounded">Normal</span>
                                        )}
                                    </td>
                                    <td className="p-5">
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleUpdateStock(item._id, item.quantity + 500, item.threshold)}
                                                className="px-3 py-1.5 bg-neon-purple/10 text-neon-purple border border-neon-purple/20 text-[10px] font-bold rounded hover:bg-neon-purple/20 flex items-center gap-1 transition-colors"
                                            >
                                                <Plus className="w-3 h-3" /> Restock
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {inventory.length === 0 && <div className="p-20 text-center text-gray-600 font-mono text-xs uppercase tracking-widest">Ledger Empty</div>}
            </div>

            {/* Add New Item */}
            <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-xl font-display font-black text-white mb-6 flex items-center gap-3">
                        <Box className="w-5 h-5 text-luxury-gold" /> Manual Entry Protocol
                    </h3>
                    <form onSubmit={handleAddItem} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Asset Name</label>
                                <input
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-luxury-gold outline-none transition-all placeholder:text-gray-700"
                                    placeholder="Ex: Truffle Oil"
                                    value={newItem.name}
                                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Category</label>
                                <select
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-gray-300 focus:border-luxury-gold outline-none"
                                    value={newItem.category}
                                    onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                >
                                    <option value="BASE">Base</option>
                                    <option value="SAUCE">Sauce</option>
                                    <option value="CHEESE">Cheese</option>
                                    <option value="VEGGIE">Veggie</option>
                                    <option value="MEAT">Meat</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Unit Cost (₹)</label>
                                <input
                                    type="number"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-luxury-gold outline-none"
                                    value={newItem.price}
                                    onChange={e => setNewItem({ ...newItem, price: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Parameters</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="number"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none"
                                        placeholder="Qty"
                                        value={newItem.quantity}
                                        onChange={e => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                                    />
                                    <input
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none"
                                        placeholder="Unit"
                                        value={newItem.unit}
                                        onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Image Access</label>
                                <input
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none"
                                    value={newItem.imageUrl}
                                    placeholder="https://..."
                                    onChange={e => setNewItem({ ...newItem, imageUrl: e.target.value })}
                                />
                            </div>
                            <div className="flex items-end">
                                <Button type="submit" className="w-full h-[50px] bg-luxury-gold hover:bg-white hover:text-midnight-950 text-midnight-950 font-black uppercase text-xs tracking-widest rounded-xl transition-all">
                                    Submit Entry <ArrowUpRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminInventory;
