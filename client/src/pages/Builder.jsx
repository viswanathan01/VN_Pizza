import { useState, useEffect, useMemo } from 'react';
import axios from '../api/axios';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    ChefHat,
    Layers,
    Sparkles,
    Search,
    ChevronLeft,
    ChevronRight,
    Minus,
    Plus,
    Zap,
    ShoppingCart
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import { useCartStore } from '../hooks/useCartStore';
import { useAuthStore } from '../hooks/useAuthStore';

const Builder = () => {
    const { state } = useLocation();
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const { isSignedIn } = useAuthStore();

    // Pagination State
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 9;

    // Selections
    const [selectedBase, setSelectedBase] = useState(null);
    const [selectedSauce, setSelectedSauce] = useState(null);
    const [selectedCheese, setSelectedCheese] = useState(null);
    const [selectedToppings, setSelectedToppings] = useState([]);

    const { addToCart } = useCartStore();
    const navigate = useNavigate();

    // Reset page when step or search changes
    useEffect(() => {
        setPage(1);
    }, [step, searchQuery]);

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const res = await axios.get('/inventory/ingredients');
                setInventory(res.data);

                if (state?.pack && res.data.length > 0) {
                    const pack = state.pack;
                    const findItem = (name) => res.data.find(i => i.name === name);
                    if (pack.ingredientsSnapshot.base) setSelectedBase(findItem(pack.ingredientsSnapshot.base.name || pack.ingredientsSnapshot.base));
                    if (pack.ingredientsSnapshot.sauce) setSelectedSauce(findItem(pack.ingredientsSnapshot.sauce.name || pack.ingredientsSnapshot.sauce));
                    if (pack.ingredientsSnapshot.cheeses?.length > 0) setSelectedCheese(findItem(pack.ingredientsSnapshot.cheeses[0].name || pack.ingredientsSnapshot.cheeses[0]));
                    if (pack.ingredientsSnapshot.toppings) {
                        const packToppings = pack.ingredientsSnapshot.toppings
                            .map(t => findItem(t.name || t))
                            .filter(Boolean)
                            .map(t => ({ ...t, quantity: 1 }));
                        setSelectedToppings(packToppings);
                    }
                }
            } catch (err) {
                toast.error("Cloud pantry sync failed.");
            } finally {
                setLoading(false);
            }
        };
        fetchInventory();
    }, [state]);

    const steps = [
        { id: 1, name: 'Crust', icon: Layers, category: 'BASE' },
        { id: 2, name: 'Sauce', icon: Sparkles, category: 'SAUCE' },
        { id: 3, name: 'Cheese', icon: ChefHat, category: 'CHEESE' },
        { id: 4, name: 'Toppings', icon: Zap, category: ['VEG_TOPPING', 'MEAT_TOPPING', 'HERB', 'SPICE'] },
        { id: 5, name: 'Review', icon: Check, category: 'REVIEW' },
    ];

    const currentStepConfig = steps.find(s => s.id === step);

    const filteredItems = useMemo(() => {
        if (step === 5) return [];
        let items = inventory.filter(i => {
            if (Array.isArray(currentStepConfig.category)) {
                return currentStepConfig.category.includes(i.category);
            }
            return i.category === currentStepConfig.category;
        });
        if (searchQuery) {
            items = items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return items;
    }, [inventory, step, searchQuery, currentStepConfig]);

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const paginatedItems = filteredItems.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const calculatePrice = () => {
        let price = 0;
        if (selectedBase) price += selectedBase.pricePerUnit;
        if (selectedSauce) price += selectedSauce.pricePerUnit;
        if (selectedCheese) price += selectedCheese.pricePerUnit;
        price += selectedToppings.reduce((sum, v) => sum + (v.pricePerUnit * v.quantity), 0);
        return price;
    };

    const toggleTopping = (topping) => {
        const existing = selectedToppings.find(t => t._id === topping._id);
        if (existing) {
            setSelectedToppings(selectedToppings.filter(t => t._id !== topping._id));
        } else {
            if (selectedToppings.length >= 6) {
                toast.error("Maximum 6 toppings allowed!");
                return;
            }
            setSelectedToppings([...selectedToppings, { ...topping, quantity: 1 }]);
        }
    };

    const handleAddToCart = async () => {
        if (!isSignedIn) {
            toast.error("Please login to save your order!");
            return;
        }

        const pizza = {
            type: 'CUSTOM',
            price: calculatePrice(),
            quantity: 1,
            snapshot: {
                base: selectedBase?.name,
                sauce: selectedSauce?.name,
                cheeses: [selectedCheese?.name],
                toppings: selectedToppings.map(t => ({ name: t.name, quantity: t.quantity }))
            }
        };

        await addToCart(pizza);
        toast.success("Added! Routing to checkout...");
        navigate('/cart');
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[70vh] text-orange-500">
            <ChefHat className="w-12 h-12 mb-4 animate-bounce" />
            <p className="uppercase tracking-widest text-xs font-bold text-gray-400">Syncing Artisan Pantry...</p>
        </div>
    );

    return (
        <div className="space-y-12 pb-20">
            {/* High-Clarity Stepper */}
            <header className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between relative px-2">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
                    {steps.map((s) => {
                        const isActive = step === s.id;
                        const isCompleted = step > s.id;
                        return (
                            <div key={s.id} className="relative z-10 flex flex-col items-center gap-2 group cursor-pointer" onClick={() => (isCompleted || isActive) && setStep(s.id)}>
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border-4",
                                    isActive ? "bg-orange-500 border-orange-100 text-white scale-110 shadow-lg shadow-orange-500/20" :
                                        isCompleted ? "bg-green-500 border-green-100 text-white" : "bg-white border-gray-100 text-gray-400"
                                )}>
                                    {isCompleted ? <Check className="w-6 h-6" /> : <s.icon className="w-5 h-5" />}
                                </div>
                                <span className={cn("text-[10px] font-bold uppercase tracking-widest", isActive ? "text-orange-600" : "text-gray-400")}>{s.name}</span>
                            </div>
                        );
                    })}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* Visual Preview (Centerpiece) */}
                <div className="lg:col-span-5 lg:sticky lg:top-24 order-2 lg:order-1">
                    <div className="card bg-gray-50/50 border-none flex flex-col items-center py-16 px-8 relative overflow-hidden group">
                        {/* Live Pizza Visualizer */}
                        <div className="relative w-full aspect-square max-w-[340px] z-10">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
                                className="w-full h-full rounded-full bg-[#f3e5ab] shadow-2xl border-[12px] border-[#d4a06e] relative overflow-hidden flex items-center justify-center"
                            >
                                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/pizzas.png')]" />
                                {selectedSauce && <div className="absolute inset-0 m-1 rounded-full bg-red-600/80 shadow-inner" />}
                                {selectedCheese && <div className="absolute inset-0 m-3 rounded-full bg-[#ffeeaa]/70 backdrop-blur-[1px]" />}
                                {selectedToppings.map((t, idx) => (
                                    <div key={t._id} className="absolute inset-0 flex items-center justify-center animate-pulse-slow">
                                        <div className="relative w-full h-full">
                                            {[...Array(t.quantity * 4)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="absolute w-3 h-3 rounded-full bg-green-600 shadow-sm border border-green-800"
                                                    style={{
                                                        top: `${15 + Math.random() * 70}%`,
                                                        left: `${15 + Math.random() * 70}%`,
                                                        transform: `rotate(${Math.random() * 360}deg)`
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Summary */}
                        <div className="w-full mt-10 space-y-3">
                            <div className="flex justify-between items-center text-xs font-bold border-b pb-2">
                                <span className="text-gray-400 uppercase tracking-widest">Recipe Value</span>
                                <span className="text-2xl text-orange-600">₹{calculatePrice()}</span>
                            </div>
                            <div className="text-[10px] text-gray-500 font-medium leading-relaxed italic text-center">
                                Custom build with {selectedToppings.length} selected toppings.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Interaction Area */}
                <div className="lg:col-span-7 order-1 lg:order-2 space-y-8">
                    {step < 5 ? (
                        <>
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold text-gray-900">Choose your {currentStepConfig.name}</h3>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="pl-10 pr-4 py-2 bg-white border rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 w-48 shadow-sm"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {paginatedItems.map(item => {
                                    const isSelected = (step === 1 && selectedBase?._id === item._id) ||
                                        (step === 2 && selectedSauce?._id === item._id) ||
                                        (step === 3 && selectedCheese?._id === item._id) ||
                                        (step === 4 && selectedToppings.find(t => t._id === item._id));

                                    return (
                                        <div
                                            key={item._id}
                                            onClick={() => {
                                                if (step === 1) setSelectedBase(item);
                                                else if (step === 2) setSelectedSauce(item);
                                                else if (step === 3) setSelectedCheese(item);
                                                else toggleTopping(item);
                                            }}
                                            className={cn(
                                                "card p-4 flex flex-col items-center justify-center text-center cursor-pointer group transition-all duration-300",
                                                isSelected ? "border-orange-500 bg-orange-50/50 shadow-lg shadow-orange-500/5 scale-105" : "hover:border-orange-200"
                                            )}
                                        >
                                            <div className="w-16 h-16 mb-4 flex items-center justify-center">
                                                <img src={item.image.url} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform" />
                                            </div>
                                            <div className="text-xs font-bold text-gray-900 line-clamp-1">{item.name}</div>
                                            <div className="text-[10px] text-orange-600 font-bold mt-1">₹{item.pricePerUnit}</div>
                                            {isSelected && (
                                                <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white">
                                                    <Check className="w-3 h-3 stroke-[4px]" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-4 mt-6">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Page {page} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-8 animate-fade-in-up">
                            <h3 className="text-3xl font-bold text-gray-900">Review Design</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <ReviewItem label="Crust" name={selectedBase?.name} img={selectedBase?.image.url} />
                                <ReviewItem label="Sauce" name={selectedSauce?.name} img={selectedSauce?.image.url} />
                                <ReviewItem label="Cheese" name={selectedCheese?.name} img={selectedCheese?.image.url} />
                                <div className="card p-4">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Toppings</div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedToppings.map(t => (
                                            <span key={t._id} className="px-2 py-1 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-700">{t.name}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button onClick={handleAddToCart} className="w-full btn-primary h-20 text-xl gap-4">
                                Complete Masterpiece <ArrowRight className="w-6 h-6" />
                            </button>
                        </div>
                    )}

                    {step < 5 && (
                        <div className="flex gap-4 pt-10">
                            <button
                                onClick={() => setStep(s => Math.max(1, s - 1))}
                                disabled={step === 1}
                                className="px-8 h-16 border rounded-2xl text-gray-400 font-bold uppercase tracking-widest hover:bg-gray-50 disabled:opacity-30"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setStep(s => s + 1)}
                                disabled={(step === 1 && !selectedBase) || (step === 2 && !selectedSauce) || (step === 3 && !selectedCheese)}
                                className="flex-1 btn-primary h-16 text-sm gap-2"
                            >
                                Next Ritual <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ReviewItem = ({ label, name, img }) => (
    <div className="card p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center p-1">
            <img src={img} className="max-w-full max-h-full object-contain" />
        </div>
        <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</div>
            <div className="text-sm font-bold text-gray-900">{name || 'Default'}</div>
        </div>
    </div>
);

export default Builder;
