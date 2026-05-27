import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
};

export default nextConfig;
