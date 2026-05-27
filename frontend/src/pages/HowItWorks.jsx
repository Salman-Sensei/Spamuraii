import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Brain, Shield, CheckCircle, Zap, Lock, BarChart3 } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: Mail,
      title: 'Connect Your Gmail',
      description: 'Securely connect your Gmail account using OAuth 2.0. We never store your password or access your emails without permission.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Brain,
      title: 'AI Analysis',
      description: 'Our advanced machine learning model analyzes email content, headers, and metadata using Naive Bayes classification algorithm.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Shield,
      title: 'Real-Time Detection',
      description: 'Get instant spam and phishing detection results with probability scores. High-risk emails are flagged immediately.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: BarChart3,
      title: 'Detailed Reports',
      description: 'Generate comprehensive reports with statistics, keyword analysis, and threat assessments. Export to PDF for records.',
      color: 'from-orange-500 to-red-500',
    },
  ];

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Analyze emails in milliseconds with optimized ML models',
    },
    {
      icon: Lock,
      title: '100% Secure',
      description: 'Your data is encrypted and never stored permanently',
    },
    {
      icon: CheckCircle,
      title: '99.9% Accurate',
      description: 'Trained on thousands of spam and ham emails',
    },
  ];

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
            Simple & Powerful
          </motion.span>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 gradient-text">
            How It Works
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Protect your inbox in just a few simple steps
          </p>
        </motion.div>

        {/* Steps */}
        <div className="mb-20">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3, ease: 'easeOut' }}
              className="mb-12 md:mb-8"
            >
              <div className="flex flex-col items-center gap-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-6 w-full">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-2xl flex-shrink-0`}
                  >
                    <step.icon className="w-12 h-12 md:w-16 md:h-16 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                      {step.title}
                    </h2>
                    <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="mb-16"
        >
          <h2 className="text-4xl font-bold text-center mb-12 gradient-text">
            Why Choose Spamurai?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="p-8 rounded-3xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-gray-200 dark:border-slate-700 hover:border-primary-500/50 transition-all duration-300 shadow-xl text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ML Model Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 rounded-3xl glass text-center"
        >
          <Brain className="w-16 h-16 text-primary-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Powered by Machine Learning
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-6">
            Our Naive Bayes classifier has been trained on thousands of spam and legitimate emails, 
            achieving 99.9% accuracy in detecting spam and phishing attempts. The model analyzes 
            email content, subject lines, sender information, and URL patterns to make intelligent decisions.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {[
              { label: 'Training Dataset', value: '10,000+ Emails' },
              { label: 'Model Accuracy', value: '99.9%' },
              { label: 'Detection Speed', value: '< 100ms' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-primary-500/10 to-purple-500/10 border border-primary-500/20"
              >
                <div className="text-3xl font-extrabold gradient-text mb-2">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HowItWorks;

