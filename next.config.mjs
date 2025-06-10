/** @type {import('next').NextConfig} */
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
});

const BASE_PATH = process.env.PAGES_BASE_PATH ?? '/resume-builder';

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  console.log('Running in production mode');
  // Enable production-specific optimizations
} else {
  console.log('Running in development mode');
  // Enable development-specific features
}

const nextConfig = withPWA({
  reactStrictMode: false,
  swcMinify: true,
  output: 'export',
  basePath: isProd ? BASE_PATH : '',
  assetPrefix: isProd ? BASE_PATH : '',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
});

export default nextConfig;
