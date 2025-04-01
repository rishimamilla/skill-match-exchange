import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Exchange Skills, Grow Together
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
          Connect with people who share your interests and learn new skills through
          skill exchange.
        </p>
        {!user && (
          <Link
            to="/register"
            className="bg-white text-blue-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started
          </Link>
        )}
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Find Your Match</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Connect with people who have the skills you want to learn and share
            your expertise in return.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Learn & Teach</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Exchange knowledge through one-on-one sessions, workshops, or online
            tutoring.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Build Community</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Join a community of learners and teachers, share experiences, and grow
            together.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="text-center">
        <h2 className="text-3xl font-bold mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-4">1</div>
            <h3 className="text-xl font-semibold mb-2">Create Profile</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Sign up and list the skills you want to learn and teach.
            </p>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-4">2</div>
            <h3 className="text-xl font-semibold mb-2">Find Matches</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Browse through profiles and find people with matching interests.
            </p>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-4">3</div>
            <h3 className="text-xl font-semibold mb-2">Connect</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start a conversation and arrange skill exchange sessions.
            </p>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-4">4</div>
            <h3 className="text-xl font-semibold mb-2">Learn & Share</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Exchange knowledge and grow your skills together.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 