import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'zod',
      'sonner',
      '@tanstack/react-query',
    ],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  compress: true,
  reactStrictMode: true,
  async redirects() {
    return [
      // PRD 가 planning-box 로 이전됨 (2026-04-17). 북마크/외부 링크 유저 보호.
      {
        source: '/prd',
        destination: 'https://planning-box.potenlab.dev/prd/new',
        permanent: true,
      },
      {
        source: '/prd/:path*',
        destination: 'https://planning-box.potenlab.dev/prd/:path*',
        permanent: true,
      },
      {
        source: '/api/prd/:path*',
        destination: 'https://planning-box.potenlab.dev/api/prd/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
