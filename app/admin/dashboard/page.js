'use client';
import Axios from '@/Helper/Axios';
import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter, useSearchParams } from 'next/navigation';
import ConfirmationModal from '@/components/ConfirmationModal';
import SearchableSelect from '@/components/inputs/SearchableSelect';
import RichTextLimited from '@/components/inputs/RichTextLimited';
import AlertModal from '@/components/AlertModal';

export default function AdminDashboard() {
    const { user, isLoggedIn } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [actionLoading, setActionLoading] = useState(null);
    const [rejectModal, setRejectModal] = useState({ open: false, id: null, reason: '' });
    const [confirmModal, setConfirmModal] = useState({ 
        open: false, 
        title: '', 
        message: '', 
        onConfirm: () => {},
        confirmColor: 'indigo' 
    });
    const [alertState, setAlertState] = useState({
        open: false,
        title: '',
        message: '',
        type: 'error'
    });
    const [editModal, setEditModal] = useState({ 
        open: false, 
        id: null, 
        data: {
            organization_name: '',
            country: '',
            category_id: '',
            summary: '',
            why_win: '',
            how_help: '',
            website_url: '',
            founder_video_url: '',
            facebook: '',
            twitter: '',
            linkedin: '',
            instagram: ''
        }
    });
    const [editLogo, setEditLogo] = useState(null);
    const [editPitchDeck, setEditPitchDeck] = useState(null);
    const [editSubmitting, setEditSubmitting] = useState(false);
    
    const [addModal, setAddModal] = useState({ open: false });
    const [userSearch, setUserSearch] = useState('');
    const [userResults, setUserResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [addData, setAddData] = useState({
        organization_name: '',
        country: '',
        category_id: '',
        summary: '',
        why_win: '',
        how_help: '',
        website_url: '',
        founder_video_url: '',
        facebook: '',
        twitter: '',
        linkedin: '',
        instagram: ''
    });
    const [addLogo, setAddLogo] = useState(null);
    const [addPitchDeck, setAddPitchDeck] = useState(null);
    const [addSubmitting, setAddSubmitting] = useState(false);
    const [countries, setCountries] = useState([]);
    const [categories, setCategories] = useState([]);

    // Redirect if not admin
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const { data } = await Axios.get('/countries');
                if (data.status) setCountries(data.data || []);
            } catch (err) {
                console.error('Failed to load countries', err);
            }
        };
        const fetchCategories = async () => {
            try {
                const { data } = await Axios.get('/admin/categories');
                if (data.status) setCategories(data.data || []);
            } catch (err) {
                console.error('Failed to load categories', err);
            }
        };
        fetchCountries();
        fetchCategories();
        if (!isLoggedIn) {
        } else if (user && user.role_id !== 1) {
            router.push('/dashboard');
        }
    }, [isLoggedIn, user, router]);

    useEffect(() => {
        const statusFromUrl = searchParams.get('status') || 'pending';
        const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
        const allowedStatuses = ['pending', 'approved', 'rejected'];
        const normalizedStatus = allowedStatuses.includes(statusFromUrl) ? statusFromUrl : 'pending';
        const normalizedPage = Number.isNaN(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl;
        setStatusFilter(normalizedStatus);
        setPage(normalizedPage);
    }, [searchParams]);

    const fetchProfiles = async (statusParam = statusFilter, pageParam = page) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusParam) {
                params.set('status', statusParam);
            }
            if (pageParam && pageParam > 1) {
                params.set('page', String(pageParam));
            }
            const query = params.toString();
            const url = query ? `/admin/profiles?${query}` : '/admin/profiles';
            const { data } = await Axios.get(url);
            if (data.status) {
                const paginated = data.data;
                setProfiles(paginated.data || []);
                setPage(paginated.current_page || 1);
                setLastPage(paginated.last_page || 1);
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
    }, [statusFilter, page, user]);

    const handleStatusTabClick = (status) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('status', status);
        params.delete('page');
        const query = params.toString();
        router.push(query ? `/admin/dashboard?${query}` : '/admin/dashboard');
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage === page) return;
        const params = new URLSearchParams(searchParams.toString());
        if (newPage <= 1) {
            params.delete('page');
        } else {
            params.set('page', String(newPage));
        }
        const query = params.toString();
        router.push(query ? `/admin/dashboard?${query}` : '/admin/dashboard');
    };

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
                    setAlertState({
                        open: true,
                        title: 'Approval Failed',
                        message: err.response?.data?.message || 'Failed to approve profile',
                        type: 'error'
                    });
                } finally {
                    setActionLoading(null);
                    setConfirmModal(prev => ({ ...prev, open: false }));
                }
            }
        });
    };

    const handleReject = async () => {
        if (!rejectModal.reason) {
            setAlertState({
                open: true,
                title: 'Reason Required',
                message: 'Please provide a reason for rejection.',
                type: 'error'
            });
            return;
        }
        
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
            setAlertState({
                open: true,
                title: 'Rejection Failed',
                message: err.response?.data?.message || 'Failed to reject profile',
                type: 'error'
            });
        } finally {
            setActionLoading(null);
        }
    };

    const openEditModal = (profile) => {
        setEditLogo(null);
        setEditPitchDeck(null);
        setEditModal({
            open: true,
            id: profile.id,
            data: {
                organization_name: profile.organization_name || '',
                country: profile.country || '',
                category_id: profile.category_id || '',
                summary: profile.summary || '',
                why_win: profile.why_win || '',
                how_help: profile.how_help || '',
                website_url: profile.website_url || '',
                founder_video_url: profile.founder_video_url || '',
                facebook: (profile.social_links && profile.social_links.facebook) || '',
                twitter: (profile.social_links && profile.social_links.twitter) || '',
                linkedin: (profile.social_links && profile.social_links.linkedin) || '',
                instagram: (profile.social_links && profile.social_links.instagram) || ''
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
                setEditSubmitting(true);
                try {
                    const formData = new FormData();
                    formData.append('organization_name', editModal.data.organization_name);
                    formData.append('summary', editModal.data.summary);
                    if (editModal.data.country) formData.append('country', editModal.data.country);
                    if (editModal.data.category_id) formData.append('category_id', editModal.data.category_id);
                    formData.append('why_win', editModal.data.why_win);
                    formData.append('how_help', editModal.data.how_help);
                    if (editModal.data.website_url) formData.append('website_url', editModal.data.website_url);
                    if (editModal.data.founder_video_url) formData.append('founder_video_url', editModal.data.founder_video_url);
                    const socialLinks = {
                        facebook: editModal.data.facebook || '',
                        twitter: editModal.data.twitter || '',
                        linkedin: editModal.data.linkedin || '',
                        instagram: editModal.data.instagram || ''
                    };
                    formData.append('social_links', JSON.stringify(socialLinks));
                    if (editLogo) {
                        formData.append('logo', editLogo);
                    }
                    if (editPitchDeck) {
                        formData.append('pitch_deck', editPitchDeck);
                    }

                    const { data } = await Axios.post(`/admin/profiles/${editModal.id}/update`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });

                    if (data.status) {
                        setEditModal({ ...editModal, open: false });
                        setEditLogo(null);
                        fetchProfiles();
                    }
                } catch (err) {
                    console.error(err);
                    setAlertState({
                        open: true,
                        title: 'Update Failed',
                        message: err.response?.data?.message || 'Failed to update profile',
                        type: 'error'
                    });
                } finally {
                    setActionLoading(null);
                    setEditSubmitting(false);
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
        if (!selectedUser) {
            setAlertState({
                open: true,
                title: 'User Required',
                message: 'Please select a user first.',
                type: 'error'
            });
            return;
        }
        if (!addLogo) {
            setAlertState({
                open: true,
                title: 'Logo Required',
                message: 'Please upload a logo.',
                type: 'error'
            });
            return;
        }

        const formData = new FormData();
        formData.append('user_id', selectedUser.id);
        formData.append('organization_name', addData.organization_name);
        if (addData.country) formData.append('country', addData.country);
        if (addData.category_id) formData.append('category_id', addData.category_id);
        formData.append('summary', addData.summary);
        formData.append('why_win', addData.why_win);
        formData.append('how_help', addData.how_help);
        if (addData.website_url) formData.append('website_url', addData.website_url);
        if (addData.founder_video_url) formData.append('founder_video_url', addData.founder_video_url);
        const socialLinks = {
            facebook: addData.facebook || '',
            twitter: addData.twitter || '',
            linkedin: addData.linkedin || '',
            instagram: addData.instagram || ''
        };
        formData.append('social_links', JSON.stringify(socialLinks));
        formData.append('logo', addLogo);
        if (addPitchDeck) {
            formData.append('pitch_deck', addPitchDeck);
        }

        setAddSubmitting(true);
        try {
            const { data } = await Axios.post('/admin/profiles', formData);
            if (data.status) {
                setAddModal({ open: false });
                fetchProfiles();
                setAlertState({
                    open: true,
                    title: 'Profile Created',
                    message: 'The profile has been created successfully.',
                    type: 'success'
                });
                // Reset form
                setSelectedUser(null);
                setAddData({
                    organization_name: '',
                    country: '',
                    category_id: '',
                    summary: '',
                    why_win: '',
                    how_help: '',
                    website_url: '',
                    founder_video_url: '',
                    facebook: '',
                    twitter: '',
                    linkedin: '',
                    instagram: ''
                });
                setAddLogo(null);
            }
        } catch (err) {
            console.error(err);
            setAlertState({
                open: true,
                title: 'Creation Failed',
                message: err.response?.data?.message || 'Failed to create profile',
                type: 'error'
            });
        } finally {
            setAddSubmitting(false);
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
                        onClick={() => handleStatusTabClick(status)}
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
                                    <div className="ml-4 flex items-center space-x-2">
                                        {statusFilter === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => openEditModal(profile)}
                                                    className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(profile.id)}
                                                    disabled={actionLoading === profile.id}
                                                    className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => setRejectModal({ open: true, id: profile.id, reason: '' })}
                                                    disabled={actionLoading === profile.id}
                                                    className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {statusFilter === 'rejected' && (
                                            <button
                                                onClick={() => handleApprove(profile.id)} // Allow re-approving
                                                disabled={actionLoading === profile.id}
                                                className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                                            >
                                                Approve
                                            </button>
                                        )}
                                        {statusFilter === 'approved' && (
                                            <>
                                                <button
                                                    onClick={() => openEditModal(profile)}
                                                    className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setRejectModal({ open: true, id: profile.id, reason: '' })}
                                                    disabled={actionLoading === profile.id}
                                                    className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
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

            {!loading && lastPage > 1 && (
                <div className="flex items-center justify-between mt-6">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="px-3 py-1.5 text-xs rounded-md border bg-white text-gray-700 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-xs text-gray-500">
                        Page {page} of {lastPage}
                    </span>
                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === lastPage}
                        className="px-3 py-1.5 text-xs rounded-md border bg-white text-gray-700 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Reject Modal */}
            {rejectModal.open && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-start sm:items-center justify-center p-4 z-50 min-h-full">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
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
                                className="bg-indigo-800 text-white px-4 py-2 rounded hover:bg-indigo-900"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editModal.open && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-start sm:items-center justify-center p-4 z-50 min-h-full">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
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
                                <label className="block text-sm font-medium text-gray-700">Country</label>
                                <SearchableSelect
                                    items={countries}
                                    getLabel={(c) => `${c.name}${c.iso2 ? ` (${c.iso2})` : ''}`}
                                    getValue={(c) => c.name}
                                    value={editModal.data.country || ''}
                                    onChange={(val) => setEditModal({ ...editModal, data: { ...editModal.data, country: val } })}
                                    placeholder="Select a country"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <SearchableSelect
                                    items={categories}
                                    getLabel={(c) => c.name}
                                    getValue={(c) => String(c.id)}
                                    value={editModal.data.category_id ? String(editModal.data.category_id) : ''}
                                    onChange={(val) => setEditModal({ ...editModal, data: { ...editModal.data, category_id: val } })}
                                    placeholder="Select a category"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Summary</label>
                                <RichTextLimited
                                    value={editModal.data.summary}
                                    onChange={(html) => setEditModal({ ...editModal, data: { ...editModal.data, summary: html } })}
                                    maxLength={300}
                                    placeholder="Short summary (max 300 characters)"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Why Win</label>
                                <RichTextLimited
                                    value={editModal.data.why_win}
                                    onChange={(html) => setEditModal({ ...editModal, data: { ...editModal.data, why_win: html } })}
                                    maxLength={300}
                                    placeholder="Why the organization deserves to win (max 300 characters)"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">How Help</label>
                                <RichTextLimited
                                    value={editModal.data.how_help}
                                    onChange={(html) => setEditModal({ ...editModal, data: { ...editModal.data, how_help: html } })}
                                    maxLength={300}
                                    placeholder="How funds will help (max 300 characters)"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Logo (Leave empty to keep current)</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => setEditLogo(e.target.files[0])}
                                    className="mt-1 block w-full text-sm text-gray-500 cursor-pointer file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Pitch Deck (PDF, PowerPoint, or JPG, optional)</label>
                                <input 
                                    type="file" 
                                    accept="application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/jpeg"
                                    onChange={(e) => setEditPitchDeck(e.target.files[0])}
                                    className="mt-1 block w-full text-sm text-gray-500 cursor-pointer file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Link to Founder/ explainer Video (max 2 min)</label>
                                <input 
                                    type="url" 
                                    value={editModal.data.founder_video_url}
                                    onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, founder_video_url: e.target.value } })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Facebook</label>
                                    <input 
                                        type="url" 
                                        value={editModal.data.facebook}
                                        onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, facebook: e.target.value } })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Twitter</label>
                                    <input 
                                        type="url" 
                                        value={editModal.data.twitter}
                                        onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, twitter: e.target.value } })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                                    <input 
                                        type="url" 
                                        value={editModal.data.linkedin}
                                        onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, linkedin: e.target.value } })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Instagram</label>
                                    <input 
                                        type="url" 
                                        value={editModal.data.instagram}
                                        onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, instagram: e.target.value } })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                </div>
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
                                    disabled={editSubmitting}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {editSubmitting ? (
                                        <span className="flex items-center">
                                            <svg
                                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Saving...
                                        </span>
                                    ) : (
                                        'Update Profile'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Profile Modal */}
            {addModal.open && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-start sm:items-center justify-center p-4 z-50 min-h-full">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
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
                                        <label className="block text-sm font-medium text-gray-700">Country</label>
                                        <SearchableSelect
                                            items={countries}
                                            getLabel={(c) => `${c.name}${c.iso2 ? ` (${c.iso2})` : ''}`}
                                            getValue={(c) => c.name}
                                            value={addData.country}
                                            onChange={(val) => setAddData({ ...addData, country: val })}
                                            placeholder="Select a country"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Category</label>
                                        <SearchableSelect
                                            items={categories}
                                            getLabel={(c) => c.name}
                                            getValue={(c) => String(c.id)}
                                            value={addData.category_id ? String(addData.category_id) : ''}
                                            onChange={(val) => setAddData({ ...addData, category_id: val })}
                                            placeholder="Select a category"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Logo</label>
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={(e) => setAddLogo(e.target.files[0])}
                                            className="mt-1 block w-full cursor-pointer file:cursor-pointer"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Pitch Deck (PDF, PowerPoint, or JPG, optional)</label>
                                        <input 
                                            type="file" 
                                            accept="application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/jpeg"
                                            onChange={(e) => setAddPitchDeck(e.target.files[0])}
                                            className="mt-1 block w-full text-sm text-gray-500 cursor-pointer file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Summary</label>
                                        <RichTextLimited
                                            value={addData.summary}
                                            onChange={(html) => setAddData({ ...addData, summary: html })}
                                            maxLength={300}
                                            required
                                            placeholder="Short summary (max 300 characters)"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Why Win</label>
                                        <RichTextLimited
                                            value={addData.why_win}
                                            onChange={(html) => setAddData({ ...addData, why_win: html })}
                                            maxLength={300}
                                            required
                                            placeholder="Why the organization deserves to win (max 300 characters)"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">How Help</label>
                                        <RichTextLimited
                                            value={addData.how_help}
                                            onChange={(html) => setAddData({ ...addData, how_help: html })}
                                            maxLength={300}
                                            required
                                            placeholder="How funds will help (max 300 characters)"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Link to Founder/ explainer Video (max 2 min)</label>
                                        <input 
                                            type="url" 
                                            value={addData.founder_video_url}
                                            onChange={(e) => setAddData({ ...addData, founder_video_url: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Facebook</label>
                                            <input 
                                                type="url" 
                                                value={addData.facebook}
                                                onChange={(e) => setAddData({ ...addData, facebook: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Twitter</label>
                                            <input 
                                                type="url" 
                                                value={addData.twitter}
                                                onChange={(e) => setAddData({ ...addData, twitter: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                                            <input 
                                                type="url" 
                                                value={addData.linkedin}
                                                onChange={(e) => setAddData({ ...addData, linkedin: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Instagram</label>
                                            <input 
                                                type="url" 
                                                value={addData.instagram}
                                                onChange={(e) => setAddData({ ...addData, instagram: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                            />
                                        </div>
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
                                    disabled={!selectedUser || addSubmitting}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {addSubmitting ? (
                                        <span className="flex items-center">
                                            <svg
                                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Creating...
                                        </span>
                                    ) : (
                                        'Create Profile'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <AlertModal
                isOpen={alertState.open}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type}
                onClose={() => setAlertState(prev => ({ ...prev, open: false }))}
            />

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
