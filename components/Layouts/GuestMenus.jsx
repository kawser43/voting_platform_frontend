import Link from 'next/link'
import React from 'react'

export default function GuestMenus({toggleMobileMenu}) {
    return (
        <>
            <Link href="/auth/login" onClick={toggleMobileMenu} className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md font-medium md:border border-gray-100 md:text-center text-left">
                Login
            </Link>
            <Link href="/auth/register" onClick={toggleMobileMenu} className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md font-medium md:border border-gray-100 md:text-center text-left">
                Register
            </Link>
        </>
    )
}
