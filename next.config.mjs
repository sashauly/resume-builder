import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public', // Where to output the service worker files
  register: true, // Register the service worker
  skipWaiting: true, // Skip waiting for service worker to activate
  disable: process.env.NODE_ENV === 'development', // Disable PWA in dev
});

const BASE_PATH = process.env.PAGES_BASE_PATH ?? '/resume-builder';

const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'export',
  basePath: isProd ? BASE_PATH : '',
  assetPrefix: isProd ? BASE_PATH : '',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default withPWA(nextConfig);
