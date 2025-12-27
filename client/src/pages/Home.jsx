import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowRight, ChefHat, Timer, Star } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';

const Home = () => {
    const { isSignedIn } = useAuth();

    return (
        <div className="min-h-screen bg-brand-charcoal text-white font-sans selection:bg-brand-red selection:text-white">
            {/* Navigation (Transparent) */}
            <nav className="absolute top-0 w-full z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto left-0 right-0">
                <div className="flex items-center gap-2 font-display font-bold text-2xl tracking-tight">
                    <span className="text-white">Plaza</span><span className="text-brand-gold">Pizza</span>
                </div>
                <div className="flex gap-4">
                    {isSignedIn ? (
                        <Link to="/dashboard">
                            <Button className="bg-brand-red hover:bg-red-700 text-white rounded-full px-6">Go to Dashboard</Button>
                        </Link>
                    ) : (
                        <>
                            <Link to="/sign-in">
                                <Button variant="ghost" className="text-white hover:text-brand-gold hover:bg-white/10">Sign In</Button>
                            </Link>
                            <Link to="/sign-up">
                                <Button className="bg-brand-gold text-brand-dark hover:bg-yellow-400 font-bold rounded-full px-6">Get Started</Button>
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-brand-gold text-sm font-medium mb-6 animate-in slide-in-from-bottom-4 fade-in duration-700">
                            <Star className="w-4 h-4 fill-brand-gold" /> Voted #1 Pizza in Town
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-display font-extrabold leading-tight mb-6 animate-in slide-in-from-bottom-8 fade-in duration-1000">
                            Artisanal Pizza, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-orange-500">Crafted by You.</span>
                        </h1>
                        <p className="text-xl text-gray-300 mb-10 max-w-xl leading-relaxed animate-in slide-in-from-bottom-12 fade-in duration-1000 delay-100">
                            Experience the perfect balance of fresh ingredients, premium toppings, and
                            chef-inspired sauces. Delivered piping hot in minutes.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 animate-in slide-in-from-bottom-16 fade-in duration-1000 delay-200">
                            <Link to={isSignedIn ? "/pizza/create" : "/sign-up"}>
                                <Button size="lg" className="bg-brand-red hover:bg-red-700 text-white px-8 h-14 text-lg rounded-full shadow-xl shadow-red-900/30">
                                    Start Your Order <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                            <Link to="/menu"> {/* Menu without ordering, or just scroll down */}
                                <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 h-14 text-lg rounded-full px-8">
                                    View Menu
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Hero Image / Abstract Background */}
                <div className="absolute top-0 right-0 w-full h-full lg:w-1/2 bg-[url('https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=2881&auto=format&fit=crop')] bg-cover bg-center lg:bg-left opacity-20 lg:opacity-50 mask-image-gradient pointer-events-none -z-0 mix-blend-overlay"></div>
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-brand-charcoal to-transparent"></div>
            </div>

            {/* Features Strip */}
            <div className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
                <div className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-brand-red/20 flex items-center justify-center text-brand-red">
                            <ChefHat className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Fresh Ingredients</h3>
                            <p className="text-gray-400 text-sm">Sourced locally every morning.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-brand-gold/20 flex items-center justify-center text-brand-gold">
                            <Timer className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Fast Delivery</h3>
                            <p className="text-gray-400 text-sm">Target time: 35 minutes or less.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-500">
                            <Star className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Top Rated</h3>
                            <p className="text-gray-400 text-sm">Over 500+ 5-star reviews.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
