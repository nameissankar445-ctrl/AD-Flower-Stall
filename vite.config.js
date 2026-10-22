import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// The site is plain HTML/CSS/JS. Vite serves and builds it as-is:
//  - the HTML pages are the entries (multi-page),
//  - everything in /public (css, js, assets, robots.txt, sitemap.xml) is copied to the build untouched,
//    so the existing <script src="js/..."> and <link href="css/..."> tags keep working exactly as before.
export default defineConfig({
  appType: 'mpa',
  build: {
    assetsDir: 'bundle',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        terms: resolve(__dirname, 'terms.html'),
        credits: resolve(__dirname, 'credits.html'),
        adminLogin: resolve(__dirname, 'admin/login.html'),
        admin: resolve(__dirname, 'admin/index.html'),
      },
    },
  },
});
