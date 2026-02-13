'use client'
import React from 'react'
import Navbar from '../Navbar'
import { usePathname } from 'next/navigation'

export default function ParentLayout({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Voting Platform. All rights reserved.
            </p>
        </div>
      </footer>
    </div>
  );
}