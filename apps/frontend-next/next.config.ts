import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import withBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// Content Security Policy
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self';
  connect-src 'self' ws: wss:;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  report-uri /api/report;
  report-to csp-endpoint;
`;

// Security headers configuration
const securityHeaders = [
  {
    key: 'Reporting-Endpoints',
    value: 'csp-endpoint="/api/report"',
  },
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
];

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    // Enable React 19 features
    reactCompiler: false,
  },
  // Strict mode for better development experience
  reactStrictMode: true,
  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_APP_NAME: 'SmartRetail Pro',
  },
  // Security headers
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

const baseConfig = withAnalyzer(withNextIntl(nextConfig));

export default (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN)
  ? withSentryConfig(baseConfig, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    })
  : baseConfig;
