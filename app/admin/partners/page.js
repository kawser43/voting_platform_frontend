'use client';
import Axios from '@/Helper/Axios';
import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '@/components/ConfirmationModal';
import AlertModal from '@/components/AlertModal';

export default function PartnersPage() {
    const { user, isLoggedIn } = useUser();
    const router = useRouter();
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [addModal, setAddModal] = useState({ open: false });
    const [editModal, setEditModal] = useState({ open: false, id: null, data: { name: '' } });
    const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: () => {}, confirmColor: 'red' });
    const [alertModal, setAlertModal] = useState({ open: false, title: '', message: '', type: 'info' });
    const [formData, setFormData] = useState({
        name: '',
    });
    const [logo, setLogo] = useState(null);

    useEffect(() => {
        if (!isLoggedIn) {
            // router.push('/auth/login');
        } else if (user && user.role_id !== 1) {
            router.push('/dashboard');
        }
    }, [isLoggedIn, user, router]);

    const fetchPartners = async () => {
        setLoading(true);
        try {
            const { data } = await Axios.get('/admin/partners');
            if (data.status) {
                setPartners(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role_id === 1) {
            fetchPartners();
        }
    }, [user]);

    const handleAddPartner = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        if (logo) {
            data.append('logo', logo);
        }

        try {
            const { data: response } = await Axios.post('/admin/partners', data);
            if (response.status) {
                setAddModal({ open: false });
                setFormData({ name: '' });
                setLogo(null);
                fetchPartners();
                setAlertModal({ open: true, title: 'Success', message: 'Partner added successfully', type: 'success' });
            }
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.message || 'Failed to add partner';
            setAlertModal({ open: true, title: 'Error', message: errorMessage, type: 'error' });
        }
    };

    const handleUpdatePartner = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', editModal.data.name);
        if (logo) {
            data.append('logo', logo);
        }

        try {
            const { data: response } = await Axios.post(`/admin/partners/${editModal.id}`, data);
            if (response.status) {
                setEditModal({ open: false, id: null, data: { name: '' } });
                setLogo(null);
                fetchPartners();
                setAlertModal({ open: true, title: 'Success', message: 'Partner updated successfully', type: 'success' });
            }
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.message || 'Failed to update partner';
            setAlertModal({ open: true, title: 'Error', message: errorMessage, type: 'error' });
        }
    };

    const handleDeletePartner = (id) => {
        setConfirmModal({
            open: true,
            title: 'Delete Partner',
            message: 'Are you sure you want to delete this partner?',
            confirmColor: 'red',
            onConfirm: async () => {
                setActionLoading(id);
                try {
                    const { data } = await Axios.delete(`/admin/partners/${id}`);
                    if (data.status) {
                        fetchPartners();
                        setAlertModal({ open: true, title: 'Success', message: 'Partner deleted successfully', type: 'success' });
                    }
                } catch (err) {
                    console.error(err);
                    const errorMessage = err.response?.data?.message || 'Failed to delete partner';
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Manage Partners</h1>
                <button 
                    onClick={() => setAddModal({ open: true })}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 font-medium"
                >
                    Add Partner
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : partners.length > 0 ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <ul className="divide-y divide-gray-200">
                        {partners.map((partner) => (
                            <li key={partner.id} className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        {partner.logo ? (
                                            <img className="h-12 w-12 rounded-full object-cover mr-4" src={partner.logo} alt={partner.name} />
                                        ) : (
                                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                                                <span className="text-gray-500 text-sm">N/A</span>
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">{partner.name}</h3>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setEditModal({ open: true, id: partner.id, data: { name: partner.name } })}
                                            className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeletePartner(partner.id)}
                                            disabled={actionLoading === partner.id}
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
                    No partners found.
                </div>
            )}

            {/* Add Modal */}
            {addModal.open && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Add Partner</h3>
                        <form onSubmit={handleAddPartner} className="space-y-4">
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Logo</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => setLogo(e.target.files[0])}
                                    className="mt-1 block w-full text-sm text-gray-500 cursor-pointer file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
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
                                    Add Partner
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editModal.open && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Partner</h3>
                        <form onSubmit={handleUpdatePartner} className="space-y-4">
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Logo (Leave empty to keep current)</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => setLogo(e.target.files[0])}
                                    className="mt-1 block w-full text-sm text-gray-500 cursor-pointer file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
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
                                    Update Partner
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmationModal 
                isOpen={confirmModal.open}
                onClose={() => setConfirmModal({ ...confirmModal, open: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmColor={confirmModal.confirmColor}
            />

            <AlertModal 
                isOpen={alertModal.open}
                onClose={() => setAlertModal({ ...alertModal, open: false })}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />
        </div>
    );
}
