/** @type {import(next).NextConfig} */
const nextConfig = {
  async headers() {
    const env = process.env.NEXT_PUBLIC_APP_ENV ?? "prod";
    return env !== "prod"
      ? [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] }]
      : [];
  },
};
export default nextConfig;
