'use client';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({ children }) {
    const { user, isLoggedIn, isLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isLoggedIn) {
                router.push('/auth/login');
            } else if (user && user.role_id) {
                // If admin, redirect to admin dashboard
                router.push('/admin/dashboard');
            }
        }
    }, [user, isLoggedIn, isLoading, router]);

    if (isLoading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    // While redirecting or if invalid, show nothing or loading
    if (!isLoggedIn || (user && user.role_id)) {
        return null;
    }

    return <>{children}</>;
}
