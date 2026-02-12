'use client';
import { useState, useEffect } from 'react';
import Axios from '@/Helper/Axios';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';

export default function SubmissionPage() {
    const { user, isLoggedIn, isLoading: userLoading } = useUser();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    const [formData, setFormData] = useState({
        organization_name: '',
        summary: '',
        why_win: '',
        how_help: '',
        website_url: '',
        facebook: '',
        twitter: '',
        linkedin: '',
        instagram: ''
    });
    const [logo, setLogo] = useState(null);
    const [preview, setPreview] = useState(null);
    const [status, setStatus] = useState(null);
    const [rejectionReason, setRejectionReason] = useState(null);

    useEffect(() => {
        if (!userLoading && !isLoggedIn) {
            router.push('/auth/login');
            return;
        }
        
        // Fetch existing profile
        const fetchProfile = async () => {
            try {
                const { data } = await Axios.get('/profile');
                if (data.status && data.data) {
                    const profile = data.data;
                    const socials = profile.social_links || {};
                    setFormData({
                        organization_name: profile.organization_name || '',
                        summary: profile.summary || '',
                        why_win: profile.why_win || '',
                        how_help: profile.how_help || '',
                        website_url: profile.website_url || '',
                        facebook: socials.facebook || '',
                        twitter: socials.twitter || '',
                        linkedin: socials.linkedin || '',
                        instagram: socials.instagram || ''
                    });
                    if (profile.logo_url) {
                        setPreview(profile.logo_url);
                    }
                    setStatus(profile.status);
                    setRejectionReason(profile.rejection_reason);
                }
            } catch (err) {
                console.error("Error fetching profile", err);
            } finally {
                setFetching(false);
            }
        };

        if (isLoggedIn) {
            fetchProfile();
        }
    }, [userLoading, isLoggedIn, router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogo(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const data = new FormData();
        data.append('organization_name', formData.organization_name);
        data.append('summary', formData.summary);
        data.append('why_win', formData.why_win);
        data.append('how_help', formData.how_help);
        if (formData.website_url) data.append('website_url', formData.website_url);
        
        const socialLinks = {
            facebook: formData.facebook,
            twitter: formData.twitter,
            linkedin: formData.linkedin,
            instagram: formData.instagram
        };
        data.append('social_links', JSON.stringify(socialLinks));

        if (logo) {
            data.append('logo', logo);
        }

        try {
            const res = await Axios.post('/profile', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (res.data.status) {
                setSuccess('Profile submitted successfully!');
                setTimeout(() => router.push('/dashboard'), 2000);
            } else {
                setError(res.data.message || 'Submission failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred during submission');
        } finally {
            setLoading(false);
        }
    };

    if (userLoading || fetching) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-6">
                <h1 className="text-2xl font-bold mb-6">Submission Profile</h1>
                
                {status === 'approved' && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
                        <p className="font-bold">Approved</p>
                        <p>Your profile has been approved and is live on the leaderboard. You cannot edit it anymore.</p>
                    </div>
                )}

                {status === 'rejected' && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                        <p className="font-bold">Rejected</p>
                        <p>Reason: {rejectionReason}</p>
                        <p className="text-sm mt-1">You can update your profile and resubmit it for approval.</p>
                    </div>
                )}

                {status === 'pending' && status !== null && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
                        <p className="font-bold">Pending Review</p>
                        <p>Your profile is currently under review. You can update it while it is pending.</p>
                    </div>
                )}
                
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
                {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <fieldset disabled={status === 'approved'}>
                    {/* Organization Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                        <input 
                            type="text" 
                            name="organization_name" 
                            value={formData.organization_name} 
                            onChange={handleChange}
                            required 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>

                    {/* Logo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Logo</label>
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            className="mt-1 block w-full"
                        />
                        {preview && <img src={preview} alt="Logo Preview" className="mt-2 h-20 w-auto object-contain" />}
                    </div>

                    {/* Summary */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Summary</label>
                        <textarea 
                            name="summary" 
                            value={formData.summary} 
                            onChange={handleChange}
                            required 
                            maxLength={500}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-24"
                        />
                        <p className="text-xs text-gray-500 text-right">{formData.summary.length}/500</p>
                    </div>

                    {/* Why Win */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Why You Deserve To Win?</label>
                        <textarea 
                            name="why_win" 
                            value={formData.why_win} 
                            onChange={handleChange}
                            required 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-32"
                        />
                    </div>

                    {/* How Help */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">How Will This Money Help You?</label>
                        <textarea 
                            name="how_help" 
                            value={formData.how_help} 
                            onChange={handleChange}
                            required 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-32"
                        />
                    </div>

                    {/* Website */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Website URL</label>
                        <input 
                            type="url" 
                            name="website_url" 
                            value={formData.website_url} 
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>

                    {/* Social Links */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Facebook</label>
                            <input 
                                type="url" 
                                name="facebook" 
                                value={formData.facebook} 
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Twitter (X)</label>
                            <input 
                                type="url" 
                                name="twitter" 
                                value={formData.twitter} 
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                            <input 
                                type="url" 
                                name="linkedin" 
                                value={formData.linkedin} 
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Instagram</label>
                            <input 
                                type="url" 
                                name="instagram" 
                                value={formData.instagram} 
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Save & Submit'}
                        </button>
                    </div>
                    </fieldset>
                </form>
            </div>
        </div>
    );
}
