import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      app: "/src/app",
      components: "/src/components",
      services: "/src/services",
      views: "/src/views",
      types: "/src/types",
    },
  },
  esbuild: {
    jsxFactory: "jsx",
    jsxInject: `import { jsx } from 'theme-ui'`,
  },
  server: {
    open: true,
    proxy: {
      "/api": "http://localhost:8000",
      "/static": "http://localhost:8000",
    },
  },
  build: {
    outDir: "build",
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "src/setupTests",
    mockReset: true,
  },
})
