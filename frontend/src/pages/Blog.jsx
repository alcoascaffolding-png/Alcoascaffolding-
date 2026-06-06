import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEOHead from '../components/common/SEOHead';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { blogPosts } from '../data/blogPosts';

const Blog = () => (
  <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
    <SEOHead
      title="Scaffolding Blog UAE — Guides, Pricing & Safety"
      description="Expert scaffolding guides for Abu Dhabi, United Arab Emirates contractors. Rental pricing, equipment comparisons, and UAE safety tips from Alcoa Scaffolding."
      keywords="scaffolding blog UAE, scaffolding guide Abu Dhabi, scaffolding rental tips"
      canonical="/blog"
    />
    <section className="section-padding py-12 sm:py-16">
      <div className="container-custom max-w-4xl">
        <Breadcrumbs items={[{ name: 'Blog', path: '/blog' }]} />
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Scaffolding Guides & Resources
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-10">
          Practical UAE scaffolding advice — pricing, equipment, and site safety.
        </p>
        <div className="space-y-6">
          {blogPosts.map((post, index) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700"
            >
              <time className="text-sm text-gray-500 dark:text-gray-400">{post.date} · {post.readTime}</time>
              <h2 className="text-xl font-bold mt-2 mb-2">
                <Link
                  to={`/blog/${post.slug}`}
                  className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{post.excerpt}</p>
              <Link
                to={`/blog/${post.slug}`}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Read article →
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default Blog;
