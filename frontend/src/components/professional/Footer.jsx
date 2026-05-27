import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin, Mail, Shield } from 'lucide-react';

const Footer = () => {
  const teamMembers = [
    { name: 'Salman Khan', id: '02-131232-121', role: 'Team Lead' },
    { name: 'Mohammad Rizwan', id: '02-131232-019' },
    { name: 'Hammad Hussain', id: '02-134232-040' },
  ];

  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Mail, href: '#', label: 'Email' },
  ];

  return (
    <footer className="relative mt-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(102,126,234,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(118,75,162,0.3),transparent_50%)]" />
      </div>

      <div className="relative z-10 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">🥷</div>
              <div>
                <h3 className="text-2xl font-bold">Spamurai</h3>
                <p className="text-sm text-gray-400">AI-Powered Email Protection</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6">
              Detect spam and phishing like a ninja! Advanced AI technology protecting your inbox.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Team Members */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Team Members
            </h4>
            <div className="space-y-3">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  whileHover={{ x: 5 }}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 transition-all duration-300"
                >
                  <div className="font-semibold">{member.name}</div>
                  <div className="text-sm text-gray-400 font-mono">{member.id}</div>
                  {member.role && (
                    <div className="text-xs text-purple-400 mt-1 font-medium">{member.role}</div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-xl font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { name: 'Features', path: '/features' },
                { name: 'Pricing', path: '/pricing' },
                { name: 'Documentation', path: '/documentation' },
                { name: 'Support', path: '/support' },
                { name: 'Privacy Policy', path: '/privacy-policy' },
                { name: 'How It Works', path: '/how-it-works' },
                { name: 'About Us', path: '/about-us' },
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-white transition-colors block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-gray-400 text-sm">
            © 2025 Spamurai. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm">
            Built with ❤️ by Team Spamurai
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;

