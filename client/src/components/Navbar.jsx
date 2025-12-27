import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { ShoppingCart } from 'lucide-react';
import { useSelector } from 'react-redux';

const Navbar = () => {
    const cartItems = useSelector(state => state.cart.items);

    return (
        <nav className="flex justify-between items-center py-4 border-b border-gray-200 mb-6">
            <Link to="/" className="text-2xl font-bold text-orange-600 tracking-tight">Plaza Pizza</Link>
            <div className="flex gap-6 items-center">
                <Link to="/menu" className="font-medium hover:text-orange-600 transition">Menu</Link>

                <SignedIn>
                    <Link to="/dashboard" className="font-medium hover:text-orange-600 transition">Orders</Link>
                    <Link to="/cart" className="relative font-medium hover:text-orange-600 transition flex items-center">
                        <ShoppingCart className="w-5 h-5" />
                        {cartItems.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartItems.length}</span>}
                    </Link>
                    <UserButton afterSignOutUrl="/" />
                </SignedIn>
                <SignedOut>
                    <Link to="/sign-in" className="btn-primary">Sign In</Link>
                </SignedOut>
            </div>
        </nav>
    );
};

export default Navbar;
