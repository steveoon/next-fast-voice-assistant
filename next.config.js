/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // 只在服务器端构建时添加这个规则
    if (isServer) {
      config.externals.push({
        "onnxruntime-node": "commonjs onnxruntime-node",
      });
    }

    return config;
  },
};

export default nextConfig;
