import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Shield, Zap, ArrowRight } from 'lucide-react';

const HeroSection = ({ onGetStarted, isAuthenticated }) => {
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 animated-gradient opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(102,126,234,0.1),transparent_50%)]" />
      
      {/* Floating Particles - Reduced for performance */}
      {typeof window !== 'undefined' && [...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary-500/20 rounded-full"
          style={{ willChange: 'transform' }}
          initial={{
            x: Math.random() * (window.innerWidth || 1920),
            y: Math.random() * (window.innerHeight || 1080),
          }}
          animate={{
            y: [null, Math.random() * 50 - 25],
            x: [null, Math.random() * 50 - 25],
          }}
          transition={{
            duration: Math.random() * 4 + 3,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />
      ))}

      <div className="relative z-10 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-8">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary-500/10 to-purple-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 text-sm font-medium"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Email Protection
            </motion.span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6"
          >
            <span className="block gradient-text">Spamurai</span>
            <span className="block text-gray-900 dark:text-white mt-2">
              Email Spam & Phishing
            </span>
            <span className="block text-gray-900 dark:text-white">
              Detection Web Application
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Protect your inbox with cutting-edge AI technology. 
            Detect spam and phishing attempts like a ninja.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            {!isAuthenticated ? (
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGetStarted}
                className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 text-white font-bold text-lg shadow-2xl shadow-primary-500/50 hover:shadow-primary-500/70 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-primary-500"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDashboardClick}
                className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg shadow-2xl shadow-green-500/50 hover:shadow-green-500/70 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            )}

            {!isAuthenticated && (
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-md border-2 border-primary-500/50 text-primary-600 dark:text-primary-400 font-bold text-lg hover:bg-primary-500/10 transition-all duration-300"
              >
                Watch Demo
              </motion.button>
            )}
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {[
              { icon: Shield, text: 'Advanced AI Detection' },
              { icon: Zap, text: 'Real-time Analysis' },
              { icon: Sparkles, text: '99.9% Accuracy' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -5 }}
                className="p-6 rounded-2xl glass hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300"
              >
                <feature.icon className="w-8 h-8 text-primary-500 mx-auto mb-3" />
                <p className="text-gray-700 dark:text-gray-300 font-medium">{feature.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-primary-500/50 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;

