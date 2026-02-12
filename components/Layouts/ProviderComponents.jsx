'use client'
import UserContextProvider from '@/context/UserContext'
import React from 'react'

export default function ProviderComponents({ children }) {
  return (
    <UserContextProvider>
          {children}
    </UserContextProvider>

  )
}
