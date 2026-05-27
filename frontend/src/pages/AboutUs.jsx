import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Users, Target, Eye, Code, Brain } from 'lucide-react';

const AboutUs = () => {
  const teamMembers = [
    {
      name: 'Salman Khan',
      id: '02-131232-121',
      role: 'Team Lead',
      semester: '5th Semester',
      department: 'Software Engineering',
      description: 'Leading the team with expertise in software architecture and project management.',
    },
    {
      name: 'Mohammad Rizwan',
      id: '02-131232-019',
      role: 'Developer',
      semester: '5th Semester',
      department: 'Software Engineering',
      description: 'Specialized in backend development and API integration.',
    },
    {
      name: 'Hammad Hussain',
      id: '02-134232-040',
      role: 'Developer',
      semester: '8th Semester',
      department: 'Computer Science',
      description: 'Focused on machine learning models and frontend development.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

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
            About Spamurai
          </motion.span>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 gradient-text">
            About Us
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            A Machine Learning Lab project designed to protect users from email spam and phishing attacks
          </p>
        </motion.div>

        {/* Mission & Vision */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 gap-8 mb-20"
        >
          <motion.div
            variants={itemVariants}
            className="p-8 rounded-3xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 backdrop-blur-xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-blue-500/20">
                <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              To develop an intelligent email protection system that leverages cutting-edge machine learning 
              algorithms to accurately detect and prevent spam and phishing attacks, ensuring users can 
              communicate safely in the digital world. We aim to make email security accessible, reliable, 
              and user-friendly through advanced AI technology.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-purple-500/20">
                <Eye className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Vision</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              To become a leading solution in email security, where every user can trust their inbox. 
              We envision a future where AI-powered protection is seamlessly integrated into everyday 
              communication, making the internet a safer place for everyone. Through continuous 
              learning and innovation, we strive to stay ahead of evolving cyber threats.
            </p>
          </motion.div>
        </motion.div>

        {/* Project Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 p-8 rounded-3xl glass text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Brain className="w-8 h-8 text-primary-500" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Machine Learning Lab Project</h2>
          </div>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-6">
            Spamurai is developed as part of our Machine Learning Lab course, demonstrating practical 
            application of machine learning algorithms in real-world cybersecurity challenges. This 
            project showcases our understanding of:
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {[
              { icon: Brain, text: 'Naive Bayes Classification' },
              { icon: Code, text: 'Feature Engineering' },
              { icon: Target, text: 'Model Training & Evaluation' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.2, ease: 'easeOut' }}
                whileHover={{ scale: 1.03, y: -3 }}
                className="p-6 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700"
                style={{ willChange: 'transform' }}
              >
                <item.icon className="w-10 h-10 text-primary-500 mx-auto mb-3" />
                <p className="text-gray-700 dark:text-gray-300 font-semibold">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="w-8 h-8 text-primary-500" />
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Our Team</h2>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Meet the talented developers behind Spamurai
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="p-8 rounded-3xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-gray-200 dark:border-slate-700 hover:border-primary-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                <div className="text-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                    {member.name.charAt(0)}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {member.name}
                  </h3>
                  <div className="flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400 mb-2">
                    <GraduationCap className="w-5 h-5" />
                    <span className="font-semibold">{member.role}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-mono mb-1">
                    {member.id}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {member.department} • {member.semester}
                  </p>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-center leading-relaxed">
                  {member.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { label: 'Team Members', value: '3' },
            { label: 'Accuracy Rate', value: '99.9%' },
            { label: 'Lines of Code', value: '10K+' },
            { label: 'ML Models', value: '2' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-primary-500/10 to-purple-500/10 border border-primary-500/20 text-center"
            >
              <div className="text-4xl font-extrabold gradient-text mb-2">{stat.value}</div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUs;

