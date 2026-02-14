'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Axios from '@/Helper/Axios';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const e = searchParams.get('email');
    if (e) setEmail(e);
  }, [searchParams]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const { data } = await Axios.post('/verify-email', { email, code });
      if (data.status) {
        setMessage('Email verified successfully. You can now log in.');
        setTimeout(() => router.push('/auth/login'), 1200);
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return setError('Enter your email first');
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const { data } = await Axios.post('/resend-verification', { email });
      if (data.status) {
        setMessage('Verification code resent. Check your email.');
      } else {
        setError(data.message || 'Failed to resend code');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20 z-10 relative">
        <div className="text-center">
          <Link href="/" className="inline-block mb-4">
            <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a5.5 5.5 0 00-11 0" /></svg>
            </div>
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter the 6-digit code we sent to your email
          </p>
        </div>

        {message && <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">{message}</div>}
        {error && <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">{error}</div>}

        <form className="space-y-4" onSubmit={handleVerify}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="^[0-9]{6}$"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\\D/g, '').slice(0, 6))}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 tracking-widest text-center"
              placeholder="123456"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="text-sm text-indigo-600 hover:underline disabled:opacity-50"
            >
              Resend code
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          <Link href="/auth/login" className="text-indigo-600 hover:underline">Back to login</Link>
        </div>
      </div>
    </div>
  );
}

