/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
};

module.exports = nextConfig;

// frontend/next.config.js
module.exports = {
  env: {
    DEEPL_API_KEY: process.env.DEEPL_API_KEY,
  },
};
