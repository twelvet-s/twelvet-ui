import { mergeConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import baseConig from './vite.config.base';

export default mergeConfig(
  {
    mode: 'development',
    server: {
      open: true,
      host: '0.0.0.0',
      port: 8000,
      proxy: {
        '/api/': {
          target: 'http://cloud.twelvet.cn/',
          changeOrigin: true,
          pathRewrite: {
            '^/api': '',
          },
        },
      },
      fs: {
        strict: true,
      },
    },
    plugins: [
      eslint({
        // @ts-ignore
        cache: false,
        include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
        exclude: ['node_modules'],
      }),
    ],
  },
  baseConig
);
