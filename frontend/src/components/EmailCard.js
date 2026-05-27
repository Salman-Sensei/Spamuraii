import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Calendar, AlertTriangle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../utils/cn';

const EmailCard = ({ email, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isSpam = email.classification === 'spam';
  const isHighRisk = email.warning_level === 'high';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={cn(
        "glass rounded-2xl p-6 border-2 transition-all duration-300",
        isSpam ? "border-red-500/50 bg-red-500/5" : "border-green-500/50 bg-green-500/5",
        isHighRisk && "border-red-500 bg-red-500/10"
      )}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Mail className={cn(
                "w-6 h-6",
                isSpam ? "text-red-500" : "text-green-500"
              )} />
            </motion.div>
            <h3 className="text-xl font-bold text-foreground flex-1">
              {email.subject || "No Subject"}
            </h3>
            <motion.span
              whileHover={{ scale: 1.1 }}
              className={cn(
                "px-4 py-1 rounded-full text-sm font-bold",
                isSpam 
                  ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                  : "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
              )}
            >
              {isSpam ? '⚠️ SPAM' : '✅ SAFE'}
            </motion.span>
          </div>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>{email.sender}</span>
            </div>
            {email.date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(email.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Probability Bars */}
      <div className="my-6 space-y-4 p-4 rounded-xl bg-background/50 border border-border">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-foreground">Spam Probability</span>
            <span className="text-sm font-bold text-red-500">{(email.spam_probability || 0).toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${email.spam_probability || 0}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-foreground">Ham Probability</span>
            <span className="text-sm font-bold text-green-500">{(email.ham_probability || 0).toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${email.ham_probability || 0}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <AnimatePresence>
        {isHighRisk && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 rounded-xl bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 animate-pulse" />
            <span className="text-sm font-semibold text-red-500">{email.warning_message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suspicious URLs */}
      <AnimatePresence>
        {email.phishing_indicators?.suspicious_urls?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30"
          >
            <h4 className="text-sm font-bold text-yellow-600 dark:text-yellow-400 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
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
                      whileHover={{ x: 4, scale: 1.02 }}
                      className="flex items-center gap-2 p-2 rounded-lg bg-background/50 hover:bg-background border border-border transition-colors"
                      onClick={(e) => {
                        if (!window.confirm('⚠️ This link appears suspicious. Are you sure you want to proceed?')) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <ExternalLink className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-mono text-foreground">{urlObj.hostname}</span>
                    </motion.a>
                  );
                } catch {
                  return (
                    <div key={idx} className="p-2 rounded-lg bg-background/50 border border-border text-sm text-muted-foreground">
                      Invalid URL
                    </div>
                  );
                }
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expandable Body */}
      <div className="mt-4 pt-4 border-t border-border">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
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
        </motion.button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 rounded-xl bg-background/50 border border-border text-sm text-foreground whitespace-pre-wrap max-h-96 overflow-y-auto"
            >
              {email.body}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default EmailCard;
