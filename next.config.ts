import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // /* config options here */
  // // webpack: (config, { isServer }) => {
  // //   if (!isServer) {
  // //     config.resolve.fallback = {
  // //       ...config.resolve.fallback,
  // //       canvas: false,
  // //     };
  // //   }
  // //   return config;
  // // },
  // // target: "serverless",
  // future: { webpack5: true },
  // webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
  //   config.resolve.alias.canvas = false;
  //   config.resolve.alias.encoding = false;
  //   return config;
  // },
};

export default nextConfig;
