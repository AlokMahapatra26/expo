/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Dangerously disable type checking during builds
    ignoreBuildErrors: true,
  },
  eslint: {
    // Disable ESLint during builds
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
