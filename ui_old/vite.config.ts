import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import eslintPlugin from 'vite-plugin-eslint';
// import basicSsl from '@vitejs/plugin-basic-ssl';
import viteCompression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';
import vueJsx from '@vitejs/plugin-vue-jsx';

const viteHtml = (options?: any) => ({
  name: 'vite-plugin-html-transform',
  transformIndexHtml(html: string) {
    const reg = /(src|href)="\.\/static\//gm;
    html = html.replace(reg, '$1="{{ .BK_STATIC_URL }}/static/');
    return html;
  },
});

const cookie = 'blueking_language=zh-cn; bk_token=bkcrypt%24gAAAAABqOzM89A350DabtvSXCfJioAfrt5JKF1v6RIq8cX4JmKPIuM8-NlDlY6m-hyWm1LaJOzSWs2ZTSQvaNBih9ovOWHSoWegGcvzI2mOn2U49P5ERiPA%3D'
const proxyUrl = 'http://bscp-api.sit.bktencent.com'
// const proxyUrl = 'https://bscp-api.bk-tenant-v7.bktencent.com'

export default defineConfig(({ command, mode }) => {
  const plugins = [
    vue(),
    eslintPlugin({
      include: ['src/**/*.{ts,tsx,js,jsx,vue}'],
      cache: true,
    }),
    viteCompression({
      filter: /\.js|.css$/,
      threshold: 1,
    }),
    vueJsx(),
  ];
  console.error('defineConfig command', command);
  if (command === 'build') {
    plugins.push(viteHtml());
    // plugins.push(
    //   visualizer({
    //     open: true,
    //     gzipSize: true,
    //     brotliSize: true,
    //   }),
    // );
  }
  //  else {
  //   plugins.push(basicSsl())
  // }

  return {
    base: './',
    publicDir: 'static',
    plugins,
    css: {
      preprocessorOptions: {
        scss: {
          // additionalData: '@import "./src/css/style.scss";'
        },
      },
    },
    resolve: {
      alias: {
        'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js',
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'static',
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        output: {
          entryFileNames: 'static/js/[name]-[hash].js',
          chunkFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
          manualChunks: {
            lodash: ['lodash'],
            'notice-component': ['@blueking/notice-component'],
          },
        },
      },
    },
    optimizeDeps: {
      include: [
        'monaco-editor/esm/vs/language/json/json.worker',
        'monaco-editor/esm/vs/language/css/css.worker',
        'monaco-editor/esm/vs/language/html/html.worker',
        'monaco-editor/esm/vs/language/typescript/ts.worker',
        'monaco-editor/esm/vs/editor/editor.worker',
      ],
    },
    server: {
      https: false,
      host: 'bscp.local.woa.com',
      port: 5174,
      proxy: {
        '/api/v1/': {
          target: proxyUrl,
          changeOrigin: true,
          secure: false,
          headers: {
            'Cookie': cookie,
          },
        },
        // '/api/bk-user-web/prod': {
        //   target: 'https://bkapi.bk-tenant-v7.bktencent.com',
        //   changeOrigin: true,
        //   secure: false,
        //   configure: (proxy) => {
        //     proxy.on('proxyReq', (proxyReq: any, req: any) => {
        //       proxyReq.setHeader('sec-fetch-mode', req.headers['sec-fetch-mode'] || 'cors');
        //       proxyReq.setHeader('sec-fetch-site', req.headers['sec-fetch-site'] || 'same-origin');
        //       proxyReq.setHeader('sec-fetch-dest', req.headers['sec-fetch-dest'] || 'empty');
        //       // 把浏览器发来的 cookie 原样转发
        //       proxyReq.setHeader('cookie', 'bklogin_csrftoken_bfbcf7b25ebb14ad=ie59pNDdcSdVJ9x52pCCfTSTVfahNuOw; bklogin_sessionid_bfbcf7b25ebb14ad=bigyy8x0w2xsfpugifb7ynsn770e7nxs; bk_token=bkcrypt%24gAAAAABqKNvRd3HGSwsPIWBWw9_kJvX9aBODd7ijusfZBb0hY0HHHolXoGDHfod0kTN1GqLosuFxyexVsvajXrDuRFXgVCu8Y4ZMVSr7-XpkMVJaWkV1jvG0ceRrqit9k9NTmW9ojLT5; blueking_language=zh-cn');
        //     });
        //   },
        // }
      },
    },
  };
});
