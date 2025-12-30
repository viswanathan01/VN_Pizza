import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuthStore } from '../hooks/useAuthStore';
import { Users, Search, Shield, CheckCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminUsers = () => {
    const { getToken, user: currentUser } = useAuthStore();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [updating, setUpdating] = useState(null);

    const ROLES = ['USER', 'CHEF', 'DELIVERY', 'ADMIN'];

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const res = await axios.get('/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleUpdate = async (userId, newRole) => {
        if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

        setUpdating(userId);
        try {
            const token = await getToken();
            await axios.patch(`/admin/users/${userId}/role`, { role: newRole }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
            toast.success("Role updated successfully");
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Failed to update role");
        } finally {
            setUpdating(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <Users className="w-10 h-10 text-orange-500" /> User Management
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Manage system access and specialized roles.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none w-64 shadow-sm font-medium"
                        />
                    </div>
                    <button
                        onClick={fetchUsers}
                        className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                    >
                        <RefreshCw className={`w-5 h-5 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                        <tr>
                            <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">User Details</th>
                            <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
                            <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Created</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {loading && users.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="py-20 text-center text-gray-400 font-bold animate-pulse">Loading Users...</td>
                            </tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="py-20 text-center text-gray-400 font-bold">No users found.</td>
                            </tr>
                        ) : (
                            filteredUsers.map(u => (
                                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 font-bold text-sm">
                                                {u.fullName?.charAt(0) || u.email.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{u.fullName}</p>
                                                <p className="text-xs text-gray-500 font-medium">{u.email}</p>
                                                <p className="text-[10px] text-gray-400 mt-1">{u._id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="relative">
                                            {updating === u._id ? (
                                                <div className="flex items-center gap-2 text-orange-500 text-xs font-bold uppercase tracking-widest animate-pulse">
                                                    <RefreshCw className="w-4 h-4 animate-spin" /> Updating...
                                                </div>
                                            ) : (
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleRoleUpdate(u._id, e.target.value)}
                                                    disabled={u.clerkUserId === currentUser?.id} // Prevent self interaction if needed, but endpoint handles safety
                                                    className={`
                                                        appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest outline-none border cursor-pointer transition-all
                                                        ${u.role === 'ADMIN' ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : ''}
                                                        ${u.role === 'CHEF' ? 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100' : ''}
                                                        ${u.role === 'DELIVERY' ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' : ''}
                                                        ${u.role === 'USER' ? 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100' : ''}
                                                        focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
                                                    `}
                                                >
                                                    {ROLES.map(r => (
                                                        <option key={r} value={r}>{r}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-500/10 text-green-600 text-[10px] font-bold uppercase tracking-widest border border-green-200 dark:border-green-500/20">
                                            <CheckCircle className="w-3 h-3" /> Active
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-bold text-gray-500">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
