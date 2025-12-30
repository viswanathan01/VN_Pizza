import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from "@clerk/clerk-react";
import {
    Loader2,
    Plus,
    RefreshCw,
    AlertTriangle,
    Box,
    Database,
    History,
    Users,
    Package,
    Search,
    Image as ImageIcon
} from 'lucide-react';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const CATEGORY_MAP = {
    BASE: 'GRAM',
    SAUCE: 'ML',
    CHEESE: 'GRAM',
    VEG_TOPPING: 'GRAM',
    MEAT_TOPPING: 'GRAM',
    HERB: 'GRAM',
    SPICE: 'GRAM',
    EXTRA: 'COUNT'
};

const AdminInventory = () => {
    const [activeTab, setActiveTab] = useState('DEPOT'); // DEPOT, BATCHES, LEDGER, SUPPLIERS
    const [inventory, setInventory] = useState([]);
    const [ledger, setLedger] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const { getToken, isLoaded, isSignedIn } = useAuth();

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [alertFilter, setAlertFilter] = useState(false);

    // Initial filter if navigated from critical alert
    useEffect(() => {
        if (window.location.hash === '#alert') {
            setAlertFilter(true);
        }
    }, []);

    const [newItem, setNewItem] = useState({
        name: '',
        category: 'VEG_TOPPING',
        quantity: 1000,
        pricePerUnit: 10,
        supplierName: '',
        unitType: 'GRAM',
        image: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (activeTab === 'DEPOT') {
                const res = await axios.get('/inventory?limit=1000', config);
                setInventory(res.data.items || []);
            } else if (activeTab === 'LEDGER') {
                const res = await axios.get('/inventory/ledger', config);
                setLedger(res.data || []);
            } else if (activeTab === 'SUPPLIERS') {
                const res = await axios.get('/inventory/suppliers', config);
                setSuppliers(res.data || []);
            } else if (activeTab === 'BATCHES') {
                const res = await axios.get('/inventory/batches', config);
                setBatches(res.data || []);
            }
            setLoading(false);
        } catch (err) {
            toast.error("Resource fetch failed.");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded && isSignedIn) fetchData();
    }, [isLoaded, isSignedIn, activeTab]);

    const handleAddItem = async (e) => {
        e.preventDefault();
        const tid = toast.loading("Executing Entry Protocol...");
        try {
            const token = await getToken();
            const payload = {
                ...newItem,
                image: newItem.image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&auto=format&fit=crop',
                quantity: Number(newItem.quantity),
                pricePerUnit: Number(newItem.pricePerUnit)
            };
            await axios.post('/inventory', payload, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Ingredient added to Depot", { id: tid });
            setNewItem({ name: '', category: 'VEG_TOPPING', quantity: 1000, pricePerUnit: 10, supplierName: '', unitType: 'GRAM', image: '' });
            fetchData();
        } catch (err) {
            toast.error("Protocol violation: Entry rejected", { id: tid });
        }
    };

    const handleStockUpdate = async (id, current, delta) => {
        try {
            const token = await getToken();
            await axios.patch(`/inventory/${id}`,
                { currentStock: current + delta },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Stock Adjusted");
            fetchData();
        } catch (err) {
            toast.error("Adjustment failed");
        }
    };

    // Helper to group inventory by category
    const groupedInventory = inventory.reduce((acc, item) => {
        if (alertFilter && item.inventory.currentStock >= item.inventory.minThreshold) return acc;
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});

    const orderedCategories = Object.keys(CATEGORY_MAP); // Maintain consistent order

    if (loading && inventory.length === 0) return (
        <div className="flex flex-col items-center justify-center p-20 h-[60vh] text-orange-500">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading Supply Depot...</p>
        </div>
    );

    return (
        <div className="space-y-10">
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Supply Depot</h1>
                    <p className="text-gray-500 text-sm font-medium mt-1">Manage global ingredients and procurement.</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    {[
                        { id: 'DEPOT', label: 'Ingredients', icon: Database },
                        { id: 'BATCHES', label: 'Batches', icon: Package },
                        { id: 'SUPPLIERS', label: 'Suppliers', icon: Users },
                        { id: 'LEDGER', label: 'Ledger', icon: History }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => { setActiveTab(t.id); setAlertFilter(false); }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                activeTab === t.id ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            <t.icon className="w-4 h-4" /> {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Alert Banner - only show if active or available */}
            {activeTab === 'DEPOT' && (alertFilter || inventory.some(i => i.inventory.currentStock < i.inventory.minThreshold)) && (
                <div
                    onClick={() => setAlertFilter(!alertFilter)}
                    className={cn(
                        "p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all",
                        alertFilter ? "bg-red-50 border-red-200 ring-2 ring-red-200" : "bg-white border-red-100 hover:bg-red-50"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 animate-pulse">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm">Stock Security Alert</h4>
                            <p className="text-xs text-red-600 font-medium">
                                {inventory.filter(i => i.inventory.currentStock < i.inventory.minThreshold).length} items below safety threshold.
                                <span className="underline ml-1">{alertFilter ? "Show all items" : "Click to filter"}</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Calendar Filter for Batches & Ledger */}
            {(activeTab === 'BATCHES' || activeTab === 'LEDGER') && (
                <div className="flex justify-end">
                    <div className="flex items-center gap-2 bg-white border rounded-xl px-4 py-2 shadow-sm">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Filter Date:</span>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="text-sm font-bold text-gray-900 outline-none"
                        />
                    </div>
                </div>
            )}

            {activeTab === 'DEPOT' && (
                <div className="space-y-10">
                    {/* Manual Entry Form */}
                    <div className="card shadow-sm border-orange-100 bg-orange-50/30">
                        <div className="flex items-center gap-3 mb-6">
                            <Plus className="w-5 h-5 text-orange-600" />
                            <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider">Manual Stock Entry</h3>
                        </div>
                        <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block ml-1">Name</label>
                                <input required className="w-full px-4 py-2 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none" placeholder="e.g. Buffalo Mozzarella" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block ml-1">Category</label>
                                <select className="w-full px-4 py-2 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none" value={newItem.category} onChange={e => {
                                    const cat = e.target.value;
                                    setNewItem({ ...newItem, category: cat, unitType: CATEGORY_MAP[cat] });
                                }}>
                                    {Object.keys(CATEGORY_MAP).map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block ml-1">Initial Qty</label>
                                <input type="number" required className="w-full px-4 py-2 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block ml-1">Price / {newItem.unitType}</label>
                                <input type="number" required className="w-full px-4 py-2 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none" value={newItem.pricePerUnit} onChange={e => setNewItem({ ...newItem, pricePerUnit: e.target.value })} />
                            </div>
                            <div className="flex items-end">
                                <button type="submit" className="w-full btn-primary h-[42px] flex items-center justify-center gap-2 text-xs">
                                    <Plus className="w-4 h-4" /> Add Item
                                </button>
                            </div>
                            <div className="md:col-span-full">
                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block ml-1">Image URL (Optional)</label>
                                <div className="relative">
                                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input className="w-full pl-10 pr-4 py-2 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Unsplash URL" value={newItem.image} onChange={e => setNewItem({ ...newItem, image: e.target.value })} />
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Categorized Inventory Display */}
                    <div className="space-y-8">
                        {orderedCategories.map(category => {
                            const items = groupedInventory[category];
                            if (!items || items.length === 0) return null;

                            return (
                                <div key={category} className="space-y-4">
                                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest pl-2 border-l-4 border-orange-500">
                                        {category.replace('_', ' ')}
                                    </h3>
                                    <div className="card p-0 overflow-hidden shadow-sm">
                                        <table className="app-table">
                                            <thead>
                                                <tr>
                                                    <th>Material</th>
                                                    <th>Stock Level</th>
                                                    <th>Unit Price</th>
                                                    <th className="text-right">Quick Restock</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.map(item => (
                                                    <tr key={item._id} className="hover:bg-gray-50/50">
                                                        <td>
                                                            <div className="flex items-center gap-3">
                                                                <img src={item.image.url} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                                                <div className="font-bold text-gray-900">{item.name}</div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="flex items-center gap-2">
                                                                <span className={cn("font-mono font-bold text-sm",
                                                                    item.inventory.currentStock < item.inventory.minThreshold ? 'text-red-600' : 'text-green-600'
                                                                )}>
                                                                    {item.inventory.currentStock.toLocaleString()}
                                                                </span>
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase">{item.unitType}</span>
                                                                {item.inventory.currentStock < item.inventory.minThreshold && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                                            </div>
                                                        </td>
                                                        <td className="font-semibold text-gray-500">₹{item.pricePerUnit}/{item.unitType}</td>
                                                        <td className="text-right">
                                                            <button
                                                                onClick={() => handleStockUpdate(item._id, item.inventory.currentStock, 500)}
                                                                className="p-2 hover:bg-orange-50 text-orange-600 rounded-lg transition-colors border border-transparent hover:border-orange-100"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })}
                        {Object.keys(groupedInventory).length === 0 && (
                            <div className="p-20 text-center text-gray-400 card border-dashed">
                                <p className="text-sm font-bold uppercase tracking-widest">No matching inventory items found.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'LEDGER' && (
                <div className="card p-0 overflow-hidden shadow-sm">
                    <table className="app-table">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Action</th>
                                <th>Item</th>
                                <th>Quantity</th>
                                <th>Source</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ledger
                                .filter(log => log.timestamp.startsWith(selectedDate))
                                .map(log => (
                                    <tr key={log._id}>
                                        <td className="text-xs font-mono text-gray-400">{format(new Date(log.timestamp), 'MMM d, HH:mm:ss')}</td>
                                        <td>
                                            <span className={cn("status-pill",
                                                log.action === 'ADD' ? 'bg-green-100 text-green-700' :
                                                    log.action === 'REMOVE' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                            )}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="font-semibold text-gray-900">{log.ingredientId?.name || 'N/A'}</td>
                                        <td className="font-mono text-sm">
                                            <span className={log.action === 'REMOVE' ? 'text-red-600' : 'text-green-600'}>
                                                {log.action === 'REMOVE' ? '-' : '+'}{log.quantity}
                                            </span>
                                            <span className="text-[10px] text-gray-400 ml-1 uppercase">{log.unit}</span>
                                        </td>
                                        <td className="text-xs text-gray-500 italic uppercase">{log.source}</td>
                                    </tr>
                                ))}
                            {ledger.filter(log => log.timestamp.startsWith(selectedDate)).length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-10 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">
                                        No records for {selectedDate}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'BATCHES' && (
                <div className="card p-0 overflow-hidden shadow-sm">
                    <table className="app-table">
                        <thead>
                            <tr>
                                <th>Batch ID</th>
                                <th>Material</th>
                                <th>Quantity</th>
                                <th>Cost/Unit</th>
                                <th>Expiry</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {batches
                                .filter(batch => batch.receivedAt.startsWith(selectedDate))
                                .map(batch => (
                                    <tr key={batch._id} className="hover:bg-gray-50/50">
                                        <td className="font-mono text-xs font-bold text-gray-400">#{batch.batchId}</td>
                                        <td className="font-bold text-gray-900">{batch.ingredientId?.name || 'Artisan Material'}</td>
                                        <td className="font-mono text-sm">
                                            {batch.quantity.toLocaleString()} <span className="text-[10px] text-gray-400 uppercase">{batch.unit}</span>
                                        </td>
                                        <td className="font-semibold text-gray-500">₹{batch.costPerUnit}</td>
                                        <td className="text-xs text-gray-500">
                                            {batch.expiryDate ? format(new Date(batch.expiryDate), 'MMM d, yyyy') : 'PERISHABLE'}
                                        </td>
                                        <td>
                                            <span className="status-pill bg-green-50 text-green-700">ACTIVE</span>
                                        </td>
                                    </tr>
                                ))}
                            {batches.filter(batch => batch.receivedAt.startsWith(selectedDate)).length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-10 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">
                                        No batches received on {selectedDate}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'SUPPLIERS' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suppliers.map(supplier => (
                        <div key={supplier._id} className="card group hover:border-orange-200 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div className="flex gap-1">
                                    {[...Array(supplier.reliabilityScore)].map((_, i) => (
                                        <div key={i} className="w-1 h-3 bg-orange-500 rounded-full" />
                                    ))}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{supplier.name}</h3>
                            <p className="text-xs text-gray-500 font-medium mb-4">{supplier.contactEmail}</p>
                            <div className="flex flex-wrap gap-2 pt-4 border-t">
                                {supplier.suppliedCategories.map(cat => (
                                    <span key={cat} className="px-2 py-1 bg-gray-100 rounded-lg text-[9px] font-black text-gray-500 uppercase tracking-widest">
                                        {cat}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminInventory;
