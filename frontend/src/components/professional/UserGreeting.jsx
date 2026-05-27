import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut, User as UserIcon } from 'lucide-react';

const UserGreeting = ({ user, onLogout }) => {
  // Debug: Log user object
  useEffect(() => {
    if (user) {
      console.log('📸 UserGreeting - User object:', user);
      console.log('📸 UserGreeting - Picture URL:', user.picture);
      console.log('📸 UserGreeting - Name:', user.name);
      console.log('📸 UserGreeting - Email:', user.email);
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 p-6 shadow-2xl"
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent_50%)]" />
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {user.picture ? (
            <motion.img
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
              src={user.picture}
              alt={user.name || user.email}
              className="w-16 h-16 rounded-full border-4 border-white/50 shadow-xl object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                console.error('Failed to load user picture:', user.picture);
                e.target.style.display = 'none';
                // Show fallback icon
                const fallback = e.target.nextElementSibling;
                if (fallback) fallback.classList.remove('hidden');
              }}
              onLoad={() => {
                console.log('✅ UserGreeting - Picture loaded successfully');
              }}
            />
          ) : null}
          {!user.picture && (
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border-4 border-white/50 flex items-center justify-center"
            >
              <UserIcon className="w-8 h-8 text-white" />
            </motion.div>
          )}
          <div>
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-white mb-1"
            >
              Hello, {user.name || user.email.split('@')[0]}! 👋
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white/90 text-sm"
            >
              {user.email}
            </motion.p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.1, x: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold hover:bg-white/30 transition-all duration-300 shadow-lg"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </motion.button>
      </div>

      {/* Floating Particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/30 rounded-full"
          initial={{
            x: Math.random() * 300,
            y: Math.random() * 100,
          }}
          animate={{
            y: [null, Math.random() * 50 - 25],
            x: [null, Math.random() * 50 - 25],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      ))}
    </motion.div>
  );
};

export default UserGreeting;

