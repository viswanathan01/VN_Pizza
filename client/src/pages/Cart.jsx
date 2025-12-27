import { useSelector, useDispatch } from 'react-redux';
import { clearCart, removeFromCart } from '../features/cartSlice';
import axios from '../api/axios';
import { useAuth, useUser } from "@clerk/clerk-react";
import { ShoppingCart, Trash2, ArrowRight, ShieldCheck, Ticket, CreditCard, Pizza } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
    const items = useSelector(state => state.cart.items);
    const totalPrice = useSelector(state => state.cart.totalPrice);
    const dispatch = useDispatch();
    const { getToken } = useAuth();
    const { user } = useUser();
    const navigate = useNavigate();

    const handleCheckout = async () => {
        const loadingToast = toast.loading("Processing your pizza order...");
        try {
            const token = await getToken();
            const orderData = {
                items: items.map(i => ({
                    base: i.base,
                    sauce: i.sauce,
                    cheese: i.cheese,
                    veggies: i.veggies,
                    meat: i.meat
                })),
                totalPrice,
                contactNumber: user.phoneNumbers?.[0]?.phoneNumber || 'Not provided',
                paymentId: "SIMULATED_PAYMENT_" + Date.now()
            };

            await axios.post('/orders', orderData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success("Order placed successfully! Redirecting...", { id: loadingToast });
            dispatch(clearCart());
            setTimeout(() => navigate('/orders'), 2000);
        } catch (error) {
            console.error('Checkout failed', error);
            toast.error(error.response?.data?.details || "Checkout failed. Please try again.", { id: loadingToast });
        }
    };

    if (items.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-10 h-10 text-gray-200" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Your cart is lonely</h2>
                <p className="text-gray-500 mt-2">Add some delicious pizzas to get started!</p>
            </div>
            <Button size="lg" className="rounded-2xl h-14 px-12 bg-brand-red font-bold" onClick={() => navigate('/pizza/create')}>
                Build a Pizza
            </Button>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <h1 className="text-4xl font-black text-gray-900 mb-12 flex items-center gap-4">
                Review Order <span className="text-brand-gold text-lg font-medium px-4 py-1 bg-brand-gold/10 rounded-full">{items.length} Items</span>
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Cart Items */}
                <div className="lg:col-span-8 space-y-6">
                    <AnimatePresence>
                        {items.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="group relative bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/20 flex items-center gap-6"
                            >
                                <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner">
                                    🍕
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{item.name}</h3>
                                    <p className="text-sm text-gray-400 font-medium mt-1 italic">
                                        {item.base} • {item.sauce} • {item.cheese}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {item.veggies.map(v => (
                                            <span key={v} className="text-[10px] font-black uppercase text-brand-gold bg-brand-gold/5 px-2 py-0.5 rounded tracking-tighter">{v}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-right space-y-2">
                                    <div className="text-2xl font-black text-brand-red tracking-tight">₹{item.price}</div>
                                    <button
                                        onClick={() => dispatch(removeFromCart(item.id))}
                                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    <Button
                        variant="link"
                        onClick={() => navigate('/pizza/create')}
                        className="text-brand-red font-bold flex items-center gap-2"
                    >
                        Add another pizza <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>

                {/* Checkout Sidebar */}
                <div className="lg:col-span-4 h-fit sticky top-32">
                    <div className="bg-brand-charcoal rounded-[40px] p-8 text-white shadow-2xl shadow-gray-900/40 space-y-8">
                        <div className="space-y-4">
                            <h4 className="text-xl font-bold flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-brand-gold" /> Payment Summary
                            </h4>
                            <div className="space-y-3 pt-4">
                                <div className="flex justify-between text-gray-400 font-medium">
                                    <span>Subtotal</span>
                                    <span className="text-white">₹{totalPrice}</span>
                                </div>
                                <div className="flex justify-between text-gray-400 font-medium">
                                    <span>Delivery Fee</span>
                                    <span className="text-green-400">FREE</span>
                                </div>
                                <div className="flex justify-between text-gray-400 font-medium italic">
                                    <span>Taxes</span>
                                    <span className="text-white">Included</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                            <div className="text-xs font-black uppercase tracking-widest text-brand-gold">Total Amount</div>
                            <div className="text-5xl font-display font-black leading-none">₹{totalPrice}</div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <Button
                                onClick={handleCheckout}
                                className="w-full h-16 rounded-2xl bg-brand-red hover:bg-red-700 text-lg font-bold shadow-xl shadow-red-900/40 group"
                            >
                                Place Order <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>

                            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <ShieldCheck className="w-4 h-4 text-green-500" /> Secure Checkout
                            </div>
                        </div>

                        {/* Promo Clip */}
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                            <div className="p-2 bg-brand-gold rounded-xl">
                                <Ticket className="w-5 h-5 text-brand-dark" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold">Have a promo code?</p>
                                <p className="text-[10px] text-gray-400">Apply at next step</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ChevronRight = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m9 18 6-6-6-6" />
    </svg>
)

export default Cart;
