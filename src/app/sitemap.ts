import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://skyowed.app';
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/airlines`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/airlines/ryanair`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/airlines/easyjet`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/airlines/lufthansa`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/login`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
  ];
}
