import { Outlet, Link, useLocation } from 'react-router-dom';
import { UserButton, SignInButton } from '@clerk/clerk-react';
import { ShoppingCart, Pizza, ClipboardList, Sun, Moon, PlusCircle, LayoutDashboard } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '../utils/cn';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

import { useAuthStore } from '../hooks/useAuthStore';
import { useCartStore } from '../hooks/useCartStore';
import { useMenuStore } from '../hooks/useMenuStore';

const UserLayout = () => {
    const { pathname } = useLocation();
    const { isLoaded, isSignedIn, user, role } = useAuthStore();
    const { items: cartItems, loadCart } = useCartStore();
    const { loadPacks } = useMenuStore();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        if (isLoaded) {
            loadPacks();
            if (isSignedIn) {
                loadCart();
            }
        }
    }, [isLoaded, isSignedIn]);

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const navItems = [
        { name: 'Menu', href: '/menu', icon: Pizza },
        { name: 'Pizza Builder', href: '/builder', icon: PlusCircle },
        { name: 'My Orders', href: '/orders', icon: ClipboardList },
    ];

    const isAdmin = role === 'ADMIN';

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
            {/* Main Navbar */}
            <nav className="sticky top-0 z-50 w-full bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-color)]">
                <div className="container mx-auto h-20 flex items-center justify-between px-6">
                    {/* Brand Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20 group-hover:rotate-6 transition-transform">
                            <Pizza className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">PLAZA<span className="text-orange-500 italic">PIZZA</span></span>
                    </Link>

                    {/* Central Navigation */}
                    <div className="hidden md:flex gap-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className={cn(
                                        "px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                                        isActive
                                            ? "bg-orange-50 text-orange-600"
                                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                    )}
                                >
                                    <item.icon className={cn("w-4 h-4", isActive ? "text-orange-500" : "text-gray-400")} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 pr-4 border-r">
                            <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
                                {theme === 'DARK' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </button>

                            <Link to="/cart" className="relative p-2.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
                                <ShoppingCart className="w-4 h-4" />
                                {cartItems.length > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-orange-500 text-[8px] font-black text-white rounded-full flex items-center justify-center border-2 border-white">
                                        {cartItems.length}
                                    </span>
                                )}
                            </Link>

                            {isAdmin && (
                                <Link to="/admin" className="p-2.5 rounded-xl hover:bg-gray-100 text-orange-600 transition-colors" title="Admin Panel">
                                    <LayoutDashboard className="w-4 h-4" />
                                </Link>
                            )}
                        </div>

                        {/* User Profile */}
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden sm:block">
                                {user?.firstName || 'Guest'}
                            </span>
                            <div className="w-9 h-9 rounded-lg overflow-hidden border bg-gray-50 shadow-sm">
                                {isSignedIn ? (
                                    <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
                                ) : (
                                    <SignInButton mode="modal">
                                        <button className="w-full h-full flex items-center justify-center bg-gray-900 text-white text-[10px] font-bold uppercase hover:bg-orange-500 transition-colors">
                                            Log In
                                        </button>
                                    </SignInButton>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Content Container */}
            <main className="container mx-auto px-6 py-10 animate-fade-in">
                <Outlet />
            </main>
        </div>
    );
};

export default UserLayout;
