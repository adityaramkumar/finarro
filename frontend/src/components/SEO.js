import React from 'react';
import { Helmet } from 'react-helmet';

const SEO = ({
  title = 'finarro - AI Financial Assistant | Smart Money Management',
  description = 'Transform how you manage money with AI-powered insights. Chat with your finances, connect bank accounts, analyze documents, and make smarter financial decisions. Free to start.',
  keywords = 'AI financial assistant, personal finance, money management, financial insights, budgeting app, bank account integration, financial planning, expense tracking',
  image = 'https://finarro.com/og-image.png',
  url = 'https://finarro.com/',
  type = 'website',
  structuredData = null,
  noIndex = false,
}) => {
  const siteTitle = 'finarro';
  const fullTitle = title.includes(siteTitle)
    ? title
    : `${title} | ${siteTitle}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
      )}

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteTitle} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content="@finarro" />
      <meta name="twitter:site" content="@finarro" />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

// Pre-defined SEO configurations for common pages
export const SEOConfigs = {
  home: {
    title: 'finarro - AI Financial Assistant | Smart Money Management',
    description:
      'Transform how you manage money with AI-powered insights. Chat with your finances, connect bank accounts, analyze documents, and make smarter financial decisions. Free to start.',
    url: 'https://finarro.com/',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'finarro',
      url: 'https://finarro.com',
      description: 'AI-powered financial assistant for smart money management',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://finarro.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  },

  signup: {
    title: 'Sign Up for finarro - Start Managing Your Money Smarter',
    description:
      'Join thousands of users who are taking control of their finances with AI-powered insights. Sign up for free and start your journey to financial wellness today.',
    url: 'https://finarro.com/signup',
  },

  about: {
    title: 'About finarro - Our Mission to Democratize Financial Intelligence',
    description:
      "Learn about finarro's mission to make financial intelligence accessible to everyone through AI technology. Discover our story, values, and vision for the future.",
    url: 'https://finarro.com/about',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About finarro',
      description:
        "Learn about finarro's mission to democratize financial intelligence",
      mainEntity: {
        '@type': 'Organization',
        name: 'finarro',
        url: 'https://finarro.com',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+1-408-329-7788',
          contactType: 'customer service',
          email: 'hello@finarro.com',
        },
      },
    },
  },

  support: {
    title: 'Support & Help Center - finarro Customer Service',
    description:
      "Get help with finarro. Find answers to common questions, contact our support team, or browse our help documentation. We're here to help you succeed.",
    url: 'https://finarro.com/support',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'finarro Support',
      description: 'Get help and support for finarro',
    },
  },

  privacy: {
    title: 'Privacy Policy - How finarro Protects Your Data',
    description:
      'Learn how finarro collects, uses, and protects your personal and financial information. Read our comprehensive privacy policy and data security practices.',
    url: 'https://finarro.com/privacy',
  },

  terms: {
    title: 'Terms of Service - finarro Legal Terms and Conditions',
    description:
      "Read finarro's terms of service, user agreement, and legal conditions. Understand your rights and responsibilities when using our financial management platform.",
    url: 'https://finarro.com/terms',
  },
};

export default SEO;
