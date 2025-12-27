import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useDispatch } from 'react-redux';
import { addToCart } from '../features/cartSlice';
import { ArrowRight, Check, ChefHat, ArrowLeft, Layers, ShoppingBag, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Menu = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);

    const [selectedBase, setSelectedBase] = useState(null);
    const [selectedSauce, setSelectedSauce] = useState(null);
    const [selectedCheese, setSelectedCheese] = useState(null);
    const [selectedVeggies, setSelectedVeggies] = useState([]);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const res = await axios.get('/inventory');
                setInventory(res.data);
            } catch (err) {
                toast.error("Failed to load ingredients");
            } finally {
                setLoading(false);
            }
        };
        fetchInventory();
    }, []);

    const bases = inventory.filter(i => i.category === 'BASE');
    const sauces = inventory.filter(i => i.category === 'SAUCE');
    const cheeses = inventory.filter(i => i.category === 'CHEESE');
    const veggies = inventory.filter(i => i.category === 'VEGGIE');

    const calculatePrice = () => {
        let price = 0;
        if (selectedBase) price += selectedBase.price;
        if (selectedSauce) price += selectedSauce.price;
        if (selectedCheese) price += selectedCheese.price;
        price += selectedVeggies.reduce((sum, v) => sum + v.price, 0);
        return price;
    };

    const toggleVeggie = (veggie) => {
        if (selectedVeggies.find(v => v._id === veggie._id)) {
            setSelectedVeggies(selectedVeggies.filter(v => v._id !== veggie._id));
        } else {
            if (selectedVeggies.length >= 6) {
                toast.error("Max 6 toppings for optimal balance");
                return;
            }
            setSelectedVeggies([...selectedVeggies, veggie]);
        }
    };

    const handleAddToCart = () => {
        const pizza = {
            id: Date.now(),
            name: `Custom ${selectedBase.name}`,
            description: `${selectedSauce.name}, ${selectedCheese.name}, ${selectedVeggies.map(v => v.name).join(', ')}`,
            price: calculatePrice(),
            base: selectedBase.name,
            sauce: selectedSauce.name,
            cheese: selectedCheese.name,
            veggies: selectedVeggies.map(v => v.name),
        };
        dispatch(addToCart(pizza));
        toast.success("Masterpiece created!");
        navigate('/cart');
    };

    const steps = [
        { id: 1, name: 'Foundation', icon: Layers },
        { id: 2, name: 'Essence', icon: Sparkles },
        { id: 3, name: 'Fusion', icon: ChefHat },
        { id: 4, name: 'Flourish', icon: Sparkles },
    ];

    const OptionCard = ({ item, isSelected, onClick, fallbackEmoji }) => (
        <motion.div
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn(
                "cursor-pointer group relative overflow-hidden rounded-2xl border transition-all duration-300 backdrop-blur-md",
                isSelected
                    ? "border-luxury-gold bg-luxury-gold/10 shadow-glow"
                    : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20"
            )}
        >
            <div className="p-6 flex flex-col items-center text-center gap-4">
                <div className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center overflow-hidden transition-all duration-500 shadow-xl",
                    isSelected ? "ring-2 ring-luxury-gold scale-110" : "bg-black/20"
                )}>
                    {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-3xl">{fallbackEmoji}</span>
                    )}
                </div>

                <div className="space-y-1">
                    <h3 className={cn("font-bold text-sm line-clamp-1 font-display", isSelected ? "text-luxury-gold" : "text-gray-200")}>{item.name}</h3>
                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest">₹{item.price}</p>
                </div>
            </div>

            {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-luxury-gold rounded-full flex items-center justify-center text-midnight-950 shadow-lg">
                    <Check className="w-3 h-3 stroke-[3px]" />
                </div>
            )}
        </motion.div>
    );

    if (loading) return <div className="min-h-screen flex items-center justify-center text-luxury-gold font-display text-xl animate-pulse">Initializing Kitchen...</div>;

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <div className="flex flex-col gap-6 mb-12">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-display font-black text-white leading-none tracking-tight">
                            Design Your <span className="text-gradient-gold">Masterpiece</span>
                        </h1>
                        <p className="text-gray-400 mt-2 font-medium">Step {step} of 4: {steps[step - 1].name}</p>
                    </div>
                </div>

                {/* Scoped Progress Bar */}
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / 4) * 100}%` }}
                        className="h-full bg-luxury-gold shadow-glow"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Options Grid */}
                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="min-h-[400px]"
                        >
                            {step === 1 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {bases.map(item => <OptionCard key={item._id} item={item} isSelected={selectedBase?._id === item._id} onClick={() => setSelectedBase(item)} fallbackEmoji="🍕" />)}
                                </div>
                            )}
                            {step === 2 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {sauces.map(item => <OptionCard key={item._id} item={item} isSelected={selectedSauce?._id === item._id} onClick={() => setSelectedSauce(item)} fallbackEmoji="🥫" />)}
                                </div>
                            )}
                            {step === 3 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {cheeses.map(item => <OptionCard key={item._id} item={item} isSelected={selectedCheese?._id === item._id} onClick={() => setSelectedCheese(item)} fallbackEmoji="🧀" />)}
                                </div>
                            )}
                            {step === 4 && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                    {veggies.map(item => (
                                        <OptionCard
                                            key={item._id}
                                            item={item}
                                            isSelected={selectedVeggies.find(v => v._id === item._id)}
                                            onClick={() => toggleVeggie(item)}
                                            fallbackEmoji="🌿"
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Controls */}
                    <div className="flex gap-4 mt-8 pt-8 border-t border-white/5">
                        <Button variant="outline" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="h-14 px-8 rounded-full border-white/10 text-white hover:bg-white/10">
                            <ArrowLeft className="mr-2 w-4 h-4" /> Back
                        </Button>
                        <Button
                            className={cn("flex-1 h-14 rounded-full font-bold text-lg hover:scale-[1.02] transition-transform", step === 4 ? "bg-luxury-gold text-midnight-950" : "bg-white text-midnight-950")}
                            disabled={(step === 1 && !selectedBase) || (step === 2 && !selectedSauce) || (step === 3 && !selectedCheese)}
                            onClick={() => step < 4 ? setStep(s => s + 1) : handleAddToCart()}
                        >
                            {step === 4 ? `Add to Cart • ₹${calculatePrice()}` : 'Continue'}
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Holographic Preview */}
                <div className="lg:col-span-4 lg:sticky lg:top-28 h-fit">
                    <div className="glass-panel p-8 rounded-[40px] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-luxury-gold/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative aspect-square mb-8 flex items-center justify-center">
                            {/* Base Plate */}
                            <motion.div className="w-full h-full rounded-full border border-white/10 bg-black/20 relative shadow-2xl flex items-center justify-center">
                                {/* Layers */}
                                {selectedBase && (
                                    <motion.div layoutId="layer-base" className="absolute w-[90%] h-[90%] rounded-full bg-[#f5d0a9] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] border-4 border-[#e6b88a]" />
                                )}
                                {selectedSauce && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute w-[80%] h-[80%] rounded-full bg-red-600/90 shadow-inner blur-[1px]" />
                                )}
                                {selectedCheese && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute w-[75%] h-[75%] rounded-full bg-yellow-100/80 mix-blend-overlay opacity-80" />
                                )}
                                {/* Toppings scatter */}
                                {selectedVeggies.map((v, i) => (
                                    <motion.div
                                        key={v._id}
                                        initial={{ scale: 0, rotate: i * 45 }}
                                        animate={{ scale: 1, rotate: i * 45 + 360 }}
                                        className="absolute w-full h-full flex items-center justify-start pl-8"
                                        style={{ transformOrigin: 'center' }}
                                    >
                                        <span className="text-xl drop-shadow-lg">🍄</span>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {!selectedBase && (
                                <div className="absolute text-center space-y-2 opacity-50">
                                    <ChefHat className="w-12 h-12 mx-auto mb-2 text-gray-500" />
                                    <p className="text-xs font-black uppercase tracking-widest text-gray-500">Canvas Empty</p>
                                </div>
                            )}
                        </div>

                        {/* Bill Summary */}
                        <div className="space-y-4 font-mono text-xs text-gray-400 border-t border-dashed border-white/10 pt-6">
                            <div className="flex justify-between">
                                <span>BASE</span>
                                <span className="text-white">{selectedBase?.name || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>SAUCE</span>
                                <span className="text-white">{selectedSauce?.name || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>CHEESE</span>
                                <span className="text-white">{selectedCheese?.name || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>TOPPINGS</span>
                                <span className="text-white">{selectedVeggies.length} Selected</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Menu;
