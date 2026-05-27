import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Moon, Sun, LogOut, User } from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { logout, googleLogin } from '../../api';

const Navbar = ({ user, isAuthenticated, onLoginClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { themeMode, toggleTheme } = useTheme();
  const location = useLocation();

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  const handleGetStarted = async (e) => {
    e.preventDefault();
    if (onLoginClick) {
      // Use the login handler from parent if provided
      await onLoginClick();
    } else {
      // Fallback: navigate to home page
      navigate('/');
    }
  };

  // Debug: Log user prop when it changes
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🔍 Navbar received user:', user);
      console.log('📸 Navbar - Picture URL:', user.picture);
      console.log('📸 Navbar - Name:', user.name);
      console.log('📸 Navbar - Email:', user.email);
      console.log('📸 Navbar - Has picture?', !!user.picture);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Features', path: '/features' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'About Us', path: '/about-us' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <div className="text-3xl">🥷</div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">Spamurai</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">AI-Powered Protection</p>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors relative group ${
                  location.pathname === item.path ? 'text-primary-600 dark:text-primary-400' : ''
                }`}
              >
                {item.name}
                <span className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary-500 to-purple-500 transition-all duration-300 ${
                  location.pathname === item.path ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              {themeMode === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </motion.button>

            {/* Dashboard Button - only show when authenticated and not on home page */}
            {isAuthenticated && location.pathname !== '/' && (
              <Link to="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-6 py-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow-lg shadow-green-500/50 hover:shadow-xl hover:shadow-green-500/70 transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    Dashboard
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              </Link>
            )}

            {/* User Menu */}
            {isAuthenticated && user && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-3 px-4 py-2 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 text-white"
              >
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name || user.email || 'User'}
                    className="w-8 h-8 rounded-full border-2 border-white/50 object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      console.error('Failed to load user picture in Navbar:', user.picture);
                      e.target.style.display = 'none';
                      // Show fallback icon
                      const fallback = e.target.nextElementSibling;
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                    onLoad={() => {
                      console.log('✅ User picture loaded successfully:', user.picture);
                    }}
                  />
                ) : null}
                {!user.picture && (
                  <div className="w-8 h-8 rounded-full border-2 border-white/50 bg-white/20 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                )}
                <span className="font-medium">
                  {user.name ? (user.name.split(' ')[0] || user.name) : (user.email || 'User')}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLogout}
                  className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}

            {/* Login Button - only show when not authenticated */}
            {!isAuthenticated && (
              <motion.button
                onClick={handleGetStarted}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 text-white font-semibold shadow-lg shadow-primary-500/50 hover:shadow-xl hover:shadow-primary-500/70 transition-all duration-300 glow"
              >
                Get Started
              </motion.button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-slate-800"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-slate-700"
          >
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block py-2 text-gray-700 dark:text-gray-300 font-medium transition-colors hover:text-primary-600 dark:hover:text-primary-400 ${
                    location.pathname === item.path ? 'text-primary-600 dark:text-primary-400' : ''
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200 dark:border-slate-700 space-y-3">
                {!isAuthenticated ? (
                  <button
                    onClick={handleGetStarted}
                    className="w-full px-6 py-3 rounded-full bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 text-white font-semibold shadow-lg shadow-primary-500/50 hover:shadow-xl hover:shadow-primary-500/70 transition-all duration-300"
                  >
                    Get Started
                  </button>
                ) : (
                  <>
                    {/* Dashboard Button in Mobile Menu - only show when not on home page */}
                    {location.pathname !== '/' && (
                      <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <button className="w-full px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow-lg shadow-green-500/50 hover:shadow-xl hover:shadow-green-500/70 transition-all duration-300 mb-3">
                          Dashboard
                        </button>
                      </Link>
                    )}
                    <div className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-2">
                      {user.picture ? (
                        <img 
                          src={user.picture} 
                          alt={user.name || user.email || 'User'} 
                          className="w-8 h-8 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            console.error('Failed to load user picture in mobile menu:', user.picture);
                            e.target.style.display = 'none';
                            const fallback = e.target.nextElementSibling;
                            if (fallback) fallback.classList.remove('hidden');
                          }}
                          onLoad={() => {
                            console.log('✅ User picture loaded in mobile menu:', user.picture);
                          }}
                        />
                      ) : null}
                      {!user.picture && (
                        <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                      )}
                      <span className="text-gray-700 dark:text-gray-300">
                        {user.name ? (user.name.split(' ')[0] || user.name) : (user.email || 'User')}
                      </span>
                    </div>
                    <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800" title="Logout">
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                  </>
                )}
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between py-2 text-gray-700 dark:text-gray-300"
                >
                  <span>Theme</span>
                  {themeMode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;

