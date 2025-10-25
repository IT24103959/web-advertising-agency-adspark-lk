"use client";

import Link from "next/link";
import { useState } from "react";

export default function SupportPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Topics", icon: "📚" },
    { id: "getting-started", name: "Getting Started", icon: "🚀" },
    { id: "campaigns", name: "Campaigns", icon: "📢" },
    { id: "analytics", name: "Analytics", icon: "📊" },
    { id: "billing", name: "Billing & Payments", icon: "💳" },
    { id: "assets", name: "Asset Management", icon: "🎨" },
    { id: "account", name: "Account Settings", icon: "⚙️" },
  ];

  const faqs = [
    {
      id: 1,
      category: "getting-started",
      question: "How do I create my first advertisement campaign?",
      answer:
        "To create your first campaign, navigate to your client dashboard and click on 'Create Campaign'. Fill in your campaign details including target audience, budget, and schedule. You can then upload your creative assets or choose from our asset library.",
    },
    {
      id: 2,
      category: "getting-started",
      question: "What types of advertisements can I create?",
      answer:
        "AdSpark supports various advertisement formats including display banners, video ads, social media posts, and print advertisements. You can choose from multiple templates or upload your own creative assets.",
    },
    {
      id: 3,
      category: "campaigns",
      question: "How do I track my campaign performance?",
      answer:
        "You can monitor your campaign performance through the Analytics section in your dashboard. View metrics like impressions, clicks, click-through rates, and conversions. Real-time data helps you optimize your campaigns for better results.",
    },
    {
      id: 4,
      category: "campaigns",
      question: "Can I pause or modify my campaigns after they're live?",
      answer:
        "Yes, you can pause, resume, or modify your campaigns at any time through your dashboard. Changes to targeting, budget, or creative content can be made while campaigns are running.",
    },
    {
      id: 5,
      category: "analytics",
      question: "What metrics are available in the analytics dashboard?",
      answer:
        "Our analytics dashboard provides comprehensive metrics including total impressions, clicks, click-through rates (CTR), conversion rates, cost per click (CPC), and return on ad spend (ROAS). You can also view demographic breakdowns and geographic performance data.",
    },
    {
      id: 6,
      category: "analytics",
      question: "How often is analytics data updated?",
      answer:
        "Analytics data is updated in real-time for most metrics. Some advanced reporting features may have a delay of up to 24 hours to ensure data accuracy and completeness.",
    },
    {
      id: 7,
      category: "billing",
      question: "What payment methods do you accept?",
      answer:
        "We accept major credit cards (Visa, MasterCard, American Express), bank transfers, and PayPal. All transactions are processed securely through encrypted payment gateways.",
    },
    {
      id: 8,
      category: "billing",
      question: "How does billing work for advertising campaigns?",
      answer:
        "Billing is based on your campaign performance and chosen pricing model (CPC, CPM, or flat rate). You'll be charged only for actual ad delivery. Monthly invoices are generated automatically and can be accessed through your dashboard.",
    },
    {
      id: 9,
      category: "assets",
      question: "What file formats are supported for creative assets?",
      answer:
        "We support various formats including JPG, PNG, GIF, WebP for images; MP4, WebM for videos; MP3, WAV for audio; and PDF, DOC, DOCX for documents. Maximum file size varies by type (5MB for images, 100MB for videos).",
    },
    {
      id: 10,
      category: "assets",
      question: "Can I use the asset library for my campaigns?",
      answer:
        "Yes, our asset library contains professionally designed templates, stock images, and marketing materials that you can use in your campaigns. Some assets may require additional licensing for commercial use.",
    },
    {
      id: 11,
      category: "account",
      question: "How do I update my company information?",
      answer:
        "Navigate to Account Settings in your dashboard to update company details, contact information, billing addresses, and notification preferences. Changes are saved automatically.",
    },
    {
      id: 12,
      category: "account",
      question: "How do I reset my password?",
      answer:
        "Click 'Forgot Password' on the login page and enter your email address. You'll receive a password reset link within a few minutes. If you don't receive the email, check your spam folder or contact support.",
    },
  ];

  const features = [
    {
      title: "Campaign Management",
      description:
        "Create, manage, and optimize your advertising campaigns with powerful tools and analytics.",
      icon: "🎯",
    },
    {
      title: "Real-time Analytics",
      description:
        "Track performance metrics in real-time with comprehensive reporting and insights.",
      icon: "📈",
    },
    {
      title: "Asset Library",
      description:
        "Access thousands of professional templates, images, and marketing materials.",
      icon: "🎨",
    },
    {
      title: "Multi-platform Distribution",
      description:
        "Distribute your ads across multiple platforms and channels from a single dashboard.",
      icon: "🌐",
    },
    {
      title: "Advanced Targeting",
      description:
        "Reach your ideal audience with sophisticated targeting options and demographic filters.",
      icon: "🎪",
    },
    {
      title: "Automated Optimization",
      description:
        "AI-powered optimization automatically improves your campaign performance over time.",
      icon: "🤖",
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory =
      activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-2xl font-bold text-gray-900 hover:text-blue-600 cursor-pointer">
                  AdSpark
                </h1>
              </Link>
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                Support Center
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
          <p className="text-xl mb-8 text-blue-100">
            Find answers to common questions and learn about AdSpark features
          </p>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for help topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 text-gray-900 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            AdSpark Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                } border border-gray-200`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => (
                <FAQItem
                  key={faq.id}
                  question={faq.question}
                  answer={faq.answer}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No FAQs found matching your search.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Contact Section */}
        <section className="mt-16 bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Still need help?
          </h2>
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? Our support team is here to
            help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@adspark.com"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              📧 Email Support
            </a>
            <a
              href="tel:+1234567890"
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              📞 Call Support
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 AdSpark. All rights reserved.</p>
          <div className="mt-4 flex justify-center space-x-6">
            <Link href="/privacy" className="text-gray-300 hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-300 hover:text-white">
              Terms of Service
            </Link>
            <Link href="/support" className="text-gray-300 hover:text-white">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// FAQ Item Component
function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="font-medium text-gray-900">{question}</span>
        <svg
          className={`h-5 w-5 text-gray-500 transform transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-gray-600 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}
