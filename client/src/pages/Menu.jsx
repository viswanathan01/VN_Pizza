import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ShoppingCart, Edit3, ArrowRight, Pizza, ChefHat, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

import { useCartStore } from '../hooks/useCartStore';
import { useMenuStore } from '../hooks/useMenuStore';
import { useAuthStore } from '../hooks/useAuthStore';

const CATEGORIES = [
    { id: 'CLASSIC', label: 'Classic' },
    { id: 'VEG', label: 'Veg' },
    { id: 'NON_VEG', label: 'Non-Veg' },
    { id: 'PREMIUM', label: 'Premium' },
    { id: 'SPICY', label: 'Spicy' }
];

const Menu = () => {
    const navigate = useNavigate();
    const { packs, status: menuStatus } = useMenuStore();
    const { addToCart } = useCartStore();
    const { isSignedIn } = useAuthStore();
    const [selectedCategory, setSelectedCategory] = useState('ALL');

    const featuredPacks = packs.filter(p => p.isFeatured);
    const filteredPacks = packs.filter(p => !p.isFeatured && (selectedCategory === 'ALL' || p.category === selectedCategory));

    const handleAddToCart = async (pack) => {
        if (!isSignedIn) {
            toast.error("Please log in to add items to your cart.");
            return;
        }

        const cartItem = {
            type: 'PACK',
            packId: pack._id,
            snapshot: { ...pack.ingredientsSnapshot, name: pack.name, description: pack.description },
            price: pack.price,
            quantity: 1
        };

        await addToCart(cartItem);
        toast.success(`${pack.name} added to cart!`);
    };

    if (menuStatus === 'loading' || menuStatus === 'idle') return (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
            <p className="font-bold uppercase tracking-widest text-xs opacity-50">Preparing the Menu...</p>
        </div>
    );

    return (
        <div className="space-y-20 pb-20">
            {/* Minimalist Hero */}
            {featuredPacks.length > 0 && (
                <section className="relative h-[70vh] rounded-[2.5rem] overflow-hidden group shadow-2xl">
                    <img
                        src={featuredPacks[0].image?.url}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        alt="Featured Pizza"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-12 md:p-20 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest w-fit"
                        >
                            <Sparkles className="w-4 h-4" /> Chef's Masterpiece
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-none"
                        >
                            {featuredPacks[0].name}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-gray-200 max-w-xl font-medium"
                        >
                            {featuredPacks[0].description}
                        </motion.p>
                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => handleAddToCart(featuredPacks[0])}
                                className="px-8 h-16 bg-white text-gray-900 rounded-2xl font-bold uppercase tracking-widest transition-all flex items-center gap-3 hover:bg-orange-500 hover:text-white"
                            >
                                <ShoppingCart className="w-5 h-5" /> Order Now • ₹{featuredPacks[0].price}
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* Builder CTA */}
            <section className="bg-orange-50 rounded-[3rem] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 border border-orange-100">
                <div className="space-y-6 text-center md:text-left">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-orange-100 mx-auto md:mx-0">
                        <ChefHat className="w-8 h-8 text-orange-500" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">Your Kitchen, Your <span className="text-orange-500">Rules.</span></h2>
                    <p className="text-gray-600 text-lg font-medium max-w-lg">
                        Access our artisanal pantry of 50+ ingredients and build a pizza that defines you.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/builder')}
                    className="px-12 h-20 bg-gray-900 text-white rounded-[2rem] font-bold text-xl uppercase tracking-widest transition-all flex items-center gap-4 hover:bg-orange-500 shadow-xl"
                >
                    Start Building <ArrowRight className="w-6 h-6" />
                </button>
            </section>

            {/* Menu Grid */}
            <section className="space-y-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b pb-10">
                    <div>
                        <h3 className="text-4xl font-bold text-gray-900 tracking-tight">The Signature Selection</h3>
                        <p className="text-gray-500 font-medium mt-1">Curated by our masters for the ultimate flavor profile.</p>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {[{ id: 'ALL', label: 'All' }, ...CATEGORIES].map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={cn(
                                    "px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                                    selectedCategory === cat.id ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                )}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredPacks.map((pack) => (
                        <motion.div
                            key={pack._id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="group flex flex-col bg-white rounded-[2.5rem] border hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                        >
                            <div className="relative h-64 overflow-hidden">
                                <img src={pack.image?.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={pack.name} />
                                <div className="absolute top-6 right-6">
                                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold text-gray-900 uppercase tracking-widest shadow-sm">
                                        {pack.category}
                                    </span>
                                </div>
                            </div>
                            <div className="p-8 space-y-6 flex flex-col flex-grow">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-2xl font-bold text-gray-900 leading-tight">{pack.name}</h4>
                                    <span className="text-xl font-bold text-orange-600">₹{pack.price}</span>
                                </div>
                                <p className="text-gray-500 text-sm font-medium line-clamp-2 leading-relaxed">
                                    {pack.description}
                                </p>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => handleAddToCart(pack)}
                                        className="flex-1 h-14 bg-gray-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-orange-500 transition-colors"
                                    >
                                        Add to Cart
                                    </button>
                                    <button
                                        onClick={() => navigate('/builder', { state: { pack } })}
                                        className="w-14 h-14 border rounded-2xl flex items-center justify-center text-gray-400 hover:text-orange-500 hover:border-orange-500 transition-all"
                                    >
                                        <Edit3 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Menu;
