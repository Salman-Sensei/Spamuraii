import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, TrendingUp, AlertTriangle, Shield, Mail } from 'lucide-react';
import VIPButton from './VIPButton';

const ReportSectionProfessional = ({ report, onGenerateReport, onExportPDF, isGenerating }) => {
  if (!report && !isGenerating) {
    return (
      <motion.section
        id="reports"
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
              📊 Email Analysis Report
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Generate comprehensive reports and export to PDF
            </p>
          </motion.div>

          <div className="flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGenerateReport}
              disabled={isGenerating}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-purple-500 text-white font-bold text-lg shadow-xl shadow-primary-500/50 hover:shadow-2xl hover:shadow-primary-500/70 transition-all duration-300 flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Generate Report
            </motion.button>
          </div>
        </div>
      </motion.section>
    );
  }

  if (isGenerating) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.section
      id="reports"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="py-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 gradient-text">
            📊 Email Analysis Report
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Comprehensive analysis of your email inbox
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { icon: Mail, label: 'Total Emails', value: report.total_emails, color: 'from-blue-500 to-cyan-500' },
            { icon: AlertTriangle, label: 'Spam', value: report.spam_count, color: 'from-red-500 to-orange-500' },
            { icon: Shield, label: 'Safe', value: report.ham_count, color: 'from-green-500 to-emerald-500' },
            { icon: TrendingUp, label: 'Phishing', value: report.phishing_count, color: 'from-yellow-500 to-orange-500' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.05 }}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.color} p-6 shadow-2xl`}
            >
              <div className="relative z-10">
                <stat.icon className="w-8 h-8 text-white mb-4" />
                <div className="text-4xl font-extrabold text-white mb-2">{stat.value}</div>
                <div className="text-white/90 font-medium">{stat.label}</div>
              </div>
              <motion.div
                className="absolute inset-0 bg-white/10"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Keywords */}
        {report.top_keywords && report.top_keywords.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 p-8 rounded-2xl glass"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              🔍 Top Suspicious Keywords
            </h3>
            <div className="flex flex-wrap gap-3">
              {report.top_keywords.map((kw, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.1, y: -3 }}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-500/30 text-gray-900 dark:text-white font-semibold"
                >
                  {kw.keyword} <span className="text-yellow-600 dark:text-yellow-400">({kw.count})</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Export Button */}
        <div className="flex justify-center">
          <VIPButton onClick={onExportPDF} size="lg">
            <Download className="w-5 h-5" />
            Export PDF Report
          </VIPButton>
        </div>
      </div>
    </motion.section>
  );
};

export default ReportSectionProfessional;

