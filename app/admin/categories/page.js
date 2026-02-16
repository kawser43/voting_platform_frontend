'use client';
import Axios from '@/Helper/Axios';
import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '@/components/ConfirmationModal';
import AlertModal from '@/components/AlertModal';

export default function CategoriesPage() {
    const { user, isLoggedIn } = useUser();
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [addModal, setAddModal] = useState({ open: false });
    const [editModal, setEditModal] = useState({ open: false, id: null, data: { name: '', is_active: true } });
    const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: () => {}, confirmColor: 'red' });
    const [alertModal, setAlertModal] = useState({ open: false, title: '', message: '', type: 'info' });
    const [formData, setFormData] = useState({
        name: '',
        is_active: true,
    });

    useEffect(() => {
        if (!isLoggedIn) {
        } else if (user && user.role_id !== 1) {
            router.push('/dashboard');
        }
    }, [isLoggedIn, user, router]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const { data } = await Axios.get('/admin/categories');
            if (data.status) {
                setCategories(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role_id === 1) {
            fetchCategories();
        }
    }, [user]);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                is_active: formData.is_active,
            };
            const { data } = await Axios.post('/admin/categories', payload);
            if (data.status) {
                setAddModal({ open: false });
                setFormData({ name: '', is_active: true });
                fetchCategories();
                setAlertModal({ open: true, title: 'Success', message: 'Category added successfully', type: 'success' });
            }
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.message || 'Failed to add category';
            setAlertModal({ open: true, title: 'Error', message: errorMessage, type: 'error' });
        }
    };

    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: editModal.data.name,
                is_active: editModal.data.is_active,
            };
            const { data } = await Axios.post(`/admin/categories/${editModal.id}`, payload);
            if (data.status) {
                setEditModal({ open: false, id: null, data: { name: '', is_active: true } });
                fetchCategories();
                setAlertModal({ open: true, title: 'Success', message: 'Category updated successfully', type: 'success' });
            }
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.message || 'Failed to update category';
            setAlertModal({ open: true, title: 'Error', message: errorMessage, type: 'error' });
        }
    };

    const handleDeleteCategory = (id) => {
        setConfirmModal({
            open: true,
            title: 'Delete Category',
            message: 'Are you sure you want to delete this category?',
            confirmColor: 'red',
            onConfirm: async () => {
                setActionLoading(id);
                try {
                    const { data } = await Axios.delete(`/admin/categories/${id}`);
                    if (data.status) {
                        fetchCategories();
                        setAlertModal({ open: true, title: 'Success', message: 'Category deleted successfully', type: 'success' });
                    }
                } catch (err) {
                    console.error(err);
                    const errorMessage = err.response?.data?.message || 'Failed to delete category';
                    setAlertModal({ open: true, title: 'Error', message: errorMessage, type: 'error' });
                } finally {
                    setActionLoading(null);
                    setConfirmModal(prev => ({ ...prev, open: false }));
                }
            }
        });
    };

    if (!user || user.role_id !== 1) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Manage Categories</h1>
                <button
                    onClick={() => setAddModal({ open: true })}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 font-medium"
                >
                    Add Category
                </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
                These categories appear in the campaign submission form. Toggle visibility by activating or deactivating them.
            </p>

            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : categories.length > 0 ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <ul className="divide-y divide-gray-200">
                        {categories.map((category) => (
                            <li key={category.id} className="p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                category.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {category.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Slug: {category.slug}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setEditModal({ open: true, id: category.id, data: { name: category.name, is_active: category.is_active } })}
                                            className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCategory(category.id)}
                                            disabled={actionLoading === category.id}
                                            className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    No categories found.
                </div>
            )}

            {addModal.open && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Add Category</h3>
                        <form onSubmit={handleAddCategory} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    required
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="add-is-active"
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                />
                                <label htmlFor="add-is-active" className="ml-2 block text-sm text-gray-700">
                                    Active
                                </label>
                            </div>
                            <div className="mt-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setAddModal({ open: false })}
                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                                >
                                    Add Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editModal.open && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Category</h3>
                        <form onSubmit={handleUpdateCategory} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    value={editModal.data.name}
                                    onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, name: e.target.value } })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    required
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="edit-is-active"
                                    type="checkbox"
                                    checked={editModal.data.is_active}
                                    onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, is_active: e.target.checked } })}
                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                />
                                <label htmlFor="edit-is-active" className="ml-2 block text-sm text-gray-700">
                                    Active
                                </label>
                            </div>
                            <div className="mt-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setEditModal({ ...editModal, open: false })}
                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={confirmModal.open}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmColor={confirmModal.confirmColor}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, open: false }))}
            />

            <AlertModal
                isOpen={alertModal.open}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
                onClose={() => setAlertModal(prev => ({ ...prev, open: false }))}
            />
        </div>
    );
}

