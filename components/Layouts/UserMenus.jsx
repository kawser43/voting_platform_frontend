'use client';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';

export default function UserMenus({ toggleMobileMenu }) {
    const { user, logoutUser } = useUser();

    return (
        <>
            {user?.role_id === 1 ? (
                <Link 
                    href="/admin/dashboard" 
                    onClick={toggleMobileMenu} 
                    className="text-indigo-600 hover:text-indigo-800 px-3 py-2 rounded-md font-medium md:border-0 border border-indigo-100 md:text-left text-left"
                >
                    Dashboard
                </Link>
            ) : (
                <Link 
                    href="/dashboard" 
                    onClick={toggleMobileMenu} 
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md font-medium md:border-0 border border-gray-100 md:text-left text-left"
                >
                    Dashboard
                </Link>
            )}
            <button 
                onClick={() => {
                    logoutUser();
                    if (toggleMobileMenu) toggleMobileMenu();
                }}
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md font-medium md:border border-gray-100 md:text-center text-left"
            >
                Logout
            </button>
        </>
    );
}