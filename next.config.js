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
  env: {
    DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY,
    CEREBRAS_API_KEY: process.env.CEREBRAS_API_KEY,
    CARTESIA_API_KEY: process.env.CARTESIA_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
  },
};

module.exports = nextConfig;
