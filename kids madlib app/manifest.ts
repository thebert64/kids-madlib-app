import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mad Libs Stories',
    short_name: 'Mad Libs',
    description: 'Create hilarious collaborative stories with friends!',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f3ff',
    theme_color: '#7c3aed',
    orientation: 'portrait-primary',
    categories: ['games', 'kids', 'entertainment'],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    screenshots: [],
    shortcuts: [
      {
        name: 'New Story',
        url: '/',
        description: 'Create a new Mad Libs story',
      },
      {
        name: 'Join Story',
        url: '/join',
        description: 'Join an existing story',
      },
    ],
  };
}
