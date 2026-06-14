import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isUserOrOrgPage = repositoryName.endsWith(".github.io");

const nextConfig: NextConfig = {
  output: isGithubPages ? "export" : undefined,
  basePath: isGithubPages && repositoryName && !isUserOrOrgPage ? `/${repositoryName}` : undefined,
  assetPrefix: isGithubPages && repositoryName && !isUserOrOrgPage ? `/${repositoryName}/` : undefined,
  images: {
    unoptimized: true
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"]
  }
};

export default nextConfig;
