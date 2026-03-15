import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  {
    protocol: "http",
    hostname: "127.0.0.1",
    port: "3001",
  },
  {
    protocol: "http",
    hostname: "localhost",
    port: "3001",
  },
];

const payloadApiUrl = process.env.PAYLOAD_API_URL?.trim();

if (payloadApiUrl) {
  try {
    const url = new URL(payloadApiUrl);
    const protocol = url.protocol.replace(":", "") as "http" | "https";
    const port = url.port || undefined;

    if (
      !remotePatterns.some(
        (pattern) =>
          pattern.protocol === protocol &&
          pattern.hostname === url.hostname &&
          (pattern.port ?? "") === (port ?? ""),
      )
    ) {
      remotePatterns.push({
        protocol,
        hostname: url.hostname,
        port,
      });
    }
  } catch {
    // Ignore invalid PAYLOAD_API_URL values and keep local development defaults.
  }
}

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    remotePatterns,
  },
};

export default nextConfig;
