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
            if (user?.account_type === 'submitter') {
                fetchProfile();
            } else {
                // voters don't have profiles; stop loading immediately
                setLoadingProfile(false);
            }
        }
    }, [userLoading, isLoggedIn, router, user]);

    if (userLoading || (isLoggedIn && loadingProfile)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }
    
    if (!user) return null;

    const getStatusColor = (status) => {
        switch(status) {
            case 'approved': return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'approved': 
                return (
                    <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'rejected':
                return (
                    <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                                Welcome back, {user.name}
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Manage your profile and track your submission status
                            </p>
                        </div>
                        <div className="mt-4 flex md:mt-0 md:ml-4">
                            <Link href="/leaderboard" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                View Leaderboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    
                    {/* Left Column: Submission Status */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
                            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Submission Status</h3>
                                {profile && (
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(profile.status)}`}>
                                        {getStatusIcon(profile.status)}
                                        {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
                                    </span>
                                )}
                            </div>
                            
                            <div className="p-6">
                                {user?.account_type !== 'submitter' ? (
                                    <div className="text-center py-10">
                                        <div className="mx-auto h-24 w-24 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                                            <svg className="h-12 w-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="mt-2 text-lg font-medium text-gray-900">Voting Account</h3>
                                        <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
                                            Voter accounts cannot submit organization profiles. You can support organizations by voting on their public profiles.
                                        </p>
                                        <div className="mt-6">
                                            <Link href="/leaderboard" className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                                Browse Organizations
                                            </Link>
                                        </div>
                                    </div>
                                ) : profile ? (
                                    <div className="space-y-6">
                                        <div className="flex items-start space-x-6">
                                            {profile.logo_url ? (
                                                <div className="flex-shrink-0 h-24 w-24 rounded-xl border border-gray-200 p-2 bg-white shadow-sm">
                                                    <img src={profile.logo_url} alt="Logo" className="h-full w-full object-contain" />
                                                </div>
                                            ) : (
                                                <div className="flex-shrink-0 h-24 w-24 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
                                                    <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                            
                                            <div className="flex-1">
                                                <h4 className="text-xl font-bold text-gray-900">{profile.organization_name}</h4>
                                                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{profile.description || 'No description provided.'}</p>
                                                
                                                {profile.status === 'rejected' && (
                                                    <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-md">
                                                        <div className="flex">
                                                            <div className="flex-shrink-0">
                                                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                            <div className="ml-3">
                                                                <h3 className="text-sm font-medium text-red-800">Rejection Reason</h3>
                                                                <div className="mt-1 text-sm text-red-700">
                                                                    <p>{profile.rejection_reason || 'Please contact support for more details.'}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-gray-100 flex items-center justify-end space-x-4">
                                            {profile.status === 'approved' ? (
                                                <Link href={`/profiles/${profile.id}`} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                                    View Public Profile
                                                </Link>
                                            ) : (
                                                <Link href="/dashboard/submission" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                                    {profile.status === 'rejected' ? 'Fix & Resubmit' : 'Edit Submission'}
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <div className="mx-auto h-24 w-24 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                                            <svg className="h-12 w-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        </div>
                                        <h3 className="mt-2 text-lg font-medium text-gray-900">No Submission Yet</h3>
                                        <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">Get started by creating your organization profile to participate in the voting platform.</p>
                                        <div className="mt-6">
                                            <Link href="/dashboard/submission" className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                                Create Submission
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Account Info */}
                    <div className="space-y-6">
                        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
                            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="text-lg font-semibold text-gray-900">Account Details</h3>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center space-x-4 mb-6">
                                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                                
                                <div className="border-t border-gray-100 pt-4">
                                    <dl className="divide-y divide-gray-100">
                                        <div className="py-3 flex justify-between text-sm">
                                            <dt className="text-gray-500">Account Type</dt>
                                            <dd className="font-medium text-gray-900">
                                                {user?.account_type === 'voter' ? 'Voter' : (user?.account_type === 'submitter' ? 'Organization' : 'Not set')}
                                            </dd>
                                        </div>
                                        <div className="py-3 flex justify-between text-sm">
                                            <dt className="text-gray-500">Status</dt>
                                            <dd className="font-medium text-green-600">Active</dd>
                                        </div>
                                    </dl>
                                </div>

                                <div className="mt-6">
                                    <button 
                                        onClick={logoutUser}
                                        className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Quick Help Card */}
                        <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                            <h3 className="text-sm font-semibold text-indigo-900 uppercase tracking-wide mb-3">Need Help?</h3>
                            <p className="text-sm text-indigo-700 mb-4">
                                If you have questions about the submission process or criteria, please check our guidelines.
                            </p>
                            <Link href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                                Read Submission Guidelines &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
