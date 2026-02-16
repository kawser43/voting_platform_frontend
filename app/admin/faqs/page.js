'use client';

import Axios from '@/Helper/Axios';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AlertModal from '@/components/AlertModal';

export default function AdminFaqPage() {
    const { user, isLoggedIn } = useUser();
    const router = useRouter();
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [alertState, setAlertState] = useState({
        open: false,
        title: '',
        message: '',
        type: 'info'
    });
    const [editModal, setEditModal] = useState({
        open: false,
        id: null,
        data: { question: '', answer: '', is_active: true, sort_order: 0 }
    });

    useEffect(() => {
        if (!isLoggedIn) {
            return;
        }
        if (user && user.role_id !== 1) {
            router.push('/dashboard');
        }
    }, [isLoggedIn, user, router]);

    const fetchFaqs = async () => {
        setLoading(true);
        try {
            const { data } = await Axios.get('/admin/faqs');
            if (data.status) {
                setFaqs(data.data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role_id === 1) {
            fetchFaqs();
        }
    }, [user]);

    const openNewFaq = () => {
        setEditModal({
            open: true,
            id: null,
            data: { question: '', answer: '', is_active: true, sort_order: faqs.length }
        });
    };

    const openEditFaq = (faq) => {
        setEditModal({
            open: true,
            id: faq.id,
            data: {
                question: faq.question || '',
                answer: faq.answer || '',
                is_active: !!faq.is_active,
                sort_order: faq.sort_order ?? 0
            }
        });
    };

    const handleChange = (field, value) => {
        setEditModal(prev => ({
            ...prev,
            data: { ...prev.data, [field]: value }
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!editModal.data.question || !editModal.data.answer) {
            setAlertState({
                open: true,
                title: 'Validation',
                message: 'Question and answer are required',
                type: 'error'
            });
            return;
        }

        setSaving(true);
        try {
            const payload = {
                question: editModal.data.question,
                answer: editModal.data.answer,
                is_active: editModal.data.is_active,
                sort_order: Number(editModal.data.sort_order) || 0
            };

            const url = editModal.id ? `/admin/faqs/${editModal.id}` : '/admin/faqs';
            const { data } = await Axios.post(url, payload);

            if (data.status) {
                setEditModal({
                    open: false,
                    id: null,
                    data: { question: '', answer: '', is_active: true, sort_order: 0 }
                });
                fetchFaqs();
                setAlertState({
                    open: true,
                    title: 'Success',
                    message: editModal.id ? 'FAQ updated successfully' : 'FAQ created successfully',
                    type: 'success'
                });
            }
        } catch (err) {
            console.error(err);
            const message = err.response?.data?.message || 'Failed to save FAQ';
            setAlertState({
                open: true,
                title: 'Error',
                message,
                type: 'error'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
        setActionLoading(id);
        try {
            const { data } = await Axios.delete(`/admin/faqs/${id}`);
            if (data.status) {
                fetchFaqs();
                setAlertState({
                    open: true,
                    title: 'Success',
                    message: 'FAQ deleted successfully',
                    type: 'success'
                });
            }
        } catch (err) {
            console.error(err);
            const message = err.response?.data?.message || 'Failed to delete FAQ';
            setAlertState({
                open: true,
                title: 'Error',
                message,
                type: 'error'
            });
        } finally {
            setActionLoading(null);
        }
    };

    if (!user || user.role_id !== 1) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <AlertModal
                isOpen={alertState.open}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type}
                onClose={() => setAlertState(prev => ({ ...prev, open: false }))}
            />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Manage FAQs</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Add and organize common questions for the FAQ page.
                    </p>
                </div>
                <button
                    onClick={openNewFaq}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                    Add FAQ
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading FAQs...</div>
            ) : faqs.length === 0 ? (
                <div className="text-center py-12 text-gray-500 border border-dashed border-gray-200 rounded-lg">
                    No FAQs yet. Click "Add FAQ" to create the first one.
                </div>
            ) : (
                <div className="space-y-4">
                    {faqs.map((faq) => (
                        <div
                            key={faq.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 flex items-start justify-between gap-4"
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-semibold text-gray-500">
                                        #{faq.sort_order ?? 0}
                                    </span>
                                    {!faq.is_active && (
                                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                                            Hidden
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900">
                                    {faq.question}
                                </h3>
                                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                    {faq.answer}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => openEditFaq(faq)}
                                    className="px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(faq.id)}
                                    disabled={actionLoading === faq.id}
                                    className="px-3 py-1.5 rounded-md text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editModal.open && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            {editModal.id ? 'Edit FAQ' : 'Add FAQ'}
                        </h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Question
                                </label>
                                <input
                                    type="text"
                                    value={editModal.data.question}
                                    onChange={(e) => handleChange('question', e.target.value)}
                                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Answer
                                </label>
                                <textarea
                                    rows={5}
                                    value={editModal.data.answer}
                                    onChange={(e) => handleChange('answer', e.target.value)}
                                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Sort order
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editModal.data.sort_order}
                                        onChange={(e) => handleChange('sort_order', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div className="flex items-center gap-2 mt-6 md:mt-8">
                                    <input
                                        id="faq_is_active"
                                        type="checkbox"
                                        checked={editModal.data.is_active}
                                        onChange={(e) => handleChange('is_active', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                    />
                                    <label htmlFor="faq_is_active" className="text-sm text-gray-700">
                                        Visible on FAQ page
                                    </label>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setEditModal({
                                            open: false,
                                            id: null,
                                            data: { question: '', answer: '', is_active: true, sort_order: 0 }
                                        })
                                    }
                                    className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save FAQ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

