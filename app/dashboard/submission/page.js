'use client';
import { useState, useEffect, useRef } from 'react';
import RichTextLimited from '@/components/inputs/RichTextLimited';
import SearchableSelect from '@/components/inputs/SearchableSelect';
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
        country: '',
        category_id: '',
        summary: '',
        why_win: '',
        how_help: '',
        website_url: '',
        facebook: '',
        twitter: '',
        linkedin: '',
        instagram: '',
        founder_video_url: ''
    });
    const [logo, setLogo] = useState(null);
    const [pitchDeck, setPitchDeck] = useState(null);
    const [preview, setPreview] = useState(null);
    const [status, setStatus] = useState(null);
    const [rejectionReason, setRejectionReason] = useState(null);
    const summaryRef = useRef(null);
    const whyRef = useRef(null);
    const helpRef = useRef(null);
    const [countries, setCountries] = useState([]);
    const [categories, setCategories] = useState([]);
    const messageRef = useRef(null);
    const [showToast, setShowToast] = useState(false);

    const wrapSelection = (ref, marker) => {
        const el = ref.current;
        if (!el) return;
        const start = el.selectionStart ?? 0;
        const end = el.selectionEnd ?? 0;
        const before = el.value.substring(0, start);
        const selection = el.value.substring(start, end);
        const after = el.value.substring(end);
        const updated = `${before}${marker}${selection}${marker}${after}`;
        el.value = updated.slice(0, 300); // enforce 300 cap
        const event = new Event('input', { bubbles: true });
        el.dispatchEvent(event);
        // Restore selection around formatted text
        const newPos = start + marker.length;
        el.setSelectionRange(newPos, newPos + selection.length);
        el.focus();
    };

    useEffect(() => {
        if (!userLoading) {
            if (!isLoggedIn) {
                router.push('/auth/login');
                return;
            }
            if (user?.account_type !== 'submitter') {
                // voters should not access submission page
                router.push('/dashboard');
                return;
            }
        }
        
        // Fetch existing profile
        const fetchProfile = async () => {
            try {
                const { data } = await Axios.get('/profile');
                if (data.status && data.data) {
                    const profile = data.data;
                    const socials = profile.social_links || {};
                    setFormData(prev => ({
                        ...prev,
                        organization_name: profile.organization_name || '',
                        country: profile.country || '',
                        category_id: profile.category_id || '',
                        summary: profile.summary || '',
                        why_win: profile.why_win || '',
                        how_help: profile.how_help || '',
                        website_url: profile.website_url || '',
                        founder_video_url: profile.founder_video_url || '',
                        facebook: socials.facebook || '',
                        twitter: socials.twitter || '',
                        linkedin: socials.linkedin || '',
                        instagram: socials.instagram || ''
                    }));
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

        if (isLoggedIn && user?.account_type === 'submitter') {
            fetchProfile();
        }
    }, [userLoading, isLoggedIn, user, router]);

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const { data } = await Axios.get('/countries');
                if (data.status) {
                    setCountries(data.data || []);
                }
            } catch (err) {
                console.error('Failed to load countries', err);
            }
        };
        fetchCountries();
        const fetchCategories = async () => {
            try {
                const { data } = await Axios.get('/categories');
                if (data.status) {
                    setCategories(data.data || []);
                }
            } catch (err) {
                console.error('Failed to load categories', err);
            }
        };
        fetchCategories();
    }, []);

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
    const handlePitchDeckChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPitchDeck(file);
        }
    };

    const handleSubmit = async (e, saveAsDraft = false) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const data = new FormData();
        data.append('organization_name', formData.organization_name);
        data.append('country', formData.country);
        if (formData.category_id) {
            data.append('category_id', formData.category_id);
        }
        data.append('summary', formData.summary);
        data.append('why_win', formData.why_win);
        data.append('how_help', formData.how_help);
        if (formData.website_url) data.append('website_url', formData.website_url);
        if (formData.founder_video_url) data.append('founder_video_url', formData.founder_video_url);
        data.append('save_as_draft', saveAsDraft ? 'true' : 'false');
        
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
        if (pitchDeck) {
            data.append('pitch_deck', pitchDeck);
        }

        try {
            const res = await Axios.post('/profile', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (res.data.status) {
                setSuccess(saveAsDraft ? 'Draft saved successfully!' : 'Profile submitted successfully!');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 5000);
                setTimeout(() => router.push('/dashboard'), 1500);
            } else {
                setError(res.data.message || 'Submission failed');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 5000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred during submission');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 5000);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if ((error || success) && messageRef.current) {
            messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [error, success]);

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
                
                {(error || success) && (
                    <div ref={messageRef}>
                        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
                        {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}
                    </div>
                )}

                <form onSubmit={(e) => handleSubmit(e, false)}>
                    <fieldset disabled={status === 'approved'} className="space-y-4">
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
                    {/* Country */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Country</label>
                        <SearchableSelect
                            items={countries}
                            getLabel={(c) => `${c.name}${c.iso2 ? ` (${c.iso2})` : ''}`}
                            getValue={(c) => c.name}
                            value={formData.country}
                            onChange={(val) => setFormData(prev => ({ ...prev, country: val }))}
                            placeholder="Select a country"
                            disabled={status === 'approved'}
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <SearchableSelect
                            items={categories}
                            getLabel={(c) => c.name}
                            getValue={(c) => String(c.id)}
                            value={formData.category_id ? String(formData.category_id) : ''}
                            onChange={(val) => setFormData(prev => ({ ...prev, category_id: val }))}
                            placeholder="Select a category"
                            disabled={status === 'approved'}
                        />
                    </div>

                    {/* Logo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Logo</label>
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            className="mt-1 block w-full text-sm text-gray-500 cursor-pointer file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                        {preview && <img src={preview} alt="Logo Preview" className="mt-2 h-20 w-auto object-contain rounded border" />}
                    </div>

                    {/* Summary */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Short Organization Summary (max 300)</label>
                        <div className="mt-1">
                            <RichTextLimited 
                                value={formData.summary}
                                onChange={(html) => setFormData(prev => ({ ...prev, summary: html }))}
                                maxLength={300}
                                placeholder="Tell us briefly about your organization..."
                            />
                        </div>
                    </div>

                    {/* Why Win */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Why do you deserve to win? (max 300)</label>
                        <div className="mt-1">
                            <RichTextLimited 
                                value={formData.why_win}
                                onChange={(html) => setFormData(prev => ({ ...prev, why_win: html }))}
                                maxLength={300}
                                placeholder="Explain your achievements, impact, and uniqueness..."
                            />
                        </div>
                    </div>

                    {/* How Help */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">How will this money help you? (max 300)</label>
                        <div className="mt-1">
                            <RichTextLimited 
                                value={formData.how_help}
                                onChange={(html) => setFormData(prev => ({ ...prev, how_help: html }))}
                                maxLength={300}
                                placeholder="Describe how the funds will advance your mission..."
                            />
                        </div>
                    </div>

                    {/* Founder Video */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Link to Founder Video (YouTube, max 2 min)</label>
                        <input 
                            type="url" 
                            name="founder_video_url" 
                            value={formData.founder_video_url} 
                            onChange={handleChange}
                            required
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                        <p className="text-xs text-gray-500">Must be a YouTube link.</p>
                    </div>

                    {/* Pitch Deck */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Pitch Deck (PDF, PowerPoint, or JPG, optional)</label>
                        <input 
                            type="file" 
                            accept="application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/jpeg"
                            onChange={handlePitchDeckChange}
                            className="mt-1 block w-full text-sm text-gray-500 cursor-pointer file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                        {pitchDeck && <p className="text-xs text-gray-500 mt-1">Selected: {pitchDeck.name}</p>}
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

                    <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button 
                            type="button"
                            disabled={loading}
                            onClick={(e) => handleSubmit(e, true)}
                            className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200 disabled:opacity-50 border"
                        >
                            {loading ? 'Saving...' : 'Save as Draft'}
                        </button>
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
            {(showToast && (error || success)) && (
                <div className="fixed bottom-6 inset-x-0 px-4 z-50">
                    <div className={`max-w-md mx-auto ${error ? 'bg-red-600' : 'bg-green-600'} text-white rounded-lg shadow-lg px-4 py-3 flex items-center justify-between`}>
                        <div className="flex items-center">
                            <svg className="h-5 w-5 text-white mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium truncate">{error || success}</span>
                        </div>
                        <button onClick={() => setShowToast(false)} className="ml-3 text-white/80 hover:text-white text-sm">
                            Dismiss
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
