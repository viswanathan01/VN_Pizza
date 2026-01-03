import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ShoppingCart, Edit3, ArrowRight, Star, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

import { useCartStore } from '../hooks/useCartStore';
import { useMenuStore } from '../hooks/useMenuStore';
import { useAuthStore } from '../hooks/useAuthStore';

const CATEGORIES = [
    { id: 'ALL', label: 'All' },
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

    // FIX: Prioritize 'Double Pepperoni' as featured to avoid broken image, or fallback to any featured
    const featuredPack = packs.find(p => p.name === 'Double Pepperoni') || packs.find(p => p.isFeatured);
    // FIX: Filter out the specific featured pack being shown
    const filteredPacks = packs.filter(p => p._id !== featuredPack?._id && (selectedCategory === 'ALL' || p.category === selectedCategory));

    const handleAddToCart = async (pack, e) => {
        e?.stopPropagation();
        if (!isSignedIn) {
            toast.error("Please log in to add items.");
            return;
        }

        const cartItem = {
            type: 'PACK',
            packId: pack._id,
            snapshot: {
                ...pack.ingredientsSnapshot,
                name: pack.name,
                description: pack.description,
                image: pack.image // FIX: Add image to snapshot for Cart
            },
            price: pack.price,
            quantity: 1
        };

        await addToCart(cartItem);
        toast.success(`${pack.name} added!`);
    };

    if (menuStatus === 'loading' || menuStatus === 'idle') return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        </div>
    );

    return (
        <div className="min-h-screen bg-white pb-20 pt-10 px-6">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header */}
                <div className="text-center space-y-4">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-extrabold text-gray-900 tracking-tight"
                    >
                        Our <span className="text-orange-500">Menu</span>
                    </motion.h1>
                    <p className="text-gray-500 max-w-lg mx-auto text-lg">
                        Choose from our chef's curated selection or build your own custom masterpiece.
                    </p>
                </div>

                {/* FIX: Featured Banner MOVED ABOVE categories and VISIBLE ALWAYS */}
                {featuredPack && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative rounded-[2.5rem] overflow-hidden bg-orange-500 text-white shadow-2xl items-center grid grid-cols-1 md:grid-cols-2"
                    >
                        <div className="p-12 space-y-6 relative z-10">
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                <Star className="w-3 h-3 fill-current" /> Featured Pick
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold leading-none">{featuredPack.name}</h2>
                            <p className="text-orange-100 text-lg font-medium line-clamp-2">{featuredPack.description}</p>
                            <div className="pt-4 flex gap-4">
                                <button
                                    onClick={(e) => handleAddToCart(featuredPack, e)}
                                    className="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-lg"
                                >
                                    Add for ₹{featuredPack.price}
                                </button>
                                <button
                                    onClick={() => navigate('/builder', { state: { pack: featuredPack } })}
                                    className="px-6 py-4 rounded-xl font-bold border-2 border-white/30 hover:bg-white/10 transition-colors"
                                >
                                    Customize
                                </button>
                            </div>
                        </div>
                        <div className="h-64 md:h-full min-h-[300px] relative">
                            <img src={featuredPack.image?.url} className="absolute inset-0 w-full h-full object-cover" alt="Featured" />
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-transparent to-transparent md:bg-gradient-to-l" />
                        </div>
                    </motion.div>
                )}

                {/* Categories */}
                <div className="flex justify-center flex-wrap gap-2 sticky top-4 z-30 py-4 bg-white/80 backdrop-blur-md rounded-full max-w-fit mx-auto px-6 border border-gray-100 shadow-sm">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={cn(
                                "relative px-6 py-2.5 rounded-full text-sm font-bold transition-colors z-10",
                                selectedCategory === cat.id ? "text-white" : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            {selectedCategory === cat.id && (
                                <motion.div
                                    layoutId="activeCategory"
                                    className="absolute inset-0 bg-gray-900 rounded-full -z-10"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Pizza Grid */}
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                >
                    <AnimatePresence mode='popLayout'>
                        {filteredPacks.map((pack) => (
                            <motion.div
                                layout
                                key={pack._id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className="group bg-white rounded-[2rem] p-4 shadow-lg hover:shadow-2xl transition-all border border-gray-100/50 hover:border-orange-100 flex flex-col"
                            >
                                {/* Image Area */}
                                <div
                                    className="relative h-52 rounded-[1.5rem] overflow-hidden cursor-pointer"
                                    onClick={() => navigate('/builder', { state: { pack } })}
                                >
                                    <img
                                        src={pack.image?.url}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        alt={pack.name}
                                    />
                                    <div className="absolute top-3 right-3">
                                        <span className="bg-white/90 backdrop-blur text-xs font-bold px-3 py-1.5 rounded-full shadow-sm text-gray-900 border border-gray-100">
                                            ₹{pack.price}
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white font-bold tracking-widest uppercase text-xs border border-white px-4 py-2 rounded-full">Customize</span>
                                    </div>
                                </div>

                                <div className="pt-4 px-2 space-y-3 flex-grow flex flex-col">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 leading-tight line-clamp-1" title={pack.name}>{pack.name}</h3>
                                            <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wide">{pack.category}</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 flex-grow">
                                        {pack.description}
                                    </p>

                                    <button
                                        onClick={(e) => handleAddToCart(pack, e)}
                                        className="w-full bg-gray-100 hover:bg-gray-900 hover:text-white text-gray-900 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group/btn"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Add to Cart</span>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* Builder CTA */}
                <div onClick={() => navigate('/builder')} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] p-12 text-center text-white relative overflow-hidden cursor-pointer group">
                    <div className="absolute inset-0 bg-grid-white/[0.05] -z-0" />
                    <div className="relative z-10 space-y-6">
                        <Edit3 className="w-12 h-12 mx-auto text-orange-500 group-hover:rotate-12 transition-transform" />
                        <h2 className="text-3xl font-bold">Don't see what you like?</h2>
                        <p className="text-gray-400 max-w-lg mx-auto">Use our custom builder to create your own pizza from scratch with over 50+ fresh ingredients.</p>
                        <span className="inline-block bg-white text-gray-900 px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-orange-500 hover:text-white transition-colors">
                            Launch Builder
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Menu;
