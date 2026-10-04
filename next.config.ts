import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: path.resolve(__dirname),
  serverExternalPackages: ['@electric-sql/pglite', 'postgres', 'bcryptjs'],
};

export default nextConfig;
