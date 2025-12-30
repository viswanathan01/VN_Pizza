
import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from "@clerk/clerk-react";
import {
    Edit2,
    Trash2,
    X,
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

    const [selectedDate, setSelectedDate] = useState('');
    const [alertFilter, setAlertFilter] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Editing States
    const [editingBatch, setEditingBatch] = useState(null);
    const [editingSupplier, setEditingSupplier] = useState(null);

    // Initial filter if navigated from critical alert
    useEffect(() => {
        if (window.location.hash === '#alert') {
            setAlertFilter(true);
        }
    }, []);

    // Reset pagination on tab/filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, selectedDate, selectedCategory]);

    const [newItem, setNewItem] = useState({
        name: '',
        category: 'VEG_TOPPING',
        quantity: 1000,
        pricePerUnit: 10,
        supplierName: '',
        unitType: 'GRAM',
        image: ''
    });

    const [newSupplier, setNewSupplier] = useState({ name: '', contactEmail: '', contactPhone: '', suppliedCategories: [] });
    const [newBatch, setNewBatch] = useState({ ingredientId: '', quantity: 100, costPerUnit: 0, expiryDate: '', supplierId: '' });
    const [searchTerm, setSearchTerm] = useState(''); // For searchable ingredient selection

    // --- HANDLERS ---

    const handleEditClick = (supplier) => {
        setEditingSupplier(supplier._id);
        setNewSupplier({
            name: supplier.name,
            contactEmail: supplier.contactEmail || '',
            contactPhone: supplier.contactPhone || '',
            suppliedCategories: supplier.suppliedCategories || []
        });
        // Smooth scroll to form not easily possible with pure ref here quickly, but form is at top of tab
    };

    const handleCancelEdit = () => {
        setEditingSupplier(null);
        setNewSupplier({ name: '', contactEmail: '', contactPhone: '', suppliedCategories: [] });
    };

    const handleUpdateSupplier = async (e) => {
        e.preventDefault();
        try {
            const token = await getToken();
            await axios.put(`/suppliers/${editingSupplier}`, newSupplier, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Supplier Updated");
            handleCancelEdit();
            fetchData();
        } catch (err) {
            toast.error("Update failed");
        }
    };

    const toggleCategory = (cat) => {
        setNewSupplier(prev => {
            const exists = prev.suppliedCategories.includes(cat);
            return {
                ...prev,
                suppliedCategories: exists
                    ? prev.suppliedCategories.filter(c => c !== cat)
                    : [...prev.suppliedCategories, cat]
            };
        });
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = await getToken(); // Although interceptor handles it, explicit header doesn't hurt or can be removed if interceptor works for all. But let's stick to existing pattern or cleaned up pattern.
            // The interceptor injects token, so strictly speaking explicit header isn't needed if using the imported instance, but the existing code uses explicit headers. I will follow existing pattern.

            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (activeTab === 'DEPOT') {
                const res = await axios.get('/inventory?limit=1000', config);
                setInventory(res.data.items || []);
            } else if (activeTab === 'LEDGER') {
                const res = await axios.get('/inventory/ledger', config);
                setLedger(res.data || []);
            } else if (activeTab === 'SUPPLIERS') {
                const res = await axios.get('/suppliers', config); // UPDATED
                setSuppliers(res.data || []);
            } else if (activeTab === 'BATCHES') {
                const res = await axios.get('/inventory/batches', config);
                setBatches(res.data || []);
                // Also need ingredients and suppliers for the form
                const ingRes = await axios.get('/inventory?limit=1000', config);
                setInventory(ingRes.data.items || []);
                const supRes = await axios.get('/suppliers', config);
                setSuppliers(supRes.data || []);
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

    const handleAddSupplier = async (e) => {
        e.preventDefault();
        try {
            const token = await getToken();
            await axios.post('/suppliers', newSupplier, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Supplier Added");
            setNewSupplier({ name: '', contactEmail: '', contactPhone: '', suppliedCategories: [] });
            fetchData();
        } catch (err) {
            toast.error("Failed to add supplier");
        }
    };

    const handleDeleteSupplier = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            const token = await getToken();
            await axios.delete(`/suppliers/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Supplier removed");
            fetchData();
        } catch (err) {
            toast.error("Failed to remove supplier");
        }
    };

    const [isNewMaterial, setIsNewMaterial] = useState(false);
    const [newMaterialDetails, setNewMaterialDetails] = useState({ name: '', category: 'VEG_TOPPING' });

    const handleAddBatch = async (e) => {
        e.preventDefault();
        try {
            const token = await getToken();
            let finalIngredientId = newBatch.ingredientId;

            if (isNewMaterial) {
                // 1. Create New Ingredient First
                const ingPayload = {
                    name: newMaterialDetails.name,
                    category: newMaterialDetails.category,
                    quantity: 0, // Initial stock 0, batch will add to it
                    pricePerUnit: 0, // Will be updated or irrelevant
                    unitType: CATEGORY_MAP[newMaterialDetails.category]
                };

                const ingRes = await axios.post('/inventory', ingPayload, { headers: { Authorization: `Bearer ${token}` } });
                finalIngredientId = ingRes.data._id;
            } else {
                const selectedIng = inventory.find(i => i._id === newBatch.ingredientId);
                if (!selectedIng) return toast.error("Select an ingredient");
            }

            // 2. Create Batch
            const selectedIng = inventory.find(i => i._id === finalIngredientId) || { unitType: CATEGORY_MAP[newMaterialDetails.category] };

            const payload = {
                ...newBatch,
                ingredientId: finalIngredientId,
                batchId: `B-${Date.now().toString().slice(-6)}`,
                unit: selectedIng.unitType
            };

            await axios.post('/inventory/batches', payload, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Batch Received & Stock Updated");

            // Reset
            setNewBatch({ ingredientId: '', quantity: 100, costPerUnit: 0, expiryDate: '', supplierId: '' });
            setSearchTerm('');
            setIsNewMaterial(false);
            setNewMaterialDetails({ name: '', category: 'VEG_TOPPING' });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.error || "Batch entry failed");
        }
    };

    const handleDeleteBatch = async (id) => {
        if (!confirm("Void this batch? This will reverse stock.")) return;
        try {
            const token = await getToken();
            await axios.delete(`/inventory/batches/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Batch Voided");
            fetchData();
        } catch (err) {
            toast.error("Failed to void batch");
        }
    };

    const handleBatchEditClick = (batch) => {
        setEditingBatch(batch._id);
        setIsNewMaterial(false);
        setNewBatch({
            ingredientId: batch.ingredientId?._id || batch.ingredientId,
            quantity: batch.quantity,
            costPerUnit: batch.costPerUnit,
            expiryDate: batch.expiryDate ? batch.expiryDate.split('T')[0] : '',
            supplierId: batch.supplierId?._id || batch.supplierId
        });
    };

    const handleCancelBatchEdit = () => {
        setEditingBatch(null);
        setNewBatch({ ingredientId: '', quantity: 100, costPerUnit: 0, expiryDate: '', supplierId: '' });
    };

    const handleUpdateBatch = async (e) => {
        e.preventDefault();
        try {
            const token = await getToken();
            await axios.put(`/inventory/batches/${editingBatch}`, newBatch, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Batch Updated");
            handleCancelBatchEdit();
            fetchData();
        } catch (err) {
            toast.error("Failed to update batch");
        }
    };

    // Helper to group inventory by category
    const groupedInventory = inventory.reduce((acc, item) => {
        if (alertFilter && item.inventory.currentStock >= item.inventory.minThreshold) return acc;
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});

    // Dynamic Categories derived from default map + existing inventory + suppliers
    const dynamicCategories = Array.from(new Set([
        ...Object.keys(CATEGORY_MAP),
        ...inventory.map(i => i.category),
        ...suppliers.flatMap(s => s.suppliedCategories || [])
    ])).filter(Boolean).sort();

    const getUnitForCategory = (cat) => CATEGORY_MAP[cat] || 'GRAM';

    if (loading && inventory.length === 0 && ledger.length === 0 && batches.length === 0) return (
        <div className="flex flex-col items-center justify-center p-20 h-[60vh] text-orange-500">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading Supply Depot...</p>
        </div>
    );

    // PAGINATION HELPERS
    const renderPagination = (totalItems) => {
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        if (totalPages <= 1) return null;

        return (
            <div className="flex items-center justify-center gap-4 py-6">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded bg-gray-100 text-xs font-bold text-gray-600 disabled:opacity-50 hover:bg-gray-200"
                >
                    Previous
                </button>
                <span className="text-xs font-medium text-gray-400">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded bg-gray-100 text-xs font-bold text-gray-600 disabled:opacity-50 hover:bg-gray-200"
                >
                    Next
                </button>
            </div>
        );
    };

    // Filtered Data Calculations
    const getFilteredData = (data, dateField) => {
        const filtered = data.filter(item => !selectedDate || item[dateField]?.startsWith(selectedDate));
        const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
        return { filtered, paginated };
    };

    return (
        <div className="space-y-10">
            {/* Global Datalists for Suggestions */}
            <datalist id="category-options">
                {dynamicCategories.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
            </datalist>
            <datalist id="ingredient-names">
                {inventory.map(i => <option key={i._id} value={i.name}>{i.category.replace(/_/g, ' ')}</option>)}
            </datalist>
            <datalist id="ingredient-names-with-units">
                {inventory.map(i => <option key={i._id} value={i.name}>{i.name} ({i.unitType})</option>)}
            </datalist>

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

            {/* Alert Banner - DEPOT ONLY */}
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

            {/* Calendar Filter - BATCHES & LEDGER */}
            {(activeTab === 'BATCHES' || activeTab === 'LEDGER') && (
                <div className="flex justify-end">
                    <div className="flex items-center gap-2 bg-white border rounded-xl px-4 py-2 shadow-sm group hover:border-orange-50 transition-colors">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-orange-500">Filter Date:</span>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="text-sm font-bold text-gray-900 outline-none cursor-pointer"
                        />
                        {selectedDate && (
                            <button onClick={() => setSelectedDate('')} className="ml-2 text-red-500 hover:bg-red-50 p-1 rounded-full">
                                <span className="text-[10px] font-black uppercase">Clear</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'DEPOT' && (
                <div className="space-y-6">
                    {/* Category Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => setSelectedCategory('ALL')}
                            className={cn(
                                "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
                                selectedCategory === 'ALL'
                                    ? "bg-gray-900 text-white border-gray-900"
                                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                            )}
                        >
                            ALL ITEMS
                        </button>
                        {dynamicCategories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
                                    selectedCategory === cat
                                        ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/30"
                                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                                )}
                            >
                                {cat.replace(/_/g, ' ')}
                            </button>
                        ))}
                    </div>

                    {/* Manual Entry Form */}
                    <div className="card shadow-sm border-orange-100 bg-orange-50/30">
                        <div className="flex items-center gap-3 mb-6">
                            <Plus className="w-5 h-5 text-orange-600" />
                            <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider">Manual Stock Entry</h3>
                        </div>
                        <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block ml-1">Name</label>
                                <input
                                    required
                                    list="ingredient-names"
                                    className="w-full px-4 py-2 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                    placeholder="e.g. Buffalo Mozzarella"
                                    value={newItem.name}
                                    onChange={e => {
                                        const name = e.target.value;
                                        const existing = inventory.find(i => i.name.toLowerCase() === name.toLowerCase());
                                        if (existing) {
                                            setNewItem({
                                                ...newItem,
                                                name,
                                                category: existing.category,
                                                unitType: existing.unitType,
                                                pricePerUnit: existing.pricePerUnit
                                            });
                                        } else {
                                            setNewItem({ ...newItem, name });
                                        }
                                    }}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block ml-1">Category</label>
                                <input
                                    list="category-options"
                                    className="w-full px-4 py-2 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                    style={{ textTransform: 'uppercase' }}
                                    value={newItem.category}
                                    onChange={e => {
                                        const cat = e.target.value.toUpperCase().replace(/\s+/g, '_');
                                        setNewItem({ ...newItem, category: cat, unitType: getUnitForCategory(cat) });
                                    }}
                                    placeholder="Select or Type..."
                                />
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
                        {(selectedCategory === 'ALL' ? dynamicCategories : [selectedCategory]).map(category => {
                            const items = groupedInventory[category];
                            if (!items || items.length === 0) return null;

                            return (
                                <div key={category} className="space-y-4">
                                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest pl-2 border-l-4 border-orange-500">
                                        {category.replace(/_/g, ' ')}
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
                                                                <img src={item.image?.url || item.image} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
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

            {activeTab === 'BATCHES' && (() => {
                const { filtered, paginated } = getFilteredData(batches, 'receivedAt');
                return (
                    <div className="space-y-6">
                        {/* New/Edit Batch Form */}
                        <div className={cn("card shadow-sm border-orange-100 transition-colors", editingBatch ? "bg-orange-100 border-orange-300" : "bg-orange-50/30")}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {editingBatch ? <Edit2 className="w-5 h-5 text-orange-600" /> : <Plus className="w-5 h-5 text-orange-600" />}
                                    <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider">
                                        {editingBatch ? "Update Batch Records" : "Receive New Batch"}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    {editingBatch ? (
                                        <button onClick={handleCancelBatchEdit} className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 uppercase tracking-widest">
                                            <X className="w-4 h-4" /> Cancel Edit
                                        </button>
                                    ) : (
                                        <>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">New Material?</label>
                                            <input
                                                type="checkbox"
                                                checked={isNewMaterial}
                                                onChange={(e) => setIsNewMaterial(e.target.checked)}
                                                className="toggle-checkbox"
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                            <form onSubmit={editingBatch ? handleUpdateBatch : handleAddBatch} className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                {isNewMaterial ? (
                                    <>
                                        <div className="md:col-span-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block ml-1">Category</label>
                                            <input
                                                list="category-options"
                                                className="w-full px-4 py-2 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                                value={newMaterialDetails.category}
                                                style={{ textTransform: 'uppercase' }}
                                                onChange={e => setNewMaterialDetails({ ...newMaterialDetails, category: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                                                placeholder="Select/Type"
                                            />
                                        </div>
                                        <div className="md:col-span-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block ml-1">New Name</label>
                                            <input
                                                required
                                                className="w-full px-4 py-2 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                                placeholder="e.g. Truffle Oil"
                                                value={newMaterialDetails.name}
                                                onChange={e => setNewMaterialDetails({ ...newMaterialDetails, name: e.target.value })}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block ml-1">Ingredient</label>
                                        <input
                                            required
                                            list="ingredient-names-with-units"
                                            className="w-full px-4 py-2 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                            placeholder="Search Material..."
                                            value={searchTerm}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setSearchTerm(val);
                                                const match = inventory.find(i => i.name === val || `${i.name} (${i.unitType})` === val);
                                                if (match) {
                                                    setNewBatch({ ...newBatch, ingredientId: match._id });
                                                }
                                            }}
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block ml-1">Supplier</label>
                                    <select required className="w-full px-4 py-2 bg-white border rounded-xl text-sm outline-none"
                                        value={newBatch.supplierId}
                                        onChange={e => setNewBatch({ ...newBatch, supplierId: e.target.value })}
                                    >
                                        <option value="">Select Supplier...</option>
                                        {suppliers.map(s => (
                                            <option key={s._id} value={s._id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block ml-1">Quantity</label>
                                    <input type="number" required className="w-full px-4 py-2 bg-white border rounded-xl text-sm outline-none" value={newBatch.quantity} onChange={e => setNewBatch({ ...newBatch, quantity: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block ml-1">Cost / Unit</label>
                                    <input type="number" required className="w-full px-4 py-2 bg-white border rounded-xl text-sm outline-none" value={newBatch.costPerUnit} onChange={e => setNewBatch({ ...newBatch, costPerUnit: e.target.value })} />
                                </div>
                                <div className="flex items-end">
                                    <button type="submit" className={cn("w-full btn-primary h-[40px] flex items-center justify-center gap-2 text-xs", editingBatch ? "bg-green-600 hover:bg-green-700" : "")}>
                                        {editingBatch ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                        {editingBatch ? "Update" : "Receive"}
                                    </button>
                                </div>
                            </form>
                        </div>

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
                                    {paginated.map(batch => (
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
                                            <td className="flex items-center gap-2">
                                                <span className="status-pill bg-green-50 text-green-700">ACTIVE</span>
                                                <button
                                                    onClick={() => handleBatchEditClick(batch)}
                                                    className="p-1.5 hover:bg-orange-50 text-gray-300 hover:text-orange-500 rounded-lg transition-colors"
                                                    title="Edit Batch"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteBatch(batch._id)}
                                                    className="p-1.5 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-colors"
                                                    title="Void Batch (Reverse Stock)"
                                                >
                                                    <AlertTriangle className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {paginated.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="p-10 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">
                                                No batches {selectedDate ? `received on ${selectedDate}` : ''}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {renderPagination(filtered.length)}
                    </div>
                );
            })()}

            {activeTab === 'LEDGER' && (() => {
                const { filtered, paginated } = getFilteredData(ledger, 'timestamp');
                return (
                    <div className="space-y-4">
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
                                    {paginated.map(log => (
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
                                    {paginated.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="p-10 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">
                                                No records {selectedDate ? `for ${selectedDate}` : ''}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {renderPagination(filtered.length)}
                    </div>
                );
            })()}

            {activeTab === 'SUPPLIERS' && (
                <div className="space-y-6">
                    {/* Add/Edit Supplier Form */}
                    <div className={cn("card shadow-sm border-orange-100 transition-colors", editingSupplier ? "bg-orange-100 border-orange-300" : "bg-orange-50/30")}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                {editingSupplier ? <Edit2 className="w-5 h-5 text-orange-600" /> : <Plus className="w-5 h-5 text-orange-600" />}
                                <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider">
                                    {editingSupplier ? "Update Supplier Details" : "Register New Supplier"}
                                </h3>
                            </div>
                            {editingSupplier && (
                                <button onClick={handleCancelEdit} className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 uppercase tracking-widest">
                                    <X className="w-4 h-4" /> Cancel
                                </button>
                            )}
                        </div>
                        <form onSubmit={editingSupplier ? handleUpdateSupplier : handleAddSupplier} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block ml-1">Name</label>
                                    <input required className="w-full px-4 py-2 bg-white border rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500" placeholder="Supplier Name" value={newSupplier.name} onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block ml-1">Email</label>
                                    <input className="w-full px-4 py-2 bg-white border rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500" placeholder="contact@supplier.com" value={newSupplier.contactEmail} onChange={e => setNewSupplier({ ...newSupplier, contactEmail: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block ml-1">Phone</label>
                                    <input className="w-full px-4 py-2 bg-white border rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500" placeholder="+1 234 567 890" value={newSupplier.contactPhone} onChange={e => setNewSupplier({ ...newSupplier, contactPhone: e.target.value })} />
                                </div>
                            </div>

                            {/* Category Selector */}
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block ml-1">Supplied Categories</label>
                                <div className="flex flex-wrap gap-2">
                                    {dynamicCategories.map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => toggleCategory(cat)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all",
                                                newSupplier.suppliedCategories.includes(cat)
                                                    ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                                                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                                            )}
                                        >
                                            {cat.replace(/_/g, ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button type="submit" className={cn("btn-primary h-[40px] px-8 flex items-center justify-center gap-2 text-xs", editingSupplier ? "bg-green-600 hover:bg-green-700" : "")}>
                                    {editingSupplier ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                    {editingSupplier ? "Update Supplier" : "Register Supplier"}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {suppliers.map(supplier => (
                            <div key={supplier._id} className={cn("card group hover:border-orange-200 transition-all relative", editingSupplier === supplier._id && "ring-2 ring-orange-400 bg-orange-50")}>
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button
                                        onClick={() => handleEditClick(supplier)}
                                        className="p-1.5 bg-gray-50 hover:bg-orange-100 text-gray-400 hover:text-orange-600 rounded-lg transition-colors border border-gray-100"
                                        title="Edit Supplier"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSupplier(supplier._id)}
                                        className="p-1.5 bg-gray-50 hover:bg-red-100 text-gray-400 hover:text-red-500 rounded-lg transition-colors border border-gray-100"
                                        title="Delete Supplier"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div className="flex gap-1 pr-16 pt-1">
                                        {[...Array(supplier.reliabilityScore || 5)].map((_, i) => (
                                            <div key={i} className="w-1 h-3 bg-orange-500 rounded-full" />
                                        ))}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{supplier.name}</h3>
                                <div className="space-y-1 mb-4">
                                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                                        {supplier.contactEmail || 'No Email'}
                                    </p>
                                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                                        {supplier.contactPhone || 'No Phone'}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-4 border-t">
                                    {supplier.suppliedCategories?.map(cat => (
                                        <span key={cat} className="px-2 py-1 bg-gray-100 rounded-lg text-[9px] font-black text-gray-500 uppercase tracking-widest">
                                            {cat.replace(/_/g, ' ')}
                                        </span>
                                    ))}
                                    {(!supplier.suppliedCategories || supplier.suppliedCategories.length === 0) && (
                                        <span className="text-[9px] text-gray-400 italic">No specific categories</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminInventory;
