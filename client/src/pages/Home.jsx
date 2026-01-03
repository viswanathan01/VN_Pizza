import { Link } from 'react-router-dom';
import { ArrowRight, Play, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import heroImage from '../assets/hero_scooter.png';

const Home = () => {
    return (
        <div className="min-h-screen bg-white text-gray-900 pb-20 overflow-x-hidden">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-6 pt-10 lg:pt-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left Content */}
                    <div className="space-y-8 relative z-10">
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full font-bold text-sm"
                        >
                            <span>Bike Delivery</span>
                            <span className="text-lg">🛵</span>
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-extrabold leading-[1.1]"
                        >
                            Fastest <br />
                            <span className="text-orange-500">Delivery</span> & <br />
                            Easy <span className="text-gray-900">Pickup.</span>
                        </motion.h1>

                        {/* Subtext */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-500 text-lg max-w-md leading-relaxed"
                        >
                            Plaza Pizza assures fresh, artisanal pies delivered hot to your family's doorstep without stepping out.
                        </motion.p>

                        {/* Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center gap-6"
                        >
                            <Link to="/menu" className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold shadow-xl hover:bg-slate-800 hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2">
                                Order Now
                            </Link>

                            <button className="flex items-center gap-4 group">
                                <div className="w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center group-hover:bg-orange-50 transition-colors text-orange-500">
                                    <Play className="w-5 h-5 fill-current ml-1" />
                                </div>
                                <span className="font-bold text-gray-700">Order Process</span>
                            </button>
                        </motion.div>

                        {/* Chef Note */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center gap-4 pt-8 max-w-sm"
                        >
                            <div className="w-12 h-12 bg-white shadow-md rounded-full overflow-hidden border-2 border-orange-100">
                                <img src="https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=100&q=80" alt="Chef" className="w-full h-full object-cover" />
                            </div>
                            <p className="text-xs text-orange-600 font-medium italic border-l-2 border-orange-200 pl-3">
                                "When you are too lazy to cook, we are just a click away!"
                            </p>
                        </motion.div>
                    </div>

                    {/* Right Image Area */}
                    <div className="relative isolate text-center lg:text-right">
                        {/* Background Blob */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-orange-50/50 rounded-full blur-3xl -z-10" />

                        {/* Main Circle */}
                        <div className="relative inline-block">
                            {/* Floating Elements (Food Cards) */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                className="absolute -top-10 -left-10 md:-left-20 bg-white p-3 rounded-2xl shadow-xl z-20"
                            >
                                <div className="text-4xl">🍕</div>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, 15, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
                                className="absolute top-1/2 -right-12 bg-white p-3 rounded-2xl shadow-xl z-20"
                            >
                                <div className="text-4xl">🥗</div>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, -12, 0] }}
                                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
                                className="absolute bottom-10 -left-6 bg-white p-3 rounded-2xl shadow-xl z-20"
                            >
                                <div className="text-4xl">🍔</div>
                            </motion.div>

                            <img
                                src={heroImage}
                                alt="Delivery Hero"
                                className="relative z-10 w-full max-w-[500px] mx-auto drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Bottom Features (Simplified) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
                    <FeatureCard
                        icon={<span className="text-4xl">🍅</span>}
                        title="Fresh Ingredients"
                        desc="Sourced locally ensuring the highest quality for every slice."
                    />
                    <FeatureCard
                        icon={<span className="text-4xl">⚡</span>}
                        title="Fast Delivery"
                        desc="Hot and fresh at your door within 30 minutes, guaranteed."
                    />
                    <FeatureCard
                        icon={<span className="text-4xl">👨‍🍳</span>}
                        title="Master Chefs"
                        desc="Crafted by culinary experts passionate about the perfect pie."
                    />
                </div>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="bg-gray-50 p-8 rounded-[2rem] hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100 group">
        <div className="mb-4 bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 leading-relaxed">{desc}</p>
    </div>
);

export default Home;
