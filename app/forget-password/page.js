'use client';

import { useState } from 'react';
import Axios from '@/Helper/Axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgetPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const { data } = await Axios.post('/forgot-password', { email });
            if (data.status) {
                router.push(`/reset-password?email=${encodeURIComponent(email)}`);
            } else {
                setError(data.message || 'Unable to send password reset code.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to send password reset code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20 z-10 relative">
                <div className="text-center">
                    <Link href="/auth/login" className="inline-block mb-4 text-xs text-indigo-600 hover:text-indigo-800">
                        &larr; Back to login
                    </Link>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Forgot password
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter your email and we&apos;ll send you a 6-digit reset code.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                    )}
                    {message && (
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
                            <p className="text-sm text-green-700 font-medium">{message}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email address
                            </label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a5.5 5.5 0 00-11 0" />
                                    </svg>
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 ease-in-out hover:border-indigo-300"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                            {loading ? 'Sending reset code...' : 'Send reset code'}
                        </button>
                    </div>

                    <div className="mt-4 text-center text-xs text-gray-500">
                        After you receive the code, go to the{' '}
                        <Link href="/reset-password" className="text-indigo-600 hover:text-indigo-500 hover:underline">
                            reset password
                        </Link>{' '}
                        page to set a new password.
                    </div>
                </form>
            </div>
        </div>
    );
}
