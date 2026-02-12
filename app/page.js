'use client';
import Axios from '@/Helper/Axios';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
    const [profiles, setProfiles] = useState([]);
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
                setProfiles(data.data.data);
                setLastPage(data.data.last_page);
                setPage(data.data.current_page);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                    Vote for Your Favorite
                </h1>
                <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
                    Discover and support amazing organizations. Your vote counts!
                </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto mb-12">
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
                <div className="text-center py-12">Loading profiles...</div>
            ) : profiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {profiles.map(profile => (
                        <div key={profile.id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300">
                            <div className="h-48 bg-gray-200 relative">
                                {profile.logo_url ? (
                                    <img 
                                        src={profile.logo_url} 
                                        alt={profile.organization_name} 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        No Logo
                                    </div>
                                )}
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-gray-900">{profile.organization_name}</h3>
                                    <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                        {profile.votes_count} Votes
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-4 line-clamp-3 flex-1">{profile.summary}</p>
                                <div className="mt-auto">
                                    <Link 
                                        href={`/profile/${profile.id}`}
                                        className="block w-full text-center bg-white border border-indigo-600 text-indigo-600 px-4 py-2 rounded hover:bg-indigo-50 font-medium transition-colors"
                                    >
                                        View Profile
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    No profiles found.
                </div>
            )}

            {/* Pagination */}
            {lastPage > 1 && (
                <div className="flex justify-center mt-12 gap-2">
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
