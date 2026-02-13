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
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8">Live Leaderboard</h1>

             {/* Search Bar */}
             <div className="mb-8">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Search organizations..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 rounded-md border-gray-300 shadow-sm p-3 border focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button 
                        type="submit"
                        className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 font-medium"
                    >
                        Search
                    </button>
                </form>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : profiles.length > 0 ? (
                <div className="space-y-4">
                    {profiles.map((profile, index) => {
                        const percentage = totalVotes > 0 ? ((profile.votes_count / totalVotes) * 100).toFixed(1) : 0;
                        return (
                            <div key={profile.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 flex-shrink-0">
                                            {profile.logo_url ? (
                                                <img src={profile.logo_url} alt={profile.organization_name} className="w-full h-full object-cover rounded-full" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-400">?</div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{profile.organization_name}</h3>
                                            <Link href={`/profiles/${profile.id}`} className="text-sm text-indigo-600 hover:underline">View Profile</Link>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-indigo-600">{profile.votes_count}</div>
                                        <div className="text-xs text-gray-500">Votes</div>
                                    </div>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="mt-2">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>Progress</span>
                                        <span>{percentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div 
                                            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">No profiles found.</div>
            )}

             {/* Pagination */}
             {lastPage > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                    <button 
                        disabled={page === 1}
                        onClick={() => fetchProfiles(page - 1, search)}
                        className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-gray-600">
                        Page {page} of {lastPage}
                    </span>
                    <button 
                        disabled={page === lastPage}
                        onClick={() => fetchProfiles(page + 1, search)}
                        className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}