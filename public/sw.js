if (!self.define) {
  let e,
    s = {};
  const n = (n, i) => (
    (n = new URL(n + '.js', i).href),
    s[n] ||
      new Promise((s) => {
        if ('document' in self) {
          const e = document.createElement('script');
          (e.src = n), (e.onload = s), document.head.appendChild(e);
        } else (e = n), importScripts(n), s();
      }).then(() => {
        let e = s[n];
        if (!e) throw new Error(`Module ${n} didn’t register its module`);
        return e;
      })
  );
  self.define = (i, a) => {
    const c = e || ('document' in self ? document.currentScript.src : '') || location.href;
    if (s[c]) return;
    let t = {};
    const r = (e) => n(e, c),
      o = { module: { uri: c }, exports: t, require: r };
    s[c] = Promise.all(i.map((e) => o[e] || r(e))).then((e) => (a(...e), t));
  };
}
define(['./workbox-3c9d0171'], function (e) {
  'use strict';
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: '/_next/static/11BJI_7xrUlRGejNCVSSM/_buildManifest.js',
          revision: 'cc88569e5a9dc01bd42a50053f13f94f',
        },
        {
          url: '/_next/static/11BJI_7xrUlRGejNCVSSM/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        { url: '/_next/static/chunks/118-d18390661e1233de.js', revision: '11BJI_7xrUlRGejNCVSSM' },
        { url: '/_next/static/chunks/285-ceed2f038c1bd817.js', revision: '11BJI_7xrUlRGejNCVSSM' },
        {
          url: '/_next/static/chunks/3d3f95cd-cbafa9b4382646d1.js',
          revision: '11BJI_7xrUlRGejNCVSSM',
        },
        { url: '/_next/static/chunks/408-876fc90a937b7915.js', revision: '11BJI_7xrUlRGejNCVSSM' },
        { url: '/_next/static/chunks/512-b7974b97a5c8e425.js', revision: '11BJI_7xrUlRGejNCVSSM' },
        { url: '/_next/static/chunks/514-01e6051c48d6a725.js', revision: '11BJI_7xrUlRGejNCVSSM' },
        { url: '/_next/static/chunks/600-8b1ee3f6cef9242e.js', revision: '11BJI_7xrUlRGejNCVSSM' },
        { url: '/_next/static/chunks/745-b8017d07c99843a8.js', revision: '11BJI_7xrUlRGejNCVSSM' },
        { url: '/_next/static/chunks/833-6973f76cf7296684.js', revision: '11BJI_7xrUlRGejNCVSSM' },
        { url: '/_next/static/chunks/9-a4d4d38a05c29fe6.js', revision: '11BJI_7xrUlRGejNCVSSM' },
        { url: '/_next/static/chunks/941-eb293ca6fc669126.js', revision: '11BJI_7xrUlRGejNCVSSM' },
        {
          url: '/_next/static/chunks/app/_not-found/page-9beb7753e369f621.js',
          revision: '11BJI_7xrUlRGejNCVSSM',
        },
        {
          url: '/_next/static/chunks/app/builder/page-ce0e1b2cd6c1b4f9.js',
          revision: '11BJI_7xrUlRGejNCVSSM',
        },
        {
          url: '/_next/static/chunks/app/layout-a73651ffcd16e625.js',
          revision: '11BJI_7xrUlRGejNCVSSM',
        },
        {
          url: '/_next/static/chunks/app/page-4acc04f630eb2e28.js',
          revision: '11BJI_7xrUlRGejNCVSSM',
        },
        {
          url: '/_next/static/chunks/app/settings/page-52305ff066b073f0.js',
          revision: '11BJI_7xrUlRGejNCVSSM',
        },
        {
          url: '/_next/static/chunks/c132bf7d-440dde8dc4089c69.js',
          revision: '11BJI_7xrUlRGejNCVSSM',
        },
        {
          url: '/_next/static/chunks/framework-082f5b7764f4d1d0.js',
          revision: '11BJI_7xrUlRGejNCVSSM',
        },
        { url: '/_next/static/chunks/main-8d2ca61d4ca70054.js', revision: '11BJI_7xrUlRGejNCVSSM' },
        {
          url: '/_next/static/chunks/main-app-419eef8f305b8d72.js',
          revision: '11BJI_7xrUlRGejNCVSSM',
        },
        {
          url: '/_next/static/chunks/pages/_app-d302164f45f28031.js',
          revision: '11BJI_7xrUlRGejNCVSSM',
        },
        {
          url: '/_next/static/chunks/pages/_error-d31a1af395d41de2.js',
          revision: '11BJI_7xrUlRGejNCVSSM',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-9fec3fd8cafea331.js',
          revision: '11BJI_7xrUlRGejNCVSSM',
        },
        { url: '/_next/static/css/140680f5334d82b4.css', revision: '140680f5334d82b4' },
        {
          url: '/_next/static/media/26a46d62cd723877-s.p.woff2',
          revision: 'befd9c0fdfa3d8a645d5f95717ed6420',
        },
        {
          url: '/_next/static/media/55c55f0601d81cf3-s.woff2',
          revision: '43828e14271c77b87e3ed582dbff9f74',
        },
        {
          url: '/_next/static/media/581909926a08bbc8-s.woff2',
          revision: 'f0b86e7c24f455280b8df606b89af891',
        },
        {
          url: '/_next/static/media/8e9860b6e62d6359-s.woff2',
          revision: '01ba6c2a184b8cba08b0d57167664d75',
        },
        {
          url: '/_next/static/media/97e0cb1ae144a2a9-s.woff2',
          revision: 'e360c61c5bd8d90639fd4503c829c2dc',
        },
        {
          url: '/_next/static/media/df0a9ae256c0569c-s.woff2',
          revision: 'd54db44de5ccb18886ece2fda72bdfe0',
        },
        {
          url: '/_next/static/media/e4af272ccee01ff0-s.p.woff2',
          revision: '65850a373e258f1c897a2b3d75eb74de',
        },
        {
          url: '/icons/apple-touch-icon-180x180.png',
          revision: 'f28e5bb420efe743b5b6a89900d1473c',
        },
        { url: '/icons/icon-128x128.png', revision: '07de2a6a2c00d5dfaa0368f45630367c' },
        { url: '/icons/icon-144x144.png', revision: 'ebe630ad23fddf1656031eb99ea42ffd' },
        { url: '/icons/icon-152x152.png', revision: '089a64cb0ffaed035a3fecb651726ca9' },
        { url: '/icons/icon-192x192.png', revision: '397f1413dbb4e8ed135c471f70271cc1' },
        { url: '/icons/icon-256x256.png', revision: '8fc95aa41863cb757a5a552aa11bed2d' },
        { url: '/icons/icon-384x384.png', revision: 'bdf1ffc2c632445ec77732864aafa203' },
        { url: '/icons/icon-48x48.png', revision: '3457cedb6af9359a3dcc589bf29f5f39' },
        { url: '/icons/icon-512x512.png', revision: 'e128c9e3047962b0d00bcb39f1851b77' },
        { url: '/icons/icon-72x72.png', revision: 'c6b7d09ab4bbb861c045b0d72e4df7a4' },
        { url: '/icons/icon-96x96.png', revision: '88f7caababe0323e7d087bff60d0a2b0' },
        {
          url: '/icons/web-app-manifest-192x192.png',
          revision: 'bd26a6a0fd70e6595f7465f0c51f0504',
        },
        {
          url: '/icons/web-app-manifest-512x512.png',
          revision: '6139535c36e87f02adc63bbcd784458e',
        },
        { url: '/placeholder-logo.png', revision: 'b7d4c7dd55cf683c956391f9c2ce3f5b' },
        { url: '/placeholder-logo.svg', revision: '1e16dc7df824652c5906a2ab44aef78c' },
        { url: '/placeholder-user.jpg', revision: '82c9573f1276f9683ba7d92d8a8c6edd' },
        { url: '/placeholder.jpg', revision: '887632fd67dd19a0d58abde79d8e2640' },
        { url: '/placeholder.svg', revision: '35707bd9960ba5281c72af927b79291f' },
      ],
      { ignoreURLParametersMatching: [/^utm_/, /^fbclid$/] },
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({ response: e }) =>
              e && 'opaqueredirect' === e.type
                ? new Response(e.body, { status: 200, statusText: 'OK', headers: e.headers })
                : e,
          },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 })],
      }),
      'GET',
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET',
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET',
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 2592e3 })],
      }),
      'GET',
    ),
    e.registerRoute(
      /\/_next\/static.+\.js$/i,
      new e.CacheFirst({
        cacheName: 'next-static-js-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET',
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET',
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: 'static-audio-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /\.(?:mp4|webm)$/i,
      new e.CacheFirst({
        cacheName: 'static-video-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 48, maxAgeSeconds: 86400 })],
      }),
      'GET',
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET',
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET',
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: 'static-data-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET',
    ),
    e.registerRoute(
      ({ sameOrigin: e, url: { pathname: s } }) =>
        !(!e || s.startsWith('/api/auth/callback') || !s.startsWith('/api/')),
      new e.NetworkFirst({
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 })],
      }),
      'GET',
    ),
    e.registerRoute(
      ({ request: e, url: { pathname: s }, sameOrigin: n }) =>
        '1' === e.headers.get('RSC') &&
        '1' === e.headers.get('Next-Router-Prefetch') &&
        n &&
        !s.startsWith('/api/'),
      new e.NetworkFirst({
        cacheName: 'pages-rsc-prefetch',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET',
    ),
    e.registerRoute(
      ({ request: e, url: { pathname: s }, sameOrigin: n }) =>
        '1' === e.headers.get('RSC') && n && !s.startsWith('/api/'),
      new e.NetworkFirst({
        cacheName: 'pages-rsc',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET',
    ),
    e.registerRoute(
      ({ url: { pathname: e }, sameOrigin: s }) => s && !e.startsWith('/api/'),
      new e.NetworkFirst({
        cacheName: 'pages',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET',
    ),
    e.registerRoute(
      ({ sameOrigin: e }) => !e,
      new e.NetworkFirst({
        cacheName: 'cross-origin',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 })],
      }),
      'GET',
    );
});
