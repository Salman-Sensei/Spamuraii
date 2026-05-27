import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  googleLogin,
  fetchEmails,
  analyzeOffline,
  analyzeUrl,
  generateReport,
  exportPDF,
  logout,
  getUserInfo,
  checkAuthStatus,
  testBackendConnection
} from "./api";
import { useTheme } from "./components/ThemeProvider";
import Navbar from "./components/professional/Navbar";
import Footer from "./components/professional/Footer";
import { X, AlertCircle, Mail, Link as LinkIcon, Search, Loader2, CheckCircle, AlertTriangle, ChevronUp, ChevronDown } from "lucide-react";

// Lazy load heavy components
const HeroSection = lazy(() => import("./components/professional/HeroSection"));
const FeaturesSection = lazy(() => import("./components/professional/FeaturesSection"));
const AnimatedBackground = lazy(() => import("./components/professional/AnimatedBackground"));
const UserGreeting = lazy(() => import("./components/professional/UserGreeting"));
const EmailCardProfessional = lazy(() => import("./components/professional/EmailCardProfessional"));
const EmailFetchOptions = lazy(() => import("./components/professional/EmailFetchOptions"));
const AnalysisSection = lazy(() => import("./components/professional/AnalysisSection"));
const ReportSectionProfessional = lazy(() => import("./components/professional/ReportSectionProfessional"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Support = lazy(() => import("./pages/Support"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Documentation = lazy(() => import("./pages/Documentation"));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"
      />
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    </motion.div>
  </div>
);

// Main Dashboard Component (for authenticated users)
function Dashboard() {
  const { themeMode } = useTheme();
  const [manualText, setManualText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [emails, setEmails] = useState([]);
  const [report, setReport] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('date-desc'); // Default: newest first
  const [showEmails, setShowEmails] = useState(true); // Toggle to show/hide emails
  const [fetchProgress, setFetchProgress] = useState(0); // Progress percentage for email fetching
  const [user, setUser] = useState(null);
  
  // Memoize sorted emails to prevent unnecessary re-sorting and improve performance
  // Helper function to get highest URL risk level
  const getHighestUrlRisk = (email) => {
    // First check if warning message indicates malicious URL
    const warningMsg = (email.warning_message || '').toLowerCase();
    if (warningMsg.includes('malicious url') || warningMsg.includes('dangerous links')) {
      return 4; // Highest priority for explicit malicious URL warnings
    }
    
    // Check warning level
    const warningLevel = (email.warning_level || '').toLowerCase();
    if (warningLevel === 'high' && warningMsg.includes('url')) {
      return 4;
    }
    
    // Check url_risks array
    const urlRisks = email.url_risks || [];
    if (urlRisks.length === 0) {
      // Also check phishing_indicators for suspicious URLs
      const phishingUrls = email.phishing_indicators?.suspicious_urls || [];
      if (phishingUrls.length > 0) {
        return 3; // High priority for suspicious URLs
      }
      return 0; // No URLs = lowest priority
    }
    
    // Risk level priority: high=3, medium=2, low=1, none=0
    const riskPriority = { 'high': 3, 'medium': 2, 'low': 1 };
    let maxPriority = 0;
    
    for (const risk of urlRisks) {
      // Handle both object format and direct risk_level
      const level = (risk.risk_level || risk)?.toLowerCase() || 'low';
      const priority = riskPriority[level] || 0;
      if (priority > maxPriority) {
        maxPriority = priority;
      }
    }
    
    return maxPriority;
  };

  const sortedEmails = useMemo(() => {
    if (!emails.length) return [];
    return [...emails].sort((a, b) => {
      switch (sortBy) {
        case 'date-desc': {
          const dateA = a.date ? new Date(a.date) : new Date(0);
          const dateB = b.date ? new Date(b.date) : new Date(0);
          const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
          const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();
          return timeB - timeA;
        }
        case 'date-asc': {
          const dateA = a.date ? new Date(a.date) : new Date(0);
          const dateB = b.date ? new Date(b.date) : new Date(0);
          const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
          const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();
          return timeA - timeB;
        }
        case 'spam-desc': {
          const probA = parseFloat(a.spam_probability) || 0;
          const probB = parseFloat(b.spam_probability) || 0;
          return probB - probA;
        }
        case 'spam-asc': {
          const probA = parseFloat(a.spam_probability) || 0;
          const probB = parseFloat(b.spam_probability) || 0;
          return probA - probB;
        }
        case 'url-risk': {
          // Sort by highest URL risk first (high > medium > low > none)
          // Emails with malicious URLs appear first
          const riskA = getHighestUrlRisk(a);
          const riskB = getHighestUrlRisk(b);
          return riskB - riskA;
        }
        default:
          return 0;
      }
    });
  }, [emails, sortBy]);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [urlInput, setUrlInput] = useState("");
  const [urlAnalysis, setUrlAnalysis] = useState(null);
  const [isAnalyzingUrl, setIsAnalyzingUrl] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeDashboard = async () => {
      setIsInitializing(true);
      const startTime = Date.now();
      
      try {
        await fetchUserInfo();
      } catch (error) {
        console.error('Dashboard initialization error:', error);
      } finally {
        // Ensure loading screen shows for at least 2 seconds
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 2000 - elapsedTime);
        
        setTimeout(() => {
          setIsInitializing(false);
        }, remainingTime);
      }
    };
    initializeDashboard();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const userInfo = await getUserInfo();
      console.log('📸 Dashboard - User info received:', userInfo);
      if (userInfo.authenticated && userInfo.email) {
        console.log('📸 User picture URL:', userInfo.picture);
        console.log('📸 User name:', userInfo.name);
        setUser(userInfo);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      // Don't block dashboard if user info fails - user might still be authenticated
      // The dashboard can still function without user info
    }
  };

  const handleManualAnalyze = useCallback(async () => {
    if (!manualText.trim()) {
      setAnalysis(null);
      setIsAnalyzing(false);
      return;
    }

    try {
      const data = await analyzeOffline(manualText);
      setAnalysis(data);
      setError(null);
    } catch (error) {
      console.error('Analysis error:', error);
      setError('Failed to analyze email. Please try again.');
      setAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, [manualText]);

  // Real-time analysis with debounce
  useEffect(() => {
    let timeoutId = null;
    
    if (manualText.trim().length > 10) {
      setIsAnalyzing(true);
      setError(null);
      timeoutId = setTimeout(() => {
        handleManualAnalyze();
      }, 1000);
      setTypingTimeout(timeoutId);
    } else {
      setAnalysis(null);
      setIsAnalyzing(false);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [manualText, handleManualAnalyze]);

  const handleAnalyzeUrl = async () => {
    if (!urlInput.trim()) {
      setUrlAnalysis(null);
      setIsAnalyzingUrl(false);
      return;
    }

    setIsAnalyzingUrl(true);
    setError(null);
    try {
      const data = await analyzeUrl(urlInput.trim());
      setUrlAnalysis(data);
      setError(null);
    } catch (error) {
      console.error('URL analysis error:', error);
      setError(error.message || 'Failed to analyze URL. Please try again.');
      setUrlAnalysis(null);
    } finally {
      setIsAnalyzingUrl(false);
    }
  };

  const handleFetchEmails = async (params = {}) => {
    setIsLoading(true);
    setError(null);
    setFetchProgress(0);
    // Optimistically clear previous emails for faster UI update
    setEmails([]);
    
    // Progress animation - smooth progress estimation
    const startTime = Date.now();
    const estimatedDuration = 60000; // Estimate 60 seconds for typical fetch
    let progressInterval = null;
    
    // Smooth progress animation
    const animateProgress = () => {
      progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        // Use a smooth easing function (ease-out)
        // Progress faster at start, slower near end
        const rawProgress = Math.min(elapsed / estimatedDuration, 0.95); // Cap at 95% until complete
        const easedProgress = 1 - Math.pow(1 - rawProgress, 3); // Ease-out cubic
        setFetchProgress(Math.min(easedProgress * 100, 95));
      }, 100); // Update every 100ms for smooth animation
    };
    
    try {
      // Start progress animation
      animateProgress();
      
      // Check auth in parallel with setting up the request
      const authStatusPromise = checkAuthStatus();
      
      // Use params as-is, backend will handle defaults
      const fetchParams = {
        ...params
      };
      
      const authStatus = await authStatusPromise;
      if (!authStatus.authenticated) {
        if (progressInterval) clearInterval(progressInterval);
        setError("Session expired. Please login again.");
        setEmails([]);
        setIsLoading(false);
        setFetchProgress(0);
        return;
      }
      
      // Fetch emails with timeout (increased to 120 seconds for large batches)
      const fetchPromise = fetchEmails(fetchParams);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout - server is taking too long. Try reducing the number of emails or date range.')), 120000)
      );
      
      const data = await Promise.race([fetchPromise, timeoutPromise]);
      
      // Clear progress interval and set to 100%
      if (progressInterval) clearInterval(progressInterval);
      setFetchProgress(100);
      
      if (data.error) {
        setError(data.error || "Session expired. Please login again.");
        setEmails([]);
      } else {
        // Set emails immediately for faster UI update
        setEmails(data.emails || []);
        setError(null);
        // Fetch user info in background if needed (non-blocking)
        if (!user) {
          fetchUserInfo().catch(err => console.error('Background user fetch error:', err));
        }
      }
    } catch (error) {
      console.error('Fetch emails error:', error);
      const errorMsg = error.message || 'Failed to fetch emails. Please try again.';
      setError(errorMsg);
      setEmails([]);
      if (progressInterval) clearInterval(progressInterval);
      setFetchProgress(0);
    } finally {
      // Small delay to show 100% before hiding
      setTimeout(() => {
        if (progressInterval) clearInterval(progressInterval);
        setIsLoading(false);
        setFetchProgress(0);
      }, 500);
    }
  };

  const handleReport = async () => {
    if (emails.length === 0) {
      setError('No emails available to generate report.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await generateReport(emails);
      setReport(data);
      setError(null);
    } catch (error) {
      console.error('Report error:', error);
      setError('Failed to generate report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePDF = async () => {
    if (emails.length === 0) {
      setError('No emails available to export.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      await exportPDF(emails);
      setError(null);
    } catch (error) {
      console.error('PDF export error:', error);
      setError(error.message || 'Failed to export PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setEmails([]);
      setReport(null);
      setError(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show loading screen while initializing (minimum 2 seconds)
  if (isInitializing) {
    return (
      <div className={`min-h-screen ${themeMode === 'dark' ? 'dark' : ''}`}>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold gradient-text mb-2">Loading Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400">Please wait...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeMode === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
        <Suspense fallback={null}>
          <AnimatedBackground />
        </Suspense>
        
        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4"
            >
              <div className="bg-red-500 text-white p-4 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-xl border border-red-400/50">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="flex-1 text-sm font-medium">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="relative z-10 pt-24 pb-20">
          <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
            {/* User Greeting */}
            {user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
              >
                <Suspense fallback={<div className="h-20" />}>
                  <UserGreeting user={user} onLogout={handleLogout} />
                </Suspense>
              </motion.div>
            )}

            {/* Welcome Message when no emails */}
            {emails.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="mb-12 text-center"
              >
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 gradient-text">
                  {user ? `Welcome back, ${user.name?.split(' ')[0] || user.email}!` : 'Welcome to Spamurai Dashboard'}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                  {user 
                    ? 'Fetch your Gmail emails to start analyzing, or use the analysis tools below'
                    : 'Start by fetching your emails or analyzing content below'}
                </p>
                {!user && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm text-gray-500 dark:text-gray-400"
                  >
                    Note: You need to be logged in to fetch Gmail emails
                  </motion.p>
                )}
              </motion.div>
            )}

            {/* Fetch Emails Options */}
            <Suspense fallback={<div className="h-32 mb-8" />}>
              <EmailFetchOptions onFetch={handleFetchEmails} isLoading={isLoading} progress={fetchProgress} />
            </Suspense>

            {/* Email List */}
            {emails.length > 0 && (
              <motion.section
                id="features"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-20"
              >
                {/* Header - Render immediately without viewport detection */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-center mb-8"
                >
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <h2 className="text-4xl md:text-5xl font-extrabold gradient-text">
                      📧 Inbox Scan Results
                    </h2>
                    <button
                      onClick={() => setShowEmails(!showEmails)}
                      className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors duration-200 flex items-center gap-2"
                    >
                      {showEmails ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Hide Emails
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Show Emails
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                    {emails.length} email{emails.length !== 1 ? 's' : ''} analyzed
                  </p>
                  
                  {/* Sort Options */}
                  {showEmails && (
                    <div className="flex items-center justify-center gap-4 mb-8">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <span>Sort by:</span>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                        >
                          <option value="date-desc">Date (Newest First)</option>
                          <option value="date-asc">Date (Oldest First)</option>
                          <option value="spam-desc">Spam Probability (High to Low)</option>
                          <option value="spam-asc">Spam Probability (Low to High)</option>
                          <option value="url-risk">MALICIOUS URL DETECTED</option>
                        </select>
                      </label>
                    </div>
                  )}
                </motion.div>

                {/* Email Grid - Use pre-sorted emails from useMemo */}
                {showEmails && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sortedEmails.map((email, index) => (
                      <Suspense key={email.id || index} fallback={<div className="h-32" />}>
                        <EmailCardProfessional email={email} index={index} />
                      </Suspense>
                    ))}
                  </div>
                )}
              </motion.section>
            )}

            {/* Report Section */}
            {emails.length > 0 && (
              <Suspense fallback={<div className="h-32" />}>
                <ReportSectionProfessional
                  report={report}
                  onGenerateReport={handleReport}
                  onExportPDF={handlePDF}
                  isGenerating={isLoading}
                />
              </Suspense>
            )}

            {/* Detection Options Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="mb-20"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="text-center mb-12"
              >
                <h2 className="text-4xl md:text-5xl font-extrabold mb-4 gradient-text">
                  🛡️ Detection Tools
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  Choose your detection method
                </p>
              </motion.div>

              {/* Two Column Layout for Detection Options */}
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {/* Email Spam Detection Card */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="relative group"
                  style={{ willChange: 'transform' }}
                >
                  <div className="h-full rounded-2xl border-2 border-primary-500/30 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-primary-500/50">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-4 rounded-xl bg-primary-500/20">
                        <Mail className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          Email Spam Detection
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Analyze email content for spam
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                      Paste email content to instantly detect spam, phishing attempts, and suspicious patterns using advanced AI analysis.
                    </p>

                    <div className={`relative rounded-xl border-2 transition-all duration-300 ${
                      analysis?.warning_level === 'high'
                        ? 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-800/50'
                    } backdrop-blur-xl`}>
                      <textarea
                        value={manualText}
                        onChange={(e) => setManualText(e.target.value)}
                        placeholder="Paste email content here for instant analysis...&#10;&#10;The analysis will start automatically as you type..."
                        rows={8}
                        className="w-full p-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none"
                      />
                      {manualText.length > 0 && manualText.length <= 10 && (
                        <div className="absolute bottom-4 right-4 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400">
                          Type at least 10 characters...
                        </div>
                      )}
                    </div>

                    {/* Email Analysis Results */}
                    {analysis && !isAnalyzing && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-6 rounded-xl p-6 border-2 ${
                          analysis.classification === 'spam'
                            ? 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20'
                            : 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          {analysis.classification === 'spam' ? (
                            <AlertCircle className="w-6 h-6 text-red-500" />
                          ) : (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          )}
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                            {analysis.classification === 'spam' ? '⚠️ Spam Detected' : '✅ Safe Email'}
                          </h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300">Spam Probability</span>
                            <span className="font-bold text-red-500">{(analysis.spam_probability || 0).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300">Ham Probability</span>
                            <span className="font-bold text-green-500">{(analysis.ham_probability || 0).toFixed(1)}%</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {isAnalyzing && (
                      <div className="mt-6 flex items-center justify-center py-4">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full"
                        />
                        <span className="ml-3 text-gray-600 dark:text-gray-400">Analyzing...</span>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* URL Phishing Detection Card */}
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="relative group"
                  style={{ willChange: 'transform' }}
                >
                  <div className="h-full rounded-2xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-900 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-purple-500/50">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-4 rounded-xl bg-purple-500/20">
                        <LinkIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          URL Phishing Detection
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Check URLs for phishing threats
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                      Enter any URL to check for phishing attempts, malicious content, and suspicious patterns using our advanced detection system.
                    </p>

                    <div className={`relative rounded-xl border-2 transition-all duration-300 ${
                      urlAnalysis?.risk_level === 'high'
                        ? 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20'
                        : urlAnalysis?.risk_level === 'medium'
                        ? 'border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-800/50'
                    } backdrop-blur-xl`}>
                      <div className="flex gap-2 p-4">
                        <input
                          type="url"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && urlInput.trim()) {
                              handleAnalyzeUrl();
                            }
                          }}
                          placeholder="Enter URL to analyze (e.g., https://example.com)"
                          className="flex-1 p-3 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                          onClick={handleAnalyzeUrl}
                          disabled={!urlInput.trim() || isAnalyzingUrl}
                          className="px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
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

                    {/* URL Analysis Results */}
                    {urlAnalysis && !isAnalyzingUrl && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-6 rounded-xl p-6 border-2 ${
                          urlAnalysis.label !== 'benign'
                            ? urlAnalysis.risk_level === 'high'
                              ? 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20'
                              : 'border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20'
                            : 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          {urlAnalysis.label !== 'benign' ? (
                            <AlertTriangle className={`w-6 h-6 ${urlAnalysis.risk_level === 'high' ? 'text-red-500' : 'text-orange-500'}`} />
                          ) : (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          )}
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                            {urlAnalysis.label !== 'benign'
                              ? urlAnalysis.risk_level === 'high'
                                ? '⚠️ High Risk URL'
                                : '⚠️ Medium Risk URL'
                              : '✅ Safe URL'}
                          </h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300">Risk Level</span>
                            <span className={`font-bold ${
                              urlAnalysis.risk_level === 'high'
                                ? 'text-red-500'
                                : urlAnalysis.risk_level === 'medium'
                                ? 'text-orange-500'
                                : 'text-green-500'
                            }`}>
                              {urlAnalysis.risk_level?.toUpperCase() || 'LOW'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300">Confidence</span>
                            <span className="font-bold text-purple-500">
                              {((urlAnalysis.confidence || 0) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {isAnalyzingUrl && (
                      <div className="mt-6 flex items-center justify-center py-4">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full"
                        />
                        <span className="ml-3 text-gray-600 dark:text-gray-400">Analyzing URL...</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.section>
          </div>
        </main>
      </div>
    </div>
  );
}

// Home Page Component
function Home({ isAuthenticated, user }) {
  const { themeMode } = useTheme();
  const [error, setError] = useState(null);
  const [backendConnected, setBackendConnected] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const oauthError = urlParams.get("oauth_error");
    const errorDescription = urlParams.get("error_description");

    if (oauthError) {
      const errorMsg = errorDescription 
        ? `OAuth Error: ${errorDescription}` 
        : `OAuth Error: ${oauthError}`;
      setError(errorMsg);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Test backend connection on mount
    testBackendConnection().then(connected => {
      setBackendConnected(connected);
      if (!connected) {
        setError("Cannot connect to backend server. Please make sure the backend is running on http://localhost:5000");
      }
    });
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      console.log('🔄 Initiating Google login...');
      const data = await googleLogin();
      console.log('✅ Login response received:', data);
      if (data.auth_url) {
        console.log('🔗 Redirecting to:', data.auth_url);
        window.location.href = data.auth_url;
      } else {
        const errorMsg = data.error || 'No authorization URL received from server.';
        console.error('❌ Login error:', errorMsg);
        setError(errorMsg);
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      const errorMsg = error.message || 'Failed to initiate login. Please check if the backend server is running on port 5000.';
      setError(errorMsg);
    }
  };

  return (
    <div className={`min-h-screen ${themeMode === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
        <Suspense fallback={null}>
          <AnimatedBackground />
        </Suspense>
        
        {/* Error Banner */}
        {error && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
            <div className="bg-red-500 text-white p-4 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-xl border border-red-400/50">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="flex-1 text-sm font-medium">{error}</p>
              <button
                onClick={() => setError(null)}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <main className="relative z-10">
          <Suspense fallback={<LoadingSpinner />}>
            <HeroSection onGetStarted={handleGoogleLogin} isAuthenticated={isAuthenticated} />
          </Suspense>
          <Suspense fallback={<div className="h-96" />}>
            <FeaturesSection />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

// Page Transition Wrapper with Scroll to Top
function PageTransition({ children }) {
  const location = useLocation();
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  const { themeMode } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const checkAuth = useCallback(async () => {
    try {
      const status = await checkAuthStatus();
      if (status.authenticated) {
        const userInfo = await getUserInfo();
        console.log('🔍 User info received:', userInfo);
        if (userInfo.authenticated && userInfo.email) {
          setIsAuthenticated(true);
          setUser(userInfo);
          console.log('✅ User set in state:', userInfo);
        } else {
          console.warn('⚠️ User info missing email or not authenticated:', userInfo);
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // Non-blocking auth check - don't wait for it
    const urlParams = new URLSearchParams(window.location.search);
    const oauthError = urlParams.get("oauth_error");
    const oauthSuccess = urlParams.get("oauth_success");
    const errorDescription = urlParams.get("error_description");

    if (oauthError) {
      const errorMsg = errorDescription 
        ? `OAuth Error: ${errorDescription}` 
        : `OAuth Error: ${oauthError}`;
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (oauthSuccess) {
      window.history.replaceState({}, document.title, window.location.pathname);
      // Don't await - let it run in background
      checkAuth();
    } else {
      // Don't await - let it run in background
      checkAuth();
    }

    // Listen for login trigger from Navbar
    const handleTriggerLogin = () => {
      window.location.href = '/';
      setTimeout(() => {
        const button = document.querySelector('[onclick*="handleGoogleLogin"], button:contains("Get Started Free")');
        if (button) button.click();
      }, 500);
    };
    window.addEventListener('triggerLogin', handleTriggerLogin);
    return () => window.removeEventListener('triggerLogin', handleTriggerLogin);
  }, [checkAuth]);

  const handleGlobalLogin = async () => {
    try {
      console.log('🔄 Initiating Google login from Navbar...');
      const data = await googleLogin();
      console.log('✅ Login response received:', data);
      if (data.auth_url) {
        console.log('🔗 Redirecting to:', data.auth_url);
        window.location.href = data.auth_url;
      } else {
        console.error('❌ No auth URL in response');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      // Navigate to home page which will show the error
      window.location.href = '/';
    }
  };

  return (
    <Router>
      <div className={`min-h-screen ${themeMode === 'dark' ? 'dark' : ''}`}>
        <Navbar user={user} isAuthenticated={isAuthenticated} onLoginClick={handleGlobalLogin} />
        <PageTransition>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Home isAuthenticated={isAuthenticated} user={user} />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/features" element={<FeaturesSection />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/support" element={<Support />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analysis" element={<Dashboard />} />
              <Route path="/reports" element={<Dashboard />} />
            </Routes>
          </Suspense>
        </PageTransition>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
