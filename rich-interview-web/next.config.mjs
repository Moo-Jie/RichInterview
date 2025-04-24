/** @type {import('next').NextConfig} */
const nextConfig = {
  // 打包模式为standalone，独立部署，不需要再使用next export命令
  output: "standalone",
  // 忽略一些错误，例如：TypeScript类型检查错误
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
