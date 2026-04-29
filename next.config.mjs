/** @type {import('next').NextConfig} */
const isMobile = process.env.BUILD_TARGET === 'mobile';
const nextConfig = {
  reactStrictMode: true,
  ...(isMobile ? { output: 'export', images: { unoptimized: true }, trailingSlash: true } : {}),
};
export default nextConfig;