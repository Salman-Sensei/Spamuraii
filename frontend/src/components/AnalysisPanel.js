import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

const AnalysisPanel = ({ analysis, isAnalyzing }) => {
  if (!analysis && !isAnalyzing) return null;

  if (isAnalyzing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 p-8 rounded-2xl glass border border-primary/20"
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">Analyzing email content...</p>
        </div>
      </motion.div>
    );
  }

  const isSpam = analysis.classification === 'spam';
  const isHighRisk = analysis.warning_level === 'high';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "mt-6 p-8 rounded-2xl glass border-2",
        isSpam ? "border-red-500/50 bg-red-500/5" : "border-green-500/50 bg-green-500/5"
      )}
    >
      <div className="flex items-center gap-4 mb-6">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
        >
          {isSpam ? (
            <AlertTriangle className="w-12 h-12 text-red-500" />
          ) : (
            <CheckCircle className="w-12 h-12 text-green-500" />
          )}
        </motion.div>
        <div>
          <h3 className="text-2xl font-bold text-foreground">
            {isSpam ? '⚠️ Spam Detected' : '✅ Safe Email'}
          </h3>
          <p className="text-muted-foreground">
            {isSpam ? 'This email appears to be spam' : 'This email appears to be safe'}
          </p>
        </div>
      </div>

      {/* Probability Bars */}
      <div className="space-y-4 p-6 rounded-xl bg-background/50 border border-border mb-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-foreground">Spam Probability</span>
            <span className="text-sm font-bold text-red-500">{(analysis.spam_probability || 0).toFixed(1)}%</span>
          </div>
          <div className="h-4 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${analysis.spam_probability || 0}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-foreground">Ham Probability</span>
            <span className="text-sm font-bold text-green-500">{(analysis.ham_probability || 0).toFixed(1)}%</span>
          </div>
          <div className="h-4 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${analysis.ham_probability || 0}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      {isHighRisk && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 flex items-center gap-3 mb-6"
        >
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 animate-pulse" />
          <span className="text-sm font-semibold text-red-500">{analysis.warning_message}</span>
        </motion.div>
      )}

      {/* Suspicious URLs */}
      {analysis.phishing_indicators?.suspicious_urls?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30"
        >
          <h4 className="text-sm font-bold text-yellow-600 dark:text-yellow-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Suspicious Links Detected
          </h4>
          <div className="space-y-2">
            {analysis.phishing_indicators.suspicious_urls.map((url, idx) => {
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
    </motion.div>
  );
};

export default AnalysisPanel;
