import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      new URL("https://wallpapers.com/**"),
      new URL("https://www.pixelstalk.net/**"),
      new URL("https://images.unsplash.com/**"),
      new URL("https://res.cloudinary.com/**"),
      new URL("https://lh3.googleusercontent.com/**"),
    ],
  },
};
export default nextConfig;
