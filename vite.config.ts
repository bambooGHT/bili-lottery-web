import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(() => {
  return {
    base: "/",
    publicDir: "pubilc",
    plugins: [vue()],
    resolve: {
      alias: {
        "@/": "/src/"
      }
    },
    server: {
      host: '0.0.0.0',
      port: 5173
    },
    "build": {
      sourcemap: true,
      rollupOptions: {
        plugins: [],
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return "modules";
            }
          },
        }
      }
    }
  };
});