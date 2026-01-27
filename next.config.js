/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
    ...(isProd && {
      // 在生产构建时移除 console 调用（保留 error/warn）
      removeConsole: { exclude: ["error", "warn"] },
    }),
  },
  transpilePackages: ["@privy-io/react-auth", "styled-components"],
  experimental: {
    esmExternals: "loose",
  },
}

module.exports = nextConfig
