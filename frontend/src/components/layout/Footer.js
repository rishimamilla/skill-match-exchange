import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-lg mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <div className="text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} SkillMatch. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link
              to="/about"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              About
            </Link>
            <Link
              to="/privacy"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 