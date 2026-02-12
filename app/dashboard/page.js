'use client';
import { useUser } from '@/context/UserContext';
import Axios from '@/Helper/Axios';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
    const { user, isLoggedIn, isLoading: userLoading, logoutUser } = useUser();
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    useEffect(() => {
        if (!userLoading && !isLoggedIn) {
            router.push('/auth/login');
            return;
        }

        const fetchProfile = async () => {
            try {
                const { data } = await Axios.get('/profile');
                if (data.status) {
                    setProfile(data.data);
                }
            } catch (err) {
                console.error("Error fetching profile", err);
            } finally {
                setLoadingProfile(false);
            }
        };

        if (isLoggedIn) {
            fetchProfile();
        }
    }, [userLoading, isLoggedIn, router]);

    if (userLoading || (isLoggedIn && loadingProfile)) return <div className="p-8 text-center">Loading...</div>;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* User Info Card */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}!</h1>
                        <button 
                            onClick={logoutUser}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                            Logout
                        </button>
                    </div>
                    <p className="mt-2 text-gray-600">Email: {user.email}</p>
                </div>

                {/* Submission Card */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Your Submission</h2>
                    
                    {profile ? (
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                {profile.logo_url && (
                                    <img src={profile.logo_url} alt="Logo" className="w-16 h-16 object-contain rounded border" />
                                )}
                                <div>
                                    <h3 className="font-bold text-lg">{profile.organization_name}</h3>
                                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full 
                                        ${profile.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                          profile.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                          'bg-yellow-100 text-yellow-800'}`}>
                                        {profile.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            
                            {profile.status === 'rejected' && (
                                <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
                                    <strong>Rejection Reason:</strong> {profile.rejection_reason || 'No reason provided.'}
                                </div>
                            )}

                            {profile.status !== 'approved' ? (
                                <Link href="/dashboard/submission" className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                                    Edit Submission
                                </Link>
                            ) : (
                                <p className="text-green-600">Your profile is approved and live!</p>
                            )}
                        </div>
                    ) : (
                        <div>
                            <p className="text-gray-500 mb-4">You haven't submitted a profile yet.</p>
                            <Link href="/dashboard/submission" className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                                Submit Profile
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
