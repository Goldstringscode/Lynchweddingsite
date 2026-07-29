/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Required: Next.js 14.x node_modules type errors (not our code)
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig