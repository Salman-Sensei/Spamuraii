import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Lock } from 'lucide-react';
import { cn } from '../utils/cn';

const Hero = ({ onLoginClick }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
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
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20 animate-gradient" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(102,126,234,0.1),transparent_50%)]" />
      
      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary/30 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            y: [null, Math.random() * window.innerHeight],
            x: [null, Math.random() * window.innerWidth],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <motion.div
              className="inline-block mb-6"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <div className="text-8xl mb-4">🥷</div>
            </motion.div>
            <h1 className="text-6xl md:text-8xl font-black mb-6">
              <span className="gradient-text">Spamurai</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-4">
              Email Spam & Phishing Detection Web Application
            </p>
            <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto">
              AI-Powered Email Protection - Detect spam and phishing like a ninja
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(102, 126, 234, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={onLoginClick}
              className={cn(
                "px-8 py-4 rounded-xl font-bold text-lg",
                "bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600",
                "text-white shadow-2xl",
                "hover:shadow-[0_0_40px_rgba(102,126,234,0.6)]",
                "transition-all duration-300",
                "relative overflow-hidden group"
              )}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Get Started
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "px-8 py-4 rounded-xl font-bold text-lg",
                "bg-background/50 backdrop-blur-md border-2 border-primary/50",
                "text-foreground hover:border-primary",
                "transition-all duration-300"
              )}
            >
              Learn More
            </motion.button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {[
              { icon: Shield, title: "AI Protection", desc: "Advanced ML algorithms" },
              { icon: Zap, title: "Real-time Analysis", desc: "Instant spam detection" },
              { icon: Lock, title: "Secure & Private", desc: "Your data stays safe" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10, scale: 1.05 }}
                className={cn(
                  "p-6 rounded-2xl",
                  "bg-background/50 backdrop-blur-md",
                  "border border-border/50",
                  "hover:border-primary/50 hover:shadow-xl",
                  "transition-all duration-300"
                )}
              >
                <feature.icon className="w-12 h-12 text-primary mb-4 mx-auto" />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

