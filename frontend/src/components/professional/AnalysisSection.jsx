import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, CheckCircle, AlertTriangle, ExternalLink, Mail, Link as LinkIcon } from 'lucide-react';

const AnalysisSection = ({ analysis, isAnalyzing, manualText, setManualText, urlAnalysis, isAnalyzingUrl, urlInput, setUrlInput, onAnalyzeUrl }) => {
  const [activeTab, setActiveTab] = useState('email');
  const isSpam = analysis?.classification === 'spam';
  const isHighRisk = analysis?.warning_level === 'high';
  
  // URL analysis specific checks
  const isUrlMalicious = urlAnalysis?.label && urlAnalysis.label !== 'benign';
  const urlRiskLevel = urlAnalysis?.risk_level || 'low';

  return (
    <motion.section
      id="analysis"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-20"
    >
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 gradient-text">
            🔍 Analyze Content
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            Analyze emails or URLs for spam and phishing threats
          </p>
          
          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab('email')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'email'
                  ? 'bg-primary-500 text-white shadow-lg scale-105'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Mail className="w-5 h-5" />
              Email Analysis
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'url'
                  ? 'bg-primary-500 text-white shadow-lg scale-105'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <LinkIcon className="w-5 h-5" />
              URL Analysis
            </button>
          </div>
        </motion.div>

        {/* Email Analysis Tab */}
        {activeTab === 'email' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`relative mb-8 rounded-2xl border-2 transition-all duration-300 ${
              isHighRisk
                ? 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20'
                : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-800/50'
            } backdrop-blur-xl shadow-xl`}
          >
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Paste email content here for instant analysis...&#10;&#10;The analysis will start automatically as you type..."
              rows={10}
              className="w-full p-6 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none"
            />
            {manualText.length > 0 && manualText.length <= 10 && (
              <div className="absolute bottom-4 right-4 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400">
                Type at least 10 characters...
              </div>
            )}
          </motion.div>
        )}

        {/* URL Analysis Tab */}
        {activeTab === 'url' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="mb-8"
          >
            <div className={`relative rounded-2xl border-2 transition-all duration-300 ${
              urlRiskLevel === 'high'
                ? 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20'
                : urlRiskLevel === 'medium'
                ? 'border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20'
                : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-800/50'
            } backdrop-blur-xl shadow-xl`}>
              <div className="flex gap-2 p-4">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && urlInput.trim()) {
                      onAnalyzeUrl();
                    }
                  }}
                  placeholder="Enter URL to analyze (e.g., https://example.com)"
                  className="flex-1 p-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={onAnalyzeUrl}
                  disabled={!urlInput.trim() || isAnalyzingUrl}
                  className="px-6 py-4 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                >
                  {isAnalyzingUrl ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Analyze
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        <AnimatePresence>
          {(isAnalyzing || isAnalyzingUrl) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center justify-center py-12"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  {activeTab === 'email' ? 'Analyzing email content...' : 'Analyzing URL...'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email Analysis Results */}
        <AnimatePresence>
          {activeTab === 'email' && analysis && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className={`rounded-2xl p-8 border-2 shadow-2xl ${
                isSpam
                  ? 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20'
                  : 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20'
              } backdrop-blur-xl`}
            >
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-xl ${
                    isSpam ? 'bg-red-500/20' : 'bg-green-500/20'
                  }`}
                >
                  {isSpam ? (
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  ) : (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isSpam ? '⚠️ Spam Detected' : '✅ Safe Email'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {isSpam ? 'This email appears to be spam' : 'This email appears to be safe'}
                  </p>
                </div>
              </div>

              {/* Probability Bars */}
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Spam Probability</span>
                    <span className="font-bold text-red-500">{(analysis.spam_probability || 0).toFixed(1)}%</span>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${analysis.spam_probability || 0}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Ham Probability</span>
                    <span className="font-bold text-green-500">{(analysis.ham_probability || 0).toFixed(1)}%</span>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${analysis.ham_probability || 0}%` }}
                      transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Warning */}
              {isHighRisk && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3"
                >
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 dark:text-red-400 font-semibold">{analysis.warning_message}</p>
                </motion.div>
              )}

              {/* Suspicious URLs */}
              {analysis.phishing_indicators?.suspicious_urls?.length > 0 && (
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
                  <h4 className="text-orange-700 dark:text-orange-400 font-bold mb-3 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Suspicious Links Detected
                  </h4>
                  <div className="space-y-2">
                    {analysis.phishing_indicators.suspicious_urls.map((url, idx) => {
                      try {
                        const urlObj = new URL(url);
                        return (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-3 rounded-lg bg-white/50 dark:bg-black/20 hover:bg-white/70 dark:hover:bg-black/40 transition-all duration-200 hover:translate-x-1"
                            onClick={(e) => {
                              if (!window.confirm('⚠️ This link appears suspicious. Are you sure you want to proceed?')) {
                                e.preventDefault();
                              }
                            }}
                          >
                            <span className="font-mono text-sm text-orange-600 dark:text-orange-400">
                              {urlObj.hostname}
                            </span>
                          </a>
                        );
                      } catch {
                        return null;
                      }
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* URL Analysis Results */}
        <AnimatePresence>
          {activeTab === 'url' && urlAnalysis && !isAnalyzingUrl && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className={`rounded-2xl p-8 border-2 shadow-2xl ${
                isUrlMalicious
                  ? urlRiskLevel === 'high'
                    ? 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20'
                    : 'border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20'
                  : 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20'
              } backdrop-blur-xl`}
            >
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-xl ${
                    isUrlMalicious
                      ? urlRiskLevel === 'high'
                        ? 'bg-red-500/20'
                        : 'bg-orange-500/20'
                      : 'bg-green-500/20'
                  }`}
                >
                  {isUrlMalicious ? (
                    <AlertTriangle className={`w-8 h-8 ${urlRiskLevel === 'high' ? 'text-red-500' : 'text-orange-500'}`} />
                  ) : (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isUrlMalicious
                      ? urlRiskLevel === 'high'
                        ? '⚠️ High Risk URL'
                        : '⚠️ Medium Risk URL'
                      : '✅ Safe URL'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {urlAnalysis.label === 'benign' 
                      ? 'This URL appears to be safe'
                      : `This URL is classified as: ${urlAnalysis.label}`}
                  </p>
                </div>
              </div>

              {/* URL Display */}
              <div className="mb-6 p-4 rounded-xl bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Analyzed URL:</p>
                <p className="font-mono text-sm text-gray-900 dark:text-white break-all">{urlAnalysis.url}</p>
              </div>

              {/* Confidence Score */}
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Confidence</span>
                    <span className={`font-bold ${
                      urlRiskLevel === 'high'
                        ? 'text-red-500'
                        : urlRiskLevel === 'medium'
                        ? 'text-orange-500'
                        : 'text-green-500'
                    }`}>
                      {((urlAnalysis.confidence || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(urlAnalysis.confidence || 0) * 100}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        urlRiskLevel === 'high'
                          ? 'bg-gradient-to-r from-red-500 to-orange-500'
                          : urlRiskLevel === 'medium'
                          ? 'bg-gradient-to-r from-orange-500 to-yellow-500'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Risk Level Badge */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">Risk Level:</span>
                <span className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                  urlRiskLevel === 'high'
                    ? 'bg-red-500/20 text-red-700 dark:text-red-400'
                    : urlRiskLevel === 'medium'
                    ? 'bg-orange-500/20 text-orange-700 dark:text-orange-400'
                    : 'bg-green-500/20 text-green-700 dark:text-green-400'
                }`}>
                  {urlRiskLevel.toUpperCase()}
                </span>
              </div>

              {/* Warning Message */}
              {isUrlMalicious && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    urlRiskLevel === 'high'
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-orange-500/10 border-orange-500/30'
                  }`}
                >
                  <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${
                    urlRiskLevel === 'high' ? 'text-red-500' : 'text-orange-500'
                  }`} />
                  <p className={`font-semibold ${
                    urlRiskLevel === 'high'
                      ? 'text-red-700 dark:text-red-400'
                      : 'text-orange-700 dark:text-orange-400'
                  }`}>
                    {urlRiskLevel === 'high'
                      ? '⚠️ This URL has been flagged as potentially malicious. Exercise extreme caution before visiting.'
                      : '⚠️ This URL shows some suspicious characteristics. Proceed with caution.'}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

export default AnalysisSection;

