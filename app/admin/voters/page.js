'use client';
import Axios from '@/Helper/Axios';
import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import SearchableSelect from '@/components/inputs/SearchableSelect';

export default function ExportVotersPage() {
    const { user, isLoggedIn } = useUser();
    const router = useRouter();
    const [profiles, setProfiles] = useState([]);
    const [selectedProfileId, setSelectedProfileId] = useState('');
    const [voters, setVoters] = useState([]);
    const [fetchingVoters, setFetchingVoters] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [error, setError] = useState(null);
    const [selectedVoters, setSelectedVoters] = useState([]);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!isLoggedIn) {
            // router.push('/auth/login');
        } else if (user && !user.role_id) {
            router.push('/dashboard');
        }
    }, [isLoggedIn, user, router]);

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const { data } = await Axios.get('/admin/voters/profiles');
                if (data.status) {
                    setProfiles(data.data);
                }
            } catch (err) {
                console.error("Error fetching profiles", err);
                setError("Failed to load profiles");
            }
        };

        if (isLoggedIn && user?.role_id) {
            fetchProfiles();
        }
    }, [isLoggedIn, user]);

    const fetchVoters = async (pageParam = 1) => {
        if (!selectedProfileId) return;
        
        setFetchingVoters(true);
        setError(null);
        setSelectedVoters([]);
        setHasSearched(true);
        try {
            const { data } = await Axios.get(`/admin/voters/profiles/${selectedProfileId}?page=${pageParam}`);
            if (data.status) {
                setVoters(data.data.data);
                setPage(data.data.current_page);
                setLastPage(data.data.last_page);
            }
        } catch (err) {
            console.error("Error fetching voters", err);
            setError("Failed to load voters");
        } finally {
            setFetchingVoters(false);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedVoters(voters.map(v => v.id));
        } else {
            setSelectedVoters([]);
        }
    };

    const handleSelectVoter = (id) => {
        if (selectedVoters.includes(id)) {
            setSelectedVoters(selectedVoters.filter(vId => vId !== id));
        } else {
            setSelectedVoters([...selectedVoters, id]);
        }
    };

    const handleDelete = async () => {
        if (selectedVoters.length === 0) return;
        
        if (!confirm(`Are you sure you want to delete ${selectedVoters.length} votes? This action cannot be undone.`)) {
            return;
        }

        setDeleting(true);
        try {
            const { data } = await Axios.post('/admin/voters/delete', { vote_ids: selectedVoters });
            if (data.status) {
                fetchVoters(page);
                setSelectedVoters([]);
            }
        } catch (err) {
            console.error("Error deleting voters", err);
            setError("Failed to delete voters");
        } finally {
            setDeleting(false);
        }
    };

    const handleShow = (e) => {
        e.preventDefault();
        fetchVoters(1);
    };

    const handleExport = async () => {
        if (!selectedProfileId) return;
        
        try {
            const response = await Axios.get(`/admin/voters/profiles/${selectedProfileId}/export`, {
                responseType: 'blob',
            });
            
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Extract filename from content-disposition header if possible, or generate one
            const contentDisposition = response.headers['content-disposition'];
            let fileName = 'voters.csv';
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (fileNameMatch && fileNameMatch.length === 2)
                    fileName = fileNameMatch[1];
            } else {
                 const profile = profiles.find(p => p.id == selectedProfileId);
                 if (profile) {
                     fileName = `voters_${profile.organization_name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;
                 }
            }

            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Error exporting voters", err);
            setError("Failed to export voters");
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Export Voters</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <form onSubmit={handleShow} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full relative z-30">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Organization Profile
                        </label>
                        <SearchableSelect
                            items={profiles}
                            getLabel={(p) => p.organization_name}
                            getValue={(p) => p.id}
                            value={selectedProfileId}
                            onChange={(val) => setSelectedProfileId(val)}
                            placeholder="-- Select Profile --"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!selectedProfileId || fetchingVoters}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {fetchingVoters ? 'Loading...' : 'Show Voters'}
                    </button>
                    {voters.length > 0 && (
                        <>
                            <button
                                type="button"
                                onClick={handleExport}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                Export CSV
                            </button>
                            {selectedVoters.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                                >
                                    {deleting ? 'Deleting...' : `Delete Selected (${selectedVoters.length})`}
                                </button>
                            )}
                        </>
                    )}
                </form>
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>

            {voters.length > 0 ? (
                <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        onChange={handleSelectAll}
                                        checked={voters.length > 0 && selectedVoters.length === voters.length}
                                    />
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Voted At
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {voters.map((vote, index) => (
                                <tr key={vote.id || index} className={selectedVoters.includes(vote.id) ? 'bg-indigo-50' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                            checked={selectedVoters.includes(vote.id)}
                                            onChange={() => handleSelectVoter(vote.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {vote.user ? vote.user.name : 'Unknown User'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {vote.user ? vote.user.email : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(vote.created_at).toLocaleDateString()} {new Date(vote.created_at).toLocaleTimeString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {/* Pagination */}
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{lastPage}</span>
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => fetchVoters(page - 1)}
                                        disabled={page === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => fetchVoters(page + 1)}
                                        disabled={page === lastPage}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                selectedProfileId && hasSearched && !fetchingVoters && (
                    <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-500">No voters found for this profile.</p>
                    </div>
                )
            )}
        </div>
    );
}
