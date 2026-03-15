declare module 'next-pwa' {
  import { NextConfig } from 'next';

  interface RuntimeCaching {
    urlPattern: RegExp | string;
    handler?: 'CacheFirst' | 'NetworkFirst' | 'StaleWhileRevalidate' | 'NetworkOnly' | 'CacheOnly';
    options?: {
      cacheName?: string;
      expiration?: {
        maxEntries?: number;
        maxAgeSeconds?: number;
      };
      networkTimeoutSeconds?: number;
    };
  }

  interface WithPWAConfig {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    runtimeCaching?: RuntimeCaching[];
    buildExcludes?: string[];
    publicExcludes?: boolean;
    fallbacks?: {
      document?: string;
      image?: string;
      audio?: string;
      video?: string;
      font?: string;
    };
  }

  export default function withPWA(config?: WithPWAConfig): (config: NextConfig) => NextConfig;
}
