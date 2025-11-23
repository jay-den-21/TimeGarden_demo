import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  FileText, 
  MessageSquare, 
  Wallet, 
  Bell, 
  Menu,
  X,
  Briefcase,
  LogOut,
  LogIn,
  UserPlus
} from 'lucide-react';
import { getCurrentUser, getWalletData } from '../services/mockDatabase';
import { logout, isAuthenticated } from '../services/authService';
import { User, WalletData } from '../types';

interface SidebarItemProps {
  to: string;
  icon: any;
  label: string;
  active: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      active 
        ? 'bg-blue-100 text-blue-700 font-medium' 
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </Link>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<WalletData>({ balance: 0, escrowBalance: 0 });
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = isAuthenticated();
      setAuthenticated(authStatus);
      
      if (authStatus) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
          const walletData = await getWalletData();
          setWallet(walletData);
        } catch (error) {
          // If API fails, user might not be logged in
          setAuthenticated(false);
        }
      }
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    setWallet({ balance: 0, escrowBalance: 0 });
    setAuthenticated(false);
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/browse', label: 'Browse Tasks', icon: Search },
    { path: '/proposals', label: 'My Proposals', icon: FileText },
    { path: '/contracts', label: 'Contracts', icon: Briefcase },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
    { path: '/wallet', label: 'Wallet', icon: Wallet },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            T
          </div>
          <span className="font-bold text-xl text-gray-800">TimeGarden</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`
          fixed md:sticky top-0 h-screen w-64 bg-white border-r border-gray-200 flex-shrink-0 z-10 transition-transform duration-300
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-6 flex items-center space-x-3 border-b border-gray-100 h-20">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
            TG
          </div>
          <div>
            <h1 className="font-bold text-xl text-gray-900 leading-none">TimeGarden</h1>
            <span className="text-xs text-gray-500">Task Marketplace</span>
          </div>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-5rem)]">
          {navItems.map((item) => (
            <SidebarItem 
              key={item.path} 
              to={item.path} 
              icon={item.icon} 
              label={item.label} 
              active={location.pathname === item.path}
            />
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Desktop Header */}
        <header className="hidden md:flex h-20 bg-white border-b border-gray-200 items-center justify-between px-8">
          <div className="text-gray-400 text-sm">
            Campus &gt; {navItems.find(i => i.path === location.pathname)?.label || 'Page'}
          </div>

          <div className="flex items-center space-x-6">
            {authenticated && user ? (
              <>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-gray-900">{wallet.balance.toFixed(2)} TC</span>
                  <span className="text-xs text-green-600 font-medium">Available</span>
                </div>
                
                <button 
                  className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                  title="Notifications"
                >
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="flex items-center space-x-2 pl-4 border-l border-gray-200">
                  <div className="w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user.displayName.charAt(0) || '?'}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogIn size={18} />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <UserPlus size={18} />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          {children}
        </div>
      </main>
      
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-0 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Layout;