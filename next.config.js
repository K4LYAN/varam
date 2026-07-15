/** @type {import('next').NextConfig} */

const securityHeaders = [
  // Prevent browsers from guessing MIME types
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Prevent clickjacking via iframes
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Enable DNS prefetch for performance
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  // Strict referrer for external requests
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Restrict browser feature access
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  // HTTP Strict Transport Security (HTTPS only — 2 years)
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Scripts: self + Razorpay SDK + inline/eval for Next.js hydration
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com",
      // Styles: self + Google Fonts + inline (Tailwind / CSS-in-JS)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts: self + Google Fonts
      "font-src 'self' https://fonts.gstatic.com data:",
      // Images: self + data URIs + blob + any https
      "img-src 'self' data: blob: https:",
      // Fetch/XHR: self + Supabase + Razorpay APIs
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.razorpay.com https://checkout.razorpay.com",
      // iframes: only Razorpay
      "frame-src https://api.razorpay.com https://checkout.razorpay.com",
      // Forms: self only
      "form-action 'self'",
      // Disallow all plugin types (Flash, Java, etc.)
      "object-src 'none'",
      // Upgrade HTTP → HTTPS
      "upgrade-insecure-requests",
    ].join('; '),
  },
]

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },

  // Allow images from Supabase Storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
}

export default nextConfig
