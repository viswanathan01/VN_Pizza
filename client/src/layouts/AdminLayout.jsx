import { Outlet, Link, useLocation } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { LayoutDashboard, ShoppingBag, Box, Cpu } from 'lucide-react';
import { cn } from '../utils/cn';

const AdminLayout = () => {
    const { pathname } = useLocation();

    const navItems = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
        { name: 'Inventory', href: '/admin/inventory', icon: Box },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-secondary)] flex text-[var(--text-primary)]">
            {/* Admin Sidebar */}
            <aside className="admin-sidebar">
                <div className="h-20 flex items-center px-8 border-b border-[var(--sidebar-border)]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                            <Cpu className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">PLAZA<span className="text-orange-500 italic">OS</span></span>
                    </div>
                </div>

                <div className="p-4 space-y-1">
                    <p className="px-4 mt-6 mb-2 text-[10px] font-bold uppercase text-gray-400 tracking-widest">General</p>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "nav-item",
                                    isActive && "active"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        );
                    })}

                    <p className="px-4 mt-10 mb-2 text-[10px] font-bold uppercase text-gray-400 tracking-widest">Protocol</p>
                    <div className="mx-2 p-4 bg-orange-50 dark:bg-orange-500/5 rounded-2xl border border-orange-100 dark:border-orange-500/10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase text-orange-600">Stock Security</span>
                            <span className="text-[10px] font-bold text-orange-600">85%</span>
                        </div>
                        <div className="w-full h-1.5 bg-orange-200 dark:bg-orange-500/20 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 w-[85%]" />
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors">
                        <UserButton appearance={{
                            elements: {
                                avatarBox: "w-9 h-9",
                            }
                        }} />
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold truncate">Admin Control</span>
                            <span className="text-[10px] font-bold text-green-600 uppercase">System Root</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-64 min-h-screen">
                <div className="max-w-6xl mx-auto p-12">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
