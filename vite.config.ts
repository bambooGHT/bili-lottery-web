import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(() => {
  return {
    base: "/",
    plugins: [vue()],
    resolve: {
      alias: {
        "@/": "/src/"
      }
    },
    server: {
      allowedHosts: true
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