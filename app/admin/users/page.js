'use client';
import Axios from '@/Helper/Axios';
import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';

export default function AdminUsersPage() {
    const { user, isLoggedIn } = useUser();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [updatingId, setUpdatingId] = useState(null);
    const [editModal, setEditModal] = useState({ open: false, id: null, data: { name: '', designation: '', whatsapp: '', role_id: 2, account_type: '' } });
    const [savingEdit, setSavingEdit] = useState(false);

    useEffect(() => {
        if (!isLoggedIn) {
            return;
        }
        if (user && user.role_id !== 1) {
            router.push('/dashboard');
        }
    }, [isLoggedIn, user, router]);

    const fetchUsers = async (pageParam = 1, searchParam = '') => {
        setLoading(true);
        try {
            const { data } = await Axios.get(`/admin/all-users?page=${pageParam}&search=${encodeURIComponent(searchParam)}`);
            if (data.status) {
                setUsers(data.data.data || []);
                setPage(data.data.current_page);
                setLastPage(data.data.last_page);
            }
        } catch (err) {
            console.error('Error fetching users', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoggedIn && user?.role_id === 1) {
            fetchUsers(1, '');
        }
    }, [isLoggedIn, user]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        const timeout = setTimeout(() => {
            fetchUsers(1, value);
        }, 400);
        return () => clearTimeout(timeout);
    };

    const handleUpdateUser = async (id, payload) => {
        setUpdatingId(id);
        try {
            const { data } = await Axios.post(`/admin/users/${id}`, payload);
            if (data.status) {
                setUsers(prev =>
                    prev.map(u => (u.id === id ? data.data : u))
                );
            }
        } catch (err) {
            console.error('Failed to update user', err);
        } finally {
            setUpdatingId(null);
        }
    };

    const openEdit = (u) => {
        setEditModal({
            open: true,
            id: u.id,
            data: {
                name: u.name || '',
                designation: u.designation || '',
                whatsapp: u.whatsapp || '',
                role_id: u.role_id,
                account_type: u.account_type || ''
            }
        });
    };

    const submitEdit = async () => {
        if (!editModal.id) return;
        setSavingEdit(true);
        try {
            const { data } = await Axios.post(`/admin/users/${editModal.id}`, editModal.data);
            if (data.status) {
                setUsers(prev => prev.map(u => (u.id === editModal.id ? data.data : u)));
                setEditModal({ open: false, id: null, data: { name: '', designation: '', whatsapp: '', role_id: 2, account_type: '' } });
            }
        } catch (err) {
            console.error('Failed to update user', err);
        } finally {
            setSavingEdit(false);
        }
    };

    if (!isLoggedIn || (user && user.role_id !== 1)) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                        <p className="text-sm text-gray-500">Manage registered users and their roles.</p>
                    </div>
                    <div className="w-full max-w-xs">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            value={search}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>

                <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                    <div className="min-w-full overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Account Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                            Loading users...
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                            No users found.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map(u => (
                                        <tr key={u.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900">{u.name}</div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {u.email}
                                            </td>
                                            <td className="px-4 py-3">
                                                <select
                                                    className="border-gray-300 rounded-md text-xs px-2 py-1"
                                                    value={u.account_type || ''}
                                                    onChange={(e) => handleUpdateUser(u.id, { account_type: e.target.value || null })}
                                                    disabled={updatingId === u.id}
                                                >
                                                    <option value="">Not set</option>
                                                    <option value="submitter">Submitter</option>
                                                    <option value="voter">Voter</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">
                                                <select
                                                    className="border-gray-300 rounded-md text-xs px-2 py-1"
                                                    value={u.role_id}
                                                    onChange={(e) => handleUpdateUser(u.id, { role_id: Number(e.target.value) })}
                                                    disabled={updatingId === u.id}
                                                >
                                                    <option value={1}>Admin</option>
                                                    <option value={2}>User</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => openEdit(u)}
                                                        className="px-3 py-1.5 rounded-md text-sm font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                                                    >
                                                        Edit
                                                    </button>
                                                    {updatingId === u.id && (
                                                        <span className="text-xs text-gray-500">Saving...</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {lastPage > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100">
                            <button
                                onClick={() => {
                                    if (page > 1) {
                                        const newPage = page - 1;
                                        fetchUsers(newPage, search);
                                    }
                                }}
                                disabled={page === 1 || loading}
                                className="px-3 py-1.5 text-xs rounded-md border bg-white text-gray-700 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="text-xs text-gray-500">
                                Page {page} of {lastPage}
                            </span>
                            <button
                                onClick={() => {
                                    if (page < lastPage) {
                                        const newPage = page + 1;
                                        fetchUsers(newPage, search);
                                    }
                                }}
                                disabled={page === lastPage || loading}
                                className="px-3 py-1.5 text-xs rounded-md border bg-white text-gray-700 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>

                {editModal.open && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit User</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        value={editModal.data.name}
                                        onChange={(e) => setEditModal(prev => ({ ...prev, data: { ...prev.data, name: e.target.value } }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        value={editModal.data.role_id}
                                        onChange={(e) => setEditModal(prev => ({ ...prev, data: { ...prev.data, role_id: Number(e.target.value) } }))}
                                    >
                                        <option value={1}>Admin</option>
                                        <option value={2}>User</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        value={editModal.data.account_type || ''}
                                        onChange={(e) => setEditModal(prev => ({ ...prev, data: { ...prev.data, account_type: e.target.value || '' } }))}
                                    >
                                        <option value="">Not set</option>
                                        <option value="submitter">Submitter</option>
                                        <option value="voter">Voter</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        value={editModal.data.designation}
                                        onChange={(e) => setEditModal(prev => ({ ...prev, data: { ...prev.data, designation: e.target.value } }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                                    <input
                                        type="tel"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        value={editModal.data.whatsapp}
                                        onChange={(e) => setEditModal(prev => ({ ...prev, data: { ...prev.data, whatsapp: e.target.value } }))}
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-2">
                                <button
                                    onClick={() => setEditModal({ open: false, id: null, data: { name: '', designation: '', whatsapp: '', role_id: 2, account_type: '' } })}
                                    className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    disabled={savingEdit}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitEdit}
                                    className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-70"
                                    disabled={savingEdit}
                                >
                                    {savingEdit ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
