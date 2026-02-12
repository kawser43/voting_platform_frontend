'use client';
import Axios from '@/Helper/Axios';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import Link from 'next/link';

export default function PublicProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const { isLoggedIn } = useUser();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [voteLoading, setVoteLoading] = useState(false);

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

    const handleVote = async () => {
        if (!isLoggedIn) {
            router.push('/auth/login');
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
            }
        } catch (err) {
            console.error(err);
            alert('Failed to vote');
        } finally {
            setVoteLoading(false);
        }
    };

    if (loading) return <div className="text-center py-12">Loading...</div>;
    if (error) return <div className="text-center py-12 text-red-600">{error}</div>;
    if (!profile) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {/* Header/Logo */}
                    <div className="bg-indigo-600 h-32 md:h-48 relative">
                        {profile.logo_url && (
                            <div className="absolute -bottom-16 left-8">
                                <img 
                                    src={profile.logo_url} 
                                    alt={profile.organization_name} 
                                    className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white object-cover bg-white"
                                />
                            </div>
                        )}
                    </div>
                    
                    <div className="pt-20 px-8 pb-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{profile.organization_name}</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="bg-indigo-100 text-indigo-800 text-sm font-semibold px-2.5 py-0.5 rounded">
                                        {profile.votes_count} Votes
                                    </span>
                                    {profile.website_url && (
                                        <>
                                            <span className="text-gray-300">|</span>
                                            <a 
                                                href={profile.website_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="text-indigo-600 hover:underline"
                                            >
                                                Visit Website
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div>
                                <button 
                                    onClick={handleVote}
                                    disabled={voteLoading}
                                    className={`px-6 py-3 rounded-full font-bold shadow-lg transition-transform transform hover:scale-105 ${
                                        profile.is_voted 
                                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                    }`}
                                >
                                    {voteLoading ? 'Processing...' : (profile.is_voted ? 'Voted' : 'Vote Now')}
                                </button>
                            </div>
                        </div>

                        {/* Social Links */}
                        {profile.social_links && Object.keys(profile.social_links).some(k => profile.social_links[k]) && (
                            <div className="flex gap-4 mt-6">
                                {Object.entries(profile.social_links).map(([platform, url]) => (
                                    url && (
                                        <a 
                                            key={platform} 
                                            href={url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-gray-500 hover:text-indigo-600 capitalize"
                                        >
                                            {platform}
                                        </a>
                                    )
                                ))}
                            </div>
                        )}

                        <div className="mt-8 space-y-8">
                            <section>
                                <h2 className="text-xl font-semibold text-gray-900 mb-3">About Us</h2>
                                <p className="text-gray-600 whitespace-pre-line">{profile.summary}</p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-gray-900 mb-3">Why We Should Win</h2>
                                <p className="text-gray-600 whitespace-pre-line">{profile.why_win}</p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-gray-900 mb-3">How The Prize Will Help</h2>
                                <p className="text-gray-600 whitespace-pre-line">{profile.how_help}</p>
                            </section>
                        </div>
                    </div>
                </div>
                
                <div className="mt-8 text-center">
                    <Link href="/" className="text-indigo-600 hover:underline">
                        &larr; Back to Leaderboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
