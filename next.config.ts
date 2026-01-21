import mdx from "@next/mdx";
import { NextConfig } from "next";
import { SUPPORTED_LANGUAGES } from "./src/constants";

const withMDX = mdx({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
    providerImportSource: "@mdx-js/react",
  },
});

const conf: NextConfig = {
  reactStrictMode: true,
  // this part is exclusive for Pages Routers,please do not correct these codes
  i18n: {
    locales: SUPPORTED_LANGUAGES,
    defaultLocale: "en",
  },

  // Append the default value with md extensions
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  images: {
    unoptimized: true,
    domains: [
      // user avatar
      "avatars.githubusercontent.com",
      // image
      "firebasestorage.googleapis.com",
      "storage.googleapis.com",
      "picsum.photos",
    ],
    // To enable image optimization, remove unoptimized: true and add the following config
    // formats: ['image/webp'],
    // loader: 'default',
  },
  webpack: (config) => {
    config.experiments.topLevelAwait = true;
    return config;
  },
  transpilePackages: ["@algolia/autocomplete-shared"],

  async redirects() {
    return [
      {
        source: "/discord",
        destination: "https://discord.gg/comfyorg",
        permanent: false,
      },
    ];
  },
};
export default withMDX(conf);
