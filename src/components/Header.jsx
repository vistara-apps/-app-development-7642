import React from 'react'
import { Search, Upload, FileText, Clock, Map, User, LogOut } from 'lucide-react'

const Header = ({ user, onLogout, activeView, onViewChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FileText },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'map', label: 'Map', icon: Map },
  ]

  return (
    <header className="bg-white shadow-card border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-purple-700">Historify</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onViewChange(id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeView === id
                    ? 'text-purple-700 bg-purple-50'
                    : 'text-gray-600 hover:text-purple-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User size={18} />
              <span>{user.email}</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                {user.subscriptionTier}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 py-2">
          <div className="flex space-x-4 overflow-x-auto">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onViewChange(id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  activeView === id
                    ? 'text-purple-700 bg-purple-50'
                    : 'text-gray-600 hover:text-purple-700'
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header