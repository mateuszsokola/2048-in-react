/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  assetPrefix: "./",
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
