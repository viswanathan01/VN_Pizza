import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { ShoppingCart } from 'lucide-react';
import { useSelector } from 'react-redux';

const Navbar = () => {
    const cartItems = useSelector(state => state.cart.items);

    return (
        <nav className="flex justify-between items-center py-6 px-8 max-w-7xl mx-auto">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <span className="text-2xl">🍕</span>
                </div>
                <span className="text-2xl font-bold text-gray-900 tracking-tight">Plaza</span>
            </Link>

            {/* Center Navigation */}
            <div className="hidden md:flex items-center gap-10">
                <Link to="/" className="font-semibold text-gray-900 hover:text-orange-500 transition-colors">Home</Link>
                <Link to="/menu" className="font-medium text-gray-500 hover:text-orange-500 transition-colors">Menu</Link>
                <Link to="#" className="font-medium text-gray-500 hover:text-orange-500 transition-colors">Service</Link>
                <Link to="#" className="font-medium text-gray-500 hover:text-orange-500 transition-colors">Shop</Link>
            </div>

            {/* Right Side Actions */}
            <div className="flex gap-6 items-center">
                {/* Search Bar */}
                <div className="hidden lg:flex items-center bg-gray-100/80 rounded-full px-4 py-2.5 w-64 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search"
                        className="bg-transparent border-none outline-none text-sm ml-2 w-full text-gray-700 placeholder-gray-400"
                    />
                </div>

                <SignedIn>
                    <Link to="/cart" className="relative w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:scale-105 transition-transform">
                        <ShoppingCart className="w-5 h-5 text-gray-700" />
                        {cartItems.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white">
                                {cartItems.length}
                            </span>
                        )}
                    </Link>
                    <UserButton afterSignOutUrl="/" />
                </SignedIn>
                <SignedOut>
                    <Link to="/sign-in" className="font-medium text-gray-900 hover:text-orange-500">Sign In</Link>
                </SignedOut>
            </div>
        </nav>
    );
};

export default Navbar;
