'use client';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';

export default function Navbar() {
    const { user, isLoggedIn, logoutUser } = useUser();

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="text-xl font-bold text-indigo-600">
                            Voting Platform
                        </Link>
                        <div className="hidden md:flex ml-10 space-x-8">
                            <Link href="/leaderboard" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md font-medium">
                                Leaderboard
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        {isLoggedIn ? (
                            <>
                                {user?.role_id === 1 ? (
                                    <Link href="/admin/dashboard" className="text-red-600 hover:text-red-800 px-3 py-2 rounded-md font-medium">
                                        Admin Dashboard
                                    </Link>
                                ) : (
                                    <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md font-medium">
                                        Dashboard
                                    </Link>
                                )}
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500">Hi, {user?.name}</span>
                                    <button 
                                        onClick={logoutUser}
                                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md font-medium">
                                    Login
                                </Link>
                                <Link href="/auth/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
