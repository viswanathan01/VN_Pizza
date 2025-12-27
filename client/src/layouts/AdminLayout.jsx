import { Outlet, Link, useLocation } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { LayoutDashboard, ShoppingBag, Box, Terminal, Activity, LogOut } from 'lucide-react';
import { cn } from '../utils/cn';

const AdminLayout = () => {
    const { pathname } = useLocation();

    const navItems = [
        { name: 'Command Center', href: '/admin', icon: LayoutDashboard },
        { name: 'Fleet Logistics', href: '/admin/orders', icon: ShoppingBag },
        { name: 'Supply Depot', href: '/admin/inventory', icon: Box },
    ];

    return (
        <div className="min-h-screen bg-midnight-950 flex text-gray-300 font-mono selection:bg-neon-purple selection:text-white">
            {/* Sidebar */}
            <aside className="w-72 glass-panel-heavy border-r border-white/5 fixed h-full z-30 hidden md:flex flex-col">
                <div className="h-20 flex items-center px-8 border-b border-white/5 bg-black/20">
                    <span className="text-xl font-display font-black tracking-tight text-white flex items-center gap-2">
                        <Terminal className="w-6 h-6 text-neon-purple animate-pulse" />
                        PLAZA<span className="text-neon-purple">OS</span>
                    </span>
                </div>

                <div className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
                    <div className="px-4 mb-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Modules</div>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all relative overflow-hidden group",
                                (pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href)))
                                    ? "bg-neon-purple/10 text-neon-purple border border-neon-purple/20 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                                    : "text-gray-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon className={cn("w-4 h-4", pathname === item.href ? "text-neon-purple" : "opacity-70 group-hover:text-white")} />
                            {item.name}
                            {(pathname === item.href) && <div className="absolute right-0 top-0 bottom-0 w-1 bg-neon-purple box-shadow-glow" />}
                        </Link>
                    ))}
                </div>

                <div className="p-4 border-t border-white/5 bg-black/20">
                    <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/5 border border-white/5">
                        <UserButton afterSignOutUrl="/sign-in" appearance={{
                            elements: {
                                avatarBox: "w-8 h-8 rounded-lg",
                                userButtonPopoverCard: "bg-midnight-900 border border-white/10 text-white"
                            }
                        }} />
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-xs font-bold text-white truncate">Admin Operator</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-signal-green animate-pulse" />
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Online</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile / Main Content Wrapper */}
            <div className="flex-1 md:ml-72 flex flex-col min-h-screen relative">
                {/* Background Grid Texture */}
                <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #3b82f6 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

                {/* Content */}
                <main className="flex-1 p-6 md:p-10 overflow-x-hidden relative z-10 animate-fade-in-up">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
