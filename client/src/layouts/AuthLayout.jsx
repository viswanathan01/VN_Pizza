import { Outlet } from 'react-router-dom';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen flex bg-brand-charcoal text-white overflow-hidden">
            {/* Left: Branding / Image */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-brand-dark items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    {/* Placeholder for Pizza Hero Image - using a gradient/pattern for now if image fails */}
                    <img
                        src="https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2670&auto=format&fit=crop"
                        alt="Pizza Hero"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent opacity-90" />
                </div>

                <div className="relative z-10 text-center p-12 max-w-xl">
                    <h1 className="text-5xl font-extrabold mb-6 tracking-tight font-display text-white drop-shadow-lg">
                        Hot pizzas. <br />
                        <span className="text-brand-gold">Zero waiting.</span>
                    </h1>
                    <p className="text-xl text-gray-300">
                        Experience the premium taste of Plaza Pizza. Customized by you, delivered by us.
                    </p>
                </div>
            </div>

            {/* Right: Auth Card */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
                {/* Grain texture overlay could go here */}
                <div className="w-full max-w-md animate-slide-up">
                    <div className="mb-8 text-center lg:hidden">
                        <h1 className="text-3xl font-bold text-white mb-2">Plaza Pizza</h1>
                        <p className="text-gray-400">Hot pizzas. Zero waiting.</p>
                    </div>

                    {/* The actual Clerk component or children will reside here */}
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
