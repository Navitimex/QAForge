/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow Google profile pictures from OAuth
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
