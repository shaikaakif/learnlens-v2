import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LearnLens AI',
    short_name: 'LearnLens',
    description: 'See Beyond the Score with LearnLens AI',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafaf5',
    theme_color: '#5c9966',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      // In a real production app, we would add 192x192 and 512x512 PNGs here.
    ],
  };
}
