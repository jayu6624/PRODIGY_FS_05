import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusSquare, Heart, UserCircle, LogOut, Bell } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { Avatar } from '../ui/Avatar';

export function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  
  React.useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container-app flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-primary-600 flex items-center">
          <PlusSquare className="h-6 w-6 mr-2" />
          SocialPulse
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          <NavLink to="/" isActive={isActive('/')} icon={<Home />} label="Home" />
          <NavLink to="/explore" isActive={isActive('/explore')} icon={<Search />} label="Explore" />
          <NavLink to="/create" isActive={isActive('/create')} icon={<PlusSquare />} label="Create" />
          <NavLink 
            to="/notifications" 
            isActive={isActive('/notifications')} 
            icon={<Bell />} 
            label="Notifications" 
            badge={unreadCount > 0 ? unreadCount : undefined}
          />
          <NavLink to="/profile" isActive={isActive('/profile')} icon={<UserCircle />} label="Profile" />
        </nav>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center">
          <Link 
            to="/notifications"
            className="relative p-2 text-gray-700 dark:text-gray-200 hover:text-primary-600 transition-colors"
          >
            <Bell size={24} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center h-4 w-4 text-xs text-white bg-accent-500 rounded-full">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          
          <Link to="/profile" className="ml-2">
            <Avatar src={user.avatar} alt={user.displayName} size="xs" />
          </Link>
          
          <button 
            onClick={logout}
            className="ml-4 p-2 text-gray-700 dark:text-gray-200 hover:text-error-500 transition-colors"
            aria-label="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
      
      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="flex justify-around py-2">
          <MobileNavLink to="/" isActive={isActive('/')} icon={<Home size={24} />} />
          <MobileNavLink to="/explore" isActive={isActive('/explore')} icon={<Search size={24} />} />
          <MobileNavLink to="/create" isActive={isActive('/create')} icon={<PlusSquare size={24} />} />
          <MobileNavLink to="/profile" isActive={isActive('/profile')} icon={<UserCircle size={24} />} />
        </div>
      </div>
    </header>
  );
}

interface NavLinkProps {
  to: string;
  isActive: boolean;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

function NavLink({ to, isActive, icon, label, badge }: NavLinkProps) {
  return (
    <Link 
      to={to}
      className={`flex items-center px-4 py-2 rounded-full text-sm font-medium relative ${
        isActive 
          ? 'bg-primary-50 text-primary-600 dark:bg-gray-800 dark:text-primary-400'
          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      <span className="mr-2">{icon}</span>
      <span>{label}</span>
      {badge !== undefined && (
        <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 text-xs text-white">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  );
}

interface MobileNavLinkProps {
  to: string;
  isActive: boolean;
  icon: React.ReactNode;
}

function MobileNavLink({ to, isActive, icon }: MobileNavLinkProps) {
  return (
    <Link 
      to={to}
      className={`p-2 rounded-full ${
        isActive 
          ? 'text-primary-600 dark:text-primary-400'
          : 'text-gray-700 dark:text-gray-400'
      }`}
    >
      {icon}
    </Link>
  );
}