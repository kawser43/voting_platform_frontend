'use client';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { useState } from 'react';
import GuestMenus from './GuestMenus';
import UserMenus from './UserMenus';

export default function Navbar() {
    const { user, isLoggedIn, logoutUser } = useUser();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="bg-white shadow-md relative z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="flex flex-col items-start leading-tight">
                                <img
                                    src="/globalsadaqah-logo.webp"
                                    alt="Ma'a Impact Prize"
                                    className="h-8 w-auto"
                                />
                                <span className="text-xs font-semibold text-indigo-900 mt-0.5">
                                    Ma&apos;a Impact Prize
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link href="/leaderboard" className="flex items-center bg-indigo-600 text-white px-3 py-1.5 text-[15px] rounded-md font-medium hover:bg-indigo-700 transition-colors shadow-sm group mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Leaderboard
                        </Link>

                        <Link href="/explore" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md font-medium md:border-0 border border-gray-100 md:text-left text-left">
                            Explore Organizations
                        </Link>

                        {isLoggedIn ? (
                            <UserMenus toggleMobileMenu={toggleMobileMenu} />
                        ) : (
                            <GuestMenus toggleMobileMenu={toggleMobileMenu} />
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={toggleMobileMenu}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 focus:outline-none"
                        >
                            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Drawer */}
            <div className={`fixed inset-0 z-40 transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" onClick={toggleMobileMenu}></div>
                <div className="relative flex flex-col w-64 max-w-xs h-full ml-auto bg-white shadow-xl overflow-y-auto">
                    <div className="px-4 py-6 flex-1">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-indigo-600">Menu</h2>
                            <button onClick={toggleMobileMenu} className="text-gray-500 hover:text-gray-700">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="flex flex-col space-y-4">
                            <Link href="/leaderboard" onClick={toggleMobileMenu} className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors shadow-sm group">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                Leaderboard
                            </Link>

                            <Link href="/explore" onClick={toggleMobileMenu} className="text-base font-medium text-indigo-700 hover:text-indigo-900">
                                Explore Organizations
                            </Link>

                            {isLoggedIn ? (
                                <UserMenus toggleMobileMenu={toggleMobileMenu} />
                            ) : (
                                <GuestMenus toggleMobileMenu={toggleMobileMenu} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
