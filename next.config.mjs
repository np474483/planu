/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  devIndicators: {
    appIsrStatus: false,
  },
  experimental: {
    // If Next.js 16 supports allowedDevOrigins under experimental or general, add it here:
  },
  allowedDevOrigins: ['192.168.1.35', 'localhost:3000', 'localhost:3001']
};

export default nextConfig;
