'use client';
import Axios from '@/Helper/Axios';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import Link from 'next/link';
import AlertModal from '@/components/AlertModal';

const VOTING_START_DATE = process.env.NEXT_PUBLIC_VOTING_START_DATE;
const VOTING_END_DATE = process.env.NEXT_PUBLIC_VOTING_END_DATE;

export default function PublicProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const { isLoggedIn, user } = useUser();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [voteLoading, setVoteLoading] = useState(false);
    const [alertState, setAlertState] = useState({
        open: false,
        title: '',
        message: '',
        type: 'success'
    });
    const [votePulse, setVotePulse] = useState(false);
    const [shareUrl, setShareUrl] = useState('');

    useEffect(() => {
        if (id) {
            const fetchProfile = async () => {
                try {
                    const { data } = await Axios.get(`/profiles/${id}`);
                    if (data.status) {
                        setProfile(data.data);
                    } else {
                        setError(data.message || 'Profile not found');
                    }
                } catch (err) {
                    setError('Error loading profile');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchProfile();
        }
    }, [id]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setShareUrl(window.location.href);
        }
    }, []);

    const handleVote = async () => {
        const now = new Date();
        let votingStart = null;
        let votingEndExclusive = null;

        if (VOTING_START_DATE && VOTING_END_DATE) {
            const start = new Date(VOTING_START_DATE);
            const end = new Date(VOTING_END_DATE);
            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                votingStart = start;
                votingEndExclusive = new Date(end.getTime());
                votingEndExclusive.setDate(votingEndExclusive.getDate() + 1);
                votingEndExclusive.setHours(0, 0, 0, 0);
            }
        }

        if (!votingStart || !votingEndExclusive) {
            const currentYear = now.getFullYear();
            votingStart = new Date(currentYear, 2, 2);
            votingEndExclusive = new Date(currentYear, 2, 8);
        }

        const startLabel = votingStart.toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        if (now < votingStart) {
            setAlertState({
                open: true,
                title: 'Voting Not Started',
                message: `Voting will start on ${startLabel}.`,
                type: 'info'
            });
            return;
        }

        if (now >= votingEndExclusive) {
            setAlertState({
                open: true,
                title: 'Voting Ended',
                message: 'Voting has ended.',
                type: 'info'
            });
            return;
        }

        if (!isLoggedIn) {
            setAlertState({
                open: true,
                title: 'Register or Login to Vote',
                message: 'You need an account to vote for this organization.',
                type: 'info'
            });
            return;
        }
        if (user?.account_type === 'submitter') {
            setAlertState({
                open: true,
                title: 'Voting Not Allowed',
                message: 'Submitter accounts cannot vote.',
                type: 'error'
            });
            return;
        }

        setVoteLoading(true);
        try {
            const { data } = await Axios.post(`/vote/${id}`);
            if (data.status) {
                setProfile(prev => ({
                    ...prev,
                    is_voted: data.data.voted,
                    votes_count: data.data.voted ? prev.votes_count + 1 : prev.votes_count - 1
                }));
                setVotePulse(true);
                setTimeout(() => setVotePulse(false), 700);
                setAlertState({
                    open: true,
                    title: data.data.voted ? 'Vote Submitted' : 'Vote Removed',
                    message: data.data.voted ? 'Thank you for your vote!' : 'Your vote has been removed.',
                    type: 'success'
                });
            }
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Failed to process vote';
            setAlertState({
                open: true,
                title: 'Error',
                message: msg,
                type: 'error'
            });
        } finally {
            setVoteLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
                <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Not Found</h3>
                <p className="text-gray-500 mb-6">{error}</p>
                <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                    Back to Home
                </Link>
            </div>
        </div>
    );
    
    if (!profile) return null;

    const renderContent = (text) => {
        if (!text) return '';
        const looksHtml = /<(p|strong|em|ul|ol|li|br)\b/i.test(text);
        if (looksHtml) return text;
        let safe = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        safe = safe.replace(/\*(.+?)\*/g, '<em>$1</em>');
        safe = safe.replace(/\n/g, '<br/>');
        return safe;
    };

    const getYouTubeEmbedUrl = (url) => {
        try {
            const u = new URL(url);
            if (u.hostname.includes('youtu.be')) {
                return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
            }
            if (u.hostname.includes('youtube.com')) {
                const id = u.searchParams.get('v');
                if (id) return `https://www.youtube.com/embed/${id}`;
                // handle /embed/{id}
                if (u.pathname.startsWith('/embed/')) return `https://www.youtube.com${u.pathname}`;
            }
        } catch (_) {}
        return null;
    };
    const getSocialMeta = (platform) => {
        const p = (platform || '').toLowerCase();
        if (p === 'facebook') {
            return {
                label: 'Facebook',
                classes: 'bg-blue-50 text-blue-600',
                icon: (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M13.5 9H16V6h-2.5c-1.933 0-3.5 1.567-3.5 3.5V12H8v3h2v6h3v-6h2.5l.5-3H13V9.5c0-.276.224-.5.5-.5z"/>
                    </svg>
                )
            };
        }
        if (p === 'twitter') {
            return {
                label: 'Twitter',
                classes: 'bg-sky-50 text-sky-600',
                icon: (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 20L20 4" />
                        <path d="M4 4l16 16" />
                    </svg>
                )
            };
        }
        if (p === 'linkedin') {
            return {
                label: 'LinkedIn',
                classes: 'bg-blue-50 text-blue-700',
                icon: (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M4.98 3.5a2.5 2.5 0 102.5 2.5 2.5 2.5 0 00-2.5-2.5zM4 8h3v12H4zM9 8h3v1.85h.04A3.3 3.3 0 0115 7.75C18 7.75 18.5 9.75 18.5 12.35V20h-3v-5.1c0-1.22-.02-2.79-1.7-2.79-1.7 0-2 1.33-2 2.7V20H9z"/>
                    </svg>
                )
            };
        }
        if (p === 'instagram') {
            return {
                label: 'Instagram',
                classes: 'bg-rose-50 text-rose-600',
                icon: (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="4" y="4" width="16" height="16" rx="4" />
                        <circle cx="12" cy="12" r="3.5" />
                        <circle cx="17" cy="7" r="1.2" fill="currentColor" stroke="none" />
                    </svg>
                )
            };
        }
        if (p === 'youtube') {
            return {
                label: 'YouTube',
                classes: 'bg-red-50 text-red-600',
                icon: (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="3" y="7" width="18" height="10" rx="2" fill="currentColor" />
                        <polygon points="10,9 16,12 10,15" fill="#fff" />
                    </svg>
                )
            };
        }
        return {
            label: platform,
            classes: 'bg-indigo-50 text-indigo-500',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm0 2a8 8 0 100 16 8 8 0 000-16z"/>
                </svg>
            )
        };
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            <AlertModal
                isOpen={alertState.open}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type}
                onClose={() => setAlertState(prev => ({ ...prev, open: false }))}
                actions={
                    alertState.title === 'Register or Login to Vote'
                        ? (
                            <>
                                <Link
                                    href="/auth/register"
                                    className="w-full inline-flex items-center justify-center px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
                                >
                                    Register to Vote
                                </Link>
                                <Link
                                    href="/auth/login"
                                    className="w-full inline-flex items-center justify-center px-4 py-2 rounded-md border border-indigo-200 text-indigo-700 text-sm font-medium bg-white hover:bg-indigo-50 transition-colors"
                                >
                                    Login to Vote
                                </Link>
                                <button
                                    onClick={() => setAlertState(prev => ({ ...prev, open: false }))}
                                    className="w-full inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700"
                                >
                                    Maybe later
                                </button>
                            </>
                        )
                        : undefined
                }
            />

            {/* Hero Section */}
            <div className="relative bg-indigo-700 h-64 lg:h-80 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-800 to-indigo-600 opacity-90"></div>
                <div className="absolute inset-0 opacity-20 bg-[url('/pattern.svg')]"></div>
                
                {/* Back Button */}
                <div className="absolute top-8 left-4 sm:left-8 z-10">
                    <Link href="/leaderboard" className="inline-flex items-center px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm transition-colors text-sm font-medium border border-white/20">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Leaderboard
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="md:flex">
                        <div className="md:w-1/3 lg:w-1/4 bg-gray-50 border-r border-gray-100 p-8 text-center md:text-left">
                            <div className="relative block w-full mb-6">
                                {profile.logo_url ? (
                                    <img 
                                        src={profile.logo_url} 
                                        alt={profile.organization_name} 
                                        className="w-full h-auto rounded-2xl shadow-lg border-4 border-white object-contain bg-white mx-auto md:mx-0"
                                    />
                                ) : (
                                    <div className="w-full aspect-square rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-500 mx-auto md:mx-0 border-4 border-white shadow-lg">
                                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            <h1 className="text-2xl font-bold text-gray-900 mb-2 md:hidden">{profile.organization_name}</h1>
                            
                            <div className="mb-6 flex flex-col gap-3">
                                <button 
                                    onClick={handleVote}
                                    disabled={voteLoading || user?.account_type === 'submitter'}
                                    className={`w-full py-3 px-4 rounded-xl font-bold shadow-md transition-all transform active:scale-95 flex items-center justify-center ${votePulse ? 'animate-pulse' : ''} ${
                                        profile.is_voted 
                                            ? 'bg-green-600 hover:bg-green-700 text-white ring-2 ring-green-600 ring-offset-2' 
                                            : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg'
                                    }`}
                                >
                                    {voteLoading ? (
                                        <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : profile.is_voted ? (
                                        <svg className={`w-5 h-5 mr-2 ${votePulse ? 'animate-bounce' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <rect x="3" y="9" width="18" height="10" rx="2" strokeWidth="2" />
                                            <path d="M9 9l3-6 3 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M9 13l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    ) : (
                                        <svg className={`w-5 h-5 mr-2 ${votePulse ? 'animate-bounce' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <rect x="3" y="9" width="18" height="10" rx="2" strokeWidth="2" />
                                            <path d="M9 9l3-6 3 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                    {user?.account_type === 'submitter' ? 'Competitor cannot vote' : (voteLoading ? 'Processing...' : (profile.is_voted ? 'Voted' : 'Vote Now'))}
                                </button>
                                
                                {user?.account_type === 'submitter' && (
                                    <p className="text-xs text-gray-500 text-center">Submitter accounts cannot vote.</p>
                                )}
                                
                                <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
                                    <span className="block text-3xl font-bold text-indigo-600 mb-1">{profile.votes_count}</span>
                                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Votes</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {profile.website_url && (
                                    <a 
                                        href={profile.website_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center mr-3 group-hover:bg-indigo-100 transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium truncate">Visit Website</span>
                                    </a>
                                )}
                                
                                {profile.social_links && Object.entries(profile.social_links).map(([platform, url]) => {
                                    if (!url) return null;
                                    const meta = getSocialMeta(platform);
                                    return (
                                        <a 
                                            key={platform}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors group"
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 group-hover:opacity-90 transition-colors ${meta.classes}`}>
                                                {meta.icon}
                                            </div>
                                            <span className="text-sm font-medium">{meta.label}</span>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="md:w-2/3 lg:w-3/4 p-8 lg:p-12">
                            <div className="hidden md:block mb-8 border-b border-gray-100 pb-6">
                                <div className="flex items-center flex-wrap gap-3 mb-2">
                                    <h1 className="text-4xl font-extrabold text-gray-900">{profile.organization_name}</h1>
                                    {profile.country && (
                                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium border border-indigo-100">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                <circle cx="12" cy="12" r="9" />
                                                <path d="M3 12h18" />
                                                <path d="M12 3a14 14 0 010 18" />
                                                <path d="M12 3a14 14 0 000 18" />
                                            </svg>
                                            <span>{profile.country}</span>
                                        </span>
                                    )}
                                    {profile.category && profile.category.name && (
                                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-sm font-medium border border-purple-100">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                <path d="M4 4h8l8 8-8 8-8-8z" />
                                                <path d="M9 9.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                            </svg>
                                            <span>{profile.category.name}</span>
                                        </span>
                                    )}
                                </div>
                                <p className="text-lg text-gray-500">Making a difference in our community</p>
                                {profile.user && (
                                    <p className="mt-2 text-sm text-gray-500">
                                        Founder: <span className="font-medium text-gray-700">{profile.user.name}</span>
                                        {profile.user.designation && <> — {profile.user.designation}</>}
                                        {profile.user.whatsapp && (
                                            <> • <a className="text-indigo-600 hover:underline" href={`https://wa.me/${profile.user.whatsapp.replace(/\\D/g,'')}`} target="_blank" rel="noreferrer">WhatsApp</a></>
                                        )}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-12">
                                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
                                        Share to help get more votes
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        <button
                                            onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener')}
                                            className="flex items-center justify-center px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm"
                                        >
                                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <path d="M13.5 9H16V6h-2.5c-1.933 0-3.5 1.567-3.5 3.5V12H8v3h2v6h3v-6h2.5l.5-3H13V9.5c0-.276.224-.5.5-.5z"/>
                                            </svg>
                                            Facebook
                                        </button>
                                        <button
                                            onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(profile.organization_name)}`, '_blank', 'noopener')}
                                            className="flex items-center justify-center px-3 py-2 rounded-lg bg-sky-500 text-white hover:bg-sky-600 text-sm"
                                        >
                                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M4 20L20 4" />
                                                <path d="M4 4l16 16" />
                                            </svg>
                                            X
                                        </button>
                                        <button
                                            onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener')}
                                            className="flex items-center justify-center px-3 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 text-sm"
                                        >
                                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <path d="M4.98 3.5a2.5 2.5 0 102.5 2.5 2.5 2.5 0 00-2.5-2.5zM4 8h3v12H4zM9 8h3v1.85h.04A3.3 3.3 0 0115 7.75C18 7.75 18.5 9.75 18.5 12.35V20h-3v-5.1c0-1.22-.02-2.79-1.7-2.79-1.7 0-2 1.33-2 2.7V20H9z"/>
                                            </svg>
                                            LinkedIn
                                        </button>
                                        <button
                                            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${profile.organization_name} - ${shareUrl}`)}`, '_blank', 'noopener')}
                                            className="flex items-center justify-center px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm"
                                        >
                                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M20.52 3.48A11.94 11.94 0 0012 0C5.37 0 .02 5.34.02 11.94c0 2.1.55 4.16 1.6 5.98L0 24l6.27-1.6a11.9 11.9 0 005.73 1.46h.01c6.6 0 11.95-5.34 11.95-11.94 0-3.19-1.24-6.19-3.44-8.44zM12 21.3a9.3 9.3 0 01-4.74-1.3l-.34-.2-3.72.95.99-3.63-.22-.37a9.3 9.3 0 1116.37-4.84A9.29 9.29 0 0112 21.3zm5.22-6.65c-.29-.15-1.7-.84-1.96-.94-.26-.1-.45-.15-.64.15-.19.29-.74.94-.9 1.13-.16.19-.33.22-.62.07-.29-.15-1.22-.45-2.32-1.44-.86-.77-1.45-1.72-1.62-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.33.42-.49.14-.16.19-.27.29-.45.1-.19.05-.35-.03-.5-.08-.15-.64-1.54-.88-2.11-.23-.56-.47-.49-.64-.5h-.55c-.19 0-.5.07-.76.35-.26.29-1 1-1 2.43s1.02 2.82 1.16 3.01c.15.19 2 3.05 4.84 4.29.68.29 1.21.46 1.62.58.68.21 1.3.18 1.79.11.55-.08 1.7-.69 1.94-1.36.24-.67.24-1.24.17-1.36-.07-.12-.26-.19-.55-.34z"/>
                                            </svg>
                                            WhatsApp
                                        </button>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            try {
                                                await navigator.clipboard.writeText(shareUrl);
                                                setAlertState({ open: true, title: 'Link Copied', message: 'Profile link copied to clipboard.', type: 'success' });
                                            } catch (_) {
                                                setAlertState({ open: true, title: 'Unable to Copy', message: 'Please copy the link from the address bar.', type: 'error' });
                                            }
                                        }}
                                        className="mt-2 w-full flex items-center justify-center px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-sm text-gray-700"
                                    >
                                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="9" y="9" width="13" height="13" rx="2" />
                                            <rect x="2" y="2" width="13" height="13" rx="2" />
                                        </svg>
                                        Copy Link
                                    </button>
                                </div>
                                <section className="prose prose-indigo max-w-none">
                                    <div className="flex items-center mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-4">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 m-0">About Us</h2>
                                    </div>
                                    <div className="text-gray-600 leading-relaxed bg-gray-50 p-6 rounded-xl border border-gray-100"
                                         dangerouslySetInnerHTML={{ __html: renderContent(profile.summary || "No summary provided.") }} />
                                </section>

                                {profile.founder_video_url && (
                                    <section>
                                        <div className="flex items-center mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center mr-4">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.26a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-900 m-0">Founder / Explainer Video</h2>
                                        </div>
                                        {getYouTubeEmbedUrl(profile.founder_video_url) ? (
                                            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                                <div className="relative pt-[56.25%]">
                                                    <iframe
                                                        className="absolute inset-0 w-full h-full"
                                                        src={getYouTubeEmbedUrl(profile.founder_video_url)}
                                                        title="Founder Video"
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 flex items-center justify-between flex-wrap gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">External video link</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Opens in a new tab. Ensure viewing permissions are set to open.
                                                    </p>
                                                </div>
                                                <a
                                                    href={profile.founder_video_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center px-4 py-2 rounded-md bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition-colors"
                                                >
                                                    Watch video
                                                </a>
                                            </div>
                                        )}
                                    </section>
                                )}

                                <div className="grid md:grid-cols-2 gap-8 mb-8">
                                    <section className="flex flex-col h-full">
                                        <div className="flex items-center mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center mr-4">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                                </svg>
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-900 m-0">Why We Should Win</h2>
                                        </div>
                                        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm flex-grow">
                                            <div className="prose prose-indigo max-w-none text-gray-600 leading-relaxed"
                                                 dangerouslySetInnerHTML={{ __html: renderContent(profile.why_win || "Information not provided.") }} />
                                        </div>
                                    </section>

                                    <section className="flex flex-col h-full">
                                        <div className="flex items-center mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mr-4">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-900 m-0">Impact of Prize</h2>
                                        </div>
                                        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm flex-grow">
                                            <div className="prose prose-indigo max-w-none text-gray-600 leading-relaxed"
                                                 dangerouslySetInnerHTML={{ __html: renderContent(profile.how_help || "Information not provided.") }} />
                                        </div>
                                    </section>
                                </div>

                                {profile.pitch_deck_url && (
                                    <section>
                                        <div className="flex items-center mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-4">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v8m0-8l-3 3m3-3l3 3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-900 m-0">Pitch Deck</h2>
                                        </div>
                                        <a href={profile.pitch_deck_url} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700">
                                            View / Download Pitch Deck (PDF)
                                        </a>
                                    </section>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
