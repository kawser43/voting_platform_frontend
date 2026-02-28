'use client';
import { useState, useEffect } from 'react';
import Axios from '@/Helper/Axios';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import AlertModal from '@/components/AlertModal';

export default function AdminSettings() {
    const { user, isLoggedIn } = useUser();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [settings, setSettings] = useState({
        hero_title: 'Vote for Your <br class="hidden lg:block" /> <span class="text-indigo-600">Favorite Organization</span>',
        hero_subtitle: 'Browse impactful organizations and support the initiatives that resonate with you.',
        hero_button_text: 'Get Started',
        hero_button_2_text: 'View Leaderboard'
    });
    const [alertState, setAlertState] = useState({
        open: false,
        title: '',
        message: '',
        type: 'success'
    });
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        password: '',
        password_confirmation: ''
    });
    const [passwordError, setPasswordError] = useState(null);
    const [syncingSendGrid, setSyncingSendGrid] = useState(false);

    useEffect(() => {
        if (!isLoggedIn) {
            // router.push('/auth/login');
        } else if (user && !user.role_id) {
            router.push('/dashboard');
        }
    }, [isLoggedIn, user, router]);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await Axios.get('/settings?group=hero_section');
                if (data.status) {
                    // Merge defaults with fetched data
                    setSettings(prev => ({ ...prev, ...data.data }));
                }
            } catch (err) {
                console.error("Error fetching settings", err);
            } finally {
                setLoading(false);
            }
        };

        if (user?.role_id) {
            fetchSettings();
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await Axios.post('/admin/settings', {
                settings: settings,
                group: 'hero_section'
            });
            
            if (data.status) {
                setAlertState({
                    open: true,
                    title: 'Success',
                    message: 'Settings updated successfully',
                    type: 'success'
                });
            }
        } catch (err) {
            console.error("Error updating settings", err);
            setAlertState({
                open: true,
                title: 'Error',
                message: 'Failed to update settings',
                type: 'error'
            });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setChangingPassword(true);
        setPasswordError(null);
        try {
            const { data } = await Axios.post('/change-password', passwordForm);
            if (data.status) {
                setAlertState({
                    open: true,
                    title: 'Success',
                    message: 'Password updated successfully',
                    type: 'success'
                });
                setPasswordForm({
                    current_password: '',
                    password: '',
                    password_confirmation: ''
                });
            } else {
                setPasswordError(data.message || 'Failed to update password');
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to update password';
            setPasswordError(message);
        } finally {
            setChangingPassword(false);
        }
    };

    const handleSyncSendGrid = async () => {
        if (syncingSendGrid) return;
        setSyncingSendGrid(true);
        try {
            const { data } = await Axios.post('/admin/sync-sendgrid');
            if (data.status) {
                const { synced, failed, total_attempted } = data.data;
                setAlertState({
                    open: true,
                    title: 'Sync Completed',
                    message: `Synced: ${synced}, Failed: ${failed}, Total Processed: ${total_attempted}`,
                    type: 'success'
                });
            } else {
                setAlertState({
                    open: true,
                    title: 'Sync Failed',
                    message: data.message || 'Failed to sync contacts',
                    type: 'error'
                });
            }
        } catch (err) {
            console.error(err);
            setAlertState({
                open: true,
                title: 'Error',
                message: 'Failed to initiate sync',
                type: 'error'
            });
        } finally {
            setSyncingSendGrid(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Settings...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <AlertModal
                isOpen={alertState.open}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type}
                onClose={() => setAlertState(prev => ({ ...prev, open: false }))}
            />
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Site Settings</h1>
            
            {/* Integrations */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Integrations</h2>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">SendGrid Contacts Sync</h3>
                        <p className="text-sm text-gray-500">
                            Sync verified users to your SendGrid marketing contacts list.
                        </p>
                    </div>
                    <button
                        onClick={handleSyncSendGrid}
                        disabled={syncingSendGrid}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center"
                    >
                        {syncingSendGrid ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Syncing...
                            </>
                        ) : (
                            'Sync Contacts'
                        )}
                    </button>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">Hero Section Content</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title (HTML allowed)</label>
                        <p className="text-xs text-gray-500 mb-2">Use &lt;br&gt; for line breaks and &lt;span class="text-indigo-600"&gt; for colored text.</p>
                        <input
                            type="text"
                            name="hero_title"
                            value={settings.hero_title}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
                        <textarea
                            name="hero_subtitle"
                            value={settings.hero_subtitle}
                            onChange={handleChange}
                            rows="3"
                            className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Button Text</label>
                            <input
                                type="text"
                                name="hero_button_text"
                                value={settings.hero_button_text}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Button Text</label>
                            <input
                                type="text"
                                name="hero_button_2_text"
                                value={settings.hero_button_2_text}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">Change Password</h2>
                {passwordError && (
                    <div className="mb-4 rounded-md bg-red-50 border-l-4 border-red-500 p-4">
                        <p className="text-sm text-red-700">{passwordError}</p>
                    </div>
                )}
                <form onSubmit={handlePasswordChange} className="space-y-6 max-w-lg">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current password</label>
                        <input
                            type="password"
                            value={passwordForm.current_password}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                            className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
                        <input
                            type="password"
                            value={passwordForm.password}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, password: e.target.value }))}
                            className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
                        <input
                            type="password"
                            value={passwordForm.password_confirmation}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, password_confirmation: e.target.value }))}
                            className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div className="pt-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={changingPassword}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {changingPassword ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
