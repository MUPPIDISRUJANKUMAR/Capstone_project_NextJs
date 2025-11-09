'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../src/contexts/AuthContext'
import { LoginForm } from '../../../src/components/auth/LoginForm'

export default function LoginPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect based on user role
      if (user?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
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
