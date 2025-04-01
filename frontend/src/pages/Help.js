import React from 'react';
import { motion } from 'framer-motion';
import { FiHelpCircle, FiUsers, FiMessageSquare, FiStar, FiShield } from 'react-icons/fi';

const Help = () => {
  const faqs = [
    {
      question: 'How does skill matching work?',
      answer: 'Our platform uses advanced algorithms to match users based on their skills, interests, and learning goals. When you add skills to your profile, we find users who have complementary skills that you want to learn.',
    },
    {
      question: 'How do I start exchanging skills?',
      answer: '1. Complete your profile with your skills and interests\n2. Browse the Skills page to find potential matches\n3. Connect with users who have skills you want to learn\n4. Start chatting and arrange skill exchange sessions',
    },
    {
      question: 'Is the platform free to use?',
      answer: 'Yes, SkillMatch is completely free to use! You can create an account, find matches, and exchange skills without any cost.',
    },
    {
      question: 'How do I ensure safe skill exchange?',
      answer: 'We recommend:\n- Meeting in public places\n- Verifying user profiles\n- Using our in-app chat system\n- Reporting any suspicious activity',
    },
  ];

  const features = [
    {
      icon: <FiUsers className="h-8 w-8" />,
      title: 'Skill Matching',
      description: 'Find the perfect skill exchange partners based on your interests and goals.',
    },
    {
      icon: <FiMessageSquare className="h-8 w-8" />,
      title: 'Real-time Chat',
      description: 'Communicate easily with your skill exchange partners through our chat system.',
    },
    {
      icon: <FiStar className="h-8 w-8" />,
      title: 'Rating System',
      description: 'Rate and review your skill exchange experiences to help others make informed decisions.',
    },
    {
      icon: <FiShield className="h-8 w-8" />,
      title: 'Safe Platform',
      description: 'We prioritize user safety with profile verification and reporting systems.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block"
          >
            <FiHelpCircle className="h-12 w-12 text-indigo-600 dark:text-indigo-400 mx-auto" />
          </motion.div>
          <h1 className="mt-4 text-4xl font-bold text-gray-900 dark:text-white">
            How can we help you?
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Find answers to common questions and learn more about SkillMatch
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
            >
              <div className="text-indigo-600 dark:text-indigo-400 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Still have questions? Our support team is here to help!
          </p>
          <a
            href="mailto:support@skillmatch.com"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default Help; 