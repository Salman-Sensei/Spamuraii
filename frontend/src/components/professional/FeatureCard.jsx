import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const FeatureCard = memo(({ icon: Icon, title, description, delay = 0, gradient }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      className="group relative p-8 rounded-3xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-gray-200/50 dark:border-slate-700/50 hover:border-primary-500/50 transition-all duration-200 ease-out overflow-hidden hover:-translate-y-2"
      style={{ willChange: 'transform' }}
    >
      {/* Gradient Overlay on Hover */}
      <motion.div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${gradient}`}
      />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center mb-6 shadow-lg shadow-primary-500/30 transition-transform duration-200 group-hover:scale-110">
          <Icon className="w-8 h-8 text-white" />
        </div>

        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {title}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
          {description}
        </p>

        <div className="flex items-center text-primary-600 dark:text-primary-400 font-semibold transition-transform duration-200 group-hover:translate-x-1">
          Learn more
          <ArrowUpRight className="w-5 h-5 ml-2" />
        </div>
      </div>

      {/* Shine Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
      />
    </motion.div>
  );
});

FeatureCard.displayName = 'FeatureCard';

export default FeatureCard;

