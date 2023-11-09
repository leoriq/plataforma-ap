import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Abrindo Portas',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#404266',
    theme_color: '#404266',
  }
}
