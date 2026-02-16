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

    useEffect(() => {
        if (!isLoggedIn) {
            // router.push('/auth/login');
        } else if (user && user.role_id !== 1) {
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

        if (user?.role_id === 1) {
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
        </div>
    );
}
