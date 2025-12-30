import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowRight, ShieldCheck, CreditCard, Minus, Plus, MapPin, Locate, Phone, User } from 'lucide-react';
import axios from '../api/axios';
import { useAuthStore } from '../hooks/useAuthStore';
import { useCartStore } from '../hooks/useCartStore';
import { useProfileStore } from '../hooks/useProfileStore';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Cart = () => {
    const { items, totalPrice, removeItem, updateQuantity, clearCart } = useCartStore();
    const { getToken, isLoaded, isSignedIn } = useAuthStore();
    const { profile, fetchProfile } = useProfileStore();
    const navigate = useNavigate();

    // Checkout State
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [coords, setCoords] = useState({ lat: null, lng: null });
    const [locLoading, setLocLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial Sync
    useEffect(() => {
        if (isLoaded && isSignedIn) {
            getToken().then(token => fetchProfile(token));
        }
    }, [isLoaded, isSignedIn]);

    // Auto-fill from Profile
    useEffect(() => {
        if (profile) {
            if (profile.fullName) setName(profile.fullName);
            if (profile.contactNumber) setPhone(profile.contactNumber);
            if (profile.savedAddress) {
                setAddress(profile.savedAddress.addressLine);
                setCoords({ lat: profile.savedAddress.latitude, lng: profile.savedAddress.longitude });
            }
        }
    }, [profile]);

    const handleGeolocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation not supported");
            return;
        }
        setLocLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                // Reverse Geocoding (simplified simulation or use external service if allowed, here we just set coords and ask user to confirm text)
                toast.success("Location Pin Acquired");
                if (!address) setAddress(`Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`);
                setLocLoading(false);
            },
            (err) => {
                toast.error("Location Access Denied");
                setLocLoading(false);
            }
        );
    };

    const handleCheckout = async () => {
        if (isSubmitting) return;

        if (!isSignedIn) {
            toast.error("Please log in to checkout.");
            return;
        }

        if (!name || !phone || !address) {
            toast.error("Please complete delivery details.");
            return;
        }

        setIsSubmitting(true);
        const tid = toast.loading("Processing Order...");
        try {
            const token = await getToken();
            const orderData = {
                items: items.map(i => ({
                    name: i.type === 'PACK' ? (i.snapshot?.name || 'Predefined Pack') : `Custom Build`,
                    description: i.type === 'PACK' ? i.snapshot.description : `Hand-crafted custom design`,
                    price: i.price,
                    quantity: i.quantity,
                    packId: i.packId,
                    snapshot: i.snapshot
                })),
                totalPrice,
                customer: {
                    name,
                    contactNumber: phone
                },
                deliveryAddress: {
                    label: 'Home', // Defaulting for now
                    addressLine: address,
                    latitude: coords.lat || 0,
                    longitude: coords.lng || 0
                }
            };

            await axios.post('/orders', orderData, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Order dispatched to kitchen!", { id: tid });
            await clearCart();
            setTimeout(() => navigate('/orders'), 2000);
        } catch (error) {
            toast.error(error.response?.data?.error || "Checkout failed.", { id: tid });
            setIsSubmitting(false);
        }
    };

    if (items.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <div className="w-32 h-32 bg-gray-50 rounded-[40px] flex items-center justify-center border-2 border-dashed border-gray-200">
                <ShoppingCart className="w-12 h-12 text-gray-300" />
            </div>
            <div className="space-y-2">
                <h2 className="text-3xl font-bold text-gray-900">Your cart is empty</h2>
                <p className="text-gray-500 font-medium max-w-xs mx-auto text-sm">Looks like you haven't designed your masterpiece yet.</p>
            </div>
            <button
                onClick={() => navigate('/menu')}
                className="px-10 h-16 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20"
            >
                Start Designing
            </button>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            <header className="border-b pb-8">
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Curation Registry</h1>
                <p className="text-gray-500 text-sm font-medium mt-1">Review and finalize your artisanal selections.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-900 border-b pb-4">1. Selected Items</h3>
                        <AnimatePresence mode="popLayout">
                            {items.map((item) => (
                                <motion.div
                                    key={item._id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="card flex items-center gap-6 group relative"
                                >
                                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 border shrink-0">
                                        <img
                                            src={item.type === 'PACK' ? item.snapshot.image?.url || item.snapshot.imageUrl : 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400'}
                                            className="w-full h-full object-cover"
                                            alt=""
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1">{item.type}</div>
                                        <h3 className="text-lg font-bold text-gray-900 truncate">
                                            {item.type === 'PACK' ? (item.snapshot?.name || 'Artisan Pack') : `Custom Masterpiece`}
                                        </h3>
                                        <p className="text-xs text-gray-500 line-clamp-1 mt-1 font-medium">
                                            {item.type === 'PACK' ? item.snapshot.description : `${item.snapshot.sauce}, ${item.snapshot.base}`}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-3">
                                        <div className="text-xl font-bold text-gray-900 italic">₹{item.price * item.quantity}</div>
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1 border">
                                            <button onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))} className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-lg transition-all"><Minus className="w-3 h-3" /></button>
                                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-lg transition-all"><Plus className="w-3 h-3" /></button>
                                        </div>
                                    </div>
                                    <button onClick={() => removeItem(item._id)} className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-red-100 rounded-full flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-all text-red-500 opacity-0 group-hover:opacity-100">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="space-y-6 pt-6">
                        <h3 className="text-xl font-bold text-gray-900 border-b pb-4">2. Delivery Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Recipient Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full h-12 pl-12 pr-4 bg-gray-50 border rounded-xl font-medium outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                        placeholder="Full Name"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Contact Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full h-12 pl-12 pr-4 bg-gray-50 border rounded-xl font-medium outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                        placeholder="Mobile Number"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Delivery Address</label>
                                <button
                                    onClick={handleGeolocation}
                                    disabled={locLoading}
                                    className="text-[10px] font-bold text-orange-600 uppercase tracking-widest flex items-center gap-1 hover:underline disabled:opacity-50"
                                >
                                    <Locate className="w-3 h-3" /> {locLoading ? 'Locating...' : 'Use Current Location'}
                                </button>
                            </div>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                                <textarea
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full h-24 pl-12 pr-4 py-3 bg-gray-50 border rounded-xl font-medium outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none"
                                    placeholder="Enter full street address..."
                                />
                            </div>
                            {coords.lat && (
                                <div className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                                    <Locate className="w-3 h-3" /> Pin Dropped: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
                    <div className="card bg-gray-900 border-none p-10 space-y-8 relative overflow-hidden">
                        <div className="relative z-10 space-y-8">
                            <h3 className="text-white font-bold flex items-center gap-3">
                                <CreditCard className="w-5 h-5 text-orange-500" /> Order Summary
                            </h3>
                            <div className="space-y-4 border-y border-white/10 py-6">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-gray-400">Subtotal</span>
                                    <span className="text-white">₹{totalPrice}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-gray-400">Delivery</span>
                                    <span className="text-green-500">FREE</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold pt-4 border-t border-white/5">
                                    <span className="text-orange-500 uppercase tracking-widest text-[10px]">Grand Total</span>
                                    <span className="text-3xl text-white font-bold tracking-tight">₹{totalPrice}</span>
                                </div>
                            </div>
                            <button
                                onClick={handleCheckout}
                                disabled={isSubmitting}
                                className="w-full h-16 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold rounded-2xl transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3 group"
                            >
                                {isSubmitting ? (
                                    <>Processing...</>
                                ) : (
                                    <>Authorize Order <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" /></>
                                )}
                            </button>
                            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                                <ShieldCheck className="w-4 h-4 text-green-500" /> PCI-DSS Compliant
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
