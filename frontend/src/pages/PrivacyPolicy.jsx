import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, CheckCircle } from 'lucide-react';

const PrivacyPolicy = () => {
  const sections = [
    {
      icon: Shield,
      title: 'Data Collection',
      content: `We collect minimal data necessary to provide our service. When you connect your Gmail account, we only access email metadata and content temporarily for analysis. We do not store your email content permanently. Your login credentials are never stored - we use OAuth 2.0 for secure authentication.`,
    },
    {
      icon: Lock,
      title: 'Data Security',
      content: `All data transmission is encrypted using SSL/TLS protocols. Your information is processed securely and never shared with third parties. We implement industry-standard security measures to protect your data from unauthorized access, disclosure, or destruction.`,
    },
    {
      icon: Eye,
      title: 'Data Usage',
      content: `Your email data is used solely for spam and phishing detection. We use machine learning models to analyze email content, but this analysis happens in real-time and results are not stored. We do not use your data for advertising, marketing, or any other purposes.`,
    },
    {
      icon: FileText,
      title: 'Your Rights',
      content: `You have the right to access, modify, or delete your data at any time. You can disconnect your Gmail account at any time, which will immediately revoke our access. You can request a copy of any data we have about you, though we store minimal information.`,
    },
    {
      icon: CheckCircle,
      title: 'Compliance',
      content: `We comply with GDPR, CCPA, and other applicable data protection regulations. We are committed to transparency about our data practices and will notify users of any significant changes to this policy.`,
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
            Last Updated: December 2025
          </motion.span>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 gradient-text">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 p-8 rounded-3xl glass"
        >
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            At Spamurai, we are committed to protecting your privacy and ensuring the security of your personal information. 
            This Privacy Policy explains how we handle your data when you use our email spam and phishing detection service.
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            By using Spamurai, you agree to the collection and use of information in accordance with this policy. 
            We will not use or share your information except as described in this Privacy Policy.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-8 mb-12">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-3xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-gray-200 dark:border-slate-700 hover:border-primary-500/50 transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-xl bg-primary-500/10">
                  <section.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {section.title}
                </h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 rounded-3xl bg-gradient-to-br from-primary-500/10 to-purple-500/10 border border-primary-500/20 text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Questions About Privacy?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:privacy@spamurai.com" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              privacy@spamurai.com
            </a>
          </p>
          <motion.a
            href="/support"
            whileHover={{ scale: 1.05 }}
            className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Contact Support
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

