import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import SEOHead from '../components/common/SEOHead';
import Breadcrumbs from '../components/common/Breadcrumbs';
import QuickAnswer from '../components/common/QuickAnswer';
import { getPostBySlug, getReadTime } from '../data/blogPosts';
import { buildBlogPostingSchema } from '../utils/schemaBuilders';
import { SITE_URL } from '../data/businessFacts';

const BlogPost = () => {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  if (!post) return <Navigate to="/blog" replace />;

  const articleUrl = `${SITE_URL}/blog/${post.slug}`;
  const description = post.description || post.excerpt;
  const articleSchema = buildBlogPostingSchema({
    headline: post.title,
    description,
    url: articleUrl,
    datePublished: post.date,
    dateModified: post.updated || post.date,
  });

  return (
    <article className="min-h-screen bg-surface-light dark:bg-surface-dark">
      <SEOHead
        title={post.seoTitle || post.title}
        description={description}
        keywords={post.keywords}
        canonical={`/blog/${post.slug}`}
        ogType="article"
        jsonLd={articleSchema}
        faq={post.faq}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />
      <section className="section-padding py-12 sm:py-16">
        <div className="container-custom max-w-3xl">
          <Breadcrumbs
            items={[
              { name: 'Blog', path: '/blog' },
              { name: post.title, path: `/blog/${post.slug}` },
            ]}
          />
          <header className="mb-8">
            <p className="text-sm text-gray-500">
              <time dateTime={post.date}>Published {post.date}</time>
              {post.updated && (
                <>
                  {' · '}
                  <time dateTime={post.updated}>Updated {post.updated}</time>
                </>
              )}
              {' · '}
              {getReadTime(post)} read
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
              {post.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">{post.excerpt}</p>
          </header>
          <QuickAnswer text={post.quickAnswer} className="mb-10" />
          {post.sections.map((section) => (
            <section key={section.heading} className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {section.heading}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {section.body}
              </p>
            </section>
          ))}
          {post.faq?.length > 0 && (
            <section className="mt-12 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">FAQ</h2>
              <dl className="space-y-4">
                {post.faq.map((item) => (
                  <div key={item.q}>
                    <dt className="font-semibold text-gray-900 dark:text-white">{item.q}</dt>
                    <dd className="mt-1 text-gray-700 dark:text-gray-300 text-sm">{item.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
          {post.related?.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Related pages</h2>
              <ul className="flex flex-wrap gap-3">
                {post.related.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="inline-block text-sm px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-4">
            <Link to="/contact-us" className="btn-primary">
              Get a Quote
            </Link>
            <Link to="/faq" className="btn-secondary">
              Scaffolding FAQ
            </Link>
            <Link to="/blog" className="text-blue-600 hover:underline self-center">
              ← Back to Blog
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
};

export default BlogPost;
