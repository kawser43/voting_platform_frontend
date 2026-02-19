'use client';
import { useState, useEffect, useRef } from 'react';
import Axios from '@/Helper/Axios';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const { loginUser } = useUser();
    const router = useRouter();
    const [formData, setFormData] = useState({ 
        name: '',
        account_type: '',
        designation: '',
        whatsapp: '',
        email: '', 
        password: '',
        password_confirmation: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const errorRef = useRef(null);

    useEffect(() => {
        if (error && errorRef.current) {
            errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [error]);

    const passwordsMatch = Boolean(
        formData.password &&
        formData.password_confirmation &&
        formData.password === formData.password_confirmation
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { data } = await Axios.post('/register', formData);
            if (data.status) {
                const email = formData.email;
                router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please check your inputs.');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 5000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
             {/* Background decoration */}
             <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute bottom-0 -left-4 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            <div className="auth-card max-w-md w-full space-y-8 backdrop-blur-lg p-8 rounded-2xl shadow-xl border z-10 relative">
                <div className="text-center">
                    <Link href="/" className="inline-block mb-4">
                         <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                    </Link>
                    <h2 className="text-3xl font-extrabold tracking-tight">
                        Create an account to get votes or to start voting
                    </h2>
                    <p className="auth-subtitle mt-2 text-sm">
                        All Ma’a prize applicants must register to be considered
                    </p>
                </div>

                <form className="auth-form mt-8 space-y-5" onSubmit={handleSubmit}>
                    {error && (
                        <div ref={errorRef} className="auth-error-alert p-4 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="auth-error-icon h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="auth-error-text text-sm font-medium">
                                        {error}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="full-name" className="block text-sm font-medium mb-1">Full Name</label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    id="full-name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 ease-in-out hover:border-indigo-300"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>
                        {/* Account Type */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Choose Account Type</label>
                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, account_type: 'submitter' })}
                                    className={`flex items-start p-4 rounded-lg border transition-all w-full ${
                                        formData.account_type === 'submitter'
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className={`mt-1 w-5 h-5 rounded-full mr-3 flex items-center justify-center ${formData.account_type === 'submitter' ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                                        <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium">I want to submit my organization profile</p>
                                        <p className="auth-helper-text text-xs mt-1">Create and manage a submission.</p>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, account_type: 'voter', designation: '', whatsapp: '' })}
                                    className={`flex items-start p-4 rounded-lg border transition-all w-full ${
                                        formData.account_type === 'voter'
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className={`mt-1 w-5 h-5 rounded-full mr-3 flex items-center justify-center ${formData.account_type === 'voter' ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                                        <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium">I want to vote</p>
                                        <p className="auth-helper-text text-xs mt-1">Help your favourite organisations win the Ma&apos;a Prize</p>
                                    </div>
                                </button>
                            </div>
                            {!formData.account_type && (
                                <p className="auth-error-text text-xs mt-1">Please choose an account type.</p>
                            )}
                        </div>

                        {/* Conditional fields for Submitter */}
                        {formData.account_type === 'submitter' && (
                            <>
                                <div>
                                    <label htmlFor="designation" className="block text-sm font-medium mb-1">Designation</label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0-1.657-1.343-3-3-3S6 9.343 6 11s1.343 3 3 3 3-1.343 3-3zM4 19a7 7 0 0114 0H4z" />
                                            </svg>
                                        </div>
                                        <input
                                            id="designation"
                                            name="designation"
                                            type="text"
                                            required
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 ease-in-out hover:border-indigo-300"
                                            placeholder="Founder & CEO"
                                            value={formData.designation}
                                            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="whatsapp" className="block text-sm font-medium mb-1">WhatsApp Number (Optional)</label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7a1 1 0 00.9 1.45H17M7 13l2-4m0 0l1 2m-1-2h6" />
                                            </svg>
                                        </div>
                                        <input
                                            id="whatsapp"
                                            name="whatsapp"
                                            type="tel"
                                            pattern="^[0-9+() \\-]{7,20}$"
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 ease-in-out hover:border-indigo-300"
                                            placeholder="+971500000000"
                                            value={formData.whatsapp}
                                            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                        />
                                    </div>
                                    <p className="auth-helper-text mt-1 text-xs">Optional. Include country code, e.g., +971...</p>
                                </div>
                            </>
                        )}

                        <div>
                            <label htmlFor="email-address" className="block text-sm font-medium mb-1">Email address</label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a5.5 5.5 0 00-11 0" />
                                    </svg>
                                </div>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 ease-in-out hover:border-indigo-300"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 ease-in-out hover:border-indigo-300"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password-confirm" className="block text-sm font-medium mb-1">Confirm Password</label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className={`h-5 w-5 ${passwordsMatch ? 'text-green-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <input
                                    id="password-confirm"
                                    name="password_confirmation"
                                    type="password"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 ease-in-out hover:border-indigo-300"
                                    placeholder="••••••••"
                                    value={formData.password_confirmation}
                                    onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                             {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Account...
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    Create Account
                                    <svg className="ml-2 -mr-1 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </span>
                            )}
                        </button>
                    </div>
                    <div className="mt-6 text-center">
                        <p className="text-sm auth-helper-text">
                            Already have an account?{' '}
                            <Link href="/auth/login" className="auth-link font-semibold hover:underline transition-colors">
                                Sign in instead
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
            {error && showToast && (
                <div className="fixed bottom-6 inset-x-0 px-4 z-50">
                    <div className="max-w-md mx-auto bg-red-600 text-white rounded-lg shadow-lg px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center">
                            <svg className="h-5 w-5 text-white mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium truncate">{error}</span>
                        </div>
                        <button onClick={() => setShowToast(false)} className="ml-3 text-white/80 hover:text-white text-sm">
                            Dismiss
                        </button>
                    </div>
                </div>
            )}
            
            {/* Simple footer */}
            <div className="auth-footer-text absolute bottom-4 text-center text-xs">
                &copy; {new Date().getFullYear()} Voting Platform. All rights reserved.
            </div>
        </div>
    );
}
