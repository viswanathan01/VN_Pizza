import { Link } from 'react-router-dom';
import { ArrowRight, Flame, ChefHat, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
    return (
        <div className="space-y-12 pb-20">
            {/* Hero Section */}
            <div className="relative rounded-[3rem] overflow-hidden min-h-[75vh] flex flex-col items-center justify-center text-center p-8 shadow-2xl bg-gray-900">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=2000&auto=format&fit=crop"
                        className="w-full h-full object-cover opacity-60 scale-105"
                        alt="Pizza Background"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
                </div>

                <div className="relative z-10 max-w-4xl space-y-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-orange-500 text-white text-xs font-bold uppercase tracking-widest shadow-xl shadow-orange-500/20 mx-auto"
                    >
                        <Flame className="w-4 h-4 fill-white" />
                        Premium Artisan Quality
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl lg:text-9xl font-bold leading-[0.9] tracking-tighter text-white"
                    >
                        The Art of <br />
                        <span className="text-orange-500 italic">Pizza.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto font-medium"
                    >
                        Design your own masterpiece or choose from our chef's curated selection of artisanal pizzas.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-10"
                    >
                        <Link to="/builder" className="group">
                            <div className="px-12 py-7 bg-white text-gray-900 rounded-3xl font-bold text-xl flex items-center gap-4 hover:bg-orange-500 hover:text-white transition-all shadow-2xl hover:scale-105 active:scale-95">
                                <ChefHat className="w-6 h-6" />
                                Start Building
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                            </div>
                        </Link>

                        <Link to="/menu" className="group">
                            <div className="px-12 py-7 bg-gray-800/50 backdrop-blur-md text-white border border-white/10 rounded-3xl font-bold text-xl flex items-center gap-4 hover:bg-white hover:text-gray-900 transition-all">
                                <Sparkles className="w-6 h-6 text-orange-500" />
                                View Menu
                            </div>
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
                <FeatureCard
                    title="Hand-Tossed Dough"
                    desc="Kneaded daily in our kitchen for the perfect airy crust."
                    image="https://images.unsplash.com/photo-1589187151053-5ec8818e661b?auto=format&fit=crop&w=600"
                />
                <FeatureCard
                    title="San Marzano Sauce"
                    desc="Pure Italian tomatoes, fresh basil, and extra virgin olive oil."
                    image="https://images.unsplash.com/photo-1592398555811-0e12f9b8c946?auto=format&fit=crop&w=600"
                />
                <FeatureCard
                    title="Mozzarella di Bufala"
                    desc="Creamy, fresh water buffalo mozzarella imported weekly."
                    image="https://images.unsplash.com/photo-1615361200141-f45040f367be?auto=format&fit=crop&w=600"
                />
            </div>
        </div>
    );
};

const FeatureCard = ({ title, desc, image }) => (
    <div className="group relative h-64 rounded-[2.5rem] overflow-hidden cursor-default shadow-lg">
        <div className="absolute inset-0">
            <img src={image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={title} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 p-8 space-y-2">
            <h3 className="text-white font-bold text-xl">{title}</h3>
            <p className="text-gray-400 text-sm font-medium leading-relaxed">{desc}</p>
        </div>
    </div>
);

export default Home;
