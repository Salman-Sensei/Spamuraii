import React from 'react';
import { motion } from 'framer-motion';
import FeatureCard from './FeatureCard';
import { Shield, Zap, Brain, Lock, BarChart3, Globe } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Detection',
      description: 'Advanced machine learning algorithms analyze emails with 99.9% accuracy, detecting spam and phishing attempts in real-time.',
      gradient: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
    },
    {
      icon: Zap,
      title: 'Real-Time Analysis',
      description: 'Instant email analysis as you type. Get immediate feedback on suspicious content and potential threats.',
      gradient: 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20',
    },
    {
      icon: Shield,
      title: 'Gmail Integration',
      description: 'Seamlessly connect your Gmail account and automatically scan your inbox for spam and phishing attempts.',
      gradient: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
    },
    {
      icon: Lock,
      title: 'Secure & Private',
      description: 'Your emails are processed securely. We never store your personal data or email content.',
      gradient: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20',
    },
    {
      icon: BarChart3,
      title: 'Detailed Reports',
      description: 'Generate comprehensive PDF reports with statistics, keyword analysis, and threat assessments.',
      gradient: 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20',
    },
    {
      icon: Globe,
      title: 'Offline Mode',
      description: 'Analyze any email content without internet connection. Perfect for testing suspicious emails safely.',
      gradient: 'bg-gradient-to-br from-teal-500/20 to-blue-500/20',
    },
  ];

  return (
    <section id="features" className="py-20 relative">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="inline-block px-4 py-2 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold mb-4"
          >
            Powerful Features
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 gradient-text">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Advanced AI technology combined with intuitive design for the ultimate email protection experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.1}
              gradient={feature.gradient}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

