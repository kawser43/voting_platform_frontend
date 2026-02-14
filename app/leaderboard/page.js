'use client';
import Axios from '@/Helper/Axios';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Leaderboard() {
    const [profiles, setProfiles] = useState([]);
    const [totalVotes, setTotalVotes] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [search, setSearch] = useState('');

    const fetchProfiles = async (pageNumber = 1, searchQuery = '') => {
        setLoading(true);
        try {
            const query = new URLSearchParams({ page: pageNumber, search: searchQuery }).toString();
            const { data } = await Axios.get(`/profiles?${query}`);
            if (data.status) {
                setProfiles(data.data.profiles.data);
                setTotalVotes(data.data.total_votes);
                setLastPage(data.data.profiles.last_page);
                setPage(data.data.profiles.current_page);
            }
        } catch (err) {
            console.error("Error fetching profiles", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProfiles(1, search);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 md:py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-900 mb-4">
                        Live Leaderboard 🏆
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Track the real-time rankings of organizations. Every vote counts towards making a difference!
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-12">
                    <form onSubmit={handleSearch} className="relative">
                        <div className="relative flex items-center shadow-sm rounded-full bg-white">
                            <div className="absolute left-4 text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search organizations..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-32 py-4 bg-transparent border-2 border-indigo-50 rounded-full focus:ring-0 focus:border-indigo-400 outline-none transition-all text-gray-700 placeholder-gray-400"
                            />
                            <button 
                                type="submit"
                                className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white px-6 rounded-full font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center"
                            >
                                Search
                            </button>
                        </div>
                    </form>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-50 animate-pulse flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-full"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-100 rounded w-1/3"></div>
                                    <div className="h-3 bg-gray-100 rounded w-1/4"></div>
                                </div>
                                <div className="w-16 h-8 bg-gray-100 rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : profiles.length > 0 ? (
                    <div className="space-y-4">
                        {profiles.map((profile, index) => {
                            const percentage = totalVotes > 0 ? ((profile.votes_count / totalVotes) * 100).toFixed(1) : 0;
                            const globalIndex = (page - 1) * 15 + index; // Assuming 15 items per page default or whatever the API returns, but let's just use index for visual ranking on current page for now, or strict index if possible. 
                            // Actually the API pagination usually returns per_page (default 15 in Laravel).
                            // Let's stick to relative index for visual flair (Top 3 on this page get medals if page 1).
                            
                            const isTop3 = page === 1 && index < 3;
                            
                            return (
                                <div 
                                    key={profile.id} 
                                    className={`group bg-white p-4 sm:p-6 rounded-2xl shadow-sm hover:shadow-md border border-indigo-50 transition-all duration-300 relative overflow-hidden ${isTop3 ? 'ring-2 ring-offset-2' : ''} ${index === 0 && page === 1 ? 'ring-yellow-400' : index === 1 && page === 1 ? 'ring-gray-300' : index === 2 && page === 1 ? 'ring-amber-600' : 'ring-transparent'}`}
                                >
                                    {/* Rank Badge for Top 3 */}
                                    {isTop3 && (
                                        <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-xl text-xs font-bold text-black shadow-sm ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'}`}>
                                            #{index + 1}
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row items-center gap-6">
                                        {/* Rank Number (for non-top-3 or mobile) */}
                                        <div className={`text-2xl font-bold w-12 text-center hidden sm:block ${isTop3 ? 'opacity-0' : 'text-indigo-200'}`}>
                                            #{((page - 1) * (profiles.length)) + index + 1} {/* Approximate rank calculation */}
                                        </div>

                                        {/* Logo */}
                                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                                            {profile.logo_url ? (
                                                <img 
                                                    src={profile.logo_url} 
                                                    alt={profile.organization_name} 
                                                    className="w-full h-full object-cover rounded-2xl border-2 border-indigo-50 group-hover:border-indigo-200 transition-colors shadow-sm" 
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-300 text-2xl font-bold border-2 border-indigo-100">
                                                    {profile.organization_name?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 text-center sm:text-left min-w-0 w-full">
                                            <h3 className="text-xl font-bold text-indigo-900 truncate mb-1">
                                                {profile.organization_name}
                                            </h3>
                                            <Link 
                                                href={`/profiles/${profile.id}`} 
                                                className="text-indigo-600 font-medium text-sm hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
                                            >
                                                View Profile 
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                            </Link>
                                        </div>

                                        {/* Votes & Progress */}
                                        <div className="w-full sm:w-64 flex-shrink-0">
                                            <div className="flex justify-between items-end mb-2">
                                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Votes</div>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-2xl font-bold text-indigo-600">{profile.votes_count}</span>
                                                    <span className="text-sm text-slate-400">({percentage}%)</span>
                                                </div>
                                            </div>
                                            
                                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                                <div 
                                                    className="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-indigo-500 to-purple-600 relative"
                                                    style={{ width: `${percentage}%` }}
                                                >
                                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-indigo-200">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-indigo-900 mb-2">No organizations found</h3>
                        <p className="text-indigo-500">Try adjusting your search terms</p>
                    </div>
                )}

                {/* Pagination */}
                {lastPage > 1 && (
                    <div className="flex justify-center mt-12 gap-3">
                        <button 
                            disabled={page === 1}
                            onClick={() => fetchProfiles(page - 1, search)}
                            className="px-5 py-2.5 bg-white border border-indigo-200 rounded-lg text-indigo-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50 transition-colors shadow-sm"
                        >
                            Previous
                        </button>
                        <span className="px-5 py-2.5 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-900 font-semibold min-w-[3rem] text-center flex items-center justify-center">
                            {page} / {lastPage}
                        </span>
                        <button 
                            disabled={page === lastPage}
                            onClick={() => fetchProfiles(page + 1, search)}
                            className="px-5 py-2.5 bg-white border border-indigo-200 rounded-lg text-indigo-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50 transition-colors shadow-sm"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}