import { Outlet, Link, useLocation } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';
import { ShoppingCart, UtensilsCrossed, ClipboardList, Shield } from 'lucide-react';
import { useSelector } from 'react-redux';
import { cn } from '../utils/cn';

const UserLayout = () => {
    const { pathname } = useLocation();
    const cartItems = useSelector(state => state.cart.items);
    const { user } = useUser();

    const tabs = [
        { name: 'Menu', href: '/pizza/create', icon: UtensilsCrossed },
        { name: 'My Orders', href: '/orders', icon: ClipboardList },
    ];

    return (
        <div className="min-h-screen bg-midnight-950 font-sans text-gray-100 selection:bg-luxury-gold selection:text-black">
            {/* Top Navbar */}
            <nav className="sticky top-0 z-40 w-full glass-panel border-b-0 border-white/5">
                <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-8">
                    <Link to="/dashboard" className="flex items-center gap-2 font-display font-black text-2xl tracking-tighter text-white group">
                        <span className="text-luxury-gold group-hover:brightness-125 transition-all">Plaza</span>Pizza
                    </Link>

                    <div className="flex items-center gap-6">
                        {/* Desktop Tabs */}
                        <div className="hidden md:flex gap-2">
                            {tabs.map((tab) => (
                                <Link
                                    key={tab.href}
                                    to={tab.href}
                                    className={cn(
                                        "px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                                        pathname.startsWith(tab.href)
                                            ? "bg-white/10 text-white shadow-glow"
                                            : "text-gray-500 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.name}
                                </Link>
                            ))}
                        </div>

                        {/* Cart */}
                        <Link to="/cart" className="relative p-3 hover:bg-white/10 rounded-full transition-colors group">
                            <ShoppingCart className="w-5 h-5 text-gray-400 group-hover:text-luxury-gold transition-colors" />
                            {cartItems.length > 0 && (
                                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-signal-red text-[10px] font-black text-white shadow-sm animate-in zoom-in border border-midnight-950">
                                    {cartItems.length}
                                </span>
                            )}
                        </Link>

                        {/* User Menu */}
                        <div className="border-l pl-6 border-white/10 flex items-center gap-4">
                            <div className="bg-white/10 rounded-full p-1 border border-white/5">
                                <UserButton afterSignOutUrl="/sign-in" appearance={{
                                    elements: {
                                        avatarBox: "w-8 h-8",
                                        userButtonPopoverCard: "bg-midnight-900 border border-white/10 shadow-2xl text-white",
                                        userButtonPopoverFooter: "hidden"
                                    }
                                }} />
                            </div>

                            {user?.publicMetadata?.role === 'ADMIN' && (
                                <Link to="/admin" className="hidden md:flex items-center gap-2 text-[10px] font-black text-midnight-950 bg-luxury-gold px-4 py-2 rounded-full hover:bg-white transition-all shadow-glow">
                                    <Shield className="w-3 h-3" />
                                    ADMIN
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="container mx-auto p-4 sm:p-8 animate-fade-in-up">
                <Outlet />
            </main>
        </div>
    );
};

export default UserLayout;
