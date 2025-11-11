'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function StudentsRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/request')
  }, [router])
  return null
}
