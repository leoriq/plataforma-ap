import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Next.js App',
    short_name: 'Next.js App',
    description: 'Next.js App',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#FF0000',
    theme_color: '#00FF00',
  }
}
