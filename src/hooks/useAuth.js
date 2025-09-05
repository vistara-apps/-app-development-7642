import { useState } from 'react'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [showAuth, setShowAuth] = useState(false)

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('historify_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('historify_user')
  }

  // Check for existing session on mount
  useState(() => {
    const savedUser = localStorage.getItem('historify_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  return {
    user,
    login,
    logout,
    showAuth,
    setShowAuth
  }
}