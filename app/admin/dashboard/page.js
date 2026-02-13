'use client';
import Axios from '@/Helper/Axios';
import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function AdminDashboard() {
    const { user, isLoggedIn } = useUser();
    const router = useRouter();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [actionLoading, setActionLoading] = useState(null); // id of profile being processed
    const [rejectModal, setRejectModal] = useState({ open: false, id: null, reason: '' });
    const [confirmModal, setConfirmModal] = useState({ 
        open: false, 
        title: '', 
        message: '', 
        onConfirm: () => {},
        confirmColor: 'indigo' 
    });
    const [editModal, setEditModal] = useState({ 
        open: false, 
        id: null, 
        data: {
            organization_name: '',
            summary: '',
            why_win: '',
            how_help: '',
            website_url: ''
        }
    });
    
    // Add Profile State
    const [addModal, setAddModal] = useState({ open: false });
    const [userSearch, setUserSearch] = useState('');
    const [userResults, setUserResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [addData, setAddData] = useState({
        organization_name: '',
        summary: '',
        why_win: '',
        how_help: '',
        website_url: ''
    });
    const [addLogo, setAddLogo] = useState(null);

    // Redirect if not admin
    useEffect(() => {
        if (!isLoggedIn) {
            // router.push('/auth/login'); // Handled by context usually, but good fallback
        } else if (user && user.role_id !== 1) {
            router.push('/dashboard');
        }
    }, [isLoggedIn, user, router]);

    const fetchProfiles = async () => {
        setLoading(true);
        try {
            const { data } = await Axios.get(`/admin/profiles?status=${statusFilter}`);
            if (data.status) {
                setProfiles(data.data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role_id === 1) {
            fetchProfiles();
        }
    }, [statusFilter, user]);

    const handleApprove = (id) => {
        setConfirmModal({
            open: true,
            title: 'Approve Profile',
            message: 'Are you sure you want to approve this profile? It will be visible on the leaderboard.',
            confirmColor: 'green',
            onConfirm: async () => {
                setActionLoading(id);
                try {
                    const { data } = await Axios.post(`/admin/profiles/${id}/approve`);
                    if (data.status) {
                        fetchProfiles(); // Refresh list
                    }
                } catch (err) {
                    console.error(err);
                    alert('Failed to approve profile');
                } finally {
                    setActionLoading(null);
                    setConfirmModal(prev => ({ ...prev, open: false }));
                }
            }
        });
    };

    const handleReject = async () => {
        if (!rejectModal.reason) return alert('Please provide a reason');
        
        setActionLoading(rejectModal.id);
        try {
            const { data } = await Axios.post(`/admin/profiles/${rejectModal.id}/reject`, {
                reason: rejectModal.reason
            });
            if (data.status) {
                setRejectModal({ open: false, id: null, reason: '' });
                fetchProfiles();
            }
        } catch (err) {
            console.error(err);
            alert('Failed to reject profile');
        } finally {
            setActionLoading(null);
        }
    };

    const openEditModal = (profile) => {
        setEditModal({
            open: true,
            id: profile.id,
            data: {
                organization_name: profile.organization_name || '',
                summary: profile.summary || '',
                why_win: profile.why_win || '',
                how_help: profile.how_help || '',
                website_url: profile.website_url || ''
            }
        });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setConfirmModal({
            open: true,
            title: 'Update Profile',
            message: 'Are you sure you want to save changes to this profile?',
            confirmColor: 'indigo',
            onConfirm: async () => {
                setActionLoading(editModal.id);
                try {
                    const { data } = await Axios.post(`/admin/profiles/${editModal.id}/update`, editModal.data);
                    if (data.status) {
                        setEditModal({ ...editModal, open: false });
                        fetchProfiles();
                    }
                } catch (err) {
                    console.error(err);
                    alert('Failed to update profile');
                } finally {
                    setActionLoading(null);
                    setConfirmModal(prev => ({ ...prev, open: false }));
                }
            }
        });
    };

    // Add Profile Logic
    useEffect(() => {
        const fetchUsers = async () => {
            if (addModal.open) {
                try {
                    const { data } = await Axios.get(`/admin/users?search=${userSearch}`);
                    if (data.status) {
                        setUserResults(data.data);
                    }
                } catch (err) {
                    console.error("Error fetching users", err);
                }
            }
        };

        const timeoutId = setTimeout(() => {
            if (addModal.open) fetchUsers();
        }, 500); // Debounce

        return () => clearTimeout(timeoutId);
    }, [userSearch, addModal.open]);

    const handleAddProfile = async (e) => {
        e.preventDefault();
        if (!selectedUser) return alert('Please select a user first');
        if (!addLogo) return alert('Please upload a logo');

        const formData = new FormData();
        formData.append('user_id', selectedUser.id);
        formData.append('organization_name', addData.organization_name);
        formData.append('summary', addData.summary);
        formData.append('why_win', addData.why_win);
        formData.append('how_help', addData.how_help);
        if (addData.website_url) formData.append('website_url', addData.website_url);
        formData.append('logo', addLogo);

        setLoading(true);
        try {
            const { data } = await Axios.post('/admin/profiles', formData);
            if (data.status) {
                setAddModal({ open: false });
                fetchProfiles();
                alert('Profile created successfully');
                // Reset form
                setSelectedUser(null);
                setAddData({
                    organization_name: '',
                    summary: '',
                    why_win: '',
                    how_help: '',
                    website_url: ''
                });
                setAddLogo(null);
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to create profile');
        } finally {
            setLoading(false);
        }
    };

    if (!user || user.role_id !== 1) {
        return <div className="p-8 text-center">Loading Admin Panel...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <button 
                    onClick={() => setAddModal({ open: true })}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 font-medium"
                >
                    Add Profile
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-gray-200 mb-8">
                {['pending', 'approved', 'rejected'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`py-4 px-6 font-medium text-sm focus:outline-none capitalize ${
                            statusFilter === status
                                ? 'border-b-2 border-indigo-500 text-indigo-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {status} Profiles
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : profiles.length > 0 ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <ul className="divide-y divide-gray-200">
                        {profiles.map((profile) => (
                            <li key={profile.id} className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {profile.organization_name}
                                        </h3>
                                        <p className="text-sm text-gray-500">Submitted by: {profile.user?.name} ({profile.user?.email})</p>
                                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{profile.summary}</p>
                                        {profile.rejection_reason && (
                                            <p className="mt-2 text-sm text-red-600 font-medium">Reason: {profile.rejection_reason}</p>
                                        )}
                                        <div className="mt-2">
                                            <a 
                                                href={`/profiles/${profile.id}`} // Assuming public view works for admin or we create admin view
                                                target="_blank" 
                                                className="text-indigo-600 text-sm hover:underline"
                                            >
                                                View Full Profile (Public Preview)
                                            </a>
                                        </div>
                                    </div>
                                    <div className="ml-4 flex items-center space-x-4">
                                        {statusFilter === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => openEditModal(profile)}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(profile.id)}
                                                    disabled={actionLoading === profile.id}
                                                    className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => setRejectModal({ open: true, id: profile.id, reason: '' })}
                                                    disabled={actionLoading === profile.id}
                                                    className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {statusFilter === 'rejected' && (
                                            <button
                                                onClick={() => handleApprove(profile.id)} // Allow re-approving
                                                disabled={actionLoading === profile.id}
                                                className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                                            >
                                                Approve
                                            </button>
                                        )}
                                        {statusFilter === 'approved' && (
                                            <>
                                                <button
                                                    onClick={() => openEditModal(profile)}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setRejectModal({ open: true, id: profile.id, reason: '' })}
                                                    disabled={actionLoading === profile.id}
                                                    className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    No {statusFilter} profiles found.
                </div>
            )}

            {/* Reject Modal */}
            {rejectModal.open && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Reject Profile</h3>
                        <textarea
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                            rows="4"
                            placeholder="Reason for rejection..."
                            value={rejectModal.reason}
                            onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                        ></textarea>
                        <div className="mt-4 flex justify-end space-x-3">
                            <button
                                onClick={() => setRejectModal({ open: false, id: null, reason: '' })}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editModal.open && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Profile</h3>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                                <input 
                                    type="text" 
                                    value={editModal.data.organization_name}
                                    onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, organization_name: e.target.value } })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Summary</label>
                                <textarea 
                                    value={editModal.data.summary}
                                    onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, summary: e.target.value } })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-24"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Why Win</label>
                                <textarea 
                                    value={editModal.data.why_win}
                                    onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, why_win: e.target.value } })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-24"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">How Help</label>
                                <textarea 
                                    value={editModal.data.how_help}
                                    onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, how_help: e.target.value } })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-24"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Website URL</label>
                                <input 
                                    type="url" 
                                    value={editModal.data.website_url}
                                    onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, website_url: e.target.value } })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
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
                                    Update Profile
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Profile Modal */}
            {addModal.open && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Add Organization Profile</h3>
                        <form onSubmit={handleAddProfile} className="space-y-4">
                            {/* User Selection */}
                            <div className="border-b pb-4 mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select User</label>
                                {selectedUser ? (
                                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
                                        <div>
                                            <p className="font-bold">{selectedUser.name}</p>
                                            <p className="text-sm text-gray-500">{selectedUser.email}</p>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => setSelectedUser(null)}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                        >
                                            Change
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <input 
                                            type="text" 
                                            placeholder="Search user by name or email..." 
                                            value={userSearch}
                                            onChange={(e) => setUserSearch(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 mb-2"
                                        />
                                        <div className="max-h-40 overflow-y-auto border border-gray-200 rounded">
                                            {userResults.length > 0 ? (
                                                userResults.map(u => (
                                                    <div 
                                                        key={u.id} 
                                                        onClick={() => setSelectedUser(u)}
                                                        className="p-2 hover:bg-indigo-50 cursor-pointer border-b last:border-b-0"
                                                    >
                                                        <p className="font-medium">{u.name}</p>
                                                        <p className="text-xs text-gray-500">{u.email}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-2 text-gray-500 text-sm">No users found</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {selectedUser && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                                        <input 
                                            type="text" 
                                            value={addData.organization_name}
                                            onChange={(e) => setAddData({ ...addData, organization_name: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Logo</label>
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={(e) => setAddLogo(e.target.files[0])}
                                            className="mt-1 block w-full"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Summary</label>
                                        <textarea 
                                            value={addData.summary}
                                            onChange={(e) => setAddData({ ...addData, summary: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-24"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Why Win</label>
                                        <textarea 
                                            value={addData.why_win}
                                            onChange={(e) => setAddData({ ...addData, why_win: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-24"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">How Help</label>
                                        <textarea 
                                            value={addData.how_help}
                                            onChange={(e) => setAddData({ ...addData, how_help: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-24"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Website URL</label>
                                        <input 
                                            type="url" 
                                            value={addData.website_url}
                                            onChange={(e) => setAddData({ ...addData, website_url: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        />
                                    </div>
                                </>
                            )}

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
                                    disabled={!selectedUser}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    Create Profile
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmModal.open}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal({ ...confirmModal, open: false })}
                confirmColor={confirmModal.confirmColor}
            />
        </div>
    );
}