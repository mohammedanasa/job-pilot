import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * pdf-parse wraps pdfjs-dist, which loads a separate worker file at runtime.
   * Bundling it rewrites the paths pdfjs uses to find that worker, so it fails
   * with `Setting up fake worker failed: Cannot find module pdf.worker.mjs`.
   * Leaving it external keeps it resolving from node_modules, worker included.
   */
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://eu-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
