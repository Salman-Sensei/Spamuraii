import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Code, Zap, Shield, Mail, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const Documentation = () => {
  const [openSection, setOpenSection] = useState(0);

  const sections = [
    {
      title: 'Getting Started',
      icon: Zap,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Quick Start</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Get up and running with Spamurai in minutes. Follow these simple steps to start protecting your inbox.
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Click "Get Started" or "Login with Google" button</li>
              <li>Authorize Spamurai to access your Gmail account</li>
              <li>Click "Fetch Gmail Emails" to scan your inbox</li>
              <li>View analysis results and generate reports</li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      title: 'API Integration',
      icon: Code,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">REST API</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Integrate Spamurai into your application using our REST API.
            </p>
            <div className="bg-slate-900 rounded-xl p-4 mb-4">
              <pre className="text-green-400 text-sm">
{`POST /api/predict
Content-Type: application/json

{
  "email_content": "Your email text here"
}

Response:
{
  "classification": "spam",
  "spam_probability": 95.2,
  "ham_probability": 4.8
}`}
              </pre>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Machine Learning Model',
      icon: Shield,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">How It Works</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Spamurai uses a Naive Bayes classifier trained on thousands of spam and legitimate emails.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li><strong>Feature Extraction:</strong> Analyzes email content, subject lines, and metadata</li>
              <li><strong>Classification:</strong> Uses probability-based algorithm to determine spam likelihood</li>
              <li><strong>Phishing Detection:</strong> Identifies suspicious URLs and patterns</li>
              <li><strong>Accuracy:</strong> 99.9% accuracy rate on test dataset</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: 'Gmail Integration',
      icon: Mail,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">OAuth 2.0 Setup</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Spamurai uses Google OAuth 2.0 for secure Gmail access. We only request read-only access to your emails.
            </p>
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4">
              <p className="text-blue-900 dark:text-blue-200 text-sm">
                <strong>Required Scopes:</strong> gmail.readonly - We only read your emails, never send or modify them.
              </p>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              You can revoke access at any time from your Google Account settings.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Troubleshooting',
      icon: Book,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Common Issues</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Session Expired Error</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  If you see a "session expired" error, simply log out and log back in. Your OAuth token may have expired.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Gmail API Not Enabled</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Make sure the Gmail API is enabled in your Google Cloud Console project. Check the setup guide for details.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">No Emails Found</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Ensure you have emails in your inbox. The system fetches the 10 most recent emails by default.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
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
            Complete Guide
          </motion.span>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 gradient-text">
            Documentation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Everything you need to know about using Spamurai
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="rounded-3xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-gray-200 dark:border-slate-700 overflow-hidden"
            >
              <button
                onClick={() => setOpenSection(openSection === index ? -1 : index)}
                className="w-full p-6 flex items-center justify-between hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary-500/10">
                    <section.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {section.title}
                  </h2>
                </div>
                {openSection === index ? (
                  <ChevronUp className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                )}
              </button>
              <AnimatePresence>
                {openSection === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 border-t border-gray-200 dark:border-slate-700">
                      {section.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Additional Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-primary-500/10 to-purple-500/10 border border-primary-500/20 text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Need More Help?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Check out our support page or contact us directly
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <motion.a
              href="/support"
              whileHover={{ scale: 1.05 }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Contact Support
            </motion.a>
            <motion.a
              href="/how-it-works"
              whileHover={{ scale: 1.05 }}
              className="px-6 py-3 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-semibold hover:bg-white dark:hover:bg-slate-700 transition-all duration-300"
            >
              How It Works
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Documentation;

