import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Crown, Zap, Shield, BarChart, Mail, Sparkles } from 'lucide-react';
import VIPButton from '../components/professional/VIPButton';

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  
  // Memoize plans to prevent re-renders
  const plans = useMemo(() => [
    {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for personal use',
      features: [
        '10 email analyses per day',
        'Basic spam detection',
        'Manual text analysis',
        'Email reports',
        'Community support',
      ],
      icon: Mail,
      color: 'from-gray-500 to-gray-600',
      popular: false,
    },
    {
      name: 'Pro',
      price: { monthly: 9.99, yearly: 99.99 },
      description: 'For power users and small teams',
      features: [
        'Unlimited email analyses',
        'Advanced phishing detection',
        'Gmail integration',
        'Detailed analytics',
        'PDF export',
        'Priority support',
        'API access',
      ],
      icon: Zap,
      color: 'from-blue-500 to-cyan-500',
      popular: true,
    },
    {
      name: 'VIP',
      price: { monthly: 29.99, yearly: 299.99 },
      description: 'Enterprise-grade protection',
      features: [
        'Everything in Pro',
        'Custom ML models',
        'White-label solution',
        'Dedicated support',
        'SLA guarantee',
        'Custom integrations',
        'Advanced security',
        'Team management',
      ],
      icon: Crown,
      color: 'from-yellow-400 via-orange-500 to-pink-500',
      popular: false,
      vip: true,
    },
  ], []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-24 pb-20">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-2 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold mb-4"
          >
            Choose Your Plan
          </motion.span>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 gradient-text">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
            Start free and scale as you grow. No hidden fees, cancel anytime.
          </p>

          {/* Toggle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-4 p-2 rounded-full bg-gray-200 dark:bg-slate-700"
          >
            <motion.button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                !isYearly
                  ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Monthly
            </motion.button>
            <motion.button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2 rounded-full font-semibold transition-colors relative ${
                isYearly
                  ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs bg-green-500 text-white rounded-full">
                Save 17%
              </span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={`${plan.name}-${index}`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`relative p-5 rounded-2xl flex flex-col ${
                plan.popular
                  ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/50 shadow-2xl scale-105'
                  : plan.vip
                  ? 'bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-pink-500/10 border-2 border-yellow-500/50 shadow-2xl'
                  : 'bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700'
              } backdrop-blur-xl transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-bold rounded-full">
                  Most Popular
                </div>
              )}
              {plan.vip && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <VIPButton size="sm">VIP</VIPButton>
                </div>
              )}

              <div className="text-center mb-4">
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mx-auto mb-3 shadow-lg`}
                >
                  <plan.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1.5">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1.5">
                  <motion.span 
                    key={isYearly ? 'yearly' : 'monthly'}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="text-3xl font-extrabold gradient-text"
                  >
                    ${isYearly ? plan.price.yearly : plan.price.monthly}
                  </motion.span>
                  {plan.price.monthly > 0 && (
                    <motion.span 
                      key={isYearly ? 'year' : 'month'}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm text-gray-600 dark:text-gray-400"
                    >
                      /{isYearly ? 'year' : 'month'}
                    </motion.span>
                  )}
                </div>
              </div>

              <ul className="space-y-2 mb-4 flex-grow">
                {plan.features.map((feature, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + idx * 0.05 }}
                    className="flex items-start gap-2"
                  >
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                  </motion.li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 mt-auto ${
                  plan.vip
                    ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white shadow-xl'
                    : plan.popular
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-xl'
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600'
                }`}
              >
                {plan.price.monthly === 0 ? 'Get Started Free' : 'Choose Plan'}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Have questions? We're here to help.
          </p>
          <motion.a
            href="/support"
            whileHover={{ scale: 1.05 }}
            className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-purple-500 text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            Contact Support
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;

