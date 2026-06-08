/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    deviceSizes: [480, 768, 1024, 1280],
    imageSizes: [256, 384, 512],
    formats: ["image/avif", "image/webp"],
  },
}

export default nextConfig
