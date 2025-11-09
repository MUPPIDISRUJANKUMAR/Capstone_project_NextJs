'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../src/contexts/AuthContext'
import { LoginForm } from '../../../src/components/auth/LoginForm'

export default function LoginPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('🔍 Login page useEffect triggered');
    console.log('🔍 isAuthenticated:', isAuthenticated);
    console.log('🔍 user:', user);
    
    if (isAuthenticated && user) {
      console.log('✅ User is authenticated, redirecting...');
      // Redirect based on user role
      if (user.role === 'admin') {
        console.log('👑 Redirecting to admin dashboard');
        router.push('/admin')
      } else {
        console.log('🎯 Redirecting to user dashboard');
        router.push('/dashboard')
      }
    } else {
      console.log('⏳ Waiting for authentication or user data...');
    }
  }, [isAuthenticated, user, router])

  const handleToggleMode = () => {
    router.push('/auth/register')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <LoginForm onToggleMode={handleToggleMode} />
    </div>
  )
}
