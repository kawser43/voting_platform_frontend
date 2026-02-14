'use client';
import Axios from '@/Helper/Axios';
import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '@/components/ConfirmationModal';
import AlertModal from '@/components/AlertModal';

export default function JudgesPage() {
    const { user, isLoggedIn } = useUser();
    const router = useRouter();
    const [judges, setJudges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [addModal, setAddModal] = useState({ open: false });
    const [editModal, setEditModal] = useState({ open: false, id: null, data: { name: '', designation: '' } });
    const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: () => {}, confirmColor: 'red' });
    const [alertModal, setAlertModal] = useState({ open: false, title: '', message: '', type: 'info' });
    const [formData, setFormData] = useState({
        name: '',
        designation: '',
    });
    const [profilePicture, setProfilePicture] = useState(null);

    useEffect(() => {
        if (!isLoggedIn) {
            // router.push('/auth/login');
        } else if (user && user.role_id !== 1) {
            router.push('/dashboard');
        }
    }, [isLoggedIn, user, router]);

    const fetchJudges = async () => {
        setLoading(true);
        try {
            const { data } = await Axios.get('/admin/judges');
            if (data.status) {
                setJudges(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role_id === 1) {
            fetchJudges();
        }
    }, [user]);

    const handleAddJudge = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        data.append('designation', formData.designation);
        if (profilePicture) {
            data.append('profile_picture', profilePicture);
        }

        try {
            const { data: response } = await Axios.post('/admin/judges', data);
            if (response.status) {
                setAddModal({ open: false });
                setFormData({ name: '', designation: '' });
                setProfilePicture(null);
                fetchJudges();
                setAlertModal({ open: true, title: 'Success', message: 'Judge added successfully', type: 'success' });
            }
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.message || 'Failed to add judge';
            setAlertModal({ open: true, title: 'Error', message: errorMessage, type: 'error' });
        }
    };

    const handleUpdateJudge = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', editModal.data.name);
        data.append('designation', editModal.data.designation);
        if (profilePicture) {
            data.append('profile_picture', profilePicture);
        }

        try {
            const { data: response } = await Axios.post(`/admin/judges/${editModal.id}`, data);
            if (response.status) {
                setEditModal({ open: false, id: null, data: { name: '', designation: '' } });
                setProfilePicture(null);
                fetchJudges();
                setAlertModal({ open: true, title: 'Success', message: 'Judge updated successfully', type: 'success' });
            }
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.message || 'Failed to update judge';
            setAlertModal({ open: true, title: 'Error', message: errorMessage, type: 'error' });
        }
    };

    const handleDeleteJudge = (id) => {
        setConfirmModal({
            open: true,
            title: 'Delete Judge',
            message: 'Are you sure you want to delete this judge?',
            confirmColor: 'red',
            onConfirm: async () => {
                setActionLoading(id);
                try {
                    const { data } = await Axios.delete(`/admin/judges/${id}`);
                    if (data.status) {
                        fetchJudges();
                        setAlertModal({ open: true, title: 'Success', message: 'Judge deleted successfully', type: 'success' });
                    }
                } catch (err) {
                    console.error(err);
                    const errorMessage = err.response?.data?.message || 'Failed to delete judge';
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
                <h1 className="text-3xl font-bold text-gray-900">Manage Judges</h1>
                <button 
                    onClick={() => setAddModal({ open: true })}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 font-medium"
                >
                    Add Judge
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : judges.length > 0 ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <ul className="divide-y divide-gray-200">
                        {judges.map((judge) => (
                            <li key={judge.id} className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        {judge.profile_picture ? (
                                            <img className="h-12 w-12 rounded-full object-cover mr-4" src={judge.profile_picture} alt={judge.name} />
                                        ) : (
                                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                                                <span className="text-gray-500 text-sm">N/A</span>
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">{judge.name}</h3>
                                            <p className="text-sm text-gray-500">{judge.designation}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setEditModal({ open: true, id: judge.id, data: { name: judge.name, designation: judge.designation } })}
                                            className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteJudge(judge.id)}
                                            disabled={actionLoading === judge.id}
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
                    No judges found.
                </div>
            )}

            {/* Add Modal */}
            {addModal.open && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Add Judge</h3>
                        <form onSubmit={handleAddJudge} className="space-y-4">
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
                                <label className="block text-sm font-medium text-gray-700">Designation</label>
                                <input 
                                    type="text" 
                                    value={formData.designation}
                                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => setProfilePicture(e.target.files[0])}
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
                                    Add Judge
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
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Judge</h3>
                        <form onSubmit={handleUpdateJudge} className="space-y-4">
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
                                <label className="block text-sm font-medium text-gray-700">Designation</label>
                                <input 
                                    type="text" 
                                    value={editModal.data.designation}
                                    onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, designation: e.target.value } })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Profile Picture (Leave empty to keep current)</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => setProfilePicture(e.target.files[0])}
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
                                    Update Judge
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
