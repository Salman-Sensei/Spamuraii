import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Calendar, User, ChevronDown, ChevronUp, ExternalLink, AlertTriangle } from 'lucide-react';

const EmailCardProfessional = memo(({ email, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isSpam = email.classification === 'spam';
  const isHighRisk = email.warning_level === 'high';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
      className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-200 ease-out h-full flex flex-col ${
        isSpam
          ? 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20'
          : 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20'
      } ${isHighRisk ? 'ring-2 ring-red-500/50' : ''} backdrop-blur-xl shadow-xl hover:shadow-2xl hover:-translate-y-1`}
    >
      {/* Gradient Border Effect */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
          isSpam
            ? 'bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20'
            : 'bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-green-500/20'
        }`}
      />

      <div className="relative p-6 flex-1 flex flex-col">
        {/* Content Area - grows to fill space */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className={`p-2 rounded-xl ${
                    isSpam ? 'bg-red-500/20' : 'bg-green-500/20'
                  }`}
                >
                  <Mail className={`w-5 h-5 ${isSpam ? 'text-red-500' : 'text-green-500'}`} />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 break-words">
                    {email.subject || 'No Subject'}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                    <div className="flex items-center gap-1 min-w-0">
                      <User className="w-4 h-4 flex-shrink-0" />
                      <span className="break-words">{email.sender}</span>
                    </div>
                    {email.date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(email.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Badge */}
            <div
              className={`px-4 py-2 rounded-full font-bold text-sm transition-transform duration-200 hover:scale-105 ${
                isSpam
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
              } shadow-lg`}
            >
              {isSpam ? '⚠️ SPAM' : '✅ SAFE'}
            </div>
          </div>

          {/* Suspicious URLs */}
          {email.phishing_indicators?.suspicious_urls?.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30"
            >
              <h4 className="text-orange-700 dark:text-orange-400 font-bold mb-2 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Suspicious Links Detected
              </h4>
              <div className="space-y-2">
                {email.phishing_indicators.suspicious_urls.map((url, idx) => {
                  try {
                    const urlObj = new URL(url);
                    return (
                      <motion.a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ x: 5, scale: 1.02 }}
                        onClick={(e) => {
                          if (!window.confirm('⚠️ This link appears suspicious. Are you sure you want to proceed?')) {
                            e.preventDefault();
                          }
                        }}
                        className="block p-2 rounded-lg bg-white/50 dark:bg-black/20 hover:bg-white/70 dark:hover:bg-black/40 transition-colors text-sm"
                      >
                        <span className="font-mono text-orange-600 dark:text-orange-400">{urlObj.hostname}</span>
                      </motion.a>
                    );
                  } catch {
                    return null;
                  }
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Probability Bars, Warning Banner and Expand Button - Always at bottom */}
        <div className="mt-auto">
          {/* Probability Bars */}
          <div className="mb-4 space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Spam Probability</span>
                <span className="font-bold text-red-500">{(email.spam_probability || 0).toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${email.spam_probability || 0}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Ham Probability</span>
                <span className="font-bold text-green-500">{(email.ham_probability || 0).toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${email.ham_probability || 0}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 + 0.2, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Warning Banner - Above Show Full Content button */}
          <AnimatePresence>
            {isHighRisk && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 dark:text-red-400 font-semibold text-sm">{email.warning_message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 font-medium active:scale-95"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Hide Content
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show Full Content
              </>
            )}
          </button>

          {/* Expanded Content */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
              >
                <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words overflow-wrap-anywhere font-mono">
                    {email.body}
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
});

EmailCardProfessional.displayName = 'EmailCardProfessional';

export default EmailCardProfessional;

