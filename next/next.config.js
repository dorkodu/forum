const { i18n } = require('./next-i18next.config')

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
  reactStrictMode: false,
  poweredByHeader: false,
  compiler: {
    emotion: true,
  },
}

module.exports = nextConfig
