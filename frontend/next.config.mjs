/** @type {import("next").NextConfig} */
const nextConfig = {
    async rewrites() {
        const apiUrl = (process.env.API_URL ?? "http://localhost:8000").replace(/\/$/, "");
        return [
            {
                source: "/api/:path*",
                destination: `${apiUrl}/api/:path*`,
            },
        ];
    },
};

export default nextConfig;
