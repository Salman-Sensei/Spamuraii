import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Mail, Filter } from 'lucide-react';

const EmailFetchOptions = ({ onFetch, isLoading, progress = 0 }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxResults, setMaxResults] = useState('');
  const [activeFilter, setActiveFilter] = useState(null); // Track which quick filter is active
  const isQuickFilterClick = useRef(false); // Track if we're setting from quick filter

  const handleFetch = () => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (maxResults && parseInt(maxResults) > 0) {
      params.maxResults = parseInt(maxResults);
    }
    onFetch(params);
  };

  const handleQuickFilter = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    
    // Mark that we're setting from quick filter
    isQuickFilterClick.current = true;
    
    // Set active filter and dates
    setActiveFilter(days);
    setStartDate(startStr);
    setEndDate(endStr);
    
    // Reset the flag after a short delay to allow useEffect to skip
    setTimeout(() => {
      isQuickFilterClick.current = false;
    }, 100);
  };
  
  // Update active filter when dates change manually (but not when quick filter is clicked)
  useEffect(() => {
    // Skip if we just set a quick filter
    if (isQuickFilterClick.current) {
      return;
    }
    
    if (!startDate || !endDate) {
      setActiveFilter(null);
      return;
    }
    
    const end = new Date();
    const start = new Date(startDate);
    const endCheck = new Date(endDate);
    
    // Normalize dates to start of day for accurate comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    endCheck.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    
    // Check if end date is today
    const isToday = endCheck.getTime() === today.getTime();
    
    if (!isToday) {
      setActiveFilter(null);
      return;
    }
    
    // Calculate days difference more accurately
    const daysDiff = Math.round((today - start) / (1000 * 60 * 60 * 24));
    
    // Check if it matches any quick filter
    const quickFilters = [1, 7, 30, 90];
    if (quickFilters.includes(daysDiff)) {
      setActiveFilter(daysDiff);
    } else {
      setActiveFilter(null);
    }
  }, [startDate, endDate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 p-4 rounded-xl glass"
    >
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-primary-500" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Fetch Options</h3>
      </div>

      <div className="grid md:grid-cols-3 gap-3 mb-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            <Calendar className="w-3.5 h-3.5 inline mr-1" />
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-1.5 text-sm rounded-lg bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            <Calendar className="w-3.5 h-3.5 inline mr-1" />
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-1.5 text-sm rounded-lg bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            <Mail className="w-3.5 h-3.5 inline mr-1" />
            Max Results (optional)
          </label>
          <input
            type="number"
            min="1"
            placeholder="All emails"
            value={maxResults}
            onChange={(e) => setMaxResults(e.target.value)}
            className="w-full px-3 py-1.5 text-sm rounded-lg bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Quick Filters - Full width row */}
      <div className="mb-3">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
            Quick filters:
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { label: 'Last 1 day', days: 1 },
              { label: 'Last 7 days', days: 7 },
              { label: 'Last 30 days', days: 30 },
              { label: 'Last 90 days', days: 90 },
            ].map((filter) => {
              const isActive = activeFilter === filter.days;
              return (
                <button
                  key={filter.days}
                  onClick={() => handleQuickFilter(filter.days)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-primary-500/10 hover:bg-primary-500/20 text-primary-600 dark:text-primary-400'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setMaxResults('');
                setActiveFilter(null);
              }}
              className="px-2.5 py-1 text-xs rounded-lg bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-medium transition-colors duration-200 whitespace-nowrap"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
        onClick={handleFetch}
        disabled={isLoading}
        className="w-full py-2.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed relative overflow-hidden"
      >
        {/* Progress Bar Background */}
        {isLoading && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ zIndex: 0 }}
          />
        )}
        
        {/* Button Content */}
        <div className="relative z-10 flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              <span>Fetching... {Math.round(progress)}%</span>
            </>
          ) : (
            <>
              <Mail className="w-4 h-4" />
              Fetch Gmail Emails
            </>
          )}
        </div>
      </motion.button>
    </motion.div>
  );
};

export default EmailFetchOptions;

