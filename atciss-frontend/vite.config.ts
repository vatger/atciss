import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import { playwright } from "@vitest/browser-playwright"

// https://vitejs.dev/config/
export default defineConfig({
  // Works around vitest 5 browser-mode dropping a define hoist that kept
  // Vite's JSX transform and the browser's process.env.NODE_ENV in sync,
  // which otherwise breaks theme-ui/emotion's jsx-dev-runtime at test time.
  // https://github.com/vitest-dev/vitest/issues/11265
  optimizeDeps: {
    rolldownOptions: {
      transform: {
        define: {
          "process.env.NODE_ENV": JSON.stringify("development"),
        },
      },
    },
  },
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
  // esbuild: {
  //   jsxFactory: "jsx",
  //   jsxInject: `import { jsx } from 'theme-ui'`,
  // },
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
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          globals: true,
          environment: "jsdom",
          setupFiles: "src/setupTests",
          mockReset: true,
          exclude: ["**/node_modules/**", "e2e/**"],
        },
      },
      {
        extends: true,
        test: {
          name: "browser",
          globals: true,
          mockReset: true,
          include: ["e2e/**/*.browser.test.{ts,tsx}"],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
})
