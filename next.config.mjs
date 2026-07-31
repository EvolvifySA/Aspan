/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const formsUrl = process.env.FORMS_INTERNAL_URL ?? 'http://localhost:3001'

    return [
      {
        source: '/solicitacao-vaga',
        destination: `${formsUrl}/solicitacao-vaga`,
      },
      {
        source: '/admin/forms',
        destination: `${formsUrl}/admin/forms`,
      },
      {
        source: '/admin/forms/:path*',
        destination: `${formsUrl}/admin/forms/:path*`,
      },
      {
        source: '/api/forms/:path*',
        destination: `${formsUrl}/api/forms/:path*`,
      },
      {
        source: '/assets/:path*',
        destination: `${formsUrl}/assets/:path*`,
      },
    ]
  },
}

export default nextConfig
