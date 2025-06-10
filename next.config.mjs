/** @type {import('next').NextConfig} */
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
});

const BASE_PATH = process.env.BASE_PATH || '/resume-builder/';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig = withPWA({
  reactStrictMode: false,
  trailingSlash: true,
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
