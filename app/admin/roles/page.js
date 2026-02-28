'use client';
import { useState, useEffect } from 'react';
import Axios from '@/Helper/Axios';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import AlertModal from '@/components/AlertModal';

export default function AdminRoles() {
    const { user, isLoggedIn } = useUser();
    const router = useRouter();
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', permissions: [] });
    const [saving, setSaving] = useState(false);
    const [alertState, setAlertState] = useState({ open: false, title: '', message: '', type: 'success' });
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

    useEffect(() => {
        if (!isLoggedIn) return;
        if (user && !user.role_id) {
            router.push('/dashboard');
            return;
        }
        fetchData();
    }, [isLoggedIn, user, router]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rolesRes, permsRes] = await Promise.all([
                Axios.get('/admin/roles'),
                Axios.get('/admin/permissions')
            ]);
            if (rolesRes.data.status) setRoles(rolesRes.data.data);
            if (permsRes.data.status) setPermissions(permsRes.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (role) => {
        setEditingRole(role);
        setFormData({
            name: role.name,
            description: role.description || '',
            permissions: role.permissions.map(p => p.id)
        });
        setModalOpen(true);
    };

    const handleCreate = () => {
        setEditingRole(null);
        setFormData({ name: '', description: '', permissions: [] });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            let res;
            if (editingRole) {
                res = await Axios.put(`/admin/roles/${editingRole.id}`, formData);
            } else {
                res = await Axios.post('/admin/roles', formData);
            }

            if (res.data.status) {
                setAlertState({
                    open: true,
                    title: 'Success',
                    message: editingRole ? 'Role updated successfully' : 'Role created successfully',
                    type: 'success'
                });
                setModalOpen(false);
                fetchData();
            } else {
                setAlertState({
                    open: true,
                    title: 'Error',
                    message: res.data.message || 'Operation failed',
                    type: 'error'
                });
            }
        } catch (error) {
            setAlertState({
                open: true,
                title: 'Error',
                message: error.response?.data?.message || 'Operation failed',
                type: 'error'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            const res = await Axios.delete(`/admin/roles/${deleteModal.id}`);
            if (res.data.status) {
                setAlertState({
                    open: true,
                    title: 'Success',
                    message: 'Role deleted successfully',
                    type: 'success'
                });
                fetchData();
            } else {
                setAlertState({
                    open: true,
                    title: 'Error',
                    message: res.data.message || 'Failed to delete role',
                    type: 'error'
                });
            }
        } catch (error) {
            setAlertState({
                open: true,
                title: 'Error',
                message: error.response?.data?.message || 'Failed to delete role',
                type: 'error'
            });
        } finally {
            setDeleteModal({ open: false, id: null });
        }
    };

    const togglePermission = (permId) => {
        setFormData(prev => {
            const newPerms = prev.permissions.includes(permId)
                ? prev.permissions.filter(id => id !== permId)
                : [...prev.permissions, permId];
            return { ...prev, permissions: newPerms };
        });
    };

    if (loading) return <div className="p-8 text-center">Loading Roles...</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
                <button
                    onClick={handleCreate}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 font-medium"
                >
                    Create Role
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {roles.map(role => (
                            <tr key={role.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{role.description}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {role.permissions.length} permissions
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleEdit(role)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        Edit
                                    </button>
                                    {role.id !== 1 && (
                                        <button
                                            onClick={() => setDeleteModal({ open: true, id: role.id })}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setModalOpen(false)}></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full relative">
                            <form onSubmit={handleSubmit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        {editingRole ? 'Edit Role' : 'Create New Role'}
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Role Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Description</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                rows={2}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                                                {permissions.map(perm => (
                                                    <label key={perm.id} className="flex items-center space-x-2 text-sm">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.permissions.includes(perm.id)}
                                                            onChange={() => togglePermission(perm.id)}
                                                            className="rounded text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                        <span title={perm.description}>{perm.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        {saving ? 'Saving...' : 'Save Role'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setModalOpen(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <AlertModal
                isOpen={deleteModal.open}
                title="Delete Role"
                message="Are you sure you want to delete this role? This action cannot be undone."
                type="error"
                onClose={() => setDeleteModal({ open: false, id: null })}
                onConfirm={handleDelete}
                showCancel
            />

            <AlertModal
                isOpen={alertState.open}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type}
                onClose={() => setAlertState(prev => ({ ...prev, open: false }))}
            />
        </div>
    );
}
